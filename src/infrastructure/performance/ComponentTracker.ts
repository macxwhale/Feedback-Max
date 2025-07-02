
/**
 * Component Performance Tracker
 * React-specific performance tracking utilities
 */

import { useEffect, useRef } from 'react';
import { metricsAggregator } from './MetricsAggregator';
import { logger } from '@/utils/logger';

/**
 * Hook for tracking component render performance
 */
export const useComponentPerformance = (componentName: string) => {
  const renderStartRef = useRef<number>();
  const mountTimeRef = useRef<number>();

  useEffect(() => {
    mountTimeRef.current = performance.now();
    
    return () => {
      if (mountTimeRef.current) {
        const unmountTime = performance.now() - mountTimeRef.current;
        logger.debug('Component lifecycle', {
          component: componentName,
          totalMountTime: unmountTime,
        });
      }
    };
  }, [componentName]);

  const startRender = () => {
    renderStartRef.current = performance.now();
  };

  const endRender = () => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      metricsAggregator.trackComponent(componentName, renderTime);
      
      if (renderTime > 16) {
        logger.warn('Slow component render', {
          component: componentName,
          renderTime,
        });
      }
    }
  };

  return { startRender, endRender };
};

/**
 * Higher-order component for automatic performance tracking
 */
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const TrackedComponent = (props: P) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name;
    const { startRender, endRender } = useComponentPerformance(name);

    useEffect(() => {
      startRender();
      endRender();
    });

    return <WrappedComponent {...props} />;
  };

  TrackedComponent.displayName = `withPerformanceTracking(${
    componentName || WrappedComponent.displayName || WrappedComponent.name
  })`;

  return TrackedComponent;
};

/**
 * Performance boundary component for error tracking
 */
interface PerformanceBoundaryProps {
  children: React.ReactNode;
  componentName: string;
  fallback?: React.ComponentType<{ error: Error }>;
}

export class PerformanceBoundary extends React.Component<
  PerformanceBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: PerformanceBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Component performance boundary caught error', {
      component: this.props.componentName,
      error: error.message,
      componentStack: errorInfo.componentStack,
    });

    // Track error in metrics
    metricsAggregator.trackComponent(
      `${this.props.componentName}_error`,
      performance.now()
    );
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }
      
      return (
        <div className="p-4 text-center text-red-600">
          <h2>Component Error</h2>
          <p>Something went wrong in {this.props.componentName}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
