
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AccessibilityWrapperProps {
  children: React.ReactNode;
  className?: string;
  announceChanges?: boolean;
  skipLink?: string;
  landmarks?: boolean;
}

export const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({
  children,
  className,
  announceChanges = false,
  skipLink,
  landmarks = true
}) => {
  const announcementRef = useRef<HTMLDivElement>(null);

  // Announce content changes for screen readers
  useEffect(() => {
    if (announceChanges && announcementRef.current) {
      const announcement = 'Content updated';
      announcementRef.current.textContent = announcement;
      
      // Clear after a short delay
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, [announceChanges, children]);

  return (
    <div className={cn('relative', className)}>
      {/* Skip to main content link */}
      {skipLink && (
        <a
          href={skipLink}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>
      )}

      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Main content */}
      {landmarks ? (
        <main role="main" className="focus:outline-none" tabIndex={-1}>
          {children}
        </main>
      ) : (
        children
      )}

      {/* Focus trap for modals/overlays */}
      <div
        className="sr-only"
        tabIndex={0}
        onFocus={(e) => {
          // Focus management for keyboard navigation
          const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          if (firstElement) firstElement.focus();
        }}
      />
    </div>
  );
};
