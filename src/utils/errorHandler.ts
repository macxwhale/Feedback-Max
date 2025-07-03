/**
 * Centralized Error Handler
 * Provides consistent error handling patterns across the application
 */

export interface AppError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorReportingConfig {
  enableLogging: boolean;
  enableReporting: boolean;
  maxRetries: number;
}

/**
 * Centralized error handling service
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private config: ErrorReportingConfig = {
    enableLogging: true,
    enableReporting: true,
    maxRetries: 3,
  };

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle application errors with context
   */
  handleError(error: Error | AppError, context?: Record<string, unknown>): AppError {
    const appError = this.normalizeError(error, context);
    
    if (this.config.enableLogging) {
      this.logError(appError);
    }

    if (this.config.enableReporting && appError.severity === 'critical') {
      this.reportError(appError);
    }

    return appError;
  }

  /**
   * Handle async operations with error catching
   */
  async handleAsync<T>(
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw this.handleError(error as Error, context);
    }
  }

  /**
   * Create a typed error
   */
  createError(
    code: string,
    message: string,
    severity: AppError['severity'] = 'medium',
    context?: Record<string, unknown>
  ): AppError {
    return {
      code,
      message,
      context,
      timestamp: Date.now(),
      severity,
    };
  }

  /**
   * Normalize any error to AppError format
   */
  private normalizeError(error: Error | AppError, context?: Record<string, unknown>): AppError {
    if ('code' in error && 'severity' in error) {
      return {
        ...error,
        context: { ...error.context, ...context },
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      context,
      timestamp: Date.now(),
      severity: 'medium',
    };
  }

  /**
   * Log error to console with formatting
   */
  private logError(error: AppError): void {
    const logLevel = error.severity === 'critical' ? 'error' : 'warn';
    console[logLevel]('Application Error:', {
      code: error.code,
      message: error.message,
      severity: error.severity,
      timestamp: new Date(error.timestamp).toISOString(),
      context: error.context,
    });
  }

  /**
   * Report error to external service (placeholder)
   */
  private reportError(error: AppError): void {
    // In a real application, this would send to Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && window.console) {
      console.error('Critical Error Reported:', error);
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();

/**
 * Additional response types for backward compatibility
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

/**
 * Helper functions for backward compatibility
 */
export const createError = (code: string, message: string, details?: any): AppError => {
  return errorHandler.createError(code, message, 'medium', details);
};

export const createErrorResponse = (error: string, code?: string): ErrorResponse => {
  return {
    success: false,
    error,
    code,
  };
};

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => {
  return {
    success: true,
    data,
  };
};

export const handleUnknownError = (error: unknown): AppError => {
  if (error instanceof Error) {
    return errorHandler.handleError(error);
  }
  return errorHandler.createError('UNKNOWN_ERROR', 'An unknown error occurred');
};

export const logError = (error: AppError): void => {
  console.error('Error:', error);
};

// Legacy exports for backward compatibility
export const ERROR_CODES = ErrorCodes;

/**
 * Error boundary helpers
 */
export const formatErrorForDisplay = (error: AppError): string => {
  switch (error.severity) {
    case 'critical':
      return 'A critical error occurred. Please refresh the page or contact support.';
    case 'high':
      return 'Something went wrong. Please try again.';
    case 'medium':
    case 'low':
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};

/**
 * Common error types
 */
export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];