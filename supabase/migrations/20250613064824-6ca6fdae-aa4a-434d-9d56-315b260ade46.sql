
-- First, let's create the Police Sacco organization
INSERT INTO public.organizations (
  name,
  slug,
  primary_color,
  secondary_color,
  feedback_header_title,
  feedback_header_subtitle,
  welcome_screen_title,
  welcome_screen_description,
  thank_you_title,
  thank_you_message,
  is_active,
  plan_type,
  max_responses
) VALUES (
  'Kenya National Police DT SACCO',
  'police-sacco',
  '#073763',
  '#007ACE',
  'Share Your Experience',
  'Help us serve you better with your valuable feedback',
  'Share Your Experience',
  'Help us serve you better with your valuable feedback. Your input helps us improve our services and better serve our community.',
  'Thank You for Your Feedback!',
  'Your valuable feedback has been received and will help us improve our services.',
  true,
  'premium',
  1000
);

-- Create a default theme for Police Sacco with the correct colors
INSERT INTO public.organization_themes (
  organization_id,
  theme_name,
  is_active,
  colors
) VALUES (
  (SELECT id FROM public.organizations WHERE slug = 'police-sacco'),
  'Police Sacco Default',
  true,
  '{
    "primary": "#073763",
    "secondary": "#007ACE", 
    "accent": "#f97316",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text_primary": "#073763",
    "text_secondary": "#6b7280",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444"
  }'::jsonb
);

-- Update the default colors in the existing I&M Bank organization to use Police Sacco colors
UPDATE public.organizations 
SET 
  primary_color = '#073763',
  secondary_color = '#007ACE'
WHERE slug = 'im-bank';

-- Update the existing organization theme for I&M Bank to use Police Sacco colors
UPDATE public.organization_themes 
SET colors = '{
  "primary": "#073763",
  "secondary": "#007ACE",
  "accent": "#f97316", 
  "background": "#f8fafc",
  "surface": "#ffffff",
  "text_primary": "#073763",
  "text_secondary": "#6b7280",
  "success": "#10b981",
  "warning": "#f59e0b",
  "error": "#ef4444"
}'::jsonb
WHERE organization_id = (SELECT id FROM public.organizations WHERE slug = 'im-bank');
