
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface BulkSmsRequest {
  phoneNumbers: string[];
  message: string;
  organizationId: string;
  campaignId?: string;
  senderId?: string;
}

interface AfricasTalkingBulkResponse {
  SMSMessageData: {
    Message: string;
    Recipients: Array<{
      statusCode: number;
      number: string;
      status: string;
      cost: string;
      messageId: string;
    }>;
  };
}

interface SmsResult {
  phoneNumber: string;
  status: 'sent' | 'failed';
  messageId?: string;
  cost?: string;
  error?: string;
  statusCode?: number;
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

    const { phoneNumbers, message, organizationId, campaignId, senderId }: BulkSmsRequest = await req.json();

    console.log(`[BULK-SMS] Starting bulk SMS send for org ${organizationId}`, {
      campaignId,
      recipientCount: phoneNumbers.length,
      messageLength: message.length,
      hasSenderId: !!senderId
    });

    // Get organization SMS settings
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('sms_settings, sms_sender_id, name')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      console.error(`[BULK-SMS] Organization not found:`, orgError);
      throw new Error('Organization not found or SMS not configured');
    }

    if (!organization.sms_settings?.username || !organization.sms_settings?.apiKey) {
      console.error(`[BULK-SMS] SMS credentials not configured for org ${organizationId}`);
      throw new Error('SMS credentials not configured');
    }

    console.log(`[BULK-SMS] Using SMS settings for org: ${organization.name}`, {
      username: organization.sms_settings.username,
      hasApiKey: !!organization.sms_settings.apiKey,
      senderId: senderId || organization.sms_sender_id || 'default'
    });

    // Prepare Africa's Talking bulk SMS request
    const bulkSmsPayload = {
      username: organization.sms_settings.username,
      message: message,
      senderId: senderId || organization.sms_sender_id || undefined,
      phoneNumbers: phoneNumbers
    };

    console.log(`[BULK-SMS] Sending bulk SMS request:`, {
      ...bulkSmsPayload,
      phoneNumbers: `${phoneNumbers.length} numbers`
    });

    // Send bulk SMS via Africa's Talking
    const atResponse = await fetch('https://api.africastalking.com/version1/messaging/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'apiKey': organization.sms_settings.apiKey
      },
      body: JSON.stringify(bulkSmsPayload)
    });

    console.log(`[BULK-SMS] Africa's Talking response status: ${atResponse.status}`);
    
    const responseText = await atResponse.text();
    console.log(`[BULK-SMS] Raw response:`, responseText);

    // Parse response
    let atResult: AfricasTalkingBulkResponse;
    try {
      atResult = JSON.parse(responseText);
    } catch (jsonError) {
      console.error(`[BULK-SMS] Failed to parse JSON response:`, jsonError);
      throw new Error(`API Error: ${responseText.substring(0, 200)}`);
    }

    console.log(`[BULK-SMS] Parsed response:`, {
      message: atResult.SMSMessageData?.Message,
      recipientCount: atResult.SMSMessageData?.Recipients?.length || 0
    });

    // Process results
    const results: SmsResult[] = [];
    let totalCost = 0;
    let sentCount = 0;
    let failedCount = 0;

    if (atResult.SMSMessageData?.Recipients) {
      for (const recipient of atResult.SMSMessageData.Recipients) {
        const isSuccess = recipient.status === 'Success' || recipient.statusCode === 101;
        const result: SmsResult = {
          phoneNumber: recipient.number,
          status: isSuccess ? 'sent' : 'failed',
          messageId: recipient.messageId,
          cost: recipient.cost,
          statusCode: recipient.statusCode,
          error: !isSuccess ? recipient.status : undefined
        };

        results.push(result);
        
        if (isSuccess) {
          sentCount++;
          // Extract cost value (e.g., "KES 0.8000" -> 0.8)
          const costMatch = recipient.cost?.match(/[\d.]+/);
          if (costMatch) {
            totalCost += parseFloat(costMatch[0]);
          }
        } else {
          failedCount++;
        }

        console.log(`[BULK-SMS] Result for ${recipient.number}:`, {
          status: result.status,
          messageId: result.messageId,
          cost: result.cost,
          statusCode: result.statusCode
        });

        // Record individual SMS send in database
        const { error: insertError } = await supabase
          .from('sms_sends')
          .insert({
            campaign_id: campaignId,
            organization_id: organizationId,
            phone_number: recipient.number,
            message_content: message,
            status: result.status,
            africastalking_message_id: result.messageId,
            error_message: result.error,
            sent_at: isSuccess ? new Date().toISOString() : null
          });

        if (insertError) {
          console.error(`[BULK-SMS] Error recording SMS send for ${recipient.number}:`, insertError);
        }
      }
    }

    console.log(`[BULK-SMS] Bulk SMS completed:`, {
      total: results.length,
      sent: sentCount,
      failed: failedCount,
      totalCost: totalCost,
      campaignId
    });

    // Update campaign statistics if provided
    if (campaignId) {
      const { error: campaignError } = await supabase
        .from('sms_campaigns')
        .update({
          sent_count: sentCount,
          failed_count: failedCount,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (campaignError) {
        console.error(`[BULK-SMS] Error updating campaign stats:`, campaignError);
      }
    }

    const summary = {
      total: results.length,
      sent: sentCount,
      failed: failedCount,
      totalCost: totalCost,
      message: atResult.SMSMessageData?.Message
    };

    console.log(`[BULK-SMS] Final summary:`, summary);

    return new Response(JSON.stringify({
      success: true,
      results,
      summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[BULK-SMS] Error in send-sms function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
