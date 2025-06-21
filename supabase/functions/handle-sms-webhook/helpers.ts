
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to log SMS conversations
export const logSmsConversation = async (
  supabase: SupabaseClient, 
  sessionId: string | null, 
  phoneNumber: string, 
  content: string, 
  direction: 'incoming' | 'outgoing',
  messageId?: string | null
) => {
  try {
    if (sessionId) {
      await supabase.from('sms_conversations').insert({
        sms_session_id: sessionId,
        africastalking_message_id: messageId,
        direction,
        content,
        status: direction === 'outgoing' ? 'sent' : null
      });
    }
  } catch (error) {
    console.error('Error logging SMS conversation:', error);
    // Don't throw here to avoid breaking the main flow
  }
};

// Helper to format a question for SMS delivery
export const formatQuestionForSms = (question: any): string => {
  let smsText = question.question_text
  if (question.question_type === 'multiple-choice' && question.question_options && question.question_options.length > 0) {
    const optionsText = question.question_options
      .map((opt: any, index: number) => `${index + 1}. ${opt.option_text}`)
      .join('\n')
    smsText += `\n${optionsText}`
  } else if (['star', 'nps', 'rating'].includes(question.question_type)) {
    const scale = question.question_scale_config?.[0] || { min_value: 1, max_value: 5 }
    smsText += `\n(Reply with a number from ${scale.min_value} to ${scale.max_value})`
  }
  return smsText
}

// Helper to complete the survey and store results
export const completeSurvey = async (supabase: SupabaseClient, session: any, questions: any[], organizationId: string, thankYouMessage: string) => {
    console.log(`Completing survey for session ${session.id}`);

    // Create a feedback session
    const { data: feedbackSession, error: fbSessionError } = await supabase
        .from('feedback_sessions')
        .insert({
            organization_id: organizationId,
            status: 'completed',
            completed_at: new Date().toISOString(),
            phone_number: session.phone_number,
            sms_session_id: session.id,
        })
        .select('id')
        .single();
    if (fbSessionError) throw fbSessionError;

    const responses = session.responses || {};
    const feedbackResponses = Object.entries(responses).map(([questionId, value]) => {
        const question = questions.find(q => q.id === questionId);
        return {
            question_id: questionId,
            session_id: feedbackSession.id,
            organization_id: organizationId,
            response_value: value,
            question_category: question?.category || 'Comments',
        };
    });
    
    if (feedbackResponses.length > 0) {
        const { error: responseInsertError } = await supabase
            .from('feedback_responses')
            .insert(feedbackResponses);
        if (responseInsertError) throw responseInsertError;
    }

    // Mark SMS session as completed
    await supabase.from('sms_sessions').update({ status: 'completed' }).eq('id', session.id);

    return new Response(`END ${thankYouMessage}`, { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
}

// Helper to start a new survey session
export const handleNewSession = async (supabase: SupabaseClient, from: string, organizationId: string, questions: any[], messageId?: string | null) => {
    console.log(`Starting new session for ${from}`);
    const { data: newSession, error: createSessionError } = await supabase
        .from('sms_sessions')
        .insert({
          phone_number: from,
          organization_id: organizationId,
          status: 'in_progress',
          current_question_index: 0,
          responses: {},
        })
        .select()
        .single()

      if (createSessionError) throw createSessionError

      const firstQuestion = questions[0]
      const smsResponse = formatQuestionForSms(firstQuestion)

      console.log(`New session ${newSession.id} for ${from}. Sending first question.`)
      
      // Log the outgoing message
      await logSmsConversation(supabase, newSession.id, from, smsResponse, 'outgoing');
      
      return new Response(`CON ${smsResponse}`, { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } })
}

// Helper to process an ongoing session
export const handleOngoingSession = async (supabase: SupabaseClient, session: any, text: string, questions: any[], organizationId: string, orgThankYouMessage: string, messageId?: string | null) => {
    console.log(`Processing ongoing session ${session.id}`);

    if (text.toUpperCase() === 'STOP') {
        await supabase.from('sms_sessions').update({ status: 'completed' }).eq('id', session.id);
        const stopMessage = 'You have stopped the survey. Thank you.';
        await logSmsConversation(supabase, session.id, session.phone_number, stopMessage, 'outgoing');
        return new Response(`END ${stopMessage}`, { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
    }
    
    const currentQuestionIndex = session.current_question_index
    const currentQuestion = questions[currentQuestionIndex]

    if (!currentQuestion) {
      return completeSurvey(supabase, session, questions, organizationId, orgThankYouMessage);
    }

    const updatedResponses = session.responses || {}
    updatedResponses[currentQuestion.id] = text

    const nextQuestionIndex = currentQuestionIndex + 1

    const { data: updatedSession, error: updateError } = await supabase
      .from('sms_sessions')
      .update({
        current_question_index: nextQuestionIndex,
        responses: updatedResponses,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .eq('id', session.id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    const sessionForNextStep = updatedSession;

    if (nextQuestionIndex >= questions.length) {
      return completeSurvey(supabase, sessionForNextStep, questions, organizationId, orgThankYouMessage);
    }

    const nextQuestion = questions[nextQuestionIndex]
    const smsResponse = formatQuestionForSms(nextQuestion)

    console.log(`Session ${sessionForNextStep.id} for ${session.phone_number}. Sending question ${nextQuestionIndex + 1}.`)
    
    // Log the outgoing message
    await logSmsConversation(supabase, session.id, session.phone_number, smsResponse, 'outgoing');
    
    return new Response(`CON ${smsResponse}`, { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } })
}
