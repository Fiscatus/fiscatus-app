import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  FileText, 
  PenLine, 
  CheckCircle, 
  Info, 
  Search, 
  Check, 
  Filter,
  ChevronDown,
  Inbox,
  X,
  MoreHorizontal,
  Archive,
  Trash2,
  Settings,
  RefreshCw,
  Eye,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Topbar from "@/components/Topbar";
import NotificationDetailModal from "@/components/NotificationDetailModal";
import { useToast } from "@/components/ui/use-toast";

// Tipos
interface Notification {
  id: string;
  type: "process" | "signature" | "warning" | "info" | "success" | "system" | "deadline";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  icon: JSX.Element;
  priority: "low" | "medium" | "high";
}

// Dados mockados de notificações
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "signature",
    title: "Assinatura solicitada",
    description: "DFD 010/2025 está aguardando sua assinatura há mais de 24 horas",
    timestamp: "há 2 horas",
    isRead: false,
    link: "/processos/10",
    icon: <PenLine className="w-4 h-4" />,
    priority: "high"
  },
  {
    id: "2",
    type: "process",
    title: "Processo atualizado",
    description: "ETP 011/2025 foi movido para 'Em andamento' pelo usuário João Silva",
    timestamp: "há 5 horas",
    isRead: false,
    link: "/processos/11",
    icon: <FileText className="w-4 h-4" />,
    priority: "medium"
  },
  {
    id: "3",
    type: "deadline",
    title: "Prazo próximo",
    description: "TR 012/2025 vence em 2 dias. Ação necessária para evitar atraso",
    timestamp: "ontem",
    isRead: true,
    link: "/processos/12",
    icon: <Clock className="w-4 h-4" />,
    priority: "high"
  },
  {
    id: "4",
    type: "success",
    title: "Processo concluído",
    description: "DFD 013/2025 foi finalizado com sucesso e arquivado no sistema",
    timestamp: "2 dias atrás",
    isRead: true,
    link: "/processos/13",
    icon: <CheckCircle className="w-4 h-4" />,
    priority: "low"
  },
  {
    id: "5",
    type: "info",
    title: "Nova atribuição",
    description: "Você foi designado para analisar ETP 014/2025 pelo gestor Maria Santos",
    timestamp: "3 dias atrás",
    isRead: true,
    link: "/processos/14",
    icon: <Info className="w-4 h-4" />,
    priority: "medium"
  },
  {
    id: "6",
    type: "system",
    title: "Manutenção programada",
    description: "O sistema estará indisponível das 02:00 às 04:00 para manutenção. Durante este período, algumas funcionalidades podem estar temporariamente indisponíveis. Pedimos desculpas pelo inconveniente.",
    timestamp: "há 1 dia",
    isRead: false,
    icon: <AlertTriangle className="w-4 h-4" />,
    priority: "medium"
  },
  {
    id: "7",
    type: "warning",
    title: "Documento expirado",
    description: "O documento 'Anexo A - Especificações' do processo ETP 015/2025 expirou",
    timestamp: "há 3 dias",
    isRead: true,
    link: "/processos/15",
    icon: <AlertTriangle className="w-4 h-4" />,
    priority: "high"
  },
  {
    id: "8",
    type: "process",
    title: "Comentário adicionado",
    description: "Novo comentário em ETP 016/2025: 'Necessário ajuste na especificação técnica'",
    timestamp: "há 4 dias",
    isRead: true,
    link: "/processos/16",
    icon: <FileText className="w-4 h-4" />,
    priority: "low"
  },
  {
    id: "9",
    type: "info",
    title: "Atualização do sistema",
    description: "Nova versão do sistema Fiscatus foi lançada com melhorias na interface e correções de bugs. As principais novidades incluem: melhor performance, interface mais intuitiva, e novas funcionalidades de relatórios.",
    timestamp: "há 5 dias",
    isRead: true,
    icon: <Info className="w-4 h-4" />,
    priority: "medium"
  }
];

// Configuração dos filtros
const filterOptions = [
  { key: "todas", label: "Todas", icon: "✅", color: "bg-gray-100 hover:bg-gray-200 text-gray-700" },
  { key: "nao-lidas", label: "Não lidas", icon: "📥", color: "bg-blue-100 hover:bg-blue-200 text-blue-700" },
  { key: "lidas", label: "Lidas", icon: "📤", color: "bg-green-100 hover:bg-green-200 text-green-700" },
  { key: "processo", label: "Processo", icon: "🔄", color: "bg-blue-100 hover:bg-blue-200 text-blue-700" },
  { key: "assinatura", label: "Assinatura", icon: "✍️", color: "bg-purple-100 hover:bg-purple-200 text-purple-700" },
  { key: "sistema", label: "Sistema", icon: "⚙️", color: "bg-gray-100 hover:bg-gray-200 text-gray-700" },
  { key: "prazo", label: "Prazo", icon: "⏰", color: "bg-red-100 hover:bg-red-200 text-red-700" },
  { key: "aviso", label: "Aviso", icon: "⚠️", color: "bg-orange-100 hover:bg-orange-200 text-orange-700" },
  { key: "sucesso", label: "Sucesso", icon: "✅", color: "bg-green-100 hover:bg-green-200 text-green-700" },
  { key: "info", label: "Info", icon: "ℹ️", color: "bg-blue-100 hover:bg-blue-200 text-blue-700" }
];

export default function Notificacoes() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilters, setActiveFilters] = useState<string[]>(["todas"]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filtrar notificações baseado nos filtros ativos e busca
  useEffect(() => {
    let filtered = notifications;

    // Aplicar filtros múltiplos
    if (!activeFilters.includes("todas")) {
      filtered = filtered.filter(notification => {
        return activeFilters.some(filter => {
          switch (filter) {
            case "nao-lidas":
              return !notification.isRead;
            case "lidas":
              return notification.isRead;
            case "processo":
              return notification.type === "process";
            case "assinatura":
              return notification.type === "signature";
            case "sistema":
              return notification.type === "system";
            case "prazo":
              return notification.type === "deadline";
            case "aviso":
              return notification.type === "warning";
            case "sucesso":
              return notification.type === "success";
            case "info":
              return notification.type === "info";
            default:
              return false;
          }
        });
      });
    }

    // Aplicar busca por texto
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(term) ||
        notification.description.toLowerCase().includes(term)
      );
    }

    // Ordenar: não lidas primeiro, depois por data (mais recente primeiro)
    filtered.sort((a, b) => {
      if (!a.isRead && b.isRead) return -1;
      if (a.isRead && !b.isRead) return 1;
      return 0; // Mantém ordem original para mesma categoria
    });

    setFilteredNotifications(filtered);
  }, [notifications, activeFilters, searchTerm]);

  // Toggle filtro
  const toggleFilter = (filterKey: string) => {
    setActiveFilters(prev => {
      if (filterKey === "todas") {
        return ["todas"];
      }
      
      const newFilters = prev.filter(f => f !== "todas");
      
      if (prev.includes(filterKey)) {
        const filtered = newFilters.filter(f => f !== filterKey);
        return filtered.length === 0 ? ["todas"] : filtered;
      } else {
        return [...newFilters, filterKey];
      }
    });
  };

  // Limpar todos os filtros
  const clearAllFilters = () => {
    setActiveFilters(["todas"]);
    setSearchTerm("");
  };

  // Marcar notificação como lida
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );

    toast({
      title: "Notificação marcada como lida",
      description: "A notificação foi atualizada com sucesso.",
      variant: "default"
    });
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );

    toast({
      title: "Todas as notificações marcadas como lidas",
      description: "Todas as notificações foram atualizadas com sucesso.",
      variant: "default"
    });
  };

  // Clicar na notificação
  const handleNotificationClick = (notification: Notification) => {
    // Marcar como lida se não estiver lida
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navegar para o link se existir
    if (notification.link) {
      navigate(notification.link);
    } else {
      // Mostrar modal com detalhes
      setSelectedNotification(notification);
      setIsModalOpen(true);
    }
  };

  // Obter ícone baseado no tipo
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "process":
        return <FileText className="w-4 h-4" />;
      case "signature":
        return <PenLine className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "info":
        return <Info className="w-4 h-4" />;
      case "system":
        return <Bell className="w-4 h-4" />;
      case "deadline":
        return <Clock className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Obter cor baseada no tipo
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "process":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "signature":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "warning":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "system":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "deadline":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Formatar data relativa
  const formatRelativeTime = (timestamp: string) => {
    return timestamp;
  };

  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Topbar />
      
      {/* Conteúdo principal - Fullscreen */}
      <div className="pt-16 h-screen flex flex-col">


        {/* Filtros com chips */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Filtros</h3>
              {(activeFilters.length > 1 || (activeFilters.length === 1 && !activeFilters.includes("todas"))) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  <X className="w-3 h-3 mr-1" />
                  Limpar filtros
                </Button>
              )}
            </div>
            
            {/* Chips de filtro */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => toggleFilter(filter.key)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    activeFilters.includes(filter.key)
                      ? `${filter.color} border-current shadow-sm`
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{filter.icon}</span>
                  <span>{filter.label}</span>
                  {filter.key === "nao-lidas" && unreadCount > 0 && (
                    <Badge variant="default" className="ml-1 bg-blue-600 text-white text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de notificações - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-6">
            <div className="max-w-7xl mx-auto">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id}
                      className={`transition-all duration-200 hover:shadow-lg cursor-pointer border-2 ${
                        !notification.isRead 
                          ? 'bg-blue-50 border-blue-200 shadow-md' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Ícone com destaque para não lidas */}
                          <div className={`p-3 rounded-xl border relative ${getNotificationColor(notification.type)}`}>
                            {notification.icon}
                            {!notification.isRead && (
                              <div className="absolute -top-1 -right-1">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                                    {notification.title}
                                  </h3>
                                  {!notification.isRead && (
                                    <Badge variant="default" className="bg-blue-600 text-white text-xs px-2 py-1">
                                      Nova
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                  {notification.description}
                                </p>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatRelativeTime(notification.timestamp)}
                                  </span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      notification.priority === "high" ? "border-red-200 text-red-700 bg-red-50" :
                                      notification.priority === "medium" ? "border-yellow-200 text-yellow-700 bg-yellow-50" :
                                      "border-green-200 text-green-700 bg-green-50"
                                    }`}
                                  >
                                    {notification.priority === "high" ? "Alta" : 
                                     notification.priority === "medium" ? "Média" : "Baixa"} prioridade
                                  </Badge>
                                </div>
                              </div>

                              {/* Menu de ações */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.isRead && (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}>
                                      <Check className="w-4 h-4 mr-2" />
                                      Marcar como lida
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNotification(notification);
                                    setIsModalOpen(true);
                                  }}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver detalhes
                                  </DropdownMenuItem>
                                  {notification.link && (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(notification.link!);
                                    }}>
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Ir para processo
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                /* Estado vazio */
                <div className="flex items-center justify-center h-full">
                  <Card className="text-center py-16 px-8 max-w-md">
                    <CardContent>
                      <div className="flex flex-col items-center gap-6">
                        <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full">
                          <Inbox className="w-12 h-12 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            Nenhuma notificação encontrada
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {searchTerm || activeFilters.some(f => f !== "todas")
                              ? "Tente ajustar os filtros ou termos de busca para encontrar notificações"
                              : "Você não possui notificações no momento. Novas notificações aparecerão aqui quando disponíveis."
                            }
                          </p>
                          {(searchTerm || activeFilters.some(f => f !== "todas")) && (
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={clearAllFilters}
                            >
                              Limpar filtros
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalhes da notificação */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
        onMarkAsRead={markAsRead}
      />
    </div>
  );
} 