import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock, AlertTriangle, FileText, PenLine, CheckCircle, Info, Bell } from "lucide-react";

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

interface NotificationDetailModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationDetailModal({ 
  notification, 
  isOpen, 
  onClose, 
  onMarkAsRead 
}: NotificationDetailModalProps) {
  if (!notification) return null;

  // Obter cor baseada no tipo
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "process":
        return "text-blue-600 bg-blue-50";
      case "signature":
        return "text-purple-600 bg-purple-50";
      case "warning":
        return "text-orange-600 bg-orange-50";
      case "success":
        return "text-green-600 bg-green-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      case "system":
        return "text-gray-600 bg-gray-50";
      case "deadline":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Obter cor da prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Detalhes da Notificação
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cabeçalho da notificação */}
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-lg ${getNotificationColor(notification.type)}`}>
              {notification.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">
                  {notification.title}
                </h3>
                {!notification.isRead && (
                  <Badge variant="default" className="bg-blue-600 text-white text-xs">
                    • Nova
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{notification.timestamp}</span>
                <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                  {notification.priority === "high" ? "Alta" : 
                   notification.priority === "medium" ? "Média" : "Baixa"} prioridade
                </Badge>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">
              {notification.description}
            </p>
          </div>

          {/* Informações adicionais */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Tipo:</span>
              <span className="capitalize">
                {notification.type === "process" ? "Processo" :
                 notification.type === "signature" ? "Assinatura" :
                 notification.type === "warning" ? "Aviso" :
                 notification.type === "success" ? "Sucesso" :
                 notification.type === "info" ? "Informação" :
                 notification.type === "system" ? "Sistema" :
                 notification.type === "deadline" ? "Prazo" : notification.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span className={notification.isRead ? "text-green-600" : "text-blue-600"}>
                {notification.isRead ? "Lida" : "Não lida"}
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-4 border-t">
            {!notification.isRead && (
              <Button
                onClick={handleMarkAsRead}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como lida
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 