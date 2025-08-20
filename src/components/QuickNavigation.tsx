import { Home, FileText, Users, PenTool, Network } from 'lucide-react'
import { CompactNavBar } from "@/components/ui/compact-navbar"

export function QuickNavigation() {
  const navItems = [
    { 
      name: 'Planejamento da Contratação', 
      url: '/planejamento-da-contratacao', 
      icon: Home 
    },
    { 
      name: 'Meus Processos', 
      url: '/processos', 
      icon: FileText 
    },
    { 
      name: 'Processos da Gerência', 
      url: '/processos-gerencia', 
      icon: Users 
    },
    { 
      name: 'Minhas Assinaturas', 
      url: '/assinaturas', 
      icon: PenTool 
    },
    { 
      name: 'Modelos de Fluxo', 
      url: '/modelos-de-fluxo', 
      icon: Network 
    }
  ]

  return (
    <div className="w-full bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-foreground">Navegação Rápida</h2>
          </div>
          <CompactNavBar items={navItems} variant="compact" className="max-w-md" />
        </div>
      </div>
    </div>
  )
} 