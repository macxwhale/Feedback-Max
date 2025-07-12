
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const headingVariants = cva(
  "scroll-m-20 tracking-tight",
  {
    variants: {
      variant: {
        h1: "text-4xl font-extrabold lg:text-5xl",
        h2: "text-3xl font-semibold",
        h3: "text-2xl font-semibold",
        h4: "text-xl font-semibold",
        h5: "text-lg font-semibold",
        h6: "text-base font-semibold",
      },
    },
    defaultVariants: {
      variant: "h1",
    },
  }
)

const bodyVariants = cva(
  "leading-7",
  {
    variants: {
      variant: {
        default: "text-base",
        large: "text-lg font-semibold",
        small: "text-sm font-medium leading-none",
        muted: "text-sm text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const captionVariants = cva(
  "text-xs text-muted-foreground",
  {
    variants: {
      variant: {
        default: "text-xs text-muted-foreground",
        small: "text-xs text-gray-500",
        muted: "text-xs text-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {}

export interface BodyProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof bodyVariants> {}

export interface CaptionProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof captionVariants> {}

const H1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant = "h1", ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn(headingVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
H1.displayName = "H1"

const H2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant = "h2", ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(headingVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
H2.displayName = "H2"

const H3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant = "h3", ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(headingVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
H3.displayName = "H3"

const H4 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant = "h4", ...props }, ref) => {
    return (
      <h4
        ref={ref}
        className={cn(headingVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
H4.displayName = "H4"

const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(bodyVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
Body.displayName = "Body"

const Caption = React.forwardRef<HTMLSpanElement, CaptionProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(captionVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
Caption.displayName = "Caption"

export { H1, H2, H3, H4, Body, Caption, headingVariants, bodyVariants, captionVariants }
