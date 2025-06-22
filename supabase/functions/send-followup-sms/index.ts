
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface FollowUpSmsRequest {
  phoneNumber: string;
  message: string;
  organizationId: string;
  sessionId?: string;
  campaignId?: string;
  context?: string; // 'survey', 'reminder', 'followup', etc.
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

    const { phoneNumber, message, organizationId, sessionId, campaignId, context }: FollowUpSmsRequest = await req.json();

    console.log(`[FOLLOWUP-SMS] Sending follow-up SMS`, {
      phoneNumber,
      organizationId,
      sessionId,
      campaignId,
      context,
      messageLength: message.length
    });

    // Get organization SMS settings
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('sms_settings, sms_sender_id, name')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      console.error(`[FOLLOWUP-SMS] Organization not found:`, orgError);
      throw new Error('Organization not found');
    }

    if (!organization.sms_settings?.username || !organization.sms_settings?.apiKey) {
      console.error(`[FOLLOWUP-SMS] SMS credentials not configured for org ${organizationId}`);
      throw new Error('SMS credentials not configured');
    }

    console.log(`[FOLLOWUP-SMS] Using SMS settings for ${organization.name}`);

    // Prepare SMS request
    const smsData = new URLSearchParams();
    smsData.append('username', organization.sms_settings.username);
    smsData.append('to', phoneNumber);
    smsData.append('message', message);
    if (organization.sms_sender_id) {
      smsData.append('from', organization.sms_sender_id);
    }

    console.log(`[FOLLOWUP-SMS] Sending SMS to ${phoneNumber}`);

    // Send SMS via Africa's Talking
    const atResponse = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'apiKey': organization.sms_settings.apiKey
      },
      body: smsData.toString()
    });

    const responseText = await atResponse.text();
    console.log(`[FOLLOWUP-SMS] Africa's Talking response (${atResponse.status}):`, responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (jsonError) {
      console.error(`[FOLLOWUP-SMS] Failed to parse response:`, jsonError);
      throw new Error(`SMS API Error: ${responseText}`);
    }

    const isSuccess = result.SMSMessageData?.Recipients?.[0]?.status === 'Success';
    const messageId = result.SMSMessageData?.Recipients?.[0]?.messageId;
    const cost = result.SMSMessageData?.Recipients?.[0]?.cost;

    console.log(`[FOLLOWUP-SMS] SMS result:`, {
      success: isSuccess,
      messageId,
      cost,
      message: result.SMSMessageData?.Message
    });

    // Record the SMS send
    const { error: recordError } = await supabase
      .from('sms_sends')
      .insert({
        campaign_id: campaignId,
        organization_id: organizationId,
        phone_number: phoneNumber,
        message_content: message,
        status: isSuccess ? 'sent' : 'failed',
        africastalking_message_id: messageId,
        error_message: !isSuccess ? result.SMSMessageData?.Recipients?.[0]?.status : null,
        sent_at: isSuccess ? new Date().toISOString() : null
      });

    if (recordError) {
      console.error(`[FOLLOWUP-SMS] Error recording SMS:`, recordError);
    }

    // Log conversation if session exists
    if (sessionId && isSuccess) {
      const { error: conversationError } = await supabase
        .from('sms_conversations')
        .insert({
          sms_session_id: sessionId,
          direction: 'outbound',
          content: message,
          africastalking_message_id: messageId
        });

      if (conversationError) {
        console.error(`[FOLLOWUP-SMS] Error logging conversation:`, conversationError);
      }
    }

    return new Response(JSON.stringify({
      success: isSuccess,
      messageId,
      cost,
      message: result.SMSMessageData?.Message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[FOLLOWUP-SMS] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
