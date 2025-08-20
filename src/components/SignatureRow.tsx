import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle } from "lucide-react";
import SignatureStatusBadge from "./SignatureStatusBadge";

interface SignatureRowProps {
  documento: {
    id: string;
    numeroProcesso: string;
    nome: string;
    tipo: string;
    prazo: string;
    status: "pendente" | "assinado" | "atrasado";
  };
  onVisualizar: (id: string) => void;
}

export default function SignatureRow({ documento, onVisualizar }: SignatureRowProps) {
  const isPendente = documento.status === "pendente";
  const isAtrasado = documento.status === "atrasado";

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isAtrasado ? 'bg-red-50' : ''}`}>
      <td className="px-6 py-3 text-sm font-medium text-gray-900">
        <div className="truncate" title={documento.numeroProcesso}>
          {documento.numeroProcesso}
        </div>
      </td>
      <td className="px-6 py-3 text-sm text-gray-700">
        <div className="break-words line-clamp-2" title={documento.nome}>
          {documento.nome}
        </div>
      </td>
      <td className="px-6 py-3 text-center">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
          {documento.tipo}
        </span>
      </td>
      <td className="px-6 py-3 text-center">
        <div className="truncate" title={documento.prazo}>
          {documento.prazo}
        </div>
      </td>
      <td className="px-6 py-3 text-center">
        <div className="flex justify-center items-center h-full">
          <SignatureStatusBadge status={documento.status} />
        </div>
      </td>
      <td className="flex justify-center items-center gap-2 min-w-[200px] px-4 py-2">
        {documento.status === 'assinado' ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-green-600 text-sm whitespace-nowrap">
              <CheckCircle className="w-4 h-4" />
              Assinado
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onVisualizar(documento.id)}
              className="h-8 w-8"
              aria-label="Visualizar documento"
            >
              <Eye className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVisualizar(documento.id)}
            className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 whitespace-nowrap"
          >
            <Eye className="w-4 h-4" />
            Visualizar e Assinar
          </Button>
        )}
      </td>
    </tr>
  );
} 