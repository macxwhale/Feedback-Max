
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';

interface DashboardContextType {
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const value: DashboardContextType = {
    dateRange,
    setDateRange,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    // Provide more detailed error information for debugging
    const error = new Error(
      'useDashboard must be used within a DashboardProvider. ' +
      'Make sure the component calling useDashboard is wrapped with <DashboardProvider>.'
    );
    
    // Add stack trace information in development
    if (process.env.NODE_ENV === 'development') {
      console.error('DashboardContext Error:', {
        message: error.message,
        stack: error.stack,
        hint: 'Check that DashboardProvider wraps the component tree where useDashboard is called'
      });
    }
    
    throw error;
  }
  
  return context;
};

// Optional: Create a HOC for components that need dashboard context
export const withDashboard = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => (
    <DashboardProvider>
      <Component {...props} />
    </DashboardProvider>
  );
  
  WrappedComponent.displayName = `withDashboard(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Optional: Safe hook that doesn't throw but returns null if not in provider
export const useDashboardSafe = (): DashboardContextType | null => {
  const context = useContext(DashboardContext);
  return context || null;
};
