import React from "react";
import { FileText, CheckCircle } from "lucide-react";

interface EmptyStateProps {
  type: "pendentes" | "assinados" | "geral";
}

export default function EmptyState({ type }: EmptyStateProps) {
  const config = {
    pendentes: {
      icon: <FileText className="w-16 h-16 text-gray-300" />,
      title: "Nenhum documento pendente",
      description: "Você não possui documentos aguardando sua assinatura no momento.",
      action: "Todos os seus documentos foram assinados ou estão em análise."
    },
    assinados: {
      icon: <CheckCircle className="w-16 h-16 text-green-300" />,
      title: "Nenhum documento assinado",
      description: "Você ainda não assinou nenhum documento.",
      action: "Os documentos aparecerão aqui após serem assinados."
    },
    geral: {
      icon: <FileText className="w-16 h-16 text-gray-300" />,
      title: "Nenhum documento encontrado",
      description: "Não foram encontrados documentos com os filtros aplicados.",
      action: "Tente ajustar os filtros de busca para encontrar mais resultados."
    }
  };

  const currentConfig = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {currentConfig.icon}
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {currentConfig.title}
      </h3>
      <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
        {currentConfig.description}
      </p>
      <p className="mt-2 text-xs text-gray-500 text-center">
        {currentConfig.action}
      </p>
    </div>
  );
} 