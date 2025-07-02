
/**
 * Optimized User Invitation Hook (Refactored)
 * Composed from focused, single-responsibility hooks
 */

// Re-export focused hooks for direct usage
export { useInviteUser } from './useInviteUser';
export { useBatchInvitations } from './useBatchInvitations';
export { useInvitationCache, useInvitationPerformanceStats } from './useInvitationCache';
export { useInvitationPerformance } from './useInvitationPerformance';

// Maintain backward compatibility
export const useOptimizedInviteUser = () => {
  const { useInviteUser } = require('./useInviteUser');
  return useInviteUser();
};

export const useBatchInviteUsers = () => {
  const { useBatchInvitations } = require('./useBatchInvitations');
  return useBatchInvitations();
};

export const useClearInvitationCache = () => {
  const { useInvitationCache } = require('./useInvitationCache');
  return useInvitationCache();
};
