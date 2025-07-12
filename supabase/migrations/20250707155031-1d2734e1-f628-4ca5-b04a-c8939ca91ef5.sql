
-- Fix the RLS policy that's causing the permission denied error
-- The current policy is trying to access auth.users table which causes the 403 error

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON public.user_invitations;

-- Create a new policy that doesn't reference auth.users table directly
-- Instead, we'll create a security definer function to safely get the current user's email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Create the new policy using the security definer function
CREATE POLICY "Users can view invitations sent to their email" 
  ON public.user_invitations 
  FOR SELECT
  USING (
    email = public.get_current_user_email()
  );

-- Also update the org admin policy to use enhanced_role for consistency
DROP POLICY IF EXISTS "Org admins can manage invitations for their org" ON public.user_invitations;

CREATE POLICY "Org admins can manage invitations for their org" 
  ON public.user_invitations 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = user_invitations.organization_id 
      AND (enhanced_role IN ('admin'::enhanced_org_role, 'owner'::enhanced_org_role, 'manager'::enhanced_org_role) OR role = 'admin')
      AND status = 'active'
    )
  );
