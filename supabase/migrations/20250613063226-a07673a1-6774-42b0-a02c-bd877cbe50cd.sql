
-- Add UI configuration columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS feedback_header_title TEXT DEFAULT 'Customer Feedback',
ADD COLUMN IF NOT EXISTS feedback_header_subtitle TEXT DEFAULT 'We value your feedback',
ADD COLUMN IF NOT EXISTS welcome_screen_title TEXT DEFAULT 'Welcome',
ADD COLUMN IF NOT EXISTS welcome_screen_description TEXT DEFAULT 'Please share your feedback with us',
ADD COLUMN IF NOT EXISTS thank_you_title TEXT DEFAULT 'Thank You!',
ADD COLUMN IF NOT EXISTS thank_you_message TEXT DEFAULT 'Your feedback has been submitted successfully',
ADD COLUMN IF NOT EXISTS custom_css JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS flow_configuration JSONB DEFAULT '{"enable_welcome_screen": true, "enable_progress_bar": true, "enable_keyboard_navigation": true}';

-- Create organization_assets table for managing logos and other assets
CREATE TABLE IF NOT EXISTS public.organization_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT NOT NULL, -- 'logo', 'background', 'icon', etc.
  asset_url TEXT NOT NULL,
  asset_name TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization_themes table for detailed theme configurations
CREATE TABLE IF NOT EXISTS public.organization_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  theme_name TEXT NOT NULL DEFAULT 'default',
  is_active BOOLEAN DEFAULT true,
  colors JSONB NOT NULL DEFAULT '{
    "primary": "#007ACE",
    "secondary": "#073763",
    "accent": "#f97316",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text_primary": "#1f2937",
    "text_secondary": "#6b7280",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444"
  }',
  typography JSONB DEFAULT '{
    "font_family": "Inter, sans-serif",
    "heading_font_size": "2rem",
    "body_font_size": "1rem",
    "small_font_size": "0.875rem"
  }',
  spacing JSONB DEFAULT '{
    "container_padding": "2rem",
    "section_gap": "1.5rem",
    "element_gap": "1rem"
  }',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, theme_name)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organization_assets_org_id ON public.organization_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_assets_type ON public.organization_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_organization_themes_org_id ON public.organization_themes(organization_id);

-- Enable RLS on new tables
ALTER TABLE public.organization_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_themes ENABLE ROW LEVEL SECURITY;

-- RLS policies for organization_assets (public read for active organizations)
CREATE POLICY "Anyone can view assets for active orgs" 
  ON public.organization_assets 
  FOR SELECT 
  USING (
    is_active = true 
    AND organization_id IN (
      SELECT id FROM public.organizations WHERE is_active = true
    )
  );

-- RLS policies for organization_themes (public read for active organizations)
CREATE POLICY "Anyone can view themes for active orgs" 
  ON public.organization_themes 
  FOR SELECT 
  USING (
    is_active = true 
    AND organization_id IN (
      SELECT id FROM public.organizations WHERE is_active = true
    )
  );

-- Update I&M Bank organization with proper configuration
UPDATE public.organizations 
SET 
  feedback_header_title = 'I&M Bank Rwanda Feedback',
  feedback_header_subtitle = 'Your opinion matters to us',
  welcome_screen_title = 'Welcome to I&M Bank Rwanda',
  welcome_screen_description = 'We value your feedback and strive to improve our services. Please take a few minutes to share your experience with us.',
  thank_you_title = 'Thank You for Your Feedback!',
  thank_you_message = 'Your feedback has been submitted successfully. We appreciate your time and will use your input to improve our services.',
  flow_configuration = '{
    "enable_welcome_screen": true,
    "enable_progress_bar": true,
    "enable_keyboard_navigation": true,
    "enable_auto_save": true,
    "enable_privacy_notice": true,
    "enable_data_usage_info": true,
    "enable_save_continue": true,
    "show_question_numbers": true,
    "allow_previous_navigation": true,
    "require_completion": false
  }'
WHERE slug = 'im-bank';

-- Insert default theme for I&M Bank
INSERT INTO public.organization_themes (organization_id, theme_name, colors, typography, spacing)
SELECT 
  id,
  'im-bank-default',
  '{
    "primary": "#007ACE",
    "secondary": "#073763",
    "accent": "#f97316",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text_primary": "#1f2937",
    "text_secondary": "#6b7280",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "gradient_start": "#1e3a8a",
    "gradient_end": "#f97316"
  }',
  '{
    "font_family": "Inter, system-ui, sans-serif",
    "heading_font_size": "2.5rem",
    "subheading_font_size": "1.5rem",
    "body_font_size": "1rem",
    "small_font_size": "0.875rem",
    "font_weight_normal": "400",
    "font_weight_medium": "500",
    "font_weight_bold": "700"
  }',
  '{
    "container_padding": "2rem",
    "section_gap": "2rem",
    "element_gap": "1rem",
    "border_radius": "0.75rem",
    "shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
  }'
FROM public.organizations 
WHERE slug = 'im-bank'
ON CONFLICT (organization_id, theme_name) DO UPDATE SET
  colors = EXCLUDED.colors,
  typography = EXCLUDED.typography,
  spacing = EXCLUDED.spacing,
  updated_at = now();

-- Insert logo asset for I&M Bank using the existing police logo
INSERT INTO public.organization_assets (organization_id, asset_type, asset_url, asset_name)
SELECT 
  id,
  'logo',
  '/lovable-uploads/367347fe-02da-4338-b8ba-91138293d303.png',
  'I&M Bank Rwanda Logo'
FROM public.organizations 
WHERE slug = 'im-bank'
ON CONFLICT DO NOTHING;

-- Add function to get organization configuration (fixed aggregation)
CREATE OR REPLACE FUNCTION public.get_organization_config(org_slug TEXT)
RETURNS JSONB
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'organization', to_jsonb(o.*),
    'theme', COALESCE(
      (SELECT to_jsonb(t.*) FROM public.organization_themes t 
       WHERE t.organization_id = o.id AND t.is_active = true 
       ORDER BY t.created_at DESC LIMIT 1),
      '{}'::jsonb
    ),
    'assets', COALESCE(
      (SELECT jsonb_agg(to_jsonb(a.*) ORDER BY a.display_order, a.created_at) 
       FROM public.organization_assets a 
       WHERE a.organization_id = o.id AND a.is_active = true),
      '[]'::jsonb
    )
  )
  FROM public.organizations o
  WHERE o.slug = org_slug AND o.is_active = true;
$$;
