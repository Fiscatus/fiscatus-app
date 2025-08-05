import React from "react";
import { CheckCircle, Clock, UserX, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SignatureCardProps {
  assinatura: {
    nome: string;
    cargo: string;
    data?: string;
    status: "assinado" | "pendente" | "recusado";
  };
}

export default function SignatureCard({ assinatura }: SignatureCardProps) {
  const statusConfig = {
    assinado: {
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
      badge: {
        className: "bg-green-100 text-green-700 border-green-200",
        text: "Assinado"
      },
      textColor: "text-green-600"
    },
    pendente: {
      icon: <Clock className="w-4 h-4 text-yellow-600" />,
      badge: {
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        text: "Pendente"
      },
      textColor: "text-yellow-600"
    },
    recusado: {
      icon: <UserX className="w-4 h-4 text-red-600" />,
      badge: {
        className: "bg-red-100 text-red-700 border-red-200",
        text: "Recusado"
      },
      textColor: "text-red-600"
    }
  };

  const config = statusConfig[assinatura.status];

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">
              {assinatura.nome}
            </h4>
            <p className="text-xs text-gray-600">
              {assinatura.cargo}
            </p>
          </div>
        </div>
        {config.icon}
      </div>
      
      <div className="flex items-center justify-between">
        {assinatura.status === "assinado" && assinatura.data ? (
          <p className="text-xs text-gray-500">
            Assinado em {assinatura.data}
          </p>
        ) : (
          <Badge variant="outline" className={`text-xs ${config.badge.className}`}>
            {config.badge.text}
          </Badge>
        )}
      </div>
    </div>
  );
} 