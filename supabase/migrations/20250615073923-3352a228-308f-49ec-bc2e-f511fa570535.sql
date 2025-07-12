
-- Create a table for SMS feedback sessions
CREATE TABLE public.sms_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  feedback_session_id UUID REFERENCES public.feedback_sessions(id) ON DELETE SET NULL,
  current_question_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'started', -- e.g., started, in_progress, completed, expired
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() + INTERVAL '30 minutes',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index on phone_number and status for active sessions
CREATE INDEX idx_sms_sessions_phone_status ON public.sms_sessions(phone_number, status);

-- Enable RLS for sms_sessions
ALTER TABLE public.sms_sessions ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access, as this table will be managed by an edge function
CREATE POLICY "Allow full access to service role for sms_sessions" ON public.sms_sessions
FOR ALL
USING (true)
WITH CHECK (true);

-- Create a trigger to automatically update the 'updated_at' column
CREATE TRIGGER set_sms_sessions_updated_at
BEFORE UPDATE ON public.sms_sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Create a table for individual SMS messages
CREATE TABLE public.sms_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sms_session_id UUID NOT NULL REFERENCES public.sms_sessions(id) ON DELETE CASCADE,
  africastalking_message_id TEXT,
  direction TEXT NOT NULL, -- 'incoming' or 'outgoing'
  content TEXT NOT NULL,
  status TEXT, -- e.g., 'Sent', 'Delivered', 'Failed' (for outgoing)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index on sms_session_id for faster lookups
CREATE INDEX idx_sms_conversations_session_id ON public.sms_conversations(sms_session_id);

-- Enable RLS for sms_conversations
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
CREATE POLICY "Allow full access to service role for conversations" ON public.sms_conversations
FOR ALL
USING (true)
WITH CHECK (true);


-- Extend feedback_sessions table to link with SMS sessions
ALTER TABLE public.feedback_sessions
ADD COLUMN phone_number TEXT,
ADD COLUMN sms_session_id UUID REFERENCES public.sms_sessions(id) ON DELETE SET NULL;
