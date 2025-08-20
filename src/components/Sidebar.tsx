import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { 
  X, 
  FolderOpen,
  LayoutDashboard,
  ClipboardList,
  Gavel,
  BarChart3,
  Settings,
  Users
} from "lucide-react";

const dashboard = {
  label: "Dashboard Principal", 
  icon: <LayoutDashboard className="w-5 h-5" />,
  path: "/",
  description: "Visão geral do sistema"
};

const modules = [
  { 
    label: "Planejamento da Contratação", 
    icon: <FolderOpen className="w-5 h-5" />,
    path: "/planejamento-da-contratacao",
    description: "Organize todas as fases da contratação"
  },
  {
    label: "Gestão Contratual",
    icon: <Users className="w-5 h-5" />,
    path: "/gestao-contratual",
    description: "Gerencie contratos e documentos",
    disabled: true
  },
  {
    label: "Execução Contratual",
    icon: <ClipboardList className="w-5 h-5" />,
    path: "/execucao-contratual",
    description: "Monitore a execução do contrato",
    disabled: true
  },
  {
    label: "Processo Licitatório",
    icon: <Gavel className="w-5 h-5" />,
    path: "/processo-licitatorio",
    description: "Acompanhe o processo licitatório",
    disabled: true
  },
  {
    label: "Relatórios",
    icon: <BarChart3 className="w-5 h-5" />,
    path: "/relatorios",
    description: "Visualize dados estratégicos",
    disabled: true
  },
  {
    label: "Configurações do Fluxo",
    icon: <Settings className="w-5 h-5" />,
    path: "/configuracoes-fluxo",
    description: "Personalize o fluxo de trabalho",
    disabled: true
  }
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const handleModuleClick = (module: any) => {
    if (module.disabled) {
      toast({
        title: "Módulo em Desenvolvimento",
        description: `O módulo "${module.label}" estará disponível em breve.`,
        variant: "default"
      });
      return;
    }
    
    if (module.restricted) {
      // Verificar permissões antes de navegar
      // Por enquanto, vamos permitir a navegação
    }
    
    navigate(module.path);
    onClose();
  };

  const isActiveModule = (modulePath: string) => {
    return location.pathname === modulePath || 
           (modulePath === "/" && location.pathname === "/") ||
           (modulePath === "/planejamento-da-contratacao" && location.pathname === "/planejamento-da-contratacao");
  };

  const isActiveDashboard = (dashboardPath: string) => {
    return location.pathname === dashboardPath;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-80 bg-white shadow-lg z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gray-50">
          <div>
            <span className="text-lg font-semibold text-gray-900">Módulos</span>
            <p className="text-xs text-gray-500">Navegação do sistema</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors" 
            aria-label="Fechar sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {/* Dashboard Principal */}
          <div className="px-4 mb-6">
            <button
              onClick={() => handleModuleClick(dashboard)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-200 group ${
                isActiveDashboard(dashboard.path)
                  ? "bg-blue-50 border-l-4 border-blue-600 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300"
              } cursor-pointer`}
              tabIndex={0}
            >
              <div className={`${isActiveDashboard(dashboard.path) ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}`}>
                {dashboard.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-medium">
                  {dashboard.label}
                </span>
                <span className="block text-xs text-gray-500 truncate">
                  {dashboard.description}
                </span>
              </div>
            </button>
          </div>

          {/* Módulos do Sistema */}
          <div className="px-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Módulos do Sistema
            </h3>
          </div>
          
          {modules.map((module, idx) => (
            <button
              key={module.label}
              onClick={() => handleModuleClick(module)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-200 group ${
                isActiveModule(module.path)
                  ? "bg-blue-50 border-l-4 border-blue-600 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300"
              } ${module.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              disabled={module.disabled}
              tabIndex={0}
            >
              <div className={`${isActiveModule(module.path) ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}`}>
                {module.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`block font-medium ${module.disabled ? "text-gray-400" : ""}`}>
                  {module.label}
                </span>
                <span className="block text-xs text-gray-500 truncate">
                  {module.description}
                </span>
              </div>
              {module.disabled && (
                <span className="text-xs text-gray-400">Em breve</span>
              )}
            </button>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-gray-500 text-center">
            <p>Fiscatus v1.0.0</p>
            <p className="mt-1">Gestão inteligente e integrada para contratações públicas.</p>
          </div>
        </div>
      </aside>
    </>
  );
} 