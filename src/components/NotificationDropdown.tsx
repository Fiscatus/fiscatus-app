import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle, AlertTriangle, FileText, PenLine, Clock, X, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Tipos
interface Notification {
  id: string;
  type: "process" | "signature" | "warning" | "info" | "success";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  link: string;
  icon: JSX.Element;
}

// Dados mockados de notificações
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "signature",
    title: "Assinatura solicitada",
    description: "DFD 010/2025 está aguardando sua assinatura",
    timestamp: "há 2 horas",
    isRead: false,
    link: "/processos/10",
    icon: <PenLine className="w-4 h-4" />
  },
  {
    id: "2",
    type: "process",
    title: "Processo atualizado",
    description: "ETP 011/2025 foi movido para 'Em andamento'",
    timestamp: "há 5 horas",
    isRead: false,
    link: "/processos/11",
    icon: <FileText className="w-4 h-4" />
  },
  {
    id: "3",
    type: "warning",
    title: "Prazo próximo",
    description: "TR 012/2025 vence em 2 dias",
    timestamp: "ontem",
    isRead: true,
    link: "/processos/12",
    icon: <AlertTriangle className="w-4 h-4" />
  },
  {
    id: "4",
    type: "success",
    title: "Processo concluído",
    description: "DFD 013/2025 foi finalizado com sucesso",
    timestamp: "2 dias atrás",
    isRead: true,
    link: "/processos/13",
    icon: <CheckCircle className="w-4 h-4" />
  },
  {
    id: "5",
    type: "info",
    title: "Nova atribuição",
    description: "Você foi designado para analisar ETP 014/2025",
    timestamp: "3 dias atrás",
    isRead: true,
    link: "/processos/14",
    icon: <Clock className="w-4 h-4" />
  }
];

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como lida
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );
    
    // Navegar para a página correspondente
    navigate(notification.link);
    onClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "signature":
        return <PenLine className="w-4 h-4 text-blue-500" />;
      case "process":
        return <FileText className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "info":
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "signature":
        return "border-blue-100 bg-blue-50";
      case "process":
        return "border-green-100 bg-green-50";
      case "warning":
        return "border-orange-100 bg-orange-50";
      case "success":
        return "border-green-100 bg-green-50";
      case "info":
        return "border-gray-100 bg-gray-50";
      default:
        return "border-gray-100 bg-white";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-[320px] rounded-lg shadow-xl bg-white border border-gray-200 z-50">
      <div ref={dropdownRef} className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            // Loading skeleton
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-3 animate-pulse">
                  <div className="w-4 h-4 bg-gray-200 rounded-full mt-1"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            // Empty state
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Você não possui novas notificações.</p>
            </div>
          ) : (
            // Notifications list
            <div className="p-0">
              {notifications.slice(0, 5).map((notification, index) => (
                <div key={notification.id}>
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    } ${index !== notifications.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {getNotificationIcon(notification.type)}
                          <p className={`text-sm ${
                            notification.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'
                          }`}>
                            {notification.title}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate("/notificacoes");
                onClose();
              }}
              className="w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Ver todas as notificações
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para o ícone de sino com contador
export function NotificationBell({ onClick }: { onClick: () => void }) {
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </Button>
    </div>
  );
} 