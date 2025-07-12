
-- Ensure plan_type is ENUM and has starter/pro/enterprise
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'org_plan_type') THEN
    CREATE TYPE org_plan_type AS ENUM ('starter', 'pro', 'enterprise');
  END IF;
END$$;

ALTER TABLE public.organizations
  ALTER COLUMN plan_type DROP DEFAULT,
  ALTER COLUMN plan_type TYPE org_plan_type USING 
    (CASE 
      WHEN plan_type IN ('starter', 'pro', 'enterprise') THEN plan_type::org_plan_type
      WHEN plan_type = 'free' THEN 'starter'::org_plan_type
      ELSE 'starter'::org_plan_type
    END),
  ALTER COLUMN plan_type SET DEFAULT 'starter';

-- Add features_config for optional overrides/toggles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'features_config'
  ) THEN
    ALTER TABLE public.organizations
      ADD COLUMN features_config jsonb NULL DEFAULT NULL;
  END IF;
END$$;

-- Optional: Set existing orgs with no plan_type to 'starter'
UPDATE public.organizations SET plan_type = 'starter' WHERE plan_type IS NULL;

