
import React from 'react';

/**
 * Utility to create context hooks with better error messages
 * Based on Kent C. Dodds' context pattern
 */
export function createContextHook<T>(
  context: React.Context<T | undefined>,
  contextName: string,
  providerName: string
) {
  return function useContextHook(): T {
    const contextValue = React.useContext(context);
    
    if (contextValue === undefined) {
      const error = new Error(
        `use${contextName} must be used within a ${providerName}. ` +
        `Make sure the component calling use${contextName} is wrapped with <${providerName}>.`
      );
      
      // Enhanced debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚨 Context Error: ${contextName}`);
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.info(`💡 Solution: Wrap your component with <${providerName}>`);
        console.groupEnd();
      }
      
      throw error;
    }
    
    return contextValue;
  };
}

/**
 * Utility to validate context provider hierarchy in development
 */
export function validateProviderHierarchy(
  providers: string[],
  currentProvider: string
): void {
  if (process.env.NODE_ENV === 'development') {
    console.info(`✅ ${currentProvider} initialized`);
    console.info('Provider hierarchy:', providers.join(' > '));
  }
}
