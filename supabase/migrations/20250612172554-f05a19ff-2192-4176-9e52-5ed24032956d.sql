
-- Fix infinite recursion in RLS policies - complete cleanup and recreation

-- Drop ALL existing policies on admin_users table
DROP POLICY IF EXISTS "Users can view own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can view all admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can update admin records" ON public.admin_users;

-- Drop ALL existing policies on organization_users table
DROP POLICY IF EXISTS "Users can view own org memberships" ON public.organization_users;
DROP POLICY IF EXISTS "Org admins can view org members" ON public.organization_users;
DROP POLICY IF EXISTS "Super admins can view all org memberships" ON public.organization_users;
DROP POLICY IF EXISTS "Org admins can manage their org members" ON public.organization_users;

-- Create security definer functions to check user roles without RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_admin_status()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_super_admin, false) 
  FROM public.admin_users 
  WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_current_user_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_users 
    WHERE user_id = auth.uid() 
    AND organization_id = org_id 
    AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new non-recursive policies for admin_users
CREATE POLICY "Users can view own admin record" 
  ON public.admin_users 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all admin records" 
  ON public.admin_users 
  FOR SELECT
  USING (public.get_current_user_admin_status() = true);

CREATE POLICY "Super admins can insert admin records" 
  ON public.admin_users 
  FOR INSERT
  WITH CHECK (public.get_current_user_admin_status() = true);

CREATE POLICY "Super admins can update admin records" 
  ON public.admin_users 
  FOR UPDATE
  USING (public.get_current_user_admin_status() = true);

-- Create new policies for organization_users
CREATE POLICY "Users can view own org memberships" 
  ON public.organization_users 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all org memberships" 
  ON public.organization_users 
  FOR SELECT
  USING (public.get_current_user_admin_status() = true);

CREATE POLICY "Org admins can manage their org members" 
  ON public.organization_users 
  FOR ALL
  USING (
    public.is_current_user_org_admin(organization_id) = true OR
    public.get_current_user_admin_status() = true
  );
