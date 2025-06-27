
-- Add Flask wrapper configuration to organizations table
ALTER TABLE public.organizations 
ADD COLUMN flask_sms_wrapper_url TEXT,
ADD COLUMN sms_integration_type TEXT NOT NULL DEFAULT 'direct' CHECK (sms_integration_type IN ('direct', 'flask_wrapper'));

-- Create table to track SMS conversation progress per organization
CREATE TABLE public.sms_conversation_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  sender_id TEXT NOT NULL, -- The 'to' field from callback (org identifier)
  current_step TEXT NOT NULL DEFAULT 'consent', -- consent, question_1, question_2, etc.
  session_data JSONB DEFAULT '{}'::jsonb,
  consent_given BOOLEAN DEFAULT false,
  last_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, phone_number, sender_id)
);

-- Enable RLS on sms_conversation_progress
ALTER TABLE public.sms_conversation_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sms_conversation_progress
CREATE POLICY "Organization members can view conversation progress" ON public.sms_conversation_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = sms_conversation_progress.organization_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Organization admins can manage conversation progress" ON public.sms_conversation_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = sms_conversation_progress.organization_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER set_sms_conversation_progress_updated_at
  BEFORE UPDATE ON public.sms_conversation_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Create index for performance
CREATE INDEX idx_sms_conversation_progress_org_phone ON public.sms_conversation_progress(organization_id, phone_number);
CREATE INDEX idx_sms_conversation_progress_sender ON public.sms_conversation_progress(sender_id);

-- Add system-wide Flask wrapper URL setting
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on system_settings (only admins can access)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only system admins can access system settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND is_super_admin = true
    )
  );

-- Insert default Flask wrapper URL setting
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES ('flask_sms_wrapper_base_url', '', 'Base URL for the Flask SMS wrapper API')
ON CONFLICT (setting_key) DO NOTHING;
