
import { MessageSquare } from 'lucide-react';

export interface SmsProvider {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'available' | 'coming_soon';
}

export const smsProviders: SmsProvider[] = [
  {
    id: 'sms-provider',
    name: "SMS Provider (Flask Wrapper)",
    description: 'SMS services via Flask wrapper integration',
    icon: MessageSquare,
    status: 'available'
  }
];
