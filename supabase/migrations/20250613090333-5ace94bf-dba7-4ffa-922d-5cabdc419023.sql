
-- Phase 1: Create improved question schema with proper normalization

-- First, create the question_options table for storing multiple choice options
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_value TEXT, -- For scoring or specific values
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the question_scale_config table for scale configurations
CREATE TABLE IF NOT EXISTS public.question_scale_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  min_value INTEGER NOT NULL DEFAULT 1,
  max_value INTEGER NOT NULL DEFAULT 5,
  min_label TEXT,
  max_label TEXT,
  step_size INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_scale_range CHECK (max_value > min_value),
  CONSTRAINT valid_step_size CHECK (step_size > 0)
);

-- Add validation and logic fields to questions table
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS conditional_logic JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS help_text TEXT,
ADD COLUMN IF NOT EXISTS placeholder_text TEXT;

-- Update question_types to include more metadata
ALTER TABLE public.question_types
ADD COLUMN IF NOT EXISTS config_schema JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_display_order ON public.question_options(question_id, display_order);
CREATE INDEX IF NOT EXISTS idx_question_scale_config_question_id ON public.question_scale_config(question_id);
CREATE INDEX IF NOT EXISTS idx_questions_type_category ON public.questions(type_id, category_id);

-- Add RLS policies for new tables
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_scale_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for question_options
CREATE POLICY "Organization admins can manage question options" 
  ON public.question_options 
  FOR ALL 
  TO authenticated
  USING (
    question_id IN (
      SELECT q.id FROM public.questions q
      WHERE q.organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND status = 'active'
      )
    )
  )
  WITH CHECK (
    question_id IN (
      SELECT q.id FROM public.questions q
      WHERE q.organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND status = 'active'
      )
    )
  );

-- RLS policies for question_scale_config
CREATE POLICY "Organization admins can manage question scale config" 
  ON public.question_scale_config 
  FOR ALL 
  TO authenticated
  USING (
    question_id IN (
      SELECT q.id FROM public.questions q
      WHERE q.organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND status = 'active'
      )
    )
  )
  WITH CHECK (
    question_id IN (
      SELECT q.id FROM public.questions q
      WHERE q.organization_id IN (
        SELECT organization_id 
        FROM public.organization_users 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND status = 'active'
      )
    )
  );

-- Update question_types with proper configuration schemas
UPDATE public.question_types SET 
  config_schema = CASE 
    WHEN name = 'single-choice' OR name = 'multi-choice' THEN 
      '{"supports_options": true, "min_options": 2, "max_options": 20}'::jsonb
    WHEN name = 'star' OR name = 'likert' OR name = 'nps' OR name = 'slider' THEN 
      '{"supports_scale": true, "default_min": 1, "default_max": 5}'::jsonb
    WHEN name = 'text' THEN 
      '{"supports_validation": true, "max_length": 1000}'::jsonb
    WHEN name = 'matrix' THEN 
      '{"supports_options": true, "supports_scale": true, "min_rows": 2}'::jsonb
    ELSE '{}'::jsonb
  END,
  validation_rules = CASE 
    WHEN name = 'text' THEN 
      '{"max_length": {"value": 1000, "message": "Text cannot exceed 1000 characters"}}'::jsonb
    WHEN name = 'single-choice' THEN 
      '{"min_options": {"value": 2, "message": "At least 2 options required"}}'::jsonb
    WHEN name = 'multi-choice' THEN 
      '{"min_options": {"value": 2, "message": "At least 2 options required"}}'::jsonb
    ELSE '{}'::jsonb
  END
WHERE name IN ('single-choice', 'multi-choice', 'star', 'likert', 'nps', 'slider', 'text', 'matrix');
