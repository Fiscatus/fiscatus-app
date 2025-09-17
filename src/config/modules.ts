import type React from "react"
import { Home, FileText, Users, PenLine, Workflow } from "lucide-react"

export type ModulePage = {
  id: string
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
}

export type ModuleItem = {
  id: string
  label: string
  color?: string
  pages: ModulePage[]
}

export const modulesConfig: ModuleItem[] = [
  {
    id: "planejamento",
    label: "Planejamento da Contratação",
    color: "text-indigo-600",
    pages: [
      { id: "home",               label: "Planejamento da Contratação", href: "/planejamento-da-contratacao", icon: Home,     shortcut: "G,H" },
      { id: "meus-processos",     label: "Meus Processos",               href: "/processos",                   icon: FileText, shortcut: "G,M" },
      { id: "proc-gerencia",      label: "Processos da Gerência",        href: "/processos-gerencia",         icon: Users,    shortcut: "G,G" },
      { id: "minhas-assinaturas", label: "Minhas Assinaturas",           href: "/assinaturas",                 icon: PenLine,  shortcut: "G,A" },
      { id: "modelos-fluxo",      label: "Modelos de Fluxo",             href: "/modelos-de-fluxo",           icon: Workflow, shortcut: "G,F" },
    ],
  },
]


