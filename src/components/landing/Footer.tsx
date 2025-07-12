
import React from 'react';
import { Activity } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Link } from 'react-router-dom';

const FooterLink = ({ href, children, isRouterLink = false }: { href: string; children: React.ReactNode; isRouterLink?: boolean }) => {
  if (isRouterLink) {
    return (
      <Link
        to={href}
        className="text-warm-gray-400 hover:text-white transition-colors duration-300 text-base"
      >
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className="text-warm-gray-400 hover:text-white transition-colors duration-300 text-base"
    >
      {children}
    </a>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-warm-gray-900 dark:bg-dark-warm-100">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div>
          {/* Brand section */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-sunset-500" aria-label="Pulsify pulse icon" />
              <span className="text-2xl font-space font-bold text-white">Pulsify</span>
            </div>
            <p className="text-base text-warm-gray-400 max-w-xs">
              Real Insights. Real Impact.
            </p>
            <div className="text-base text-warm-gray-400 mt-4 space-y-1">
              <p>info@pulsify.bunisystems.com</p>
              <p>+254207862379</p>
              <p>Nairobi, Kenya</p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-warm-gray-700 pt-8 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-4">
            <p className="text-base text-warm-gray-500">
              &copy; {new Date().getFullYear()} Pulsify. All rights reserved.
            </p>
            <div className="flex items-center gap-x-6">
                <FooterLink href="/privacy-policy" isRouterLink>Privacy Policy</FooterLink>
                <FooterLink href="/terms-of-service" isRouterLink>Terms of Service</FooterLink>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
};
