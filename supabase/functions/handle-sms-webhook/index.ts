
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SmsWebhookData {
  from: string;
  text: string;
  to?: string;
  id?: string;
  date?: string;
  sessionId?: string;
  phoneNumber?: string;
  linkId?: string;
  networkCode?: string;
}

interface Organization {
  id: string;
  name: string;
  sms_settings: {
    username: string;
    apiKey: string;
  };
  sms_sender_id?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('[SMS-WEBHOOK] Received SMS webhook');
    console.log('[SMS-WEBHOOK] Headers:', Object.fromEntries(req.headers.entries()));
    
    // Parse incoming data (can be form data or JSON)
    let smsData: SmsWebhookData;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      smsData = {
        from: formData.get('from')?.toString() || formData.get('phoneNumber')?.toString() || '',
        text: formData.get('text')?.toString() || '',
        to: formData.get('to')?.toString(),
        id: formData.get('id')?.toString(),
        date: formData.get('date')?.toString(),
        sessionId: formData.get('sessionId')?.toString(),
        phoneNumber: formData.get('phoneNumber')?.toString(),
        linkId: formData.get('linkId')?.toString(),
        networkCode: formData.get('networkCode')?.toString()
      };
    } else {
      smsData = await req.json();
    }

    console.log('[SMS-WEBHOOK] Parsed SMS data:', {
      from: smsData.from || smsData.phoneNumber,
      textLength: smsData.text?.length || 0,
      to: smsData.to,
      id: smsData.id,
      sessionId: smsData.sessionId
    });

    const phoneNumber = smsData.from || smsData.phoneNumber;
    const messageText = smsData.text;
    const messageId = smsData.id;

    if (!phoneNumber || !messageText) {
      console.error('[SMS-WEBHOOK] Missing required data:', { phoneNumber: !!phoneNumber, messageText: !!messageText });
      return new Response('Missing required data', { status: 400, headers: corsHeaders });
    }

    // Find organization by checking which one has SMS enabled
    // In a multi-org setup, you might want to use the 'to' field or webhook URL path to identify the org
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, sms_settings, sms_sender_id')
      .eq('sms_enabled', true);

    if (orgError || !organizations || organizations.length === 0) {
      console.error('[SMS-WEBHOOK] No SMS-enabled organizations found:', orgError);
      return new Response('No SMS-enabled organization found', { status: 404, headers: corsHeaders });
    }

    // For now, use the first enabled organization
    // TODO: Implement proper org identification logic based on webhook URL or sender ID
    const organization = organizations[0] as Organization;
    
    console.log(`[SMS-WEBHOOK] Processing SMS for organization: ${organization.name} (${organization.id})`);

    // Check for existing active session
    const { data: existingSession } = await supabase
      .from('sms_sessions')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('organization_id', organization.id)
      .eq('status', 'started')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('[SMS-WEBHOOK] Existing session:', existingSession ? 'Found' : 'Not found');

    const isStartCommand = messageText.toLowerCase().includes('start') || 
                          messageText.toLowerCase().includes('begin') ||
                          messageText.toLowerCase().includes('yes');

    let responseText = '';
    let currentSession = existingSession;

    if (!existingSession && isStartCommand) {
      console.log('[SMS-WEBHOOK] Creating new SMS session');
      
      // Create feedback session first
      const { data: feedbackSession, error: feedbackError } = await supabase
        .from('feedback_sessions')
        .insert({
          organization_id: organization.id,
          phone_number: phoneNumber,
          status: 'in_progress'
        })
        .select()
        .single();

      if (feedbackError) {
        console.error('[SMS-WEBHOOK] Error creating feedback session:', feedbackError);
        throw feedbackError;
      }

      // Create SMS session
      const { data: smsSession, error: sessionError } = await supabase
        .from('sms_sessions')
        .insert({
          organization_id: organization.id,
          phone_number: phoneNumber,
          feedback_session_id: feedbackSession.id,
          current_question_index: 0,
          responses: {},
          status: 'started'
        })
        .select()
        .single();

      if (sessionError) {
        console.error('[SMS-WEBHOOK] Error creating SMS session:', sessionError);
        throw sessionError;
      }

      currentSession = smsSession;

      // Get first question
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('order_index');

      if (questions && questions.length > 0) {
        const firstQuestion = questions[0];
        responseText = `Welcome to our survey! Q1/${questions.length}: ${firstQuestion.question_text}`;
        
        if (firstQuestion.question_type === 'rating') {
          responseText += '\n\nPlease rate from 1-5 (1=Poor, 5=Excellent)';
        }
      } else {
        responseText = `Thank you for your interest! We don't have any questions set up yet. - ${organization.name}`;
      }

    } else if (!existingSession && !isStartCommand) {
      console.log('[SMS-WEBHOOK] No active session, sending start prompt');
      responseText = `Hi! To begin our quick survey, please reply "START". Thank you! - ${organization.name}`;
      
    } else if (existingSession) {
      console.log('[SMS-WEBHOOK] Processing response for existing session');
      
      // Process response for existing session
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('order_index');

      if (questions && questions.length > 0) {
        const currentQuestion = questions[existingSession.current_question_index];
        
        if (currentQuestion) {
          // Store the response
          const responses = { ...existingSession.responses };
          responses[currentQuestion.id] = messageText;

          // Create feedback response record
          const score = generateScoreFromResponse(messageText, currentQuestion.question_type);
          await supabase
            .from('feedback_responses')
            .insert({
              session_id: existingSession.feedback_session_id,
              question_id: currentQuestion.id,
              organization_id: organization.id,
              response_value: messageText,
              question_category: currentQuestion.category || 'General',
              score: score
            });

          // Move to next question
          const nextQuestionIndex = existingSession.current_question_index + 1;
          
          await supabase
            .from('sms_sessions')
            .update({
              current_question_index: nextQuestionIndex,
              responses: responses
            })
            .eq('id', existingSession.id);

          // Check if survey is complete
          if (nextQuestionIndex >= questions.length) {
            await completeSurvey(supabase, existingSession, organization);
            responseText = `Thank you for completing our survey! Your feedback helps us improve. - ${organization.name}`;
          } else {
            // Send next question
            const nextQuestion = questions[nextQuestionIndex];
            responseText = `Q${nextQuestionIndex + 1}/${questions.length}: ${nextQuestion.question_text}`;
            
            if (nextQuestion.question_type === 'rating') {
              responseText += '\n\nPlease rate from 1-5 (1=Poor, 5=Excellent)';
            }
          }
        }
      }
    }

    // Log the incoming message
    if (currentSession) {
      const { error: logError } = await supabase
        .from('sms_conversations')
        .insert({
          sms_session_id: currentSession.id,
          direction: 'inbound',
          content: messageText,
          africastalking_message_id: messageId
        });

      if (logError) {
        console.error('[SMS-WEBHOOK] Error logging conversation:', logError);
      }
    }

    // Send response if we have one
    if (responseText && organization.sms_settings?.username && organization.sms_settings?.apiKey) {
      console.log(`[SMS-WEBHOOK] Sending response: ${responseText.substring(0, 50)}...`);
      
      try {
        const followupResponse = await supabase.functions.invoke('send-followup-sms', {
          body: {
            phoneNumber: phoneNumber,
            message: responseText,
            organizationId: organization.id,
            sessionId: currentSession?.id,
            context: 'survey_response'
          }
        });

        if (followupResponse.error) {
          console.error('[SMS-WEBHOOK] Error sending follow-up:', followupResponse.error);
        } else {
          console.log('[SMS-WEBHOOK] Follow-up sent successfully');
        }
      } catch (followupError) {
        console.error('[SMS-WEBHOOK] Exception sending follow-up:', followupError);
      }
    }

    console.log('[SMS-WEBHOOK] Webhook processing completed successfully');
    return new Response('OK', { headers: corsHeaders });

  } catch (error) {
    console.error('[SMS-WEBHOOK] Error processing SMS webhook:', error);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
});

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

async function completeSurvey(supabase: any, session: any, organization: Organization) {
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
