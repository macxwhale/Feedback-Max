
/**
 * Safe metric calculation utilities
 * Handles edge cases and prevents inflated percentages
 */

/**
 * Safely calculate percentage change with proper bounds
 */
export const calculateSafePercentageChange = (
  current: number, 
  previous: number,
  maxChange: number = 100
): number => {
  if (previous === 0 || previous === null || previous === undefined) {
    return current > 0 ? maxChange : 0;
  }
  
  if (current === null || current === undefined) {
    return 0;
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;
  
  // Cap extreme values to prevent unrealistic percentages
  return Math.max(-maxChange, Math.min(maxChange, Math.round(change)));
};

/**
 * Normalize scores to expected range (1-5 scale)
 */
export const normalizeScore = (score: number, maxExpected: number = 5): number => {
  if (score === null || score === undefined || isNaN(score)) return 0;
  
  // If score is already in expected range, return as is
  if (score >= 1 && score <= maxExpected) return score;
  
  // If score is on 0-100 scale, convert to 1-5
  if (score >= 0 && score <= 100) {
    return Math.max(1, Math.min(5, (score / 100) * 4 + 1));
  }
  
  // If score is way off, cap it
  return Math.max(1, Math.min(maxExpected, score));
};

/**
 * Calculate performance score with proper validation
 */
export const calculateSafePerformanceScore = (metrics: {
  completionRate?: number;
  satisfactionRate?: number;
  responseRate?: number;
}): number => {
  const { completionRate = 0, satisfactionRate = 0, responseRate = 0 } = metrics;
  
  // Normalize all inputs to 0-100 range
  const normalizedCompletion = Math.max(0, Math.min(100, completionRate));
  const normalizedSatisfaction = Math.max(0, Math.min(100, satisfactionRate));
  const normalizedResponse = Math.max(0, Math.min(100, responseRate));
  
  // Weighted calculation
  const score = (normalizedCompletion * 0.4) + 
                (normalizedSatisfaction * 0.4) + 
                (normalizedResponse * 0.2);
  
  return Math.round(Math.max(0, Math.min(100, score)));
};

/**
 * Format trend value for display with safe bounds
 */
export const formatSafeTrendValue = (value: number): string => {
  const safeValue = Math.max(0, Math.min(999, Math.abs(value)));
  return `${safeValue}%`;
};

/**
 * Calculate growth rate with minimum threshold protection
 */
export const calculateSafeGrowthRate = (
  current: number,
  previous: number,
  minimumThreshold: number = 5
): number => {
  // If previous period has too few data points, show as stable
  if (previous < minimumThreshold) {
    return current > previous ? 10 : 0; // Show modest positive growth or stable
  }
  
  return calculateSafePercentageChange(current, previous, 100);
};

/**
 * Validate and clean session data
 */
export const validateSessionData = (sessions: any[]): any[] => {
  if (!Array.isArray(sessions)) return [];
  
  return sessions.filter(session => {
    // Remove invalid sessions
    if (!session || typeof session !== 'object') return false;
    
    // Normalize total_score if it exists
    if (session.total_score !== null && session.total_score !== undefined) {
      session.total_score = normalizeScore(session.total_score);
    }
    
    return true;
  });
};
