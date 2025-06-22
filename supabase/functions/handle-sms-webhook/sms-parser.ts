
import { SmsData } from './types.ts';

export function parseSmsWebhookData(formData: FormData): SmsData {
  return {
    from: formData.get('from')?.toString() || '',
    text: formData.get('text')?.toString() || '',
    to: formData.get('to')?.toString(),
    id: formData.get('id')?.toString(),
    date: formData.get('date')?.toString()
  };
}

export function validateSmsData(smsData: SmsData): boolean {
  return !!(smsData.from && smsData.text);
}
