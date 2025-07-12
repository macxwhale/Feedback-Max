
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'interactive' | 'glass';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, variant = 'default', size = 'md', ...props }, ref) => {
  const variantStyles = {
    default: "rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200",
    elevated: "rounded-xl bg-card text-card-foreground shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:-translate-y-1",
    outlined: "rounded-xl border-2 bg-card text-card-foreground hover:border-primary/30 hover:shadow-sm transition-all duration-200",
    filled: "rounded-xl bg-slate-50 dark:bg-slate-800 text-card-foreground border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all duration-200",
    interactive: "rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-300 hover:border-primary/20",
    glass: "rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 text-card-foreground shadow-lg hover:shadow-xl transition-all duration-300"
  };

  const sizeStyles = {
    sm: "p-3",
    md: "p-6", 
    lg: "p-8"
  };

  return (
    <div
      ref={ref}
      className={cn(variantStyles[variant], className)}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeStyles = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5", sizeStyles[size], className)}
      {...props}
    />
  )
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeStyles = {
    sm: "text-lg",
    md: "text-title-large",
    lg: "text-2xl"
  };

  return (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight",
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeStyles = {
    sm: "text-sm",
    md: "text-body-medium",
    lg: "text-base"
  };

  return (
    <p
      ref={ref}
      className={cn("text-muted-foreground", sizeStyles[size], className)}
      {...props}
    />
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeStyles = {
    sm: "p-4 pt-0",
    md: "p-6 pt-0",
    lg: "p-8 pt-0"
  };

  return (
    <div 
      ref={ref} 
      className={cn(sizeStyles[size], className)} 
      {...props} 
    />
  )
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeStyles = {
    sm: "p-4 pt-0",
    md: "p-6 pt-0", 
    lg: "p-8 pt-0"
  };

  return (
    <div
      ref={ref}
      className={cn("flex items-center", sizeStyles[size], className)}
      {...props}
    />
  )
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
