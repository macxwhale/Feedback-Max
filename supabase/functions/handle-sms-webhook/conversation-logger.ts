
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function logSmsConversation(
  supabase: SupabaseClient,
  sessionId: string | undefined,
  direction: 'inbound' | 'outbound',
  content: string,
  messageId?: string
): Promise<void> {
  if (!sessionId) return;

  try {
    await supabase
      .from('sms_conversations')
      .insert({
        sms_session_id: sessionId,
        direction: direction,
        content: content,
        africastalking_message_id: messageId
      });
  } catch (error) {
    console.error('Error logging SMS conversation:', error);
  }
}
