
-- Enable the pgcrypto extension for hashing functions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Create a table to store API keys for each organization
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  hashed_key TEXT NOT NULL,
  key_prefix TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for faster lookups
CREATE INDEX idx_api_keys_organization_id ON public.api_keys(organization_id);
CREATE UNIQUE INDEX idx_api_keys_key_prefix ON public.api_keys(key_prefix);

-- Add a trigger to automatically update the 'updated_at' column
CREATE TRIGGER set_api_keys_updated_at
BEFORE UPDATE ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable Row-Level Security for the api_keys table
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Organization admins can manage API keys for their organization
CREATE POLICY "Org admins can manage their API keys"
  ON public.api_keys
  FOR ALL
  USING (public.is_current_user_org_admin(organization_id))
  WITH CHECK (public.is_current_user_org_admin(organization_id));

-- Policy: Super admins can manage all API keys
CREATE POLICY "Super admins can manage all API keys"
  ON public.api_keys
  FOR ALL
  USING (public.get_current_user_admin_status());

-- Create a table to log all requests made with API keys for auditing and rate limiting
CREATE TABLE public.api_request_logs (
  id BIGSERIAL PRIMARY KEY,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  status_code INT NOT NULL,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for faster querying
CREATE INDEX idx_api_request_logs_org_id_created_at ON public.api_request_logs(organization_id, created_at DESC);
CREATE INDEX idx_api_request_logs_api_key_id_created_at ON public.api_request_logs(api_key_id, created_at DESC);

-- Enable Row-Level Security for logs
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role (used by edge functions) to insert logs
CREATE POLICY "Allow service role to insert API logs"
  ON public.api_request_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Organization admins can view logs for their organization
CREATE POLICY "Org admins can view their API request logs"
  ON public.api_request_logs
  FOR SELECT
  USING (public.is_current_user_org_admin(organization_id));

-- Policy: Super admins can view all logs
CREATE POLICY "Super admins can view all API request logs"
  ON public.api_request_logs
  FOR SELECT
  USING (public.get_current_user_admin_status());

-- DB function to create a new API key and return the full key (this is the only time it's visible)
CREATE OR REPLACE FUNCTION public.create_api_key(
  p_organization_id UUID,
  p_key_name TEXT,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS TEXT -- returns the full, unhashed API key
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_key_prefix TEXT;
  v_key_secret TEXT;
  v_hashed_key TEXT;
  v_full_key TEXT;
BEGIN
  -- Permission check
  IF NOT (is_current_user_org_admin(p_organization_id) OR get_current_user_admin_status()) THEN
    RAISE EXCEPTION 'No permission to create API key for this organization.';
  END IF;

  -- Generate key components
  v_key_prefix := 'sk_org_' || substr(md5(random()::text), 1, 12);
  v_key_secret := replace(gen_random_uuid()::text, '-', '');
  v_hashed_key := encode(digest(v_key_secret, 'sha256'), 'hex');
  v_full_key := v_key_prefix || '_' || v_key_secret;

  -- Store the new key
  INSERT INTO public.api_keys (organization_id, key_name, hashed_key, key_prefix, expires_at, status)
  VALUES (p_organization_id, p_key_name, v_hashed_key, v_key_prefix, p_expires_at, 'active');

  RETURN v_full_key;
END;
$$;

-- DB function to validate a provided API key
CREATE OR REPLACE FUNCTION public.validate_api_key(p_api_key TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  org_id UUID,
  key_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_key_prefix TEXT;
  v_key_secret TEXT;
  v_api_key_record RECORD;
  last_underscore_pos INT;
BEGIN
  last_underscore_pos := length(p_api_key) - position('_' in reverse(p_api_key)) + 1;

  IF last_underscore_pos <= 1 OR last_underscore_pos >= length(p_api_key) THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  v_key_prefix := substring(p_api_key from 1 for last_underscore_pos - 1);
  v_key_secret := substring(p_api_key from last_underscore_pos + 1);

  SELECT id, organization_id, hashed_key, status, expires_at
  INTO v_api_key_record
  FROM public.api_keys
  WHERE key_prefix = v_key_prefix;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  IF v_api_key_record.status != 'active' OR (v_api_key_record.expires_at IS NOT NULL AND v_api_key_record.expires_at < now()) THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  IF v_api_key_record.hashed_key = encode(digest(v_key_secret, 'sha256'), 'hex') THEN
    UPDATE public.api_keys SET last_used_at = now() WHERE id = v_api_key_record.id;
    RETURN QUERY SELECT true, v_api_key_record.organization_id, v_api_key_record.id;
  ELSE
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID;
  END IF;
END;
$$;
