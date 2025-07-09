
import React from 'react';
import { EnhancedLoadingSpinner } from './EnhancedLoadingSpinner';

// Lazy load heavy dashboard components for better performance
export const LazyCustomerInsightsDashboard = React.lazy(() => 
  import('./CustomerInsightsDashboard').then(module => ({ 
    default: module.CustomerInsightsDashboard 
  }))
);

export const LazyPerformanceAnalyticsDashboard = React.lazy(() => 
  import('./PerformanceAnalyticsDashboard').then(module => ({ 
    default: module.PerformanceAnalyticsDashboard 
  }))
);

export const LazySentimentAnalyticsDashboard = React.lazy(() => 
  import('./SentimentAnalyticsDashboard').then(module => ({ 
    default: module.SentimentAnalyticsDashboard 
  }))
);

export const LazyAdvancedDashboardView = React.lazy(() => 
  import('./AdvancedDashboardView').then(module => ({ 
    default: module.AdvancedDashboardView 
  }))
);

// Wrapper component with loading fallback
interface LazyComponentWrapperProps {
  children: React.ReactNode;
}

export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({ children }) => (
  <React.Suspense fallback={<EnhancedLoadingSpinner text="Loading dashboard..." />}>
    {children}
  </React.Suspense>
);
