
-- This enables Row Level Security on the organizations table. It is safe to run
-- this command even if RLS is already enabled.
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- This policy grants system administrators permission to read data from the
-- organizations table. This is required for the system user management page
-- to display the name of the organization next to each user.
CREATE POLICY "Allow system admins to read all organizations"
ON public.organizations
FOR SELECT
USING (public.get_current_user_admin_status());
