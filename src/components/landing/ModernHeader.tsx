import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export const ModernHeader: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlNavbar = () => {
    if (typeof window !== 'undefined') {
      // Hide on scroll down, show on scroll up
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);

      // cleanup function
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);


  return (
    <header className={`fixed top-0 w-full bg-transparent backdrop-blur-lg border-b border-warm-gray-100/20 dark:border-dark-warm-200/20 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <Activity className="w-8 h-8 text-sunset-500" aria-label="Pulsify pulse icon" />
              <div className="absolute inset-0 w-8 h-8 bg-sunset-500 rounded-full opacity-20 animate-ping"></div>
            </div>
            <span className="text-2xl font-space font-bold text-warm-gray-900 dark:text-dark-warm-900">
              Pulsify
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
