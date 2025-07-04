
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, ChevronUp } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  extended?: boolean;
  children?: React.ReactNode;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <Plus className="w-6 h-6" />,
  className,
  size = 'md',
  position = 'bottom-right',
  extended = false,
  children
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-6 left-6'
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        'fixed z-50 rounded-full shadow-lg',
        'bg-primary hover:bg-primary/90 text-primary-foreground',
        'transition-all duration-200 active:scale-95',
        'border-2 border-white/20',
        extended ? 'px-6 h-14 gap-3' : sizeClasses[size],
        positionClasses[position],
        className
      )}
      size="icon"
    >
      {icon}
      {extended && children}
    </Button>
  );
};

// Scroll-to-top FAB variant
export const ScrollToTopFAB: React.FC<{ threshold?: number }> = ({ 
  threshold = 400 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > threshold);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <FloatingActionButton
      onClick={scrollToTop}
      icon={<ChevronUp className="w-6 h-6" />}
      position="bottom-right"
      className="bg-gray-800 hover:bg-gray-700"
    />
  );
};
