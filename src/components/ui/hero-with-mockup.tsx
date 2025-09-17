import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Glow } from "./glow"
import { Mockup } from "./mockup"

const heroVariants = cva(
  "relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-gray-50 to-white",
        gradient: "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50",
        dark: "bg-gradient-to-br from-gray-900 to-gray-800",
      },
      size: {
        sm: "py-12 md:py-16",
        md: "py-16 md:py-20",
        lg: "py-20 md:py-24",
        xl: "py-24 md:py-32",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  }
)

export interface HeroWithMockupProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof heroVariants> {
  title: string
  description: string
  primaryCta?: {
    text: string
    href?: string
    onClick?: () => void
  }
  secondaryCta?: {
    text: string
    href?: string
    onClick?: () => void
  }
  mockupImage?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
  mockupContent?: React.ReactNode
  glowVariant?: "above" | "below" | "left" | "right" | "center"
  glowSize?: "sm" | "md" | "lg" | "xl" | "2xl"
  glowColor?: "brand" | "blue" | "purple" | "pink" | "green" | "yellow" | "red"
}

const HeroWithMockup = React.forwardRef<HTMLElement, HeroWithMockupProps>(
  ({ 
    className, 
    variant, 
    size, 
    title, 
    description, 
    primaryCta, 
    secondaryCta, 
    mockupImage, 
    mockupContent,
    glowVariant = "above",
    glowSize = "xl",
    glowColor = "brand",
    ...props 
  }, ref) => {
    const glowRef = React.useRef<HTMLDivElement>(null)

    // Parallax effect for glow
    React.useEffect(() => {
      const onScroll = () => {
        const y = window.scrollY
        if (glowRef.current) {
          glowRef.current.style.transform = `translateY(${Math.min(y * 0.08, 40)}px)`
        }
      }
      window.addEventListener("scroll", onScroll, { passive: true })
      return () => window.removeEventListener("scroll", onScroll)
    }, [])

    return (
      <section
        ref={ref}
        className={cn(heroVariants({ variant, size, className }))}
        {...props}
      >
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                  {title}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                  {description}
                </p>
              </div>

              {/* CTAs */}
              {(primaryCta || secondaryCta) && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {primaryCta && (
                    <Button
                      size="lg"
                      className="h-12 px-6 gap-3 hover:translate-y-[-1px] transition-all duration-200 shadow-sm"
                      onClick={primaryCta.onClick}
                      asChild={!!primaryCta.href}
                    >
                      {primaryCta.href ? (
                        <a href={primaryCta.href}>
                          {primaryCta.text}
                        </a>
                      ) : (
                        primaryCta.text
                      )}
                    </Button>
                  )}
                  {secondaryCta && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 px-6 gap-3 hover:translate-y-[-1px] transition-all duration-200 border-gray-300 hover:border-indigo-300"
                      onClick={secondaryCta.onClick}
                      asChild={!!secondaryCta.href}
                    >
                      {secondaryCta.href ? (
                        <a href={secondaryCta.href}>
                          {secondaryCta.text}
                        </a>
                      ) : (
                        secondaryCta.text
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Mockup */}
            <div className="relative">
              <Mockup
                size="full"
                image={mockupImage}
                className="animate-appear-zoom opacity-0 [animation-delay:500ms]"
              >
                {mockupContent}
              </Mockup>
              
              {/* Glow effect */}
              <div 
                ref={glowRef}
                className="absolute inset-0 overflow-hidden pointer-events-none"
              >
                <Glow 
                  variant={glowVariant} 
                  size={glowSize} 
                  color={glowColor}
                  className="animate-appear-zoom opacity-0 [animation-delay:1000ms]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
)
HeroWithMockup.displayName = "HeroWithMockup"

export { HeroWithMockup, heroVariants }
