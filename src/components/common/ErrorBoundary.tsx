
import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logError } from '@/utils/logger';
import { createError, ERROR_CODES } from '@/utils/errorHandler';

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showReload?: boolean;
  title?: string;
  description?: string;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Production-ready Error Boundary component
 * Following React error boundary best practices and accessibility guidelines
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Static method to update state when an error occurs
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Lifecycle method called when an error occurs
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error for monitoring
    const appError = createError(
      ERROR_CODES.CLIENT_ERROR,
      error.message,
      'critical',
      {
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      }
    );

    logError('React Error Boundary caught an error', {
      error: appError,
      errorInfo,
    });

    // Update state with error info
    this.setState({ errorInfo });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Handles page reload
   */
  private handleReload = (): void => {
    window.location.reload();
  };

  /**
   * Handles error recovery by resetting state
   */
  private handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  /**
   * Renders the error fallback UI
   */
  private renderErrorFallback(): ReactNode {
    const { fallback, showReload = true, title, description } = this.props;
    
    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    const errorTitle = title || 'Something went wrong';
    const errorDescription = description || 
      'We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.';

    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="mb-2">{errorTitle}</AlertTitle>
          <AlertDescription className="mb-4">
            {errorDescription}
          </AlertDescription>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Try Again
            </Button>
            
            {showReload && (
              <Button
                variant="secondary"
                size="sm"
                onClick={this.handleReload}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Reload Page
              </Button>
            )}
          </div>

          {/* Development-only error details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-xs">
              <summary className="cursor-pointer font-medium">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </Alert>
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}

/**
 * Higher-Order Component for wrapping components with error boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Hook for programmatic error throwing (useful for testing error boundaries)
 */
export const useThrowError = () => {
  return (error: Error) => {
    throw error;
  };
};
