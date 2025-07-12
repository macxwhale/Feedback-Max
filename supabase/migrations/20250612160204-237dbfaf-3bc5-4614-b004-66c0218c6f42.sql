
-- Create enum for question categories
CREATE TYPE question_category AS ENUM (
  'QualityCommunication',
  'QualityStaff', 
  'ValueForMoney',
  'QualityService',
  'LikeliRecommend',
  'DidWeMakeEasy',
  'Comments'
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  category question_category NOT NULL,
  required BOOLEAN NOT NULL DEFAULT true,
  options JSONB,
  scale JSONB,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback_responses table
CREATE TABLE public.feedback_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  question_id UUID REFERENCES public.questions(id) NOT NULL,
  question_category question_category NOT NULL,
  response_value JSONB NOT NULL,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback_sessions table
CREATE TABLE public.feedback_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'in_progress',
  total_score INTEGER,
  category_scores JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_sessions ENABLE ROW LEVEL SECURITY;

-- Questions are public (anyone can read)
CREATE POLICY "Anyone can view active questions" 
  ON public.questions 
  FOR SELECT 
  USING (is_active = true);

-- Responses can be inserted by anyone, viewed by owner
CREATE POLICY "Anyone can create responses" 
  ON public.feedback_responses 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view their own responses" 
  ON public.feedback_responses 
  FOR SELECT 
  USING (
    session_id IN (
      SELECT id FROM public.feedback_sessions 
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

-- Sessions can be created and viewed by anyone (anonymous feedback)
CREATE POLICY "Anyone can create sessions" 
  ON public.feedback_sessions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view sessions" 
  ON public.feedback_sessions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can update sessions" 
  ON public.feedback_sessions 
  FOR UPDATE 
  USING (true);

-- Insert the bank/SACCO specific questions
INSERT INTO public.questions (question_text, question_type, category, required, order_index, scale) VALUES
('How would you rate the quality of service you receive from us?', 'star', 'QualityService', true, 1, '{"min": 1, "max": 5}'),
('Would you recommend I&M Bank Rwanda to others?', 'nps', 'LikeliRecommend', true, 2, '{"min": 0, "max": 10}'),
('How well do our staff treat you as a customer?', 'star', 'QualityStaff', true, 3, '{"min": 1, "max": 5}'),
('How well do we communicate with you?', 'star', 'QualityCommunication', true, 4, '{"min": 1, "max": 5}'),
('How would you rate the value for your money?', 'star', 'ValueForMoney', true, 5, '{"min": 1, "max": 5}'),
('Did we make it easy for you to do business with us?', 'likert', 'DidWeMakeEasy', true, 6, '{"min": 1, "max": 5, "minLabel": "Very Difficult", "maxLabel": "Very Easy"}'),
('Please let us know why you scored us this way and what would make you happier', 'text', 'Comments', false, 7, null);
