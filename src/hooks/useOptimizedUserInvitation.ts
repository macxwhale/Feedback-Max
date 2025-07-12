
/**
 * Optimized User Invitation Hook (Updated)
 * Now uses the refactored service components
 */

// Re-export focused hooks for direct usage
export { useInviteUser } from './useInviteUser';
export { useBatchInvitations } from './useBatchInvitations';
export { useInvitationCache, useInvitationPerformanceStats } from './useInvitationCache';
export { useInvitationPerformance } from './useInvitationPerformance';

// Use proper ES6 imports instead of require
import { useInviteUser } from './useInviteUser';
import { useBatchInvitations } from './useBatchInvitations';
import { useInvitationCache } from './useInvitationCache';

// Maintain backward compatibility with proper imports
export const useOptimizedInviteUser = () => {
  return useInviteUser();
};

export const useBatchInviteUsers = () => {
  return useBatchInvitations();
};

export const useClearInvitationCache = () => {
  const { clearCache, isClearingCache } = useInvitationCache();
  return {
    mutate: clearCache,
    isPending: isClearingCache,
  };
};
