
-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB
);
CREATE INDEX ON public.notifications(organization_id, created_at DESC);
CREATE INDEX ON public.notifications(user_id);

-- Add row-level security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow org members to read notifications"
ON public.notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_users
    WHERE organization_users.organization_id = notifications.organization_id
    AND organization_users.user_id = auth.uid()
  )
);

CREATE POLICY "Allow users to update their notifications"
ON public.notifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organization_users
    WHERE organization_users.organization_id = notifications.organization_id
    AND organization_users.user_id = auth.uid()
  )
);

-- Enable realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function for new feedback responses
CREATE OR REPLACE FUNCTION public.handle_new_feedback_response_notification()
RETURNS TRIGGER AS $$
DECLARE
  question_text_snapshot TEXT;
BEGIN
  question_text_snapshot := NEW.question_snapshot->>'question_text';

  INSERT INTO public.notifications (organization_id, type, title, message, metadata)
  VALUES (
    NEW.organization_id,
    'info',
    'New Feedback Received',
    'For question: ' || COALESCE(question_text_snapshot, 'N/A'),
    jsonb_build_object(
      'response_id', NEW.id,
      'session_id', NEW.session_id,
      'question_id', NEW.question_id,
      'response_value', NEW.response_value
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on feedback_responses table
CREATE TRIGGER new_feedback_response_notification_trigger
AFTER INSERT ON public.feedback_responses
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_feedback_response_notification();

-- Trigger function for new user joins
CREATE OR REPLACE FUNCTION public.handle_new_user_join_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'active') OR (TG_OP = 'UPDATE' AND NEW.status = 'active' AND OLD.status != 'active') THEN
    INSERT INTO public.notifications (organization_id, type, title, message, metadata)
    VALUES (
      NEW.organization_id,
      'success',
      'New Member Joined',
      NEW.email || ' has joined your organization.',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'organization_user_id', NEW.id,
        'email', NEW.email,
        'role', NEW.role
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on organization_users table
CREATE TRIGGER new_user_join_notification_trigger
AFTER INSERT OR UPDATE OF status ON public.organization_users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_join_notification();
