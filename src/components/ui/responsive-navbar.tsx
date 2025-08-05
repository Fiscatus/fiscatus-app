import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'

interface NavItem {
  name: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

interface ResponsiveNavBarProps {
  items: NavItem[]
  className?: string
}

export function ResponsiveNavBar({ items, className }: ResponsiveNavBarProps) {
  const location = useLocation()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  return (
    <div className={cn("relative w-full", className)}>
      <div className={cn(
        "flex items-center justify-center gap-1 md:gap-2 lg:gap-3 bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-1 md:p-2 shadow-lg",
        isMobile ? "max-w-full" : "max-w-6xl"
      )}>
        {items.map((item, index) => {
          const isActive = location.pathname === item.url || 
                          (item.url !== '/' && location.pathname.startsWith(item.url))
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              to={item.url}
              className={cn(
                "relative flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-105",
                isMobile ? "w-14 h-12" : isTablet ? "w-16 h-14" : "w-20 h-16"
              )}
            >
              <motion.div
                className="flex flex-col items-center justify-center w-full h-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={cn(
                  "transition-colors duration-300",
                  isMobile ? "w-4 h-4" : isTablet ? "w-5 h-5" : "w-6 h-6",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium transition-colors duration-300 text-center leading-tight",
                  isMobile ? "text-[10px] mt-0.5" : isTablet ? "text-xs mt-1" : "text-sm mt-1",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {isMobile ? item.name.split(' ')[0] : item.name}
                </span>
              </motion.div>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
} 