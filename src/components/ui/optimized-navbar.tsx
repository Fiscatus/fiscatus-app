import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'

interface NavItem {
  name: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

interface OptimizedNavBarProps {
  items: NavItem[]
  className?: string
}

export function OptimizedNavBar({ items, className }: OptimizedNavBarProps) {
  const location = useLocation()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  return (
    <div className={cn("relative w-full", className)}>
      <nav className={cn(
        "flex items-center justify-center gap-8 md:gap-10 lg:gap-12 bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 md:p-5 shadow-lg",
        isMobile ? "max-w-full gap-4" : "max-w-7xl"
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
                "relative flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-muted/50 border-b-2 border-transparent hover:border-primary/20",
                isMobile ? "px-3 py-2 gap-2" : "px-5 py-3 gap-3"
              )}
            >
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={cn(
                  "transition-colors duration-300 flex-shrink-0",
                  isMobile ? "w-4 h-4" : "w-5 h-5",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium transition-colors duration-300 whitespace-nowrap leading-tight",
                  isMobile ? "text-sm" : "text-base",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
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
      </nav>
    </div>
  )
} 