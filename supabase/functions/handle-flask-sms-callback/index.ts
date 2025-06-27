
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FlaskSmsCallback {
  linkId: string;
  text: string;
  to: string; // Sender ID that identifies the organization
  id: string;
  date: string;
  from: string; // Phone number
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  // Compare without timing attacks
  let result = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    result |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0 && expectedSignature.length === signature.length;
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
    const callback: FlaskSmsCallback = JSON.parse(body);
    console.log('Flask SMS callback received:', callback)

    const { linkId, text, to: senderId, id: messageId, date, from: phoneNumber } = callback

    // Get conversation progress to find the organization
    const { data: progress, error: progressError } = await supabase
      .from('sms_conversation_progress')
      .select('*')
      .eq('sender_id', senderId)
      .eq('phone_number', phoneNumber)
      .single()

    if (progressError) {
      console.error('Error finding conversation progress:', progressError)
      return new Response(JSON.stringify({ error: 'Conversation not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get organization details and verify signature
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', progress.organization_id)
      .single()

    if (orgError || !org) {
      console.error('Error finding organization:', orgError)
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

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

    // Handle different conversation steps
    let nextStep = progress.current_step
    let responseMessage = ''
    let sessionData = { ...progress.session_data }

    switch (progress.current_step) {
      case 'consent':
        if (text.toLowerCase().includes('yes') || text.toLowerCase().includes('y')) {
          nextStep = 'question_1'
          sessionData.consent_given = true
          responseMessage = 'Thank you for your consent! Let\'s begin with the first question: How would you rate our service on a scale of 1-5?'
        } else {
          responseMessage = 'Thank you for your response. You can reply "YES" anytime to start the feedback process.'
        }
        break

      case 'question_1':
        // Store answer and move to next question
        sessionData.question_1 = text
        nextStep = 'question_2'
        responseMessage = 'Thank you! Next question: How likely are you to recommend us to others? (1-10)'
        break

      case 'question_2':
        // Store answer and move to completion
        sessionData.question_2 = text
        nextStep = 'completed'
        responseMessage = 'Thank you for your valuable feedback! Your responses have been recorded.'
        
        // Create feedback session in database
        await supabase
          .from('feedback_sessions')
          .insert({
            organization_id: progress.organization_id,
            phone_number: phoneNumber,
            status: 'completed',
            metadata: sessionData,
            completed_at: new Date().toISOString()
          })
        break

      default:
        responseMessage = 'Thank you for your message. Reply "START" to begin a new feedback session.'
        break
    }

    // Update conversation progress
    await supabase
      .from('sms_conversation_progress')
      .update({
        current_step: nextStep,
        session_data: sessionData,
        last_message_id: messageId,
        consent_given: sessionData.consent_given || false
      })
      .eq('id', progress.id)

    // Send response message if needed
    if (responseMessage) {
      // Get Flask wrapper URL to send response
      const { data: settingData } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'flask_sms_wrapper_base_url')
        .single()

      const flaskWrapperUrl = settingData?.setting_value?.replace(/\/$/, '');
      
      if (flaskWrapperUrl && org.sms_settings) {
        const smsSettings = typeof org.sms_settings === 'string' 
          ? JSON.parse(org.sms_settings) 
          : org.sms_settings

        const requestData = {
          org_id: org.id,
          recipients: [phoneNumber],
          message: responseMessage,
          sender: senderId,
          username: smsSettings.username,
          api_key: smsSettings.apiKey
        }

        // Create signature for Flask API
        const webhookSecret = org.webhook_secret || 'changeme';
        const requestBody = JSON.stringify(requestData);
        const signature = createHmac('sha256', webhookSecret)
          .update(requestBody)
          .digest('hex');

        try {
          const response = await fetch(`${flaskWrapperUrl}/send-sms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Signature': signature,
            },
            body: requestBody
          })

          if (!response.ok) {
            console.error('Failed to send response via Flask API:', response.status, response.statusText)
          } else {
            console.log('Response sent successfully via Flask API')
          }
        } catch (error) {
          console.error('Error sending response via Flask API:', error)
        }
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
