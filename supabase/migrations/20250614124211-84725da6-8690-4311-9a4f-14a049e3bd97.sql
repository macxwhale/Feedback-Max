
-- Ensure plan_type is properly constrained and features_config is available
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS features_config jsonb;

-- Allow for trial end date
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone;

-- System admin auditing: track who created/changed plans for organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS updated_by_user_id uuid;

-- Add automatic updated_at/created_at triggers if not already existing (for accurate tracking).
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_organizations ON public.organizations;
CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Optionally, audit log table for new org creations/plan changes (optional if audit logging is handled elsewhere)
CREATE TABLE IF NOT EXISTS public.organization_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  action TEXT NOT NULL,
  performed_by UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy: Only authenticated system admins can insert/update organizations & log actions
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_audit_log ENABLE ROW LEVEL SECURITY;

-- Placeholder "system admin" policy: allows all for demonstration, you should refine for your user_roles structure!
CREATE POLICY "Admins can manage organizations"
  ON public.organizations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can log actions"
  ON public.organization_audit_log
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

