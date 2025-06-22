
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Organization } from './types.ts';

export async function sendSmsResponse(
  organization: Organization,
  to: string,
  message: string,
  supabase: SupabaseClient,
  sessionId?: string
): Promise<void> {
  try {
    console.log(`Sending SMS response to ${to}`);
    
    const atData = new URLSearchParams();
    atData.append('username', organization.sms_settings.username);
    atData.append('to', to);
    atData.append('message', message);
    if (organization.sms_sender_id) {
      atData.append('from', organization.sms_sender_id);
    }

    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'apiKey': organization.sms_settings.apiKey
      },
      body: atData.toString()
    });

    const result = await response.text();
    console.log('SMS send result:', result);

    // Log outbound conversation
    if (sessionId) {
      await supabase
        .from('sms_conversations')
        .insert({
          sms_session_id: sessionId,
          direction: 'outbound',
          content: message
        });
    }

  } catch (error) {
    console.error('Error sending SMS response:', error);
  }
}
