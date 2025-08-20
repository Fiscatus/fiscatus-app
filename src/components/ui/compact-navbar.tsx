import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

interface CompactNavBarProps {
  items: NavItem[]
  className?: string
  variant?: 'default' | 'compact'
}

export function CompactNavBar({ items, className, variant = 'default' }: CompactNavBarProps) {
  const location = useLocation()

  return (
    <div className={cn("relative w-full", className)}>
      <div className={cn(
        "flex items-center justify-center gap-2 bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-2 shadow-lg",
        variant === 'compact' ? "max-w-sm" : "max-w-4xl"
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
                variant === 'compact' ? "w-12 h-10" : "w-20 h-14"
              )}
            >
              <motion.div
                className="flex flex-col items-center justify-center w-full h-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={cn(
                  "transition-colors duration-300",
                  variant === 'compact' ? "w-4 h-4" : "w-5 h-5",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                {variant === 'default' && (
                  <span className={cn(
                    "text-xs mt-1 font-medium transition-colors duration-300 text-center leading-tight",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.name}
                  </span>
                )}
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