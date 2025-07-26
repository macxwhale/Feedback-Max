export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_log_enhanced: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          severity: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_super_admin: boolean | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_super_admin?: boolean | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_super_admin?: boolean | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "all_users_with_org"
            referencedColumns: ["user_id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          hashed_key: string
          id: string
          key_name: string
          key_prefix: string
          last_used_at: string | null
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          hashed_key: string
          id?: string
          key_name: string
          key_prefix: string
          last_used_at?: string | null
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          hashed_key?: string
          id?: string
          key_name?: string
          key_prefix?: string
          last_used_at?: string | null
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_request_logs: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          id: number
          ip_address: unknown | null
          organization_id: string
          status_code: number
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          id?: number
          ip_address?: unknown | null
          organization_id: string
          status_code: number
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: number
          ip_address?: unknown | null
          organization_id?: string
          status_code?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_request_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_request_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          question_category: Database["public"]["Enums"]["question_category"]
          question_completed_at: string | null
          question_id: string
          question_snapshot: Json | null
          question_started_at: string | null
          question_text_snapshot: string | null
          question_type_snapshot: string | null
          response_time_ms: number | null
          response_value: Json
          score: number | null
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          question_category: Database["public"]["Enums"]["question_category"]
          question_completed_at?: string | null
          question_id: string
          question_snapshot?: Json | null
          question_started_at?: string | null
          question_text_snapshot?: string | null
          question_type_snapshot?: string | null
          response_time_ms?: number | null
          response_value: Json
          score?: number | null
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          question_category?: Database["public"]["Enums"]["question_category"]
          question_completed_at?: string | null
          question_id?: string
          question_snapshot?: Json | null
          question_started_at?: string | null
          question_text_snapshot?: string | null
          question_type_snapshot?: string | null
          response_time_ms?: number | null
          response_value?: Json
          score?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_sessions: {
        Row: {
          avg_question_time_ms: number | null
          category_scores: Json | null
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          organization_id: string
          phone_number: string | null
          sms_session_id: string | null
          started_at: string
          status: string
          timing_metadata: Json | null
          total_response_time_ms: number | null
          total_score: number | null
          user_id: string | null
        }
        Insert: {
          avg_question_time_ms?: number | null
          category_scores?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          organization_id: string
          phone_number?: string | null
          sms_session_id?: string | null
          started_at?: string
          status?: string
          timing_metadata?: Json | null
          total_response_time_ms?: number | null
          total_score?: number | null
          user_id?: string | null
        }
        Update: {
          avg_question_time_ms?: number | null
          category_scores?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          phone_number?: string | null
          sms_session_id?: string | null
          started_at?: string
          status?: string
          timing_metadata?: Json | null
          total_response_time_ms?: number | null
          total_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_sessions_sms_session_id_fkey"
            columns: ["sms_session_id"]
            isOneToOne: false
            referencedRelation: "sms_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "all_users_with_org"
            referencedColumns: ["user_id"]
          },
        ]
      }
      invitation_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          invitation_id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          invitation_id: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          invitation_id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_events_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "user_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          organization_id: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          organization_id: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          organization_id?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "all_users_with_org"
            referencedColumns: ["user_id"]
          },
        ]
      }
      organization_assets: {
        Row: {
          asset_name: string | null
          asset_type: string
          asset_url: string
          created_at: string
          display_order: number | null
          file_size: number | null
          id: string
          is_active: boolean | null
          mime_type: string | null
          organization_id: string
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          asset_name?: string | null
          asset_type: string
          asset_url: string
          created_at?: string
          display_order?: number | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          organization_id: string
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          asset_name?: string | null
          asset_type?: string
          asset_url?: string
          created_at?: string
          display_order?: number | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          organization_id?: string
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          organization_id: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          organization_id?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          organization_id?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_themes: {
        Row: {
          colors: Json
          created_at: string
          id: string
          is_active: boolean | null
          organization_id: string
          spacing: Json | null
          theme_name: string
          typography: Json | null
          updated_at: string
        }
        Insert: {
          colors?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          organization_id: string
          spacing?: Json | null
          theme_name?: string
          typography?: Json | null
          updated_at?: string
        }
        Update: {
          colors?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string
          spacing?: Json | null
          theme_name?: string
          typography?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_themes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_users: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          enhanced_role: Database["public"]["Enums"]["enhanced_org_role"] | null
          id: string
          invited_at: string | null
          invited_by_user_id: string | null
          organization_id: string
          role: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          enhanced_role?:
            | Database["public"]["Enums"]["enhanced_org_role"]
            | null
          id?: string
          invited_at?: string | null
          invited_by_user_id?: string | null
          organization_id: string
          role?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          enhanced_role?:
            | Database["public"]["Enums"]["enhanced_org_role"]
            | null
          id?: string
          invited_at?: string | null
          invited_by_user_id?: string | null
          organization_id?: string
          role?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_users_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "all_users_with_org"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "organization_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "all_users_with_org"
            referencedColumns: ["user_id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          created_at: string
          created_by_user_id: string | null
          custom_css: Json | null
          domain: string | null
          features_config: Json | null
          feedback_header_subtitle: string | null
          feedback_header_title: string | null
          flask_sms_wrapper_url: string | null
          flow_configuration: Json | null
          id: string
          is_active: boolean
          logo_storage_path: string | null
          logo_url: string | null
          max_responses: number | null
          name: string
          plan_type: Database["public"]["Enums"]["org_plan_type"] | null
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
          slug: string
          sms_enabled: boolean
          sms_integration_type: string
          sms_sender_id: string | null
          sms_settings: Json | null
          thank_you_message: string | null
          thank_you_title: string | null
          trial_ends_at: string | null
          updated_at: string
          updated_by_user_id: string | null
          webhook_secret: string
          welcome_screen_description: string | null
          welcome_screen_title: string | null
        }
        Insert: {
          billing_email?: string | null
          created_at?: string
          created_by_user_id?: string | null
          custom_css?: Json | null
          domain?: string | null
          features_config?: Json | null
          feedback_header_subtitle?: string | null
          feedback_header_title?: string | null
          flask_sms_wrapper_url?: string | null
          flow_configuration?: Json | null
          id?: string
          is_active?: boolean
          logo_storage_path?: string | null
          logo_url?: string | null
          max_responses?: number | null
          name: string
          plan_type?: Database["public"]["Enums"]["org_plan_type"] | null
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug: string
          sms_enabled?: boolean
          sms_integration_type?: string
          sms_sender_id?: string | null
          sms_settings?: Json | null
          thank_you_message?: string | null
          thank_you_title?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          updated_by_user_id?: string | null
          webhook_secret?: string
          welcome_screen_description?: string | null
          welcome_screen_title?: string | null
        }
        Update: {
          billing_email?: string | null
          created_at?: string
          created_by_user_id?: string | null
          custom_css?: Json | null
          domain?: string | null
          features_config?: Json | null
          feedback_header_subtitle?: string | null
          feedback_header_title?: string | null
          flask_sms_wrapper_url?: string | null
          flow_configuration?: Json | null
          id?: string
          is_active?: boolean
          logo_storage_path?: string | null
          logo_url?: string | null
          max_responses?: number | null
          name?: string
          plan_type?: Database["public"]["Enums"]["org_plan_type"] | null
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug?: string
          sms_enabled?: boolean
          sms_integration_type?: string
          sms_sender_id?: string | null
          sms_settings?: Json | null
          thank_you_message?: string | null
          thank_you_title?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          updated_by_user_id?: string | null
          webhook_secret?: string
          welcome_screen_description?: string | null
          welcome_screen_title?: string | null
        }
        Relationships: []
      }
      question_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean | null
          option_text: string
          option_value: string | null
          question_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          option_text: string
          option_value?: string | null
          question_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          option_text?: string
          option_value?: string | null
          question_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_scale_config: {
        Row: {
          created_at: string | null
          id: string
          max_label: string | null
          max_value: number
          min_label: string | null
          min_value: number
          question_id: string
          step_size: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_label?: string | null
          max_value?: number
          min_label?: string | null
          min_value?: number
          question_id: string
          step_size?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_label?: string | null
          max_value?: number
          min_label?: string | null
          min_value?: number
          question_id?: string
          step_size?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_scale_config_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_types: {
        Row: {
          config_schema: Json | null
          created_at: string
          description: string | null
          display_name: string
          id: string
          name: string
          supports_options: boolean | null
          supports_scale: boolean | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          config_schema?: Json | null
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          name: string
          supports_options?: boolean | null
          supports_scale?: boolean | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          config_schema?: Json | null
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          name?: string
          supports_options?: boolean | null
          supports_scale?: boolean | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: string | null
          category_id: string
          conditional_logic: Json | null
          created_at: string
          help_text: string | null
          id: string
          is_active: boolean
          is_required: boolean | null
          order_index: number
          organization_id: string
          placeholder_text: string | null
          question_text: string
          question_type: string | null
          type_id: string
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          category?: string | null
          category_id: string
          conditional_logic?: Json | null
          created_at?: string
          help_text?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean | null
          order_index: number
          organization_id: string
          placeholder_text?: string | null
          question_text: string
          question_type?: string | null
          type_id: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          category?: string | null
          category_id?: string
          conditional_logic?: Json | null
          created_at?: string
          help_text?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean | null
          order_index?: number
          organization_id?: string
          placeholder_text?: string | null
          question_text?: string
          question_type?: string | null
          type_id?: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_questions_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "question_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_questions_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_questions_type"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "question_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "question_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "question_types"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_key: string
          permission_value: Json | null
          role: Database["public"]["Enums"]["enhanced_org_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_key: string
          permission_value?: Json | null
          role: Database["public"]["Enums"]["enhanced_org_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_key?: string
          permission_value?: Json | null
          role?: Database["public"]["Enums"]["enhanced_org_role"]
        }
        Relationships: []
      }
      sms_campaigns: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          delivered_count: number | null
          failed_count: number | null
          id: string
          message_template: string
          metadata: Json | null
          name: string
          organization_id: string
          response_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          started_at: string | null
          status: string
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          message_template: string
          metadata?: Json | null
          name: string
          organization_id: string
          response_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          message_template?: string
          metadata?: Json | null
          name?: string
          organization_id?: string
          response_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_conversation_progress: {
        Row: {
          consent_given: boolean | null
          created_at: string
          current_step: string
          id: string
          last_message_id: string | null
          organization_id: string
          phone_number: string
          sender_id: string
          session_data: Json | null
          updated_at: string
        }
        Insert: {
          consent_given?: boolean | null
          created_at?: string
          current_step?: string
          id?: string
          last_message_id?: string | null
          organization_id: string
          phone_number: string
          sender_id: string
          session_data?: Json | null
          updated_at?: string
        }
        Update: {
          consent_given?: boolean | null
          created_at?: string
          current_step?: string
          id?: string
          last_message_id?: string | null
          organization_id?: string
          phone_number?: string
          sender_id?: string
          session_data?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_conversation_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_conversations: {
        Row: {
          africastalking_message_id: string | null
          content: string
          created_at: string
          direction: string
          id: string
          sms_session_id: string
          status: string | null
        }
        Insert: {
          africastalking_message_id?: string | null
          content: string
          created_at?: string
          direction: string
          id?: string
          sms_session_id: string
          status?: string | null
        }
        Update: {
          africastalking_message_id?: string | null
          content?: string
          created_at?: string
          direction?: string
          id?: string
          sms_session_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_conversations_sms_session_id_fkey"
            columns: ["sms_session_id"]
            isOneToOne: false
            referencedRelation: "sms_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_phone_numbers: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          id: string
          metadata: Json | null
          name: string | null
          organization_id: string
          phone_number: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          organization_id: string
          phone_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          organization_id?: string
          phone_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_phone_numbers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_sends: {
        Row: {
          africastalking_message_id: string | null
          campaign_id: string | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message_content: string
          organization_id: string
          phone_number: string
          phone_number_id: string | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          africastalking_message_id?: string | null
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content: string
          organization_id: string
          phone_number: string
          phone_number_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          africastalking_message_id?: string | null
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string
          organization_id?: string
          phone_number?: string
          phone_number_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "sms_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_sends_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_sends_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "sms_phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_sessions: {
        Row: {
          created_at: string
          current_question_index: number
          expires_at: string
          feedback_session_id: string | null
          id: string
          organization_id: string
          phone_number: string
          responses: Json
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_question_index?: number
          expires_at?: string
          feedback_session_id?: string | null
          id?: string
          organization_id: string
          phone_number: string
          responses?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_question_index?: number
          expires_at?: string
          feedback_session_id?: string | null
          id?: string
          organization_id?: string
          phone_number?: string
          responses?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_sessions_feedback_session_id_fkey"
            columns: ["feedback_session_id"]
            isOneToOne: false
            referencedRelation: "feedback_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          email_opened_at: string | null
          enhanced_role: Database["public"]["Enums"]["enhanced_org_role"] | null
          expires_at: string
          id: string
          invitation_token: string
          invited_by_user_id: string
          ip_address: unknown | null
          last_resent_at: string | null
          organization_id: string
          resend_count: number | null
          role: string
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          email_opened_at?: string | null
          enhanced_role?:
            | Database["public"]["Enums"]["enhanced_org_role"]
            | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by_user_id: string
          ip_address?: unknown | null
          last_resent_at?: string | null
          organization_id: string
          resend_count?: number | null
          role?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          email_opened_at?: string | null
          enhanced_role?:
            | Database["public"]["Enums"]["enhanced_org_role"]
            | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by_user_id?: string
          ip_address?: unknown | null
          last_resent_at?: string | null
          organization_id?: string
          resend_count?: number | null
          role?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "all_users_with_org"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          organization_id: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          organization_id?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          organization_id?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      all_users_with_org: {
        Row: {
          accepted_at: string | null
          email: string | null
          invited_by_user_id: string | null
          organization_id: string | null
          organization_user_created_at: string | null
          organization_user_id: string | null
          role: string | null
          status: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_users_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "all_users_with_org"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "organization_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses_with_context: {
        Row: {
          created_at: string | null
          current_question_text: string | null
          current_question_type: string | null
          id: string | null
          is_orphaned: boolean | null
          organization_id: string | null
          organization_name: string | null
          question_category:
            | Database["public"]["Enums"]["question_category"]
            | null
          question_id: string | null
          question_is_active: boolean | null
          question_snapshot: Json | null
          question_text_snapshot: string | null
          question_type_snapshot: string | null
          response_value: Json | null
          score: number | null
          session_id: string | null
          session_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_organization_invitation: {
        Args: { invitation_token: string }
        Returns: Json
      }
      can_manage_user_role: {
        Args: {
          manager_role: Database["public"]["Enums"]["enhanced_org_role"]
          target_role: Database["public"]["Enums"]["enhanced_org_role"]
        }
        Returns: boolean
      }
      cancel_invitation: {
        Args: { p_invitation_id: string }
        Returns: Json
      }
      create_api_key: {
        Args: {
          p_organization_id: string
          p_key_name: string
          p_expires_at?: string
        }
        Returns: string
      }
      get_current_user_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_organization_config: {
        Args: { org_slug: string }
        Returns: Json
      }
      get_organization_members: {
        Args: { p_org_id: string }
        Returns: Database["public"]["CompositeTypes"]["member_with_inviter"][]
      }
      get_organization_stats: {
        Args: { org_id: string }
        Returns: Json
      }
      get_organization_stats_enhanced: {
        Args: { org_id: string }
        Returns: Json
      }
      get_paginated_organization_users: {
        Args: {
          org_id: string
          page_size?: number
          page_offset?: number
          search_term?: string
          role_filter?: string
        }
        Returns: Json
      }
      get_role_hierarchy_level: {
        Args: { user_role: Database["public"]["Enums"]["enhanced_org_role"] }
        Returns: number
      }
      get_user_enhanced_role: {
        Args: { p_user_id: string; p_org_id: string }
        Returns: Database["public"]["Enums"]["enhanced_org_role"]
      }
      invite_user_to_organization: {
        Args:
          | { p_email: string; p_organization_id: string; p_role?: string }
          | {
              p_email: string
              p_organization_id: string
              p_role?: string
              p_enhanced_role?: Database["public"]["Enums"]["enhanced_org_role"]
            }
        Returns: Json
      }
      is_current_user_org_admin: {
        Args: { org_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_organization_id?: string
          p_old_values?: Json
          p_new_values?: Json
          p_severity?: string
          p_metadata?: Json
        }
        Returns: string
      }
      log_invitation_event: {
        Args: {
          p_invitation_id: string
          p_event_type: string
          p_event_data?: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      remove_user_from_organization: {
        Args: { p_user_id: string; p_organization_id: string }
        Returns: Json
      }
      safe_delete_question: {
        Args: { question_uuid: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: { p_user_id: string; p_org_id: string; p_permission_key: string }
        Returns: Json
      }
      validate_api_key: {
        Args: { p_api_key: string }
        Returns: {
          is_valid: boolean
          org_id: string
          key_id: string
        }[]
      }
      validate_invitation_token: {
        Args: { p_token: string }
        Returns: {
          invitation_id: string
          email: string
          organization_id: string
          organization_name: string
          organization_slug: string
          role: string
          enhanced_role: Database["public"]["Enums"]["enhanced_org_role"]
          expires_at: string
          is_valid: boolean
          error_message: string
        }[]
      }
    }
    Enums: {
      enhanced_org_role:
        | "owner"
        | "admin"
        | "manager"
        | "analyst"
        | "member"
        | "viewer"
      org_plan_type: "starter" | "pro" | "enterprise"
      question_category:
        | "QualityCommunication"
        | "QualityStaff"
        | "ValueForMoney"
        | "QualityService"
        | "LikelyRecommend"
        | "DidWeMakeEasy"
        | "Comments"
        | "Satisfaction"
    }
    CompositeTypes: {
      member_with_inviter: {
        id: string | null
        user_id: string | null
        email: string | null
        role: string | null
        status: string | null
        created_at: string | null
        accepted_at: string | null
        invited_by: Json | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      enhanced_org_role: [
        "owner",
        "admin",
        "manager",
        "analyst",
        "member",
        "viewer",
      ],
      org_plan_type: ["starter", "pro", "enterprise"],
      question_category: [
        "QualityCommunication",
        "QualityStaff",
        "ValueForMoney",
        "QualityService",
        "LikelyRecommend",
        "DidWeMakeEasy",
        "Comments",
        "Satisfaction",
      ],
    },
  },
} as const
