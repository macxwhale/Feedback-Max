
import { AfricasTalkingBulkResponse, BulkSmsOptions, SmsResult, SmsSummary } from './types.ts';

export async function sendBulkSms(options: BulkSmsOptions): Promise<{ results: SmsResult[], summary: SmsSummary }> {
  const { phoneNumbers, message, username, apiKey, senderId } = options;

  // Prepare Africa's Talking bulk SMS request
  const bulkSmsPayload = {
    username,
    message,
    senderId: senderId || undefined,
    phoneNumbers
  };

  console.log(`[BULK-SMS] Sending bulk SMS request:`, {
    ...bulkSmsPayload,
    phoneNumbers: `${phoneNumbers.length} numbers`
  });

  // Send bulk SMS via Africa's Talking
  const atResponse = await fetch('https://api.africastalking.com/version1/messaging/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apiKey': apiKey
    },
    body: JSON.stringify(bulkSmsPayload)
  });

  console.log(`[BULK-SMS] Africa's Talking response status: ${atResponse.status}`);
  
  const responseText = await atResponse.text();
  console.log(`[BULK-SMS] Raw response:`, responseText);

  // Parse response
  let atResult: AfricasTalkingBulkResponse;
  try {
    atResult = JSON.parse(responseText);
  } catch (jsonError) {
    console.error(`[BULK-SMS] Failed to parse JSON response:`, jsonError);
    throw new Error(`API Error: ${responseText.substring(0, 200)}`);
  }

  console.log(`[BULK-SMS] Parsed response:`, {
    message: atResult.SMSMessageData?.Message,
    recipientCount: atResult.SMSMessageData?.Recipients?.length || 0
  });

  // Process results
  const results: SmsResult[] = [];
  let totalCost = 0;
  let sentCount = 0;
  let failedCount = 0;

  if (atResult.SMSMessageData?.Recipients) {
    for (const recipient of atResult.SMSMessageData.Recipients) {
      const isSuccess = recipient.status === 'Success' || recipient.statusCode === 101;
      const result: SmsResult = {
        phoneNumber: recipient.number,
        status: isSuccess ? 'sent' : 'failed',
        messageId: recipient.messageId,
        cost: recipient.cost,
        statusCode: recipient.statusCode,
        error: !isSuccess ? recipient.status : undefined
      };

      results.push(result);
      
      if (isSuccess) {
        sentCount++;
        // Extract cost value (e.g., "KES 0.8000" -> 0.8)
        const costMatch = recipient.cost?.match(/[\d.]+/);
        if (costMatch) {
          totalCost += parseFloat(costMatch[0]);
        }
      } else {
        failedCount++;
      }
    }
  }

  const summary: SmsSummary = {
    total: results.length,
    sent: sentCount,
    failed: failedCount,
    totalCost: totalCost,
    message: atResult.SMSMessageData?.Message
  };

  return { results, summary };
}
