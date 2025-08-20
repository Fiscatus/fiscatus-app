import { Home, FileText, Users, PenTool, Network } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"
import { CompactNavBar } from "@/components/ui/compact-navbar"

export function TubelightNavbarDemo() {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-4xl space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-slate-800">
            Navegação Tubelight
          </h1>
          <p className="text-slate-600 mb-8">
            Navegação moderna com efeito de luz e animações suaves
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Versão Padrão</h2>
            <div className="flex justify-center">
              <NavBar items={navItems} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Versão Compacta</h2>
            <div className="flex justify-center">
              <CompactNavBar items={navItems} variant="compact" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Versão Compacta com Texto</h2>
            <div className="flex justify-center">
              <CompactNavBar items={navItems} variant="default" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 