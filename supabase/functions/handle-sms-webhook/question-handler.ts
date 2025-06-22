
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SmsSession, Question, Organization } from './types.ts';

export async function getActiveQuestions(
  supabase: SupabaseClient,
  organizationId: string
): Promise<Question[]> {
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;
  return questions || [];
}

export function formatQuestionForSms(question: Question, questionNum: number, totalQuestions: number): string {
  let formattedQuestion = `Q${questionNum}/${totalQuestions}: ${question.question_text}`;
  
  if (question.question_type === 'multiple_choice') {
    formattedQuestion += '\n\nPlease reply with your choice.';
  } else if (question.question_type === 'rating') {
    formattedQuestion += '\n\nPlease rate from 1-5 (1=Poor, 5=Excellent)';
  }
  
  return formattedQuestion;
}

export async function processQuestionResponse(
  supabase: SupabaseClient,
  session: SmsSession,
  text: string,
  questions: Question[],
  organization: Organization
): Promise<{ nextMessage: string; isComplete: boolean }> {
  const currentQuestion = questions[session.current_question_index];
  
  if (!currentQuestion) {
    return {
      nextMessage: `Thank you for completing our survey! Your feedback helps us improve. - ${organization.name}`,
      isComplete: true
    };
  }

  // Store the response
  const responses = { ...session.responses };
  responses[currentQuestion.id] = text;

  // Create feedback response record
  await supabase
    .from('feedback_responses')
    .insert({
      session_id: session.feedback_session_id,
      question_id: currentQuestion.id,
      organization_id: organization.id,
      response_value: text,
      question_category: currentQuestion.category || 'General',
      score: generateScoreFromResponse(text, currentQuestion.question_type)
    });

  // Move to next question
  const nextQuestionIndex = session.current_question_index + 1;
  
  await supabase
    .from('sms_sessions')
    .update({
      current_question_index: nextQuestionIndex,
      responses: responses
    })
    .eq('id', session.id);

  // Check if survey is complete
  if (nextQuestionIndex >= questions.length) {
    await completeSurvey(supabase, session, organization);
    return {
      nextMessage: `Thank you for completing our survey! Your feedback helps us improve. - ${organization.name}`,
      isComplete: true
    };
  }

  // Send next question
  const nextQuestion = questions[nextQuestionIndex];
  return {
    nextMessage: formatQuestionForSms(nextQuestion, nextQuestionIndex + 1, questions.length),
    isComplete: false
  };
}

function generateScoreFromResponse(response: string, questionType: string): number {
  if (questionType === 'rating') {
    const rating = parseInt(response);
    return isNaN(rating) ? 3 : Math.max(1, Math.min(5, rating));
  }
  
  // Default scoring for text responses
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'poor'];
  
  const lowerResponse = response.toLowerCase();
  const hasPositive = positiveWords.some(word => lowerResponse.includes(word));
  const hasNegative = negativeWords.some(word => lowerResponse.includes(word));
  
  if (hasPositive && !hasNegative) return 5;
  if (hasNegative && !hasPositive) return 1;
  return 3; // Neutral
}

async function completeSurvey(supabase: SupabaseClient, session: SmsSession, organization: Organization) {
  console.log(`[SMS-WEBHOOK] Completing survey for session ${session.id}`);
  
  // Update SMS session status
  await supabase
    .from('sms_sessions')
    .update({ status: 'completed' })
    .eq('id', session.id);

  // Update feedback session
  await supabase
    .from('feedback_sessions')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString()
     })
    .eq('id', session.feedback_session_id);

  console.log('[SMS-WEBHOOK] Survey completed successfully');
}
