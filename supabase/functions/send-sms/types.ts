
export interface SendSmsRequest {
  phoneNumbers: string[];
  message: string;
  organizationId: string;
  campaignId: string;
}

export interface SmsResult {
  phoneNumber: string;
  status: 'sent' | 'failed';
  messageId?: string;
  error?: string;
}

export interface SmsSummary {
  total: number;
  sent: number;
  failed: number;
}

export interface Organization {
  sms_settings: {
    username: string;
    apiKey: string;
  };
  sms_sender_id?: string;
}

export interface AfricasTalkingResponse {
  SMSMessageData?: {
    Message?: string;
    Recipients?: Array<{
      status: string;
      messageId?: string;
    }>;
  };
}
