
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendSmsRequest {
  campaignId: string;
  isResend?: boolean;
  isRetry?: boolean;
}

interface FlaskSmsPayload {
  org_id: string;
  recipients: string[];
  message: string;
  sender: string;
  username: string;
  api_key: string;
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

    const { campaignId, isResend = false, isRetry = false }: SendSmsRequest = await req.json()
    console.log('Processing SMS campaign:', { campaignId, isResend, isRetry });

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('sms_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      console.error('Campaign not found:', campaignError);
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get organization and SMS settings
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', campaign.organization_id)
      .single()

    if (orgError || !org) {
      console.error('Organization not found:', orgError);
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!org.sms_enabled || !org.sms_settings) {
      return new Response(JSON.stringify({ error: 'SMS not configured for organization' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const smsSettings = typeof org.sms_settings === 'string' ? JSON.parse(org.sms_settings) : org.sms_settings
    console.log('SMS settings loaded for org:', org.name);

    // Get phone numbers for the campaign
    const { data: phoneNumbers, error: phoneError } = await supabase
      .from('sms_phone_numbers')
      .select('phone_number')
      .eq('organization_id', campaign.organization_id)
      .eq('status', 'active')

    if (phoneError) {
      console.error('Error fetching phone numbers:', phoneError);
      return new Response(JSON.stringify({ error: 'Failed to get phone numbers' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!phoneNumbers || phoneNumbers.length === 0) {
      return new Response(JSON.stringify({ error: 'No active phone numbers found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get Flask wrapper URL
    const { data: settingData, error: settingError } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'flask_sms_wrapper_base_url')
      .single()

    if (settingError || !settingData?.setting_value) {
      console.error('Flask wrapper URL not configured:', settingError);
      return new Response(JSON.stringify({ error: 'Flask SMS wrapper URL not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const flaskWrapperUrl = settingData.setting_value.replace(/\/$/, ''); // Remove trailing slash
    console.log('Using Flask wrapper URL:', flaskWrapperUrl);

    // Update campaign status
    await supabase
      .from('sms_campaigns')
      .update({
        status: 'sending',
        started_at: new Date().toISOString(),
        total_recipients: phoneNumbers.length
      })
      .eq('id', campaignId)

    const recipients = phoneNumbers.map(p => p.phone_number)

    // Enhanced message template with consent request
    const consentMessage = `Hi! We'd love your feedback on our service. 

Please reply with:
1. Yes  
2. No

Your input helps us improve. 
Thank you! – ${org.name}`

    // Prepare Flask API request payload
    const requestData: FlaskSmsPayload = {
      org_id: org.id,
      recipients,
      message: consentMessage, // Use consent message instead of campaign template
      sender: org.sms_sender_id || smsSettings.senderId || '41042',
      username: smsSettings.username,
      api_key: smsSettings.apiKey
    }

    // Create signature for Flask API
    const webhookSecret = org.webhook_secret || 'changeme';
    const bodyString = JSON.stringify(requestData);
    const signature = createHmac('sha256', webhookSecret)
      .update(bodyString)
      .digest('hex');

    console.log('Sending campaign via Flask wrapper:', { 
      campaignId, 
      recipients: recipients.length,
      flaskUrl: `${flaskWrapperUrl}/send-sms`
    });

    // Send via Flask wrapper
    const response = await fetch(`${flaskWrapperUrl}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
      },
      body: bodyString
    })

    if (!response.ok) {
      console.error('Flask API error:', response.status, response.statusText);
      await supabase
        .from('sms_campaigns')
        .update({ status: 'failed' })
        .eq('id', campaignId)

      return new Response(JSON.stringify({ 
        error: `Flask API error: ${response.status} ${response.statusText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const responseData = await response.json()
    console.log('Flask response received:', { success: responseData.success, recipients: responseData.response?.SMSMessageData?.Recipients?.length });

    // Process Flask response and update database
    let sentCount = 0
    let deliveredCount = 0
    let failedCount = 0

    if (responseData.success && responseData.response?.SMSMessageData?.Recipients) {
      for (const recipient of responseData.response.SMSMessageData.Recipients) {
        const status = recipient.statusCode === 101 ? 'sent' : 'failed'
        
        if (status === 'sent') {
          sentCount++
          deliveredCount++ // Assume delivered for now
        } else {
          failedCount++
        }

        // Record the send
        await supabase
          .from('sms_sends')
          .insert({
            campaign_id: campaignId,
            organization_id: campaign.organization_id,
            phone_number: recipient.number,
            message_content: consentMessage, // Store the actual sent message
            status,
            africastalking_message_id: recipient.messageId,
            sent_at: status === 'sent' ? new Date().toISOString() : null,
            delivered_at: status === 'sent' ? new Date().toISOString() : null,
            error_message: status === 'failed' ? `Status code: ${recipient.statusCode}` : null
          })

        // Initialize conversation progress for successful sends
        if (status === 'sent') {
          await supabase
            .from('sms_conversation_progress')
            .upsert({
              organization_id: campaign.organization_id,
              phone_number: recipient.number,
              sender_id: requestData.sender,
              current_step: 'consent',
              consent_given: false,
              session_data: { 
                campaign_id: campaignId,
                initiated_at: new Date().toISOString()
              }
            }, {
              onConflict: 'organization_id,phone_number,sender_id'
            })
        }
      }
    } else {
      // Handle failed response from Flask
      failedCount = recipients.length;
      console.error('Flask API returned unsuccessful response:', responseData);
    }

    // Update campaign with final counts
    await supabase
      .from('sms_campaigns')
      .update({
        status: sentCount > 0 ? 'completed' : 'failed',
        completed_at: new Date().toISOString(),
        sent_count: sentCount,
        delivered_count: deliveredCount,
        failed_count: failedCount
      })
      .eq('id', campaignId)

    console.log('Campaign completed:', { campaignId, sentCount, deliveredCount, failedCount });

    return new Response(JSON.stringify({
      success: true,
      campaignId,
      sentCount,
      deliveredCount,
      failedCount,
      flaskResponse: responseData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Send SMS Flask error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
