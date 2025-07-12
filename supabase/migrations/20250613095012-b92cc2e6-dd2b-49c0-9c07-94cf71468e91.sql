
-- Phase 1: Database Cleanup
-- Remove duplicate 'required' column and clean up the questions table structure
ALTER TABLE public.questions DROP COLUMN IF EXISTS required;

-- Add back legacy columns for backward compatibility if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'question_type') THEN
        ALTER TABLE public.questions ADD COLUMN question_type text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'category') THEN
        ALTER TABLE public.questions ADD COLUMN category text;
    END IF;
END $$;

-- Update existing questions to have the string values for backward compatibility
UPDATE public.questions 
SET question_type = qt.name,
    category = qc.name
FROM public.question_types qt, public.question_categories qc
WHERE questions.type_id = qt.id AND questions.category_id = qc.id
AND (questions.question_type IS NULL OR questions.category IS NULL);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_organization_order ON public.questions(organization_id, order_index);
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_scale_config_question_id ON public.question_scale_config(question_id);

-- Clean up any orphaned records
DELETE FROM public.question_options WHERE question_id NOT IN (SELECT id FROM public.questions);
DELETE FROM public.question_scale_config WHERE question_id NOT IN (SELECT id FROM public.questions);
