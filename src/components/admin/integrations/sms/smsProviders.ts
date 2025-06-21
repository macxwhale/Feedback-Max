
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
    id: 'africastalking',
    name: "Africa's Talking",
    description: 'SMS services across Africa with reliable delivery',
    icon: MessageSquare,
    status: 'available'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Global SMS and communication platform',
    icon: MessageSquare,
    status: 'coming_soon'
  },
  {
    id: 'vonage',
    name: 'Vonage',
    description: 'SMS API for global messaging',
    icon: MessageSquare,
    status: 'coming_soon'
  }
];
