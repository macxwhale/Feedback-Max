
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { FlaskSmsCallback } from './types.ts'
import { verifySignature } from './security.ts'
import { sendSmsResponse } from './sms-service.ts'
import { handleConversationStep } from './conversation-handler.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.text();
    
    // Parse the JSON and handle potential parsing errors
    let callback: FlaskSmsCallback;
    try {
      callback = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse callback JSON:', parseError, 'Body:', body);
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Flask SMS callback received (raw):', body);
    console.log('Flask SMS callback parsed:', callback);

    // Validate required fields
    if (!callback.to || !callback.from || !callback.text) {
      console.error('Missing required fields in callback:', {
        to: callback.to,
        from: callback.from,
        text: callback.text
      });
      return new Response(JSON.stringify({ error: 'Missing required fields: to, from, or text' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { linkId, text, to: senderId, id: messageId, date, from: phoneNumber } = callback

    console.log('Processing SMS callback:', {
      sender_id: senderId,
      from_number: phoneNumber,
      text: text,
      timestamp: date,
      link_id: linkId,
      message_id: messageId
    });

    // Find organization by SMS sender ID
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('sms_sender_id', senderId)
      .single()

    if (orgError || !org) {
      console.error('Error finding organization by sender ID:', senderId, orgError)
      return new Response(JSON.stringify({ error: 'Organization not found for sender ID: ' + senderId }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Found organization:', org.name, 'for sender ID:', senderId)

    // Verify signature if provided
    const providedSignature = req.headers.get('X-Signature');
    if (providedSignature) {
      const webhookSecret = org.webhook_secret || 'changeme';
      if (!verifySignature(body, providedSignature, webhookSecret)) {
        console.error('Invalid signature provided');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Get or create conversation progress
    let { data: progress, error: progressError } = await supabase
      .from('sms_conversation_progress')
      .select('*')
      .eq('organization_id', org.id)
      .eq('phone_number', phoneNumber)
      .eq('sender_id', senderId)
      .maybeSingle() // Use maybeSingle to avoid errors when no rows found

    if (progressError) {
      console.error('Error fetching conversation progress:', progressError)
      return new Response(JSON.stringify({ error: 'Database error while fetching conversation progress' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!progress) {
      // No conversation progress found, create new one
      console.log('Creating new conversation progress for:', phoneNumber)
      const { data: newProgress, error: createError } = await supabase
        .from('sms_conversation_progress')
        .insert({
          organization_id: org.id,
          phone_number: phoneNumber,
          sender_id: senderId,
          current_step: 'consent',
          consent_given: false,
          session_data: {}
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating conversation progress:', createError)
        return new Response(JSON.stringify({ error: 'Failed to create conversation progress' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      progress = newProgress
    }

    // Log the conversation
    await supabase
      .from('sms_conversations')
      .insert({
        sms_session_id: progress.id,
        direction: 'inbound',
        content: text,
        status: 'received',
        africastalking_message_id: messageId
      })

    // Handle conversation step
    const { nextStep, responseMessage, sessionData } = await handleConversationStep(
      supabase,
      progress,
      text,
      org
    )

    // Update conversation progress
    await supabase
      .from('sms_conversation_progress')
      .update({
        current_step: nextStep,
        session_data: sessionData,
        last_message_id: messageId,
        consent_given: sessionData.consent_given || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', progress.id)

    // Send response message if needed
    if (responseMessage) {
      const sent = await sendSmsResponse(supabase, org, phoneNumber, responseMessage, senderId)
      
      if (sent) {
        // Log outbound message
        await supabase
          .from('sms_conversations')
          .insert({
            sms_session_id: progress.id,
            direction: 'outbound',
            content: responseMessage,
            status: 'sent'
          })
      }
    }

    return new Response(JSON.stringify({ success: true, step: nextStep }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Flask SMS callback error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
