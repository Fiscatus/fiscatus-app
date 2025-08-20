import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface SignatureStatusBadgeProps {
  status: "pendente" | "assinado" | "atrasado";
  className?: string;
}

export default function SignatureStatusBadge({ status, className = "" }: SignatureStatusBadgeProps) {
  const statusConfig = {
    pendente: {
      label: "Pendente",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: <Clock className="w-3 h-3" />
    },
    assinado: {
      label: "Assinado",
      className: "bg-green-100 text-green-700 border-green-200",
      icon: <CheckCircle className="w-3 h-3" />
    },
    atrasado: {
      label: "Atrasado",
      className: "bg-red-100 text-red-700 border-red-200",
      icon: <AlertTriangle className="w-3 h-3" />
    }
  };

  const config = statusConfig[status];

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 px-3 py-2 text-xs font-medium ${config.className} ${className}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
} 