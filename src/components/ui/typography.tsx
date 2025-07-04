
import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const H1: React.FC<TypographyProps> = ({ children, className, as: Component = 'h1' }) => (
  <Component className={cn(
    'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
    'leading-tight text-gray-900 dark:text-gray-100',
    className
  )}>
    {children}
  </Component>
);

export const H2: React.FC<TypographyProps> = ({ children, className, as: Component = 'h2' }) => (
  <Component className={cn(
    'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight',
    'text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700',
    className
  )}>
    {children}
  </Component>
);

export const H3: React.FC<TypographyProps> = ({ children, className, as: Component = 'h3' }) => (
  <Component className={cn(
    'scroll-m-20 text-2xl font-semibold tracking-tight',
    'text-gray-900 dark:text-gray-100',
    className
  )}>
    {children}
  </Component>
);

export const H4: React.FC<TypographyProps> = ({ children, className, as: Component = 'h4' }) => (
  <Component className={cn(
    'scroll-m-20 text-xl font-semibold tracking-tight',
    'text-gray-800 dark:text-gray-200',
    className
  )}>
    {children}
  </Component>
);

export const Body: React.FC<TypographyProps> = ({ children, className, as: Component = 'p' }) => (
  <Component className={cn(
    'leading-7 text-gray-600 dark:text-gray-300',
    className
  )}>
    {children}
  </Component>
);

export const Caption: React.FC<TypographyProps> = ({ children, className, as: Component = 'span' }) => (
  <Component className={cn(
    'text-sm text-gray-500 dark:text-gray-400',
    className
  )}>
    {children}
  </Component>
);
