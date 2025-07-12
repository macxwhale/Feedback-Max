
-- Add SMS and Webhook related columns to the organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_sender_id TEXT,
ADD COLUMN IF NOT EXISTS sms_settings JSONB,
ADD COLUMN IF NOT EXISTS webhook_secret UUID NOT NULL DEFAULT gen_random_uuid();

-- Add a unique constraint to webhook_secret to ensure it's a reliable identifier for webhooks
-- and prevent conflicts.
ALTER TABLE public.organizations
ADD CONSTRAINT organizations_webhook_secret_key UNIQUE (webhook_secret);
