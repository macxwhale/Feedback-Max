
export interface FlaskSmsCallback {
  linkId: string;
  text: string;
  to: string; // Sender ID that identifies the organization
  id: string;
  date: string;
  from: string; // Phone number
}

export interface Question {
  id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  order_index: number;
  category: string;
  question_options: Array<{
    id: string;
    option_text: string;
    option_value: string;
    display_order: number;
  }>;
  question_scale_config: Array<{
    min_value: number;
    max_value: number;
    min_label: string;
    max_label: string;
  }>;
}

export interface ConversationProgress {
  id: string;
  organization_id: string;
  phone_number: string;
  sender_id: string;
  current_step: string;
  session_data: any;
  consent_given: boolean;
  last_message_id: string;
}

export interface ValidationResult {
  isValid: boolean;
  value: any;
  error?: string;
}
