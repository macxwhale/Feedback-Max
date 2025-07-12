
-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- Create storage policy for public read access to logos
CREATE POLICY "Public read access for organization logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-logos');

-- Create storage policy for authenticated users to upload logos
CREATE POLICY "Authenticated users can upload organization logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-logos' AND
  auth.role() = 'authenticated'
);

-- Create storage policy for organization admins to update/delete logos
CREATE POLICY "Organization admins can manage their logos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'organization-logos' AND
  auth.uid() IN (
    SELECT user_id FROM organization_users 
    WHERE role = 'admin' AND organization_id::text = (storage.foldername(name))[1]
  )
);

-- Update organizations table to include storage path for logo
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS logo_storage_path text;

-- Update organization_assets table to support storage references
ALTER TABLE organization_assets 
ADD COLUMN IF NOT EXISTS storage_path text,
ADD COLUMN IF NOT EXISTS file_size bigint,
ADD COLUMN IF NOT EXISTS mime_type text;

-- Create index for faster logo lookups
CREATE INDEX IF NOT EXISTS idx_organizations_slug_active ON organizations(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_org_assets_logo_active ON organization_assets(organization_id, asset_type) WHERE is_active = true AND asset_type = 'logo';
