
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SmsSession, Organization } from './types.ts';

export async function findOrCreateSmsSession(
  supabase: SupabaseClient,
  phoneNumber: string,
  organization: Organization,
  text: string
): Promise<{ session: SmsSession | null; shouldCreateNew: boolean }> {
  // Check for existing active session
  const { data: existingSession } = await supabase
    .from('sms_sessions')
    .select('*')
    .eq('phone_number', phoneNumber)
    .eq('organization_id', organization.id)
    .eq('status', 'started')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const isStartCommand = text.toLowerCase().includes('start') || text.toLowerCase().includes('begin');
  
  if (!existingSession && isStartCommand) {
    return { session: null, shouldCreateNew: true };
  }
  
  if (!existingSession && !isStartCommand) {
    return { session: null, shouldCreateNew: false };
  }
  
  return { session: existingSession, shouldCreateNew: false };
}

export async function createNewSmsSession(
  supabase: SupabaseClient,
  phoneNumber: string,
  organizationId: string
): Promise<SmsSession> {
  // Create feedback session first
  const { data: feedbackSession, error: feedbackError } = await supabase
    .from('feedback_sessions')
    .insert({
      organization_id: organizationId,
      phone_number: phoneNumber,
      status: 'in_progress'
    })
    .select()
    .single();

  if (feedbackError) throw feedbackError;

  // Create SMS session
  const { data: smsSession, error: sessionError } = await supabase
    .from('sms_sessions')
    .insert({
      organization_id: organizationId,
      phone_number: phoneNumber,
      feedback_session_id: feedbackSession.id,
      current_question_index: 0,
      responses: {},
      status: 'started'
    })
    .select()
    .single();

  if (sessionError) throw sessionError;
  return smsSession;
}
