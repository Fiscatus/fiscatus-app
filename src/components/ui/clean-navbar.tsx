import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'

interface NavItem {
  name: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

interface CleanNavBarProps {
  items: NavItem[]
  className?: string
}

export function CleanNavBar({ items, className }: CleanNavBarProps) {
  const location = useLocation()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  return (
    <div className={cn("relative w-full", className)}>
      <nav className={cn(
        "flex items-center justify-center gap-6 md:gap-8 lg:gap-10 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-3 md:p-4 h-12 shadow-sm",
        isMobile ? "max-w-full gap-4" : "max-w-6xl"
      )}>
        {items.map((item, index) => {
          // Lógica específica para cada rota para evitar conflitos
          let isActive = false
          
          if (item.url === '/planejamento-da-contratacao') {
            isActive = location.pathname === '/planejamento-da-contratacao' || location.pathname === '/'
          } else if (item.url === '/processos') {
            isActive = location.pathname === '/processos' || location.pathname.startsWith('/processos/')
          } else if (item.url === '/processos-gerencia') {
            isActive = location.pathname === '/processos-gerencia' || location.pathname.startsWith('/processos-gerencia/')
          } else if (item.url === '/assinaturas') {
            isActive = location.pathname === '/assinaturas' || location.pathname.startsWith('/assinaturas/')
          } else if (item.url === '/modelos-de-fluxo') {
            isActive = location.pathname === '/modelos-de-fluxo'
          } else {
            isActive = location.pathname === item.url
          }
          
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              to={item.url}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100/80 hover:shadow-sm border-b-2 border-transparent",
                isMobile ? "px-3 py-1.5" : "px-4 py-2",
                isActive && "border-b-2 border-primary bg-primary/5"
              )}
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={cn(
                  "transition-colors duration-200 flex-shrink-0",
                  isMobile ? "w-4 h-4" : "w-4.5 h-4.5",
                  isActive ? "text-primary" : "text-gray-600"
                )} />
                <span className={cn(
                  "font-medium transition-colors duration-200 whitespace-nowrap leading-tight",
                  isMobile ? "text-sm" : "text-sm",
                  isActive ? "text-primary font-semibold" : "text-gray-700"
                )}>
                  {isMobile ? item.name.split(' ')[0] : item.name}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 