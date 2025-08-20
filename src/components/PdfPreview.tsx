import React from "react";
import { Eye, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfPreviewProps {
  documento: {
    nome: string;
    numeroProcesso: string;
  };
}

export default function PdfPreview({ documento }: PdfPreviewProps) {
  return (
    <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Preview do PDF */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center min-h-[400px]">
        <div className="text-center text-gray-500 p-8">
          <FileText className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Preview do Documento PDF</h3>
          <p className="text-sm text-gray-400 max-w-md">
            Aqui seria exibido o conteúdo do documento "{documento.nome}"
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {documento.numeroProcesso}
          </p>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="p-4 border-t border-gray-200 bg-white flex gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Visualizar Completo
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Baixar PDF
        </Button>
      </div>
    </div>
  );
} 