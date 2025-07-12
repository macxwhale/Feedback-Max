
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeUpdates = (organizationId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!organizationId) return;

    console.log('Setting up realtime updates for organization:', organizationId);

    // Listen to feedback sessions changes
    const feedbackChannel = supabase
      .channel('feedback-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback_sessions',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          console.log('Feedback session updated:', payload);
          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: ['enhanced-organization-stats', organizationId] });
          queryClient.invalidateQueries({ queryKey: ['organization-stats', organizationId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback_responses',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          console.log('Feedback response updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['enhanced-organization-stats', organizationId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organization_users',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          console.log('Organization user updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['paginated-users'] });
          queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(feedbackChannel);
    };
  }, [organizationId, queryClient]);
};
