import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Bell, HelpCircle, Settings, LogOut, Headphones } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import Sidebar from "./Sidebar";
import NotificationDropdown from "./NotificationDropdown";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import { ModuleMenubar } from "@/components/topbar/ModuleMenubar";
import { ModuleSheet } from "@/components/topbar/ModuleSheet";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo_fiscatus.png";



export default function Topbar() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const location = useLocation();

  // Função para obter as iniciais do usuário
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função de logout
  const handleLogout = () => {
    // Limpar token JWT (simulado)
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    // Limpar dados do usuário
    setUser(null);
    
    // Mostrar toast de sucesso
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema com sucesso.",
      variant: "default"
    });
    
    // Redirecionar para login
    navigate("/login");
  };

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
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
        <div className="h-14 md:h-16 flex items-center">
          <div className="w-full max-w-[1280px] 2xl:max-w-[1360px] mx-auto px-3 sm:px-4 md:px-5 grid grid-cols-[auto,auto,1fr,auto] items-center gap-2 sm:gap-3">
            {/* Coluna 1: menu */}
            <button
              className="h-9 w-9 grid place-items-center rounded-lg hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-500"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>

            {/* Coluna 2: logo */}
            <div className="flex items-center gap-2">
              <img src={logo} className="w-8 h-8 md:w-10 md:h-10" alt="Logo Fiscatus" />
              <span className="text-base md:text-lg font-bold text-gray-800 truncate">Fiscatus</span>
            </div>

            {/* Coluna 3: menubar + busca (desktop), sheet + botão busca (mobile) */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
              {isPlanejamentoContratacao ? (
                <>
                  <ModuleMenubar />
                  <div className="hidden sm:flex flex-1">
                    <Input
                      type="text"
                      placeholder="Buscar processos, documentos, usuários..."
                      className="h-9 rounded-xl min-w-[200px] md:min-w-[280px] lg:min-w-[360px] max-w-[520px] 2xl:max-w-[640px] w-full border-gray-200 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-indigo-500"
                    />
                  </div>
                  {/* Mobile: módulos e busca */}
                  <div className="sm:hidden flex items-center gap-2">
                    <ModuleSheet />
                    <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Buscar" onClick={() => navigate("/buscar")}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex flex-1">
                  <Input
                    type="text"
                    placeholder="Buscar processos, documentos, usuários..."
                    className="h-9 rounded-xl min-w-[200px] md:min-w-[280px] lg:min-w-[360px] max-w-[520px] 2xl:max-w-[640px] w-full border-gray-200 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Coluna 4: ações */}
            <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Ajuda" onClick={() => navigate("/ajuda")}>
                <HelpCircle className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Notificações" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-red-500 text-[10px] text-white grid place-items-center px-1">3</span>
                </Button>
                <NotificationDropdown isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Configurações" onClick={() => navigate("/configuracoes")}>
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Suporte" onClick={() => navigate("/suporte")}>
                <Headphones className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center h-9 rounded-full border border-gray-200 bg-white px-2 gap-2 focus:outline-none focus-visible:outline-2 focus-visible:outline-indigo-500 hidden md:flex">
                    <Avatar className="w-6 h-6 border-0">
                      <AvatarImage src="/usuario.png" />
                      <AvatarFallback className="bg-gray-100 text-gray-700 font-medium text-xs">
                        {user ? getUserInitials(user.nome) : "GM"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">Minha conta</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <div className="px-3 py-2">
                    <div className="font-semibold text-gray-900 text-sm">{user?.nome || "Usuário"}</div>
                    <div className="text-gray-500 text-xs">{user?.email || "usuario@exemplo.com"}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair do sistema</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
} 