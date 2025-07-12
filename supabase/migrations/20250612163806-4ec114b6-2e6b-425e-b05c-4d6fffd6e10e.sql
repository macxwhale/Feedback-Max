
-- Create question_categories table
CREATE TABLE public.question_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create question_types table
CREATE TABLE public.question_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_name TEXT NOT NULL,
  supports_options BOOLEAN DEFAULT false,
  supports_scale BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new foreign key columns to questions table
ALTER TABLE public.questions 
ADD COLUMN category_id UUID REFERENCES public.question_categories(id),
ADD COLUMN type_id UUID REFERENCES public.question_types(id);

-- Populate question_categories table
INSERT INTO public.question_categories (name, description) VALUES
('QualityCommunication', 'Questions about communication quality'),
('QualityStaff', 'Questions about staff service quality'),
('ValueForMoney', 'Questions about value for money'),
('QualityService', 'Questions about overall service quality'),
('LikeliRecommend', 'Questions about likelihood to recommend'),
('DidWeMakeEasy', 'Questions about ease of doing business'),
('Comments', 'Open-ended comment questions');

-- Populate question_types table
INSERT INTO public.question_types (name, display_name, description, supports_options, supports_scale) VALUES
('star', 'Star Rating', 'Star rating from 1 to 5', false, true),
('nps', 'NPS Score', 'Net Promoter Score from 0 to 10', false, true),
('likert', 'Likert Scale', 'Agreement scale with labels', false, true),
('emoji', 'Emoji Rating', 'Emoji-based rating system', true, false),
('single-choice', 'Single Choice', 'Select one option from multiple choices', true, false),
('multi-choice', 'Multiple Choice', 'Select multiple options from choices', true, false),
('text', 'Text Input', 'Open text input field', false, false),
('ranking', 'Ranking', 'Rank options in order of preference', true, false),
('matrix', 'Matrix Question', 'Multiple questions with same scale', true, true),
('slider', 'Slider', 'Continuous scale slider', false, true);

-- Update existing questions to use the new foreign keys
UPDATE public.questions 
SET category_id = (
  SELECT id FROM public.question_categories 
  WHERE name = questions.category::text
),
type_id = (
  SELECT id FROM public.question_types 
  WHERE name = questions.question_type
);

-- Make the new foreign keys required
ALTER TABLE public.questions 
ALTER COLUMN category_id SET NOT NULL,
ALTER COLUMN type_id SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX idx_questions_category_id ON public.questions(category_id);
CREATE INDEX idx_questions_type_id ON public.questions(type_id);

-- Enable RLS on new tables
ALTER TABLE public.question_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_types ENABLE ROW LEVEL SECURITY;

-- Create policies for question_categories (public read)
CREATE POLICY "Anyone can view question categories" 
  ON public.question_categories 
  FOR SELECT 
  USING (true);

-- Create policies for question_types (public read)
CREATE POLICY "Anyone can view question types" 
  ON public.question_types 
  FOR SELECT 
  USING (true);

-- Add organizations management columns for billing and trials
ALTER TABLE public.organizations
ADD COLUMN plan_type TEXT DEFAULT 'free',
ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN billing_email TEXT,
ADD COLUMN max_responses INTEGER DEFAULT 100,
ADD COLUMN created_by_user_id UUID,
ADD COLUMN settings JSONB DEFAULT '{}';

-- Create admin_users table for system administrators
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization_users table for org-specific authentication
CREATE TABLE public.organization_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Enable RLS on new auth tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_users (admins can view other admins)
CREATE POLICY "Admins can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_super_admin = true)
  );

-- RLS policies for organization_users (users can view their org members)
CREATE POLICY "Users can view their org members" 
  ON public.organization_users 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    organization_id IN (
      SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()
    )
  );

-- Create indexes for new tables
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_organization_users_org_id ON public.organization_users(organization_id);
CREATE INDEX idx_organization_users_user_id ON public.organization_users(user_id);
CREATE INDEX idx_organizations_plan_type ON public.organizations(plan_type);
