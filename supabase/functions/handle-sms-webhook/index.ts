
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parseSmsWebhookData, validateSmsData } from './sms-parser.ts';
import { findSmsEnabledOrganization } from './organization-service.ts';
import { findOrCreateSmsSession, createNewSmsSession } from './session-manager.ts';
import { getActiveQuestions, formatQuestionForSms, processQuestionResponse } from './question-handler.ts';
import { logSmsConversation } from './conversation-logger.ts';

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
    
    // Parse incoming data
    let smsData;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      smsData = parseSmsWebhookData(formData);
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

    if (!validateSmsData({ from: phoneNumber, text: messageText })) {
      console.error('[SMS-WEBHOOK] Missing required data:', { phoneNumber: !!phoneNumber, messageText: !!messageText });
      return new Response('Missing required data', { status: 400, headers: corsHeaders });
    }

    // Find SMS-enabled organization
    const organization = await findSmsEnabledOrganization(supabase);
    if (!organization) {
      console.error('[SMS-WEBHOOK] No SMS-enabled organizations found');
      return new Response('No SMS-enabled organization found', { status: 404, headers: corsHeaders });
    }
    
    console.log(`[SMS-WEBHOOK] Processing SMS for organization: ${organization.name} (${organization.id})`);

    // Handle session management
    const { session: existingSession, shouldCreateNew } = await findOrCreateSmsSession(
      supabase, 
      phoneNumber, 
      organization, 
      messageText
    );

    let responseText = '';
    let currentSession = existingSession;

    if (shouldCreateNew) {
      console.log('[SMS-WEBHOOK] Creating new SMS session');
      currentSession = await createNewSmsSession(supabase, phoneNumber, organization.id);

      // Get questions and send first one
      const questions = await getActiveQuestions(supabase, organization.id);
      if (questions && questions.length > 0) {
        responseText = `Welcome to our survey! ${formatQuestionForSms(questions[0], 1, questions.length)}`;
      } else {
        responseText = `Thank you for your interest! We don't have any questions set up yet. - ${organization.name}`;
      }

    } else if (!existingSession && !shouldCreateNew) {
      console.log('[SMS-WEBHOOK] No active session, sending start prompt');
      responseText = `Hi! To begin our quick survey, please reply "START". Thank you! - ${organization.name}`;
      
    } else if (existingSession) {
      console.log('[SMS-WEBHOOK] Processing response for existing session');
      
      const questions = await getActiveQuestions(supabase, organization.id);
      if (questions && questions.length > 0) {
        const { nextMessage, isComplete } = await processQuestionResponse(
          supabase, 
          existingSession, 
          messageText, 
          questions, 
          organization
        );
        responseText = nextMessage;
      }
    }

    // Log the incoming message
    if (currentSession) {
      await logSmsConversation(supabase, currentSession.id, 'inbound', messageText, messageId);
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
