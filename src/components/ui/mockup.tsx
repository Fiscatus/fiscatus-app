import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const mockupVariants = cva(
  "relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
  {
    variants: {
      variant: {
        default: "border-gray-200",
        gradient: "border-transparent bg-gradient-to-br from-blue-50 to-purple-50",
        dark: "border-gray-800 bg-gray-900",
      },
      size: {
        sm: "w-64 h-40",
        md: "w-80 h-48",
        lg: "w-96 h-56",
        xl: "w-[28rem] h-64",
        "2xl": "w-[32rem] h-72",
        full: "w-full h-auto",
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
        "2xl": "shadow-2xl",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
      shadow: "lg",
    },
  }
)

export interface MockupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mockupVariants> {
  image?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
  children?: React.ReactNode
}

const Mockup = React.forwardRef<HTMLDivElement, MockupProps>(
  ({ className, variant, size, shadow, image, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(mockupVariants({ variant, size, shadow, className }))}
        {...props}
      >
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="w-full h-full object-cover"
          />
        ) : (
          children
        )}
      </div>
    )
  }
)
Mockup.displayName = "Mockup"

export { Mockup, mockupVariants }
