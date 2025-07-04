
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { DashboardProvider } from '@/context/DashboardContext';
import { OrganizationProvider } from '@/context/OrganizationContext';

/**
 * Custom render function that includes common providers
 * This helps ensure components are tested within the correct context
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withDashboard?: boolean;
  withOrganization?: boolean;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { withDashboard = false, withOrganization = false, ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    let wrappedChildren = children;

    if (withOrganization) {
      wrappedChildren = (
        <OrganizationProvider>
          {wrappedChildren}
        </OrganizationProvider>
      );
    }

    if (withDashboard) {
      wrappedChildren = (
        <DashboardProvider>
          {wrappedChildren}
        </DashboardProvider>
      );
    }

    return <>{wrappedChildren}</>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Helper to test context boundary errors
 */
export function expectContextError(callback: () => void, contextName: string) {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  expect(callback).toThrow(
    new RegExp(`use${contextName} must be used within a ${contextName}Provider`)
  );
  
  consoleSpy.mockRestore();
}
