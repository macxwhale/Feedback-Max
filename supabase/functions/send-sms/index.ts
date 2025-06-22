
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { BulkSmsRequest } from './types.ts';
import { getOrganizationSmsSettings } from './organization-service.ts';
import { sendBulkSms } from './sms-service.ts';
import { recordSmsResult, updateCampaignStats } from './database-service.ts';

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
    const organization = await getOrganizationSmsSettings(supabase, organizationId);

    console.log(`[BULK-SMS] Using SMS settings for org: ${organization.name}`, {
      username: organization.sms_settings.username,
      hasApiKey: !!organization.sms_settings.apiKey,
      senderId: senderId || organization.sms_sender_id || 'default'
    });

    // Send bulk SMS via Africa's Talking
    const { results, summary } = await sendBulkSms({
      phoneNumbers,
      message,
      username: organization.sms_settings.username,
      apiKey: organization.sms_settings.apiKey,
      senderId: senderId || organization.sms_sender_id
    });

    // Record results in database
    for (const result of results) {
      await recordSmsResult(supabase, result, campaignId, organizationId, message);
    }

    console.log(`[BULK-SMS] Bulk SMS completed:`, {
      total: results.length,
      sent: summary.sent,
      failed: summary.failed,
      totalCost: summary.totalCost,
      campaignId
    });

    // Update campaign statistics if provided
    if (campaignId) {
      await updateCampaignStats(supabase, campaignId, summary.sent, summary.failed);
    }

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
