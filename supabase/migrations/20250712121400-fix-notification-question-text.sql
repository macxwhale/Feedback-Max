
-- Update the notification trigger function to better handle question text extraction
CREATE OR REPLACE FUNCTION public.handle_new_feedback_response_notification()
RETURNS TRIGGER AS $$
DECLARE
  question_text_snapshot TEXT;
  fallback_question_text TEXT;
BEGIN
  -- First try to get question text from snapshot
  question_text_snapshot := NEW.question_snapshot->>'question_text';
  
  -- If not available in snapshot, try to get from the questions table
  IF question_text_snapshot IS NULL OR question_text_snapshot = '' THEN
    SELECT question_text INTO fallback_question_text
    FROM questions 
    WHERE id = NEW.question_id;
    
    question_text_snapshot := COALESCE(fallback_question_text, 'Feedback question');
  END IF;

  INSERT INTO public.notifications (organization_id, type, title, message, metadata)
  VALUES (
    NEW.organization_id,
    'info',
    'New Feedback Received',
    'For question: ' || question_text_snapshot,
    jsonb_build_object(
      'response_id', NEW.id,
      'session_id', NEW.session_id,
      'question_id', NEW.question_id,
      'response_value', NEW.response_value,
      'question_text', question_text_snapshot
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
