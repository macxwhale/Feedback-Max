
-- Add question snapshot fields to feedback_responses to preserve question data at response time
ALTER TABLE public.feedback_responses 
ADD COLUMN question_snapshot JSONB,
ADD COLUMN question_text_snapshot TEXT,
ADD COLUMN question_type_snapshot TEXT;

-- Update the existing responses to include question snapshots where possible
UPDATE public.feedback_responses 
SET 
  question_snapshot = (
    SELECT jsonb_build_object(
      'id', q.id,
      'question_text', q.question_text,
      'question_type', q.question_type,
      'category', q.category,
      'is_required', q.is_required,
      'order_index', q.order_index,
      'options', COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('text', option_text, 'value', option_value) ORDER BY display_order) 
         FROM question_options WHERE question_id = q.id AND is_active = true),
        '[]'::jsonb
      ),
      'scale', COALESCE(
        (SELECT jsonb_build_object('min', min_value, 'max', max_value, 'minLabel', min_label, 'maxLabel', max_label)
         FROM question_scale_config WHERE question_id = q.id LIMIT 1),
        null
      )
    )
    FROM questions q 
    WHERE q.id = feedback_responses.question_id
  ),
  question_text_snapshot = (
    SELECT question_text FROM questions WHERE id = feedback_responses.question_id
  ),
  question_type_snapshot = (
    SELECT question_type FROM questions WHERE id = feedback_responses.question_id
  )
WHERE question_snapshot IS NULL;

-- Create function to handle question deletions safely
CREATE OR REPLACE FUNCTION public.safe_delete_question(question_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response_count INTEGER;
  org_id UUID;
BEGIN
  -- Get the organization_id for the question
  SELECT organization_id INTO org_id FROM questions WHERE id = question_uuid;
  
  -- Check if there are any responses for this question
  SELECT COUNT(*) INTO response_count 
  FROM feedback_responses 
  WHERE question_id = question_uuid;
  
  IF response_count > 0 THEN
    -- If responses exist, mark question as inactive instead of deleting
    UPDATE questions 
    SET is_active = false, 
        updated_at = now(),
        question_text = question_text || ' [ARCHIVED]'
    WHERE id = question_uuid;
    
    -- Log the archival in question snapshot for future responses (if any)
    UPDATE feedback_responses 
    SET question_snapshot = jsonb_set(
      COALESCE(question_snapshot, '{}'::jsonb),
      '{archived_at}',
      to_jsonb(now()::text)
    )
    WHERE question_id = question_uuid;
    
    RETURN false; -- Indicates question was archived, not deleted
  ELSE
    -- Safe to delete if no responses exist
    DELETE FROM question_scale_config WHERE question_id = question_uuid;
    DELETE FROM question_options WHERE question_id = question_uuid;
    DELETE FROM questions WHERE id = question_uuid;
    
    RETURN true; -- Indicates question was actually deleted
  END IF;
END;
$$;

-- Create trigger to automatically capture question snapshots on response insert
CREATE OR REPLACE FUNCTION public.capture_question_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Capture question snapshot if not already provided
  IF NEW.question_snapshot IS NULL THEN
    SELECT jsonb_build_object(
      'id', q.id,
      'question_text', q.question_text,
      'question_type', q.question_type,
      'category', q.category,
      'is_required', q.is_required,
      'order_index', q.order_index,
      'organization_id', q.organization_id,
      'captured_at', now(),
      'options', COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('text', option_text, 'value', option_value) ORDER BY display_order) 
         FROM question_options WHERE question_id = q.id AND is_active = true),
        '[]'::jsonb
      ),
      'scale', COALESCE(
        (SELECT jsonb_build_object('min', min_value, 'max', max_value, 'minLabel', min_label, 'maxLabel', max_label)
         FROM question_scale_config WHERE question_id = q.id LIMIT 1),
        null
      )
    ),
    q.question_text,
    q.question_type
    INTO NEW.question_snapshot, NEW.question_text_snapshot, NEW.question_type_snapshot
    FROM questions q 
    WHERE q.id = NEW.question_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS capture_question_snapshot_trigger ON public.feedback_responses;
CREATE TRIGGER capture_question_snapshot_trigger
  BEFORE INSERT ON public.feedback_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.capture_question_snapshot();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_responses_org_session 
ON public.feedback_responses(organization_id, session_id);

CREATE INDEX IF NOT EXISTS idx_feedback_responses_question_category 
ON public.feedback_responses(question_category);

CREATE INDEX IF NOT EXISTS idx_feedback_responses_created_at 
ON public.feedback_responses(created_at);

-- Create view for responses with question context (handles orphaned responses)
CREATE OR REPLACE VIEW public.feedback_responses_with_context AS
SELECT 
  fr.*,
  CASE 
    WHEN q.id IS NOT NULL THEN q.question_text
    ELSE fr.question_text_snapshot
  END as current_question_text,
  CASE 
    WHEN q.id IS NOT NULL THEN q.question_type
    ELSE fr.question_type_snapshot  
  END as current_question_type,
  CASE 
    WHEN q.id IS NOT NULL THEN false
    ELSE true
  END as is_orphaned,
  q.is_active as question_is_active,
  o.name as organization_name,
  fs.status as session_status
FROM public.feedback_responses fr
LEFT JOIN public.questions q ON fr.question_id = q.id
LEFT JOIN public.organizations o ON fr.organization_id = o.id
LEFT JOIN public.feedback_sessions fs ON fr.session_id = fs.id;
