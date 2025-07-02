
/**
 * Invitation Cache Management Hook (Updated)
 * Uses the refactored service infrastructure
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { OptimizedUserInvitationService } from '@/infrastructure/performance/OptimizedUserInvitationService';

const optimizedService = new OptimizedUserInvitationService();

/**
 * Hook for managing invitation cache and performance metrics
 */
export const useInvitationCache = () => {
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      optimizedService.clearCache();
      return true;
    },
    onSuccess: () => {
      toast.success('Invitation cache cleared successfully');
    },
    onError: () => {
      toast.error('Failed to clear cache');
    },
  });

  return {
    clearCache: clearCacheMutation.mutate,
    isClearingCache: clearCacheMutation.isPending,
  };
};

/**
 * Hook for accessing invitation performance statistics
 */
export const useInvitationPerformanceStats = () => {
  return useQuery({
    queryKey: ['invitation-performance-stats'],
    queryFn: () => optimizedService.getPerformanceStats(),
    refetchInterval: 30000,
    staleTime: 10000,
  });
};
