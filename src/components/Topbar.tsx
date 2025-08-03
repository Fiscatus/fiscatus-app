import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Bell, Settings, Home, FileText, Users, PenLine, Workflow } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Sidebar from "./Sidebar";
import NotificationDropdown, { NotificationBell } from "./NotificationDropdown";
import { useUser } from "@/contexts/UserContext";
import logo from "@/assets/logo_fiscatus.png";

function QuickActionButton({ icon, label, variant = "default", onClick }: any) {
  const variants = {
    primary: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300",
    secondary: "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300",
    tertiary: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300",
    muted: "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
  };

  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border bg-white shadow-sm text-sm font-medium whitespace-nowrap transition-all duration-200 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${variants[variant]}`}
      onClick={onClick}
      type="button"
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}

export default function Topbar() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const location = useLocation();

  // Verifica se está em qualquer página do módulo Planejamento da Contratação
  const isPlanejamentoContratacao = 
    location.pathname === "/planejamento-da-contratacao" || 
    location.pathname === "/" ||
    location.pathname === "/processos" ||
    location.pathname === "/processos-gerencia" ||
    location.pathname === "/assinaturas" ||
    location.pathname === "/modelos-de-fluxo" ||
    location.pathname.startsWith("/processos/") ||
    location.pathname.startsWith("/processo/") ||
    location.pathname.startsWith("/assinaturas/") ||
    location.pathname.startsWith("/processos-gerencia/");

  // Verifica se o usuário tem permissão para acessar modelos de fluxo
  const temPermissaoModelosFluxo = () => {
    if (!user) return false;
    const gerenciasAutorizadas = [
      'Comissão de Implantação',
      'CI',
      'SE - Secretaria Executiva',
      'Secretaria Executiva',
      'OUV - Ouvidoria',
      'Ouvidoria'
    ];
    return gerenciasAutorizadas.some(g => user.gerencia.includes(g));
  };
  
  return (
    <>
      <header className="fixed top-0 left-0 w-full h-auto min-h-16 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm z-50 px-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Esquerda: menu, logo, nome do sistema */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu className="w-4 h-4 text-gray-600" />
          </button>
          <img src={logo} className="w-8 h-8" alt="Logo Fiscatus" />
          <span className="text-2xl font-bold text-gray-800">Fiscatus</span>
        </div>
        {/* Centro: ações rápidas */}
        <div className="flex flex-wrap gap-4 justify-center items-center flex-1 min-w-0">
          <QuickActionButton 
            icon={<Home className="text-emerald-600" />} 
            label={<span className="text-emerald-700 font-semibold">Planejamento da Contratação</span>} 
            variant="primary" 
            onClick={() => navigate("/planejamento-da-contratacao")}
          />
          {isPlanejamentoContratacao && (
            <>
              <QuickActionButton 
                icon={<FileText className="text-slate-600" />} 
                label={<span className="text-slate-700 font-semibold">Meus Processos</span>} 
                variant="secondary" 
                onClick={() => navigate("/processos")}
              />
              <QuickActionButton 
                icon={<Users className="text-gray-600" />} 
                label={<span className="text-gray-700 font-semibold">Processos da Gerência</span>} 
                variant="muted" 
                onClick={() => navigate("/processos-gerencia")}
              />
              <QuickActionButton 
                icon={<PenLine className="text-blue-600" />} 
                label={<span className="text-blue-700 font-semibold">Minhas Assinaturas</span>} 
                variant="tertiary" 
                onClick={() => navigate("/assinaturas")}
              />
              {temPermissaoModelosFluxo() && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white shadow-sm text-sm font-medium whitespace-nowrap transition-all duration-200 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300">
                      <Workflow className="text-purple-600" />
                      <span className="text-purple-700 font-semibold">Modelos de Fluxo</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    <DropdownMenuItem onClick={() => navigate("/modelos-de-fluxo")} className="cursor-pointer">
                      <Workflow className="mr-2 h-4 w-4" />
                      <span>Modelos de Fluxo</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
        {/* Direita: busca, ícones, avatar */}
        <div className="flex items-center gap-2 flex-shrink-0 mt-2 md:mt-0 relative">
          <Input type="text" placeholder="Buscar processo..." className="w-40 md:w-64 border-gray-200 focus:border-blue-300 focus:ring-blue-200" />
          <div className="relative">
            <NotificationBell onClick={() => setNotificationsOpen(!notificationsOpen)} />
            <NotificationDropdown 
              isOpen={notificationsOpen} 
              onClose={() => setNotificationsOpen(false)} 
            />
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Configurações">
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
          <Avatar className="w-8 h-8 border border-gray-200">
            <AvatarImage src="/usuario.png" />
            <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">GM</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
} 