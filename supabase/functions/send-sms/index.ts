
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { phoneNumbers, message, organizationId, campaignId } = await req.json()

    console.log(`Starting SMS send for org ${organizationId}, campaign ${campaignId}`)

    // Get organization SMS settings
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('sms_settings, sms_sender_id')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      throw new Error('Organization not found or SMS not configured')
    }

    if (!org.sms_settings?.username || !org.sms_settings?.apiKey) {
      throw new Error('SMS credentials not configured')
    }

    const results = []

    // Send SMS to each phone number
    for (const phoneNumber of phoneNumbers) {
      try {
        console.log(`Sending SMS to ${phoneNumber}`)

        // Prepare Africa's Talking API request
        const atData = new URLSearchParams()
        atData.append('username', org.sms_settings.username)
        atData.append('to', phoneNumber)
        atData.append('message', message)
        if (org.sms_sender_id) {
          atData.append('from', org.sms_sender_id)
        }

        // Send SMS via Africa's Talking
        const atResponse = await fetch('https://api.africastalking.com/version1/messaging', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'apiKey': org.sms_settings.apiKey
          },
          body: atData.toString()
        })

        const atResult = await atResponse.json()
        console.log(`Africa's Talking response for ${phoneNumber}:`, atResult)

        let status = 'failed'
        let messageId = null
        let errorMessage = null

        if (atResult.SMSMessageData?.Recipients?.length > 0) {
          const recipient = atResult.SMSMessageData.Recipients[0]
          if (recipient.status === 'Success') {
            status = 'sent'
            messageId = recipient.messageId
          } else {
            errorMessage = recipient.status
          }
        } else {
          errorMessage = atResult.SMSMessageData?.Message || 'Unknown error'
        }

        // Record the SMS send in database
        const { error: insertError } = await supabase
          .from('sms_sends')
          .insert({
            campaign_id: campaignId,
            organization_id: organizationId,
            phone_number: phoneNumber,
            message_content: message,
            status: status,
            africastalking_message_id: messageId,
            error_message: errorMessage,
            sent_at: status === 'sent' ? new Date().toISOString() : null
          })

        if (insertError) {
          console.error(`Error recording SMS send for ${phoneNumber}:`, insertError)
        }

        results.push({
          phoneNumber,
          status,
          messageId,
          error: errorMessage
        })

      } catch (error) {
        console.error(`Error sending SMS to ${phoneNumber}:`, error)
        
        // Record failed send
        await supabase
          .from('sms_sends')
          .insert({
            campaign_id: campaignId,
            organization_id: organizationId,
            phone_number: phoneNumber,
            message_content: message,
            status: 'failed',
            error_message: error.message
          })

        results.push({
          phoneNumber,
          status: 'failed',
          error: error.message
        })
      }
    }

    // Update campaign statistics
    const sentCount = results.filter(r => r.status === 'sent').length
    const failedCount = results.filter(r => r.status === 'failed').length

    await supabase
      .from('sms_campaigns')
      .update({
        sent_count: sentCount,
        failed_count: failedCount,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    console.log(`SMS campaign ${campaignId} completed. Sent: ${sentCount}, Failed: ${failedCount}`)

    return new Response(JSON.stringify({
      success: true,
      results,
      summary: {
        total: results.length,
        sent: sentCount,
        failed: failedCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-sms function:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
