
-- Create table for managing phone numbers
CREATE TABLE public.sms_phone_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  name TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'opted_out')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_user_id UUID,
  UNIQUE(organization_id, phone_number)
);

-- Create table for SMS campaigns
CREATE TABLE public.sms_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message_template TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'paused')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_user_id UUID
);

-- Create table for tracking individual SMS sends
CREATE TABLE public.sms_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.sms_campaigns(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  phone_number_id UUID REFERENCES public.sms_phone_numbers(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  africastalking_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sms_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_sends ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sms_phone_numbers
CREATE POLICY "Organization members can view phone numbers" ON public.sms_phone_numbers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = sms_phone_numbers.organization_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Organization admins can manage phone numbers" ON public.sms_phone_numbers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = sms_phone_numbers.organization_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Create RLS policies for sms_campaigns
CREATE POLICY "Organization members can view campaigns" ON public.sms_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = sms_campaigns.organization_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Organization admins can manage campaigns" ON public.sms_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = sms_campaigns.organization_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Create RLS policies for sms_sends
CREATE POLICY "Organization members can view SMS sends" ON public.sms_sends
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = sms_sends.organization_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Organization admins can manage SMS sends" ON public.sms_sends
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = sms_sends.organization_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_sms_phone_numbers_org_id ON public.sms_phone_numbers(organization_id);
CREATE INDEX idx_sms_phone_numbers_status ON public.sms_phone_numbers(status);
CREATE INDEX idx_sms_campaigns_org_id ON public.sms_campaigns(organization_id);
CREATE INDEX idx_sms_campaigns_status ON public.sms_campaigns(status);
CREATE INDEX idx_sms_sends_campaign_id ON public.sms_sends(campaign_id);
CREATE INDEX idx_sms_sends_phone_number_id ON public.sms_sends(phone_number_id);
CREATE INDEX idx_sms_sends_status ON public.sms_sends(status);

-- Create triggers for updated_at
CREATE TRIGGER set_sms_phone_numbers_updated_at
  BEFORE UPDATE ON public.sms_phone_numbers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_sms_campaigns_updated_at
  BEFORE UPDATE ON public.sms_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_sms_sends_updated_at
  BEFORE UPDATE ON public.sms_sends
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
