
export interface SmsData {
  from: string;
  text: string;
  to?: string;
  id?: string;
  date?: string;
}

export interface Organization {
  id: string;
  name: string;
  sms_settings: {
    username: string;
    apiKey: string;
  };
  sms_sender_id?: string;
}

export interface SmsSession {
  id: string;
  phone_number: string;
  organization_id: string;
  current_question_index: number;
  responses: Record<string, any>;
  status: string;
  feedback_session_id: string;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: string;
  category?: string;
  order_index: number;
}
