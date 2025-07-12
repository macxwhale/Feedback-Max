
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ThemeManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only allow dark mode on the landing page.
    if (pathname !== '/') {
      document.documentElement.classList.remove('dark');
    }
    // When navigating back to the landing page ('/'), the ThemeToggle component
    // will re-apply the 'dark' class if needed because it re-mounts and
    // its own logic for setting the theme runs again.
  }, [pathname]);

  return null;
};
