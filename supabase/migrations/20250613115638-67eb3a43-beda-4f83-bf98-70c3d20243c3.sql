
-- First, let's check for any unused or redundant tables
-- Based on the schema analysis, I don't see any obviously unused tables
-- However, I'll add some optimizations and cleanup

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_org_active ON public.questions(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_questions_order ON public.questions(organization_id, order_index) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_organization_users_user_role ON public.organization_users(user_id, role, status);
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_org_status ON public.feedback_sessions(organization_id, status, created_at);

-- Add some constraints that might be missing
ALTER TABLE public.questions 
ADD CONSTRAINT check_order_index_positive CHECK (order_index > 0);

-- Create a function for better admin stats calculation
CREATE OR REPLACE FUNCTION public.get_organization_stats(org_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'total_questions', (
      SELECT COUNT(*) FROM questions WHERE organization_id = org_id AND is_active = true
    ),
    'total_responses', (
      SELECT COUNT(*) FROM feedback_responses WHERE organization_id = org_id
    ),
    'total_sessions', (
      SELECT COUNT(*) FROM feedback_sessions WHERE organization_id = org_id
    ),
    'completed_sessions', (
      SELECT COUNT(*) FROM feedback_sessions WHERE organization_id = org_id AND status = 'completed'
    ),
    'active_members', (
      SELECT COUNT(*) FROM organization_users WHERE organization_id = org_id AND status = 'active'
    ),
    'avg_session_score', (
      SELECT ROUND(AVG(total_score::numeric), 2) 
      FROM feedback_sessions 
      WHERE organization_id = org_id AND total_score IS NOT NULL
    ),
    'recent_activity', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'type', 'session',
          'created_at', created_at,
          'status', status
        ) ORDER BY created_at DESC
      )
      FROM (
        SELECT created_at, status 
        FROM feedback_sessions 
        WHERE organization_id = org_id 
        ORDER BY created_at DESC 
        LIMIT 10
      ) recent
    )
  );
$$;

-- Edge function for feedback submission will be created separately
-- Add audit logging table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS for audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs for their organization
CREATE POLICY "Organization admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_users 
    WHERE user_id = auth.uid() 
    AND organization_id = admin_audit_log.organization_id 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- Only system can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
