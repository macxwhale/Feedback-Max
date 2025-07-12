
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

export async function sendSmsResponse(supabase: any, org: any, phoneNumber: string, message: string, senderId: string): Promise<boolean> {
  try {
    // Get Flask wrapper URL
    const { data: settingData } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'flask_sms_wrapper_base_url')
      .single()

    const flaskWrapperUrl = settingData?.setting_value?.replace(/\/$/, '');
    
    if (flaskWrapperUrl && org.sms_settings) {
      const smsSettings = typeof org.sms_settings === 'string' 
        ? JSON.parse(org.sms_settings) 
        : org.sms_settings

      const requestData = {
        org_id: org.id,
        recipients: [phoneNumber],
        message: message,
        sender: senderId,
        username: smsSettings.username,
        api_key: smsSettings.apiKey
      }

      // Create signature for Flask API
      const webhookSecret = org.webhook_secret || 'changeme';
      const requestBody = JSON.stringify(requestData);
      const signature = createHmac('sha256', webhookSecret)
        .update(requestBody)
        .digest('hex');

      const response = await fetch(`${flaskWrapperUrl}/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
        },
        body: requestBody
      })

      if (!response.ok) {
        console.error('Failed to send response via Flask API:', response.status, response.statusText)
        return false
      } else {
        console.log('Response sent successfully via Flask API')
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Error sending response via Flask API:', error)
    return false
  }
}
