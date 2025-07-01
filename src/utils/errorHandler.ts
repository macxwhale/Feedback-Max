
/**
 * Centralized error handling utility following industry best practices
 * Based on Google's Error Handling Guidelines and Airbnb's JavaScript Style Guide
 */

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorResponse {
  success: false;
  error: AppError;
  requestId?: string;
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  requestId?: string;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Creates a standardized error object
 */
export const createError = (
  code: string,
  message: string,
  severity: AppError['severity'] = 'medium',
  details?: Record<string, unknown>
): AppError => ({
  code,
  message,
  details,
  timestamp: new Date().toISOString(),
  severity,
});

/**
 * Creates a standardized error response
 */
export const createErrorResponse = (
  error: AppError,
  requestId?: string
): ErrorResponse => ({
  success: false,
  error,
  requestId,
});

/**
 * Creates a standardized success response
 */
export const createSuccessResponse = <T>(
  data: T,
  requestId?: string
): SuccessResponse<T> => ({
  success: true,
  data,
  requestId,
});

/**
 * Error codes following a consistent naming convention
 */
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_PERMISSION_DENIED: 'AUTH_PERMISSION_DENIED',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  
  // Validation errors
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_EMAIL: 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  
  // Business logic errors
  BUSINESS_USER_ALREADY_EXISTS: 'BUSINESS_USER_ALREADY_EXISTS',
  BUSINESS_ORGANIZATION_NOT_FOUND: 'BUSINESS_ORGANIZATION_NOT_FOUND',
  BUSINESS_INVITATION_EXPIRED: 'BUSINESS_INVITATION_EXPIRED',
  
  // System errors
  SYSTEM_DATABASE_ERROR: 'SYSTEM_DATABASE_ERROR',
  SYSTEM_NETWORK_ERROR: 'SYSTEM_NETWORK_ERROR',
  SYSTEM_UNKNOWN_ERROR: 'SYSTEM_UNKNOWN_ERROR',
} as const;

/**
 * Logs errors in a consistent format
 */
export const logError = (error: AppError, context?: Record<string, unknown>): void => {
  console.error('Application Error:', {
    ...error,
    context,
  });
};

/**
 * Handles and formats unknown errors consistently
 */
export const handleUnknownError = (
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): AppError => {
  if (error instanceof Error) {
    return createError(
      ERROR_CODES.SYSTEM_UNKNOWN_ERROR,
      error.message || fallbackMessage,
      'high',
      { originalError: error.name }
    );
  }
  
  return createError(
    ERROR_CODES.SYSTEM_UNKNOWN_ERROR,
    fallbackMessage,
    'high',
    { originalError: String(error) }
  );
};
