export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
  plan_type?: string;
  trial_ends_at?: string;
  billing_email?: string;
  max_responses?: number;
  created_by_user_id?: string;
  settings?: any;
  feedback_header_title?: string;
  feedback_header_subtitle?: string;
  welcome_screen_title?: string;
  welcome_screen_description?: string;
  thank_you_title?: string;
  thank_you_message?: string;
  custom_css?: any;
  flow_configuration?: any;
  features_config?: any; // <-- ADDED
  created_at: string;
  updated_at: string;
  sms_enabled?: boolean;
  sms_sender_id?: string | null;
  sms_settings?: any;
  webhook_secret?: string;
}

export interface OrganizationAsset {
  id: string;
  organization_id: string;
  asset_type: string;
  asset_url: string;
  asset_name?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationTheme {
  id: string;
  organization_id: string;
  theme_name: string;
  is_active: boolean;
  colors: any;
  typography?: any;
  spacing?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationData {
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  plan_type?: string;
  trial_ends_at?: string;
  billing_email?: string;
  max_responses?: number;
  created_by_user_id?: string;
  settings?: any;
  features_config?: any;
}
