
-- Fix RLS policies for admin_users and organization_users tables

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view their org members" ON public.organization_users;

-- Create proper policies for admin_users
-- Allow users to view their own admin record
CREATE POLICY "Users can view own admin record" 
  ON public.admin_users 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow super admins to view all admin records
CREATE POLICY "Super admins can view all admin records" 
  ON public.admin_users 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_super_admin = true
    )
  );

-- Allow super admins to insert/update admin records
CREATE POLICY "Super admins can manage admin records" 
  ON public.admin_users 
  FOR ALL
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_super_admin = true
    )
  );

-- Create proper policies for organization_users
-- Allow users to view their own organization memberships
CREATE POLICY "Users can view own org memberships" 
  ON public.organization_users 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow organization admins to view members of their organizations
CREATE POLICY "Org admins can view org members" 
  ON public.organization_users 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow super admins to view all organization memberships
CREATE POLICY "Super admins can view all org memberships" 
  ON public.organization_users 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_super_admin = true
    )
  );

-- Grant necessary permissions for authenticated users
GRANT SELECT ON public.admin_users TO authenticated;
GRANT SELECT ON public.organization_users TO authenticated;

-- Grant full permissions to super admins (will be controlled by RLS)
GRANT ALL ON public.admin_users TO authenticated;
GRANT ALL ON public.organization_users TO authenticated;
