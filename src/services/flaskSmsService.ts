
import { supabase } from '@/integrations/supabase/client';

interface FlaskSmsRequest {
  username: string;
  api_key: string;
  recipients: string[];
  message: string;
  sender: string;
  org_id: string;
}

interface FlaskSmsResponse {
  SMSMessageData: {
    Message: string;
    Recipients: Array<{
      cost: string;
      messageId: string;
      number: string;
      status: string;
      statusCode: number;
    }>;
  };
}

interface FlaskSmsCallback {
  linkId: string;
  text: string;
  to: string;
  id: string;
  date: string;
  from: string;
}

export class FlaskSmsService {
  private static async getFlaskWrapperUrl(): Promise<string> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'flask_sms_wrapper_base_url')
      .single();

    if (error || !data?.setting_value) {
      throw new Error('Flask SMS wrapper URL not configured');
    }

    return data.setting_value;
  }

  static async sendSms(
    organizationId: string,
    recipients: string[],
    message: string,
    senderConfig: {
      username: string;
      apiKey: string;
      senderId: string;
    }
  ): Promise<FlaskSmsResponse> {
    try {
      const flaskUrl = await this.getFlaskWrapperUrl();
      
      const requestData: FlaskSmsRequest = {
        username: senderConfig.username,
        api_key: senderConfig.apiKey,
        recipients,
        message,
        sender: senderConfig.senderId,
        org_id: organizationId
      };

      console.log('Sending SMS via Flask wrapper:', { organizationId, recipients: recipients.length });

      const response = await fetch(`${flaskUrl}/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Flask SMS API error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Flask SMS response:', responseData);

      return responseData;
    } catch (error) {
      console.error('Flask SMS service error:', error);
      throw error;
    }
  }

  static async initializeConversationProgress(
    organizationId: string,
    phoneNumber: string,
    senderId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('sms_conversation_progress')
        .upsert({
          organization_id: organizationId,
          phone_number: phoneNumber,
          sender_id: senderId,
          current_step: 'consent',
          consent_given: false,
          session_data: {}
        }, {
          onConflict: 'organization_id,phone_number,sender_id'
        });

      if (error) {
        console.error('Error initializing conversation progress:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to initialize conversation progress:', error);
      throw error;
    }
  }

  static async updateConversationProgress(
    senderId: string,
    phoneNumber: string,
    step: string,
    sessionData: any = {}
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('sms_conversation_progress')
        .update({
          current_step: step,
          session_data: sessionData,
          updated_at: new Date().toISOString()
        })
        .eq('sender_id', senderId)
        .eq('phone_number', phoneNumber);

      if (error) {
        console.error('Error updating conversation progress:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to update conversation progress:', error);
      throw error;
    }
  }

  static async getConversationProgress(
    senderId: string,
    phoneNumber: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('sms_conversation_progress')
        .select('*')
        .eq('sender_id', senderId)
        .eq('phone_number', phoneNumber)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error getting conversation progress:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get conversation progress:', error);
      return null;
    }
  }
}
