import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation()

  return (
    <div className={cn("relative w-full max-w-md mx-auto", className)}>
      <div className="flex items-center justify-center space-x-1 bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-1 shadow-lg">
        {items.map((item, index) => {
          const isActive = location.pathname === item.url
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              to={item.url}
              className="relative flex items-center justify-center w-16 h-12 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <motion.div
                className="flex flex-col items-center justify-center w-full h-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs mt-1 font-medium transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.name}
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