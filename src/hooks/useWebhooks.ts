
import { useState, useCallback } from 'react';
import { FeedbackResponse } from '@/components/FeedbackForm';

interface WebhookConfig {
  url: string;
  events: string[];
  active: boolean;
}

export const useWebhooks = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);

  const triggerWebhooks = useCallback(async (
    event: string,
    data: FeedbackResponse[]
  ) => {
    const activeWebhooks = webhooks.filter(
      webhook => webhook.active && webhook.events.includes(event)
    );

    const promises = activeWebhooks.map(webhook =>
      fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
          source: 'police-sacco-feedback'
        })
      }).catch(error => {
        console.error(`Webhook failed for ${webhook.url}:`, error);
      })
    );

    await Promise.allSettled(promises);
  }, [webhooks]);

  const addWebhook = useCallback((webhook: WebhookConfig) => {
    setWebhooks(prev => [...prev, webhook]);
  }, []);

  const removeWebhook = useCallback((url: string) => {
    setWebhooks(prev => prev.filter(w => w.url !== url));
  }, []);

  return {
    webhooks,
    triggerWebhooks,
    addWebhook,
    removeWebhook
  };
};
