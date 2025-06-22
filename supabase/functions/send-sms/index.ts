
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SendSmsRequest, SmsResult, SmsSummary } from './types.ts';
import { getOrganizationSmsSettings } from './organization-service.ts';
import { sendSmsToNumber } from './sms-sender.ts';
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

    const { phoneNumbers, message, organizationId, campaignId }: SendSmsRequest = await req.json();

    console.log(`Starting SMS send for org ${organizationId}, campaign ${campaignId}`);

    // Get organization SMS settings
    const organization = await getOrganizationSmsSettings(supabase, organizationId);

    const results: SmsResult[] = [];

    // Send SMS to each phone number
    for (const phoneNumber of phoneNumbers) {
      const result = await sendSmsToNumber(phoneNumber, message, organization);
      results.push(result);

      // Record the SMS send in database
      await recordSmsResult(supabase, result, campaignId, organizationId, message);
    }

    // Update campaign statistics
    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    await updateCampaignStats(supabase, campaignId, sentCount, failedCount);

    console.log(`SMS campaign ${campaignId} completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    const summary: SmsSummary = {
      total: results.length,
      sent: sentCount,
      failed: failedCount
    };

    return new Response(JSON.stringify({
      success: true,
      results,
      summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-sms function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
