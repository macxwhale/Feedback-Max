
-- First, create the enhanced role enum
CREATE TYPE public.enhanced_org_role AS ENUM (
  'owner',
  'admin', 
  'manager',
  'analyst',
  'member',
  'viewer'
);

-- Create role permissions table for granular access control
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role enhanced_org_role NOT NULL,
  permission_key TEXT NOT NULL,
  permission_value JSONB DEFAULT '{"allowed": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission_key)
);

-- Insert default permissions for each role
INSERT INTO public.role_permissions (role, permission_key, permission_value) VALUES
-- Owner permissions (full access)
('owner', 'manage_organization', '{"allowed": true}'),
('owner', 'manage_users', '{"allowed": true}'),
('owner', 'manage_roles', '{"allowed": true}'),
('owner', 'manage_questions', '{"allowed": true}'),
('owner', 'view_analytics', '{"allowed": true}'),
('owner', 'export_data', '{"allowed": true}'),
('owner', 'manage_integrations', '{"allowed": true}'),
('owner', 'manage_billing', '{"allowed": true}'),

-- Admin permissions (most access, no billing)
('admin', 'manage_organization', '{"allowed": true}'),
('admin', 'manage_users', '{"allowed": true}'),
('admin', 'manage_roles', '{"allowed": true, "restrictions": ["cannot_change_owner"]}'),
('admin', 'manage_questions', '{"allowed": true}'),
('admin', 'view_analytics', '{"allowed": true}'),
('admin', 'export_data', '{"allowed": true}'),
('admin', 'manage_integrations', '{"allowed": true}'),

-- Manager permissions (team management)
('manager', 'manage_users', '{"allowed": true, "restrictions": ["cannot_manage_admins_or_owners"]}'),
('manager', 'manage_questions', '{"allowed": true}'),
('manager', 'view_analytics', '{"allowed": true}'),
('manager', 'export_data', '{"allowed": true}'),

-- Analyst permissions (analytics focused)
('analyst', 'view_analytics', '{"allowed": true}'),
('analyst', 'export_data', '{"allowed": true}'),
('analyst', 'manage_questions', '{"allowed": true, "restrictions": ["read_only"]}'),

-- Member permissions (basic access)
('member', 'view_analytics', '{"allowed": true, "restrictions": ["basic_view_only"]}'),
('member', 'manage_questions', '{"allowed": true, "restrictions": ["read_only"]}'),

-- Viewer permissions (read only)
('viewer', 'view_analytics', '{"allowed": true, "restrictions": ["read_only"]}');

-- Add new role column to organization_users table
ALTER TABLE public.organization_users 
ADD COLUMN enhanced_role enhanced_org_role DEFAULT 'member';

-- Migrate existing roles to the new column
UPDATE public.organization_users 
SET enhanced_role = CASE 
  WHEN role = 'admin' THEN 'admin'::enhanced_org_role
  ELSE 'member'::enhanced_org_role
END;

-- Update user invitations table by adding new column
ALTER TABLE public.user_invitations 
ADD COLUMN enhanced_role enhanced_org_role DEFAULT 'member';

-- Migrate existing invitation roles
UPDATE public.user_invitations 
SET enhanced_role = CASE 
  WHEN role = 'admin' THEN 'admin'::enhanced_org_role
  ELSE 'member'::enhanced_org_role
END;

-- Add role hierarchy function
CREATE OR REPLACE FUNCTION public.get_role_hierarchy_level(user_role enhanced_org_role)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE user_role
    WHEN 'owner' THEN 6
    WHEN 'admin' THEN 5
    WHEN 'manager' THEN 4
    WHEN 'analyst' THEN 3
    WHEN 'member' THEN 2
    WHEN 'viewer' THEN 1
    ELSE 0
  END;
$$;

-- Function to check if user can manage another user based on role hierarchy
CREATE OR REPLACE FUNCTION public.can_manage_user_role(manager_role enhanced_org_role, target_role enhanced_org_role)
RETURNS BOOLEAN
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT get_role_hierarchy_level(manager_role) > get_role_hierarchy_level(target_role);
$$;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION public.user_has_permission(p_user_id UUID, p_org_id UUID, p_permission_key TEXT)
RETURNS JSONB
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(rp.permission_value, '{"allowed": false}'::jsonb)
  FROM public.organization_users ou
  LEFT JOIN public.role_permissions rp ON rp.role = ou.enhanced_role AND rp.permission_key = p_permission_key
  WHERE ou.user_id = p_user_id AND ou.organization_id = p_org_id;
$$;

-- Enable RLS on role_permissions table
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy for role_permissions (readable by all authenticated users)
CREATE POLICY "Users can view role permissions" ON public.role_permissions
FOR SELECT TO authenticated
USING (true);

-- Create helper function to get enhanced role (for backward compatibility)
CREATE OR REPLACE FUNCTION public.get_user_enhanced_role(p_user_id UUID, p_org_id UUID)
RETURNS enhanced_org_role
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT enhanced_role
  FROM public.organization_users
  WHERE user_id = p_user_id AND organization_id = p_org_id;
$$;
