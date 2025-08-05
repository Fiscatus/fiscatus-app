import React from "react";
import { Calendar, FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentMetadataCardProps {
  documento: {
    nome: string;
    numeroProcesso: string;
    prazo: string;
    tipo: string;
    status: "pendente" | "assinado" | "atrasado";
  };
}

export default function DocumentMetadataCard({ documento }: DocumentMetadataCardProps) {
  const statusConfig = {
    pendente: {
      icon: <Clock className="w-4 h-4 text-yellow-600" />,
      label: "Pendente",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200"
    },
    assinado: {
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
      label: "Assinado",
      className: "bg-green-100 text-green-700 border-green-200"
    },
    atrasado: {
      icon: <AlertCircle className="w-4 h-4 text-red-600" />,
      label: "Atrasado",
      className: "bg-red-100 text-red-700 border-red-200"
    }
  };

  const config = statusConfig[documento.status];

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações principais */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {documento.nome}
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                {documento.numeroProcesso}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Prazo para assinar: {documento.prazo}
              </span>
            </div>
          </div>

          {/* Status e tipo */}
          <div className="flex flex-col gap-3 justify-start">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tipo:</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                {documento.tipo}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant="outline" className={config.className}>
                {config.icon}
                {config.label}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 