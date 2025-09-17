import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glowVariants = cva(
  "absolute pointer-events-none",
  {
    variants: {
      variant: {
        above: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
        below: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
        left: "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2",
        right: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
        center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
      },
      size: {
        sm: "w-32 h-32",
        md: "w-48 h-48", 
        lg: "w-64 h-64",
        xl: "w-80 h-80",
        "2xl": "w-96 h-96",
      },
      color: {
        brand: "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20",
        blue: "bg-blue-500/20",
        purple: "bg-purple-500/20",
        pink: "bg-pink-500/20",
        green: "bg-green-500/20",
        yellow: "bg-yellow-500/20",
        red: "bg-red-500/20",
      }
    },
    defaultVariants: {
      variant: "center",
      size: "lg",
      color: "brand",
    },
  }
)

export interface GlowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glowVariants> {
  blur?: number
}

const Glow = React.forwardRef<HTMLDivElement, GlowProps>(
  ({ className, variant, size, color, blur = 60, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glowVariants({ variant, size, color, className }))}
        style={{
          filter: `blur(${blur}px)`,
          ...props.style,
        }}
        {...props}
      />
    )
  }
)
Glow.displayName = "Glow"

export { Glow, glowVariants }
