
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  interactive?: boolean;
  elevated?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className,
  title,
  description,
  footer,
  interactive = false,
  elevated = false,
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const { isMobile, hasHover } = useResponsiveDesign();
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        // Interactive states
        interactive && [
          'cursor-pointer',
          hasHover && 'hover:shadow-md hover:-translate-y-0.5',
          'active:scale-[0.98]',
        ],
        // Elevation
        elevated && 'shadow-lg',
        // Mobile optimizations
        isMobile && 'rounded-xl',
        className
      )}
      onClick={interactive ? () => setIsCollapsed(!isCollapsed) : undefined}
    >
      {(title || description) && (
        <CardHeader className={cn(isMobile && 'pb-3')}>
          {title && (
            <CardTitle className={cn(
              'flex items-center justify-between',
              isMobile && 'text-lg'
            )}>
              {title}
              {collapsible && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCollapsed(!isCollapsed);
                  }}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    isCollapsed ? 'rotate-180' : 'rotate-0'
                  )}>
                    ▲
                  </div>
                </button>
              )}
            </CardTitle>
          )}
          {description && (
            <CardDescription className={cn(isMobile && 'text-sm')}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      
      {!isCollapsed && (
        <CardContent className={cn(isMobile && 'px-4')}>
          {children}
        </CardContent>
      )}
      
      {footer && !isCollapsed && (
        <CardFooter className={cn(isMobile && 'px-4 pt-0')}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};
