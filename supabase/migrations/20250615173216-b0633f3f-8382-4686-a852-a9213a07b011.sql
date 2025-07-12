
-- 1. Create a Postgres view to show all users with their org assignments, if any.
--    (Note: information about users not assigned to any organization will still be shown with organization fields as NULL.)
CREATE OR REPLACE VIEW public.all_users_with_org AS
SELECT
  au.id AS user_id,
  au.email,
  ou.id AS organization_user_id,
  ou.organization_id,
  ou.role,
  ou.status,
  ou.created_at AS organization_user_created_at,
  ou.accepted_at,
  ou.invited_by_user_id
FROM auth.users au
LEFT JOIN organization_users ou ON au.id = ou.user_id;

-- 2. (Optional) Create indexes for faster lookups/joins if needed (skip if unnecessary).
-- CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id);

-- 3. Grant select on the view to authenticated users (admin UI clients)
GRANT SELECT ON public.all_users_with_org TO authenticated;

-- (No new RLS policies needed for view; it inherits those from underlying tables.)

