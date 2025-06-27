
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendSmsRequest {
  campaignId: string;
  isResend?: boolean;
  isRetry?: boolean;
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

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('sms_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
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

    // Get phone numbers for the campaign
    let phoneNumbersQuery = supabase
      .from('sms_phone_numbers')
      .select('phone_number')
      .eq('organization_id', campaign.organization_id)
      .eq('status', 'active')

    const { data: phoneNumbers, error: phoneError } = await phoneNumbersQuery

    if (phoneError) {
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
    const { data: settingData } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'flask_sms_wrapper_base_url')
      .single()

    const flaskWrapperUrl = settingData?.setting_value
    if (!flaskWrapperUrl) {
      return new Response(JSON.stringify({ error: 'Flask SMS wrapper URL not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

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

    // Prepare Flask API request
    const requestData = {
      username: smsSettings.username,
      api_key: smsSettings.apiKey,
      recipients,
      message: campaign.message_template,
      sender: org.sms_sender_id || smsSettings.senderId || '41042',
      org_id: org.id
    }

    console.log('Sending campaign via Flask wrapper:', { campaignId, recipients: recipients.length })

    // Send via Flask wrapper
    const response = await fetch(`${flaskWrapperUrl}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      await supabase
        .from('sms_campaigns')
        .update({ status: 'failed' })
        .eq('id', campaignId)

      return new Response(JSON.stringify({ error: `Flask API error: ${response.statusText}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const responseData = await response.json()
    console.log('Flask response:', responseData)

    // Process Flask response and update database
    let sentCount = 0
    let deliveredCount = 0
    let failedCount = 0

    if (responseData.SMSMessageData?.Recipients) {
      for (const recipient of responseData.SMSMessageData.Recipients) {
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
            message_content: campaign.message_template,
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
              session_data: { campaign_id: campaignId }
            }, {
              onConflict: 'organization_id,phone_number,sender_id'
            })
        }
      }
    }

    // Update campaign with final counts
    await supabase
      .from('sms_campaigns')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        sent_count: sentCount,
        delivered_count: deliveredCount,
        failed_count: failedCount
      })
      .eq('id', campaignId)

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
    console.error('Send SMS error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
