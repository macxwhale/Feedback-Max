
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

    // Validate input parameters
    if (!phoneNumbers || phoneNumbers.length === 0) {
      throw new Error('No phone numbers provided');
    }

    if (!message || message.trim().length === 0) {
      throw new Error('Message content is required');
    }

    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    // Check if campaign is still in sending status (not cancelled/paused)
    if (campaignId) {
      const { data: campaign, error: campaignError } = await supabase
        .from('sms_campaigns')
        .select('status')
        .eq('id', campaignId)
        .single();

      if (campaignError) {
        console.error(`[BULK-SMS] Error checking campaign status:`, campaignError);
        throw new Error('Failed to verify campaign status');
      }

      if (campaign.status !== 'sending') {
        console.log(`[BULK-SMS] Campaign ${campaignId} is no longer in sending status: ${campaign.status}`);
        throw new Error(`Campaign has been ${campaign.status}`);
      }
    }

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
      
      // If all messages failed, mark campaign as failed
      if (summary.failed === results.length && summary.sent === 0) {
        await supabase
          .from('sms_campaigns')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', campaignId);
      } else {
        // Mark campaign as completed
        await supabase
          .from('sms_campaigns')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', campaignId);
      }
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
    
    // Extract campaignId from the request body for error handling
    try {
      const body = await req.clone().json();
      if (body.campaignId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );
        
        // Mark campaign as failed
        await supabase
          .from('sms_campaigns')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', body.campaignId);
      }
    } catch (updateError) {
      console.error('[BULK-SMS] Error updating campaign status:', updateError);
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
