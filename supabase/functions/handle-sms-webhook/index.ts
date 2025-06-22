
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parseSmsWebhookData, validateSmsData } from './sms-parser.ts';
import { findSmsEnabledOrganization } from './organization-service.ts';
import { findOrCreateSmsSession, createNewSmsSession } from './session-manager.ts';
import { getActiveQuestions, formatQuestionForSms, processQuestionResponse } from './question-handler.ts';
import { sendSmsResponse } from './sms-sender.ts';
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

    console.log('SMS Webhook received');
    
    const formData = await req.formData();
    const smsData = parseSmsWebhookData(formData);

    console.log('SMS Data:', smsData);

    if (!validateSmsData(smsData)) {
      console.error('Missing required SMS data');
      return new Response('Missing data', { status: 400, headers: corsHeaders });
    }

    // Find organization
    const organization = await findSmsEnabledOrganization(supabase);
    if (!organization) {
      return new Response('Organization not found', { status: 404, headers: corsHeaders });
    }

    console.log(`Processing SMS for organization: ${organization.id}`);

    // Handle session management
    const { session: existingSession, shouldCreateNew } = await findOrCreateSmsSession(
      supabase,
      smsData.from,
      organization,
      smsData.text
    );

    let responseText = '';
    let currentSession = existingSession;

    if (shouldCreateNew) {
      // Create new session and start survey
      currentSession = await createNewSmsSession(supabase, smsData.from, organization.id);
      
      const questions = await getActiveQuestions(supabase, organization.id);
      if (questions.length === 0) {
        responseText = `Thank you for your interest! We don't have any questions set up yet. - ${organization.name}`;
      } else {
        const firstQuestion = questions[0];
        responseText = `Welcome to our survey! ${formatQuestionForSms(firstQuestion, 1, questions.length)}`;
      }
    } else if (!existingSession) {
      // No active session and not a start command
      responseText = `Hi! To begin our quick survey, please reply "START". Thank you! - ${organization.name}`;
    } else {
      // Process response for existing session
      const questions = await getActiveQuestions(supabase, organization.id);
      const { nextMessage } = await processQuestionResponse(
        supabase,
        existingSession,
        smsData.text,
        questions,
        organization
      );
      responseText = nextMessage;
    }

    // Log the incoming conversation
    await logSmsConversation(supabase, currentSession?.id, 'inbound', smsData.text, smsData.id);

    // Send response if we have one
    if (responseText && organization.sms_settings?.username && organization.sms_settings?.apiKey) {
      await sendSmsResponse(organization, smsData.from, responseText, supabase, currentSession?.id);
    }

    return new Response('OK', { headers: corsHeaders });

  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});
