import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Bell, Settings, Home, FileText, Users, PenLine, Workflow, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import Sidebar from "./Sidebar";
import NotificationDropdown, { NotificationBell } from "./NotificationDropdown";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import { CleanNavBar } from "@/components/ui/clean-navbar";
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
      <header className="fixed top-0 left-0 w-full h-16 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm z-50 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        {/* Esquerda: menu, logo, nome do sistema */}
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu className="w-4 h-4 text-gray-600" />
          </button>
          <img src={logo} className="w-8 h-8 md:w-10 md:h-10" alt="Logo Fiscatus" />
          <span className="text-lg md:text-2xl font-bold text-gray-800">Fiscatus</span>
        </div>
        {/* Centro: navegação limpa e consistente */}
        <div className="flex justify-center items-center flex-1 min-w-0 px-2 md:px-4 h-full">
          {isPlanejamentoContratacao && (
            <CleanNavBar 
              items={[
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
                  icon: PenLine 
                },
                { 
                  name: 'Modelos de Fluxo', 
                  url: '/modelos-de-fluxo', 
                  icon: Workflow 
                }
              ]} 
              className="w-full"
            />
          )}
        </div>
        {/* Direita: busca, ícones, avatar */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 mt-2 md:mt-0 relative">
          <Input type="text" placeholder="Buscar processo..." className="w-32 md:w-40 lg:w-64 border-gray-200 focus:border-blue-300 focus:ring-blue-200" />
          <div className="relative">
            <NotificationBell 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              onDoubleClick={() => navigate("/notificacoes")}
            />
            <NotificationDropdown 
              isOpen={notificationsOpen} 
              onClose={() => setNotificationsOpen(false)} 
            />
          </div>
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors" 
            aria-label="Configurações"
            onClick={() => navigate("/configuracoes")}
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
          
          {/* Menu do Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Avatar className="w-8 h-8 border-0">
                  <AvatarImage src="/usuario.png" />
                  <AvatarFallback className="bg-gray-100 text-gray-700 font-medium text-sm">
                    {user ? getUserInitials(user.nome) : "GM"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              {/* Informações do usuário */}
              <div className="px-3 py-2">
                <div className="font-semibold text-gray-900 text-sm">
                  {user?.nome || "Usuário"}
                </div>
                <div className="text-gray-500 text-xs">
                  {user?.email || "usuario@exemplo.com"}
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* Opção de logout */}
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair do sistema</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
} 