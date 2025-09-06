import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  Building2,
  FolderOpen,
  ClipboardList,
  Gavel,
  BarChart3,
  Settings,
  Users,
  ArrowRight,
  Activity,
  CheckCircle,
  ChevronRight,
  Menu,
  Bell,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import Sidebar from "@/components/Sidebar";
import NotificationDropdown, { NotificationBell } from "@/components/NotificationDropdown";
import logo from "@/assets/logo_fiscatus.png";

// Componente Topbar simplificado para o Dashboard
function DashboardTopbar() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { toast } = useToast();

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
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    setUser(null);
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema com sucesso.",
      variant: "default"
    });
    
    navigate("/login");
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
        
        {/* Centro: espaço vazio para manter layout */}
        <div className="flex justify-center items-center flex-1 min-w-0 px-2 md:px-4 h-full">
          {/* Navegação removida - apenas espaço para manter layout */}
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
      
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();

  console.log('Dashboard: Rendering with user:', user?.email);

  // Dados globais do sistema com foco institucional
  const dadosGlobais = [
    {
      label: "Total de Processos Criados",
      value: "2.847",
      descricao: "Processos no sistema",
      icon: <FileText className="w-10 h-10" />,
      color: "bg-blue-50 border-blue-200 text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      crescimento: "+12% este mês"
    },
    {
      label: "Processos Ativos",
      value: "1.234",
      descricao: "Em andamento",
      icon: <Activity className="w-10 h-10" />,
      color: "bg-green-50 border-green-200 text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      link: "Ver todos os processos ativos"
    },
    {
      label: "Processos Concluídos",
      value: "1.456",
      descricao: "Finalizados",
      icon: <CheckCircle className="w-10 h-10" />,
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      iconColor: "text-emerald-600"
    },
    {
      label: "Pendências e Ações Necessárias",
      value: "89",
      descricao: "Demandas em aberto",
      icon: <Bell className="w-10 h-10" />,
      color: "bg-orange-50 border-orange-200 text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-600",
      link: "Ir para minhas pendências"
    }
  ];

  // Módulos do sistema com design limpo e moderno
  const modulos = [
    {
      nome: "Planejamento da Contratação",
      descricao: "Organize todas as fases da contratação: da demanda inicial à publicação do edital.",
      icon: <FolderOpen className="w-6 h-6" />,
      path: "/planejamento-da-contratacao"
    },
    {
      nome: "Gestão Contratual",
      descricao: "Gerencie contratos e documentos de forma centralizada.",
      icon: <Users className="w-6 h-6" />,
      path: "/gestao-contratual"
    },
    {
      nome: "Execução Contratual",
      descricao: "Monitore a execução do contrato com controle de entregas, fiscalizações e aditivos.",
      icon: <ClipboardList className="w-6 h-6" />,
      path: "/execucao-contratual"
    },
    {
      nome: "Processo Licitatório",
      descricao: "Acompanhe o processo licitatório desde a abertura até a homologação.",
      icon: <Gavel className="w-6 h-6" />,
      path: "/processo-licitatorio"
    },
    {
      nome: "Relatórios",
      descricao: "Visualize dados estratégicos em relatórios automáticos e dashboards personalizáveis.",
      icon: <BarChart3 className="w-6 h-6" />,
      path: "/relatorios"
    },
    {
      nome: "Configurações do Fluxo",
      descricao: "Personalize o fluxo de trabalho e os modelos padrão conforme a instituição.",
      icon: <Settings className="w-6 h-6" />,
      path: "/configuracoes-fluxo"
    }
  ];

  const handleModuloClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardTopbar />
      
      <main className="pt-20 px-6 py-8 flex-1">

        {/* Cards de Indicadores (Top Cards) - Grid 2x2 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Visão Geral da Administração Pública
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dadosGlobais.map((dado, index) => (
              <Card 
                key={index} 
                className={`bg-white border-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${dado.borderColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${dado.bgColor}`}>
                        <div className={dado.iconColor}>
                          {dado.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                          {dado.value}
                        </p>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {dado.label}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          {dado.descricao}
                        </p>
                        
                        {/* Crescimento (opcional) */}
                        {dado.crescimento && (
                          <p className="text-xs text-green-600 font-medium">
                            {dado.crescimento}
                          </p>
                        )}
                        
                        {/* Link (opcional) */}
                        {dado.link && (
                          <button 
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                            onClick={() => navigate(dado.link === "Ver todos os processos ativos" ? "/processos-ativos" : "/minhas-pendencias")}
                          >
                            {dado.link}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Módulos do Sistema */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Módulos do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulos.map((modulo, index) => (
              <Card 
                key={index} 
                className="bg-white border border-gray-200 rounded-2xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-gray-300"
                onClick={() => handleModuloClick(modulo.path)}
              >
                <CardContent className="p-6 relative flex flex-col h-full">
                  {/* Ícone no topo */}
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 mb-4">
                    <div className="text-gray-600">
                      {modulo.icon}
                    </div>
                  </div>
                  
                  {/* Conteúdo do card */}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {modulo.nome}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {modulo.descricao}
                    </p>
                  </div>
                  
                  {/* Ícone de ação no canto inferior direito */}
                  <div className="flex justify-end mt-auto">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Downbar Institucional */}
      <div className="bg-white border-t border-gray-200 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo Fiscatus" className="w-8 h-8" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Fiscatus
                </h1>
                <p className="text-xs text-gray-600 italic">
                  Gestão inteligente e integrada para contratações públicas.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                v1.0.0 – 2025
              </p>
              <p className="text-xs text-gray-500">
                Desenvolvido para transformar a gestão pública.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 