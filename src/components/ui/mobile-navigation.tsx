
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  children,
  trigger,
  side = 'left',
  className
}) => {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="w-5 h-5" />
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side={side} className={cn('w-80 p-0', className)}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
