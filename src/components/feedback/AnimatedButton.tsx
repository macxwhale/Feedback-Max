
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  icon?: LucideIcon;
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  disabled,
  variant = 'default',
  icon: Icon,
  className = ''
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      className={`
        transition-all duration-200 transform
        hover:scale-105 hover:shadow-lg
        active:scale-95 active:shadow-sm
        disabled:hover:scale-100 disabled:hover:shadow-none
        ${className}
      `}
    >
      {Icon && (
        <Icon className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
      )}
      {children}
    </Button>
  );
};
