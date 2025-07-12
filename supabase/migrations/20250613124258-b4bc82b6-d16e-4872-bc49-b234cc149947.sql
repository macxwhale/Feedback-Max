
-- Phase 1: Security & Performance Foundation (Fixed)

-- 1. Fix RLS policies to resolve permission denied errors
-- First, let's create proper RLS policies for organizations table
CREATE POLICY "Users can view organizations they belong to" 
  ON public.organizations 
  FOR SELECT 
  USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_users 
      WHERE user_id = auth.uid()
    ) OR
    public.get_current_user_admin_status() = true
  );

CREATE POLICY "Org admins can update their organization" 
  ON public.organizations 
  FOR UPDATE 
  USING (
    public.is_current_user_org_admin(id) = true OR
    public.get_current_user_admin_status() = true
  );

-- 2. Add comprehensive audit logging table
CREATE TABLE public.admin_audit_log_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log_enhanced ENABLE ROW LEVEL SECURITY;

-- Only admins and super admins can view audit logs
CREATE POLICY "Admins can view audit logs for their org" 
  ON public.admin_audit_log_enhanced 
  FOR SELECT 
  USING (
    public.is_current_user_org_admin(organization_id) = true OR
    public.get_current_user_admin_status() = true
  );

-- 3. Add performance indexes (without CONCURRENTLY for transaction compatibility)
CREATE INDEX IF NOT EXISTS idx_feedback_responses_org_created 
  ON public.feedback_responses (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_sessions_org_status 
  ON public.feedback_sessions (organization_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_organization_users_org_status 
  ON public.organization_users (organization_id, status);

CREATE INDEX IF NOT EXISTS idx_questions_org_active 
  ON public.questions (organization_id, is_active, order_index);

CREATE INDEX IF NOT EXISTS idx_audit_log_org_created 
  ON public.admin_audit_log_enhanced (organization_id, created_at DESC);

-- 4. Add user sessions table for session management
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" 
  ON public.user_sessions 
  FOR SELECT 
  USING (user_id = auth.uid());

-- 5. Create audit logging function
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.admin_audit_log_enhanced (
    user_id,
    organization_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    severity,
    metadata
  ) VALUES (
    auth.uid(),
    p_organization_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    p_severity,
    p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- 6. Enhanced organization stats function with performance optimization
CREATE OR REPLACE FUNCTION public.get_organization_stats_enhanced(org_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  WITH stats AS (
    SELECT 
      (SELECT COUNT(*) FROM questions WHERE organization_id = org_id AND is_active = true) as total_questions,
      (SELECT COUNT(*) FROM feedback_responses WHERE organization_id = org_id) as total_responses,
      (SELECT COUNT(*) FROM feedback_sessions WHERE organization_id = org_id) as total_sessions,
      (SELECT COUNT(*) FROM feedback_sessions WHERE organization_id = org_id AND status = 'completed') as completed_sessions,
      (SELECT COUNT(*) FROM organization_users WHERE organization_id = org_id AND status = 'active') as active_members,
      (SELECT ROUND(AVG(total_score::numeric), 2) FROM feedback_sessions WHERE organization_id = org_id AND total_score IS NOT NULL) as avg_session_score
  ),
  recent_activity AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'type', 'session',
        'created_at', created_at,
        'status', status
      ) ORDER BY created_at DESC
    ) as activities
    FROM (
      SELECT created_at, status 
      FROM feedback_sessions 
      WHERE organization_id = org_id 
      ORDER BY created_at DESC 
      LIMIT 10
    ) recent
  ),
  growth_metrics AS (
    SELECT 
      (SELECT COUNT(*) FROM feedback_sessions 
       WHERE organization_id = org_id 
       AND created_at >= date_trunc('month', now())) as sessions_this_month,
      (SELECT COUNT(*) FROM feedback_sessions 
       WHERE organization_id = org_id 
       AND created_at >= date_trunc('month', now() - interval '1 month')
       AND created_at < date_trunc('month', now())) as sessions_last_month
  )
  SELECT jsonb_build_object(
    'total_questions', s.total_questions,
    'total_responses', s.total_responses,
    'total_sessions', s.total_sessions,
    'completed_sessions', s.completed_sessions,
    'active_members', s.active_members,
    'avg_session_score', s.avg_session_score,
    'recent_activity', COALESCE(ra.activities, '[]'::jsonb),
    'growth_metrics', jsonb_build_object(
      'sessions_this_month', gm.sessions_this_month,
      'sessions_last_month', gm.sessions_last_month,
      'growth_rate', CASE 
        WHEN gm.sessions_last_month > 0 
        THEN ROUND(((gm.sessions_this_month - gm.sessions_last_month)::numeric / gm.sessions_last_month::numeric) * 100, 2)
        ELSE NULL 
      END
    )
  )
  FROM stats s, recent_activity ra, growth_metrics gm;
$$;

-- 7. Create function for paginated data retrieval
CREATE OR REPLACE FUNCTION public.get_paginated_organization_users(
  org_id UUID,
  page_size INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0,
  search_term TEXT DEFAULT NULL,
  role_filter TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  WITH filtered_users AS (
    SELECT *
    FROM organization_users ou
    WHERE ou.organization_id = org_id
    AND (search_term IS NULL OR ou.email ILIKE '%' || search_term || '%')
    AND (role_filter IS NULL OR ou.role = role_filter)
    ORDER BY ou.created_at DESC
  ),
  total_count AS (
    SELECT COUNT(*) as total FROM filtered_users
  ),
  paginated_users AS (
    SELECT * FROM filtered_users
    LIMIT page_size OFFSET page_offset
  )
  SELECT jsonb_build_object(
    'users', (SELECT jsonb_agg(to_jsonb(pu.*)) FROM paginated_users pu),
    'total_count', (SELECT total FROM total_count),
    'page_size', page_size,
    'page_offset', page_offset,
    'has_more', (SELECT total > (page_offset + page_size) FROM total_count)
  );
$$;
