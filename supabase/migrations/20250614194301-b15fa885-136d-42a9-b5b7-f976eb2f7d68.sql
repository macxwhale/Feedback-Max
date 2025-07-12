
-- Add timing columns to feedback_responses
ALTER TABLE public.feedback_responses
ADD COLUMN response_time_ms INTEGER,
ADD COLUMN question_started_at TIMESTAMPTZ,
ADD COLUMN question_completed_at TIMESTAMPTZ;

-- Add timing columns to feedback_sessions
ALTER TABLE public.feedback_sessions
ADD COLUMN total_response_time_ms INTEGER,
ADD COLUMN avg_question_time_ms INTEGER,
ADD COLUMN timing_metadata JSONB;
