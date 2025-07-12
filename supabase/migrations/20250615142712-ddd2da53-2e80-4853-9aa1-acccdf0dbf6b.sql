
-- Enable Row Level Security on the tables
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow system admins to view all users in all organizations
CREATE POLICY "Allow system admins to read all organization users"
ON public.organization_users
FOR SELECT
USING (public.get_current_user_admin_status());

-- Create a policy to allow system admins to view all pending invitations
CREATE POLICY "Allow system admins to read all user invitations"
ON public.user_invitations
FOR SELECT
USING (public.get_current_user_admin_status());
