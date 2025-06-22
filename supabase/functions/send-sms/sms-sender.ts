
import { Organization, SmsResult, AfricasTalkingResponse } from './types.ts';

export async function sendSmsToNumber(
  phoneNumber: string,
  message: string,
  organization: Organization
): Promise<SmsResult> {
  try {
    console.log(`Sending SMS to ${phoneNumber}`);

    // Prepare Africa's Talking API request
    const atData = new URLSearchParams();
    atData.append('username', organization.sms_settings.username);
    atData.append('to', phoneNumber);
    atData.append('message', message);
    if (organization.sms_sender_id) {
      atData.append('from', organization.sms_sender_id);
    }

    // Send SMS via Africa's Talking
    const atResponse = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'apiKey': organization.sms_settings.apiKey
      },
      body: atData.toString()
    });

    console.log(`Africa's Talking response status: ${atResponse.status}`);
    
    const responseText = await atResponse.text();
    console.log(`Raw response for ${phoneNumber}:`, responseText);

    // Try to parse as JSON, fallback to handling as text
    let atResult: AfricasTalkingResponse;
    try {
      atResult = JSON.parse(responseText);
    } catch (jsonError) {
      console.error(`Failed to parse JSON response for ${phoneNumber}:`, jsonError);
      
      // Handle non-JSON response (likely an error)
      const errorMessage = responseText.includes('Invalid credentials') 
        ? 'Invalid Africa\'s Talking credentials' 
        : `API Error: ${responseText.substring(0, 100)}`;

      return {
        phoneNumber,
        status: 'failed',
        error: errorMessage
      };
    }

    let status: 'sent' | 'failed' = 'failed';
    let messageId: string | undefined;
    let errorMessage: string | undefined;

    if (atResult.SMSMessageData?.Recipients?.length > 0) {
      const recipient = atResult.SMSMessageData.Recipients[0];
      if (recipient.status === 'Success') {
        status = 'sent';
        messageId = recipient.messageId;
      } else {
        errorMessage = recipient.status;
      }
    } else {
      errorMessage = atResult.SMSMessageData?.Message || 'Unknown error';
    }

    return {
      phoneNumber,
      status,
      messageId,
      error: errorMessage
    };

  } catch (error) {
    console.error(`Error sending SMS to ${phoneNumber}:`, error);
    return {
      phoneNumber,
      status: 'failed',
      error: error.message
    };
  }
}
