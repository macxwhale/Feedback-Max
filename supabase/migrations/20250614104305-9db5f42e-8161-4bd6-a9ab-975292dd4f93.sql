
-- 1. Enable RLS (if not already active; safe to repeat)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;

-- 2. Allow authenticated users to create organizations for themselves
CREATE POLICY "Users can create their own organizations"
  ON public.organizations
  FOR INSERT
  WITH CHECK (created_by_user_id = auth.uid());

-- 3. Allow authenticated users to become admins in their organizations
CREATE POLICY "Org members can join organizations"
  ON public.organization_users
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 4. [Optional] Allow admins/service role to insert for all (if required for edge function using service key, add this)
-- CREATE POLICY "Service role can insert organizations" ON public.organizations FOR INSERT TO service_role WITH CHECK (true);
-- CREATE POLICY "Service role can insert org users" ON public.organization_users FOR INSERT TO service_role WITH CHECK (true);

