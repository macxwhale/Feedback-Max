
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const callback: FlaskSmsCallback = await req.json()
    console.log('Flask SMS callback received:', callback)

    const { linkId, text, to: senderId, id: messageId, date, from: phoneNumber } = callback

    // Get conversation progress
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

    // Get organization details
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
      const flaskWrapperUrl = Deno.env.get('FLASK_SMS_WRAPPER_URL') || ''
      
      if (flaskWrapperUrl && org.sms_settings) {
        const smsSettings = typeof org.sms_settings === 'string' 
          ? JSON.parse(org.sms_settings) 
          : org.sms_settings

        const requestData = {
          username: smsSettings.username,
          api_key: smsSettings.apiKey,
          recipients: [phoneNumber],
          message: responseMessage,
          sender: senderId,
          org_id: org.id
        }

        try {
          const response = await fetch(`${flaskWrapperUrl}/send-sms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
          })

          if (!response.ok) {
            console.error('Failed to send response via Flask API:', response.statusText)
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
