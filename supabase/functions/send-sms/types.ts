
export interface BulkSmsRequest {
  phoneNumbers: string[];
  message: string;
  organizationId: string;
  campaignId?: string;
  senderId?: string;
}

export interface SmsResult {
  phoneNumber: string;
  status: 'sent' | 'failed';
  messageId?: string;
  cost?: string;
  error?: string;
  statusCode?: number;
}

export interface SmsSummary {
  total: number;
  sent: number;
  failed: number;
  totalCost: number;
  message?: string;
}

export interface Organization {
  sms_settings: {
    username: string;
    apiKey: string;
  };
  sms_sender_id?: string;
  name?: string;
}

export interface AfricasTalkingBulkResponse {
  SMSMessageData: {
    Message: string;
    Recipients: Array<{
      statusCode: number;
      number: string;
      status: string;
      cost: string;
      messageId: string;
    }>;
  };
}

export interface BulkSmsOptions {
  phoneNumbers: string[];
  message: string;
  username: string;
  apiKey: string;
  senderId?: string;
}
