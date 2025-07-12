
-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#007ACE',
  secondary_color TEXT DEFAULT '#073763',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add organization_id to existing tables
ALTER TABLE public.questions 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.feedback_sessions 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.feedback_responses 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_questions_organization_id ON public.questions(organization_id);
CREATE INDEX idx_feedback_sessions_organization_id ON public.feedback_sessions(organization_id);
CREATE INDEX idx_feedback_responses_organization_id ON public.feedback_responses(organization_id);
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organizations_domain ON public.organizations(domain);

-- Enable RLS on organizations table
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organizations are public (anyone can read active ones)
CREATE POLICY "Anyone can view active organizations" 
  ON public.organizations 
  FOR SELECT 
  USING (is_active = true);

-- Update existing RLS policies to include organization filtering
DROP POLICY IF EXISTS "Anyone can view active questions" ON public.questions;
DROP POLICY IF EXISTS "Anyone can create responses" ON public.feedback_responses;
DROP POLICY IF EXISTS "Users can view their own responses" ON public.feedback_responses;
DROP POLICY IF EXISTS "Anyone can create sessions" ON public.feedback_sessions;
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.feedback_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.feedback_sessions;

-- New organization-aware policies for questions
CREATE POLICY "Anyone can view active questions for active orgs" 
  ON public.questions 
  FOR SELECT 
  USING (
    is_active = true 
    AND organization_id IN (
      SELECT id FROM public.organizations WHERE is_active = true
    )
  );

-- New organization-aware policies for feedback_responses
CREATE POLICY "Anyone can create responses for active orgs" 
  ON public.feedback_responses 
  FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT id FROM public.organizations WHERE is_active = true
    )
  );

CREATE POLICY "Anyone can view responses for active orgs" 
  ON public.feedback_responses 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE is_active = true
    )
  );

-- New organization-aware policies for feedback_sessions
CREATE POLICY "Anyone can create sessions for active orgs" 
  ON public.feedback_sessions 
  FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT id FROM public.organizations WHERE is_active = true
    )
  );

CREATE POLICY "Anyone can view sessions for active orgs" 
  ON public.feedback_sessions 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE is_active = true
    )
  );

CREATE POLICY "Anyone can update sessions for active orgs" 
  ON public.feedback_sessions 
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE is_active = true
    )
  );

-- Insert I&M Bank as the first organization
INSERT INTO public.organizations (name, slug, primary_color, secondary_color) 
VALUES ('I&M Bank Rwanda', 'im-bank', '#007ACE', '#073763');

-- Get the organization ID for updating existing data
DO $$
DECLARE 
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'im-bank';
    
    -- Update existing questions to belong to I&M Bank
    UPDATE public.questions SET organization_id = org_id WHERE organization_id IS NULL;
    
    -- Update existing sessions to belong to I&M Bank
    UPDATE public.feedback_sessions SET organization_id = org_id WHERE organization_id IS NULL;
    
    -- Update existing responses to belong to I&M Bank
    UPDATE public.feedback_responses SET organization_id = org_id WHERE organization_id IS NULL;
END $$;

-- Make organization_id required after updating existing data
ALTER TABLE public.questions ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.feedback_sessions ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.feedback_responses ALTER COLUMN organization_id SET NOT NULL;
