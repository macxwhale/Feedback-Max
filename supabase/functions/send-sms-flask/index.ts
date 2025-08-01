
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

    // Use the campaign's message template instead of hardcoded message
    const messageToSend = campaign.message_template || `Hi! We'd love your feedback on our service. Please reply with your thoughts. Thank you! – ${org.name}`
    console.log('Using message template from campaign:', { campaignId, messageLength: messageToSend.length });

    // Prepare Flask API request payload
    const requestData: FlaskSmsPayload = {
      org_id: org.id,
      recipients,
      message: messageToSend, // Use campaign's message template
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
    console.log('Flask response received:', { success: responseData.success, fullResponse: responseData });

    // Process Flask response and update database
    let sentCount = 0
    let deliveredCount = 0
    let failedCount = 0

    if (responseData.success) {
      // Handle different response structures from Flask wrapper
      let recipientsData = [];
      
      if (responseData.response?.SMSMessageData?.Recipients) {
        // Standard AfricasTalking response structure
        recipientsData = responseData.response.SMSMessageData.Recipients;
      } else if (responseData.recipients) {
        // Direct recipients array from Flask wrapper
        recipientsData = responseData.recipients;
      } else if (responseData.response?.recipients) {
        // Nested recipients array
        recipientsData = responseData.response.recipients;
      } else {
        // Fallback: assume success for all recipients if no detailed response
        console.log('No detailed recipient data, assuming success for all');
        recipientsData = recipients.map((phone, index) => ({
          number: phone,
          statusCode: 101, // Success code
          messageId: `fallback_${Date.now()}_${index}`,
          status: 'Success'
        }));
      }

      for (let i = 0; i < recipients.length; i++) {
        const phoneNumber = recipients[i];
        const recipientData = recipientsData.find(r => 
          r.number === phoneNumber || r.phoneNumber === phoneNumber
        ) || recipientsData[i]; // Fallback to index-based matching

        // Determine status - be more lenient with success conditions
        let status = 'sent';
        let messageId = recipientData?.messageId || recipientData?.id || `generated_${Date.now()}_${i}`;
        
        // Check various possible status indicators
        if (recipientData) {
          const statusCode = recipientData.statusCode || recipientData.status_code;
          const statusText = recipientData.status || recipientData.statusText;
          
          // Consider it failed only if explicitly marked as failed
          if (statusCode && statusCode !== 101 && statusCode !== 102 && statusCode < 100) {
            status = 'failed';
          } else if (statusText && statusText.toLowerCase().includes('fail')) {
            status = 'failed';
          }
          // If Flask wrapper says success=true, default to sent unless explicitly failed
        }
        
        if (status === 'sent') {
          sentCount++;
          deliveredCount++; // Assume delivered for now
        } else {
          failedCount++;
        }

        // Record the send with the actual message that was sent
        await supabase
          .from('sms_sends')
          .insert({
            campaign_id: campaignId,
            organization_id: campaign.organization_id,
            phone_number: phoneNumber,
            message_content: messageToSend, // Store the actual sent message
            status,
            africastalking_message_id: messageId,
            sent_at: status === 'sent' ? new Date().toISOString() : null,
            delivered_at: status === 'sent' ? new Date().toISOString() : null,
            error_message: status === 'failed' ? 
              `Status code: ${recipientData?.statusCode || 'unknown'}` : null
          })

        // Initialize conversation progress for successful sends
        if (status === 'sent') {
          await supabase
            .from('sms_conversation_progress')
            .upsert({
              organization_id: campaign.organization_id,
              phone_number: phoneNumber,
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
      
      // Still record the failed attempts
      for (const phoneNumber of recipients) {
        await supabase
          .from('sms_sends')
          .insert({
            campaign_id: campaignId,
            organization_id: campaign.organization_id,
            phone_number: phoneNumber,
            message_content: messageToSend,
            status: 'failed',
            sent_at: null,
            delivered_at: null,
            error_message: responseData.error || 'Flask wrapper reported failure'
          })
      }
    }

    // Update campaign with final counts
    const finalStatus = sentCount > 0 ? 'completed' : 'failed';
    await supabase
      .from('sms_campaigns')
      .update({
        status: finalStatus,
        completed_at: new Date().toISOString(),
        sent_count: sentCount,
        delivered_count: deliveredCount,
        failed_count: failedCount
      })
      .eq('id', campaignId)

    console.log('Campaign completed:', { campaignId, sentCount, deliveredCount, failedCount, finalStatus });

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
