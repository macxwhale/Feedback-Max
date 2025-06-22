
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SmsResult } from './types.ts';

export async function recordSmsResult(
  supabase: SupabaseClient,
  result: SmsResult,
  campaignId: string | undefined,
  organizationId: string,
  messageContent: string
): Promise<void> {
  const isSuccess = result.status === 'sent';
  
  console.log(`[BULK-SMS] Result for ${result.phoneNumber}:`, {
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
      phone_number: result.phoneNumber,
      message_content: messageContent,
      status: result.status,
      africastalking_message_id: result.messageId,
      error_message: result.error,
      sent_at: isSuccess ? new Date().toISOString() : null
    });

  if (insertError) {
    console.error(`[BULK-SMS] Error recording SMS send for ${result.phoneNumber}:`, insertError);
  }
}

export async function updateCampaignStats(
  supabase: SupabaseClient,
  campaignId: string,
  sentCount: number,
  failedCount: number
): Promise<void> {
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
