import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Sidebar from "./Sidebar";
import NotificationDropdown from "./NotificationDropdown";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import { ModuleMenubar } from "@/components/topbar/ModuleMenubar";
import { ModuleSheet } from "@/components/topbar/ModuleSheet";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/topbar/AccountMenu";
import logo from "@/assets/logo_fiscatus.png";



export default function Topbar() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const location = useLocation();
  // Placeholder genérico para Dashboard
  const searchPlaceholder = location.pathname === "/" 
    ? "Buscar no sistema..." 
    : "Buscar processos, documentos, usuários...";

  // Função para abrir drawer de suporte
  const openSupportDrawer = () => {
    // sua função que abre o drawer lateral de suporte
    const ev = new CustomEvent("open-support")
    window.dispatchEvent(ev)
  }

  // Verifica se está em qualquer página do módulo Planejamento da Contratação
  const isPlanejamentoContratacao = 
    location.pathname === "/planejamento-da-contratacao" || 
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
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
        <div className="w-full h-14 sm:h-16 grid grid-cols-[auto,1fr] items-center px-4 sm:px-6 lg:px-8">
          {/* Coluna esquerda: menu + logo + seletor de módulo */}
          <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
            {/* Menu hambúrguer */}
            <button
              className="h-9 w-9 grid place-items-center rounded-lg hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-500"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src={logo} className="w-8 h-8 md:w-10 md:h-10" alt="Logo Fiscatus" />
              <span className="text-base md:text-lg font-bold text-gray-800 truncate">Fiscatus</span>
            </div>

            {/* Seletor de módulo removido do Dashboard (home) */}
            {isPlanejamentoContratacao && location.pathname !== "/" && (
              <>
                <div className="hidden sm:block">
                  <ModuleMenubar />
                </div>
                <div className="sm:hidden">
                  <ModuleSheet />
                </div>
              </>
            )}
          </div>

          {/* Coluna direita: BUSCA + AÇÕES no MESMO FLEX */}
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3.5 ml-2 sm:ml-3">
            {/* Busca elástica */}
            <div className="flex-1 relative">
              {isPlanejamentoContratacao ? (
                <div className="hidden sm:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder={searchPlaceholder}
                      className="h-10 rounded-full w-full min-w-[140px] sm:min-w-[200px] md:min-w-[280px] lg:min-w-[360px] xl:min-w-[420px] max-w-[720px] border-gray-200 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-indigo-500 pl-10"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="h-10 rounded-full w-full min-w-[140px] sm:min-w-[200px] md:min-w-[280px] lg:min-w-[360px] xl:min-w-[420px] max-w-[720px] border-gray-200 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-indigo-500 pl-10"
                  />
                </div>
              )}
            </div>

            {/* Mobile: botão de busca para Planejamento da Contratação (não exibe no Dashboard) */}
            {isPlanejamentoContratacao && location.pathname !== "/" && (
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 sm:hidden" aria-label="Buscar" onClick={() => navigate("/buscar")}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </Button>
            )}

            {/* Ações: Notificações + Minha conta (sem ml-auto) */}
            <div className="relative shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 relative"
                aria-label="Notificações"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-red-500 text-[10px] text-white grid place-items-center px-1">3</span>
              </Button>
              <NotificationDropdown isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
            </div>

            {/* Minha conta (dropdown com Saiba mais, Configurações, Suporte, Sair) */}
            <div className="shrink-0">
              <AccountMenu
                name={user?.nome || "Usuário"}
                email={user?.email || "usuario@exemplo.com"}
                onOpenSupport={openSupportDrawer}
              />
            </div>
          </div>
        </div>
      </header>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
} 