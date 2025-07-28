import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  X,
  Download,
  Eye
} from "lucide-react";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  documento: {
    id: string;
    numeroProcesso: string;
    nome: string;
    tipo: string;
    prazo: string;
    status: "pendente" | "assinado" | "atrasado";
    descricao?: string;
    assinaturas?: Array<{
      nome: string;
      cargo: string;
      data: string;
      status: "pendente" | "assinado";
    }>;
  } | null;
}

export default function SignatureModal({ isOpen, onClose, documento }: SignatureModalProps) {
  if (!documento) return null;

  const assinaturas = documento.assinaturas || [
    { nome: "João Silva", cargo: "Gerente de Suprimentos", data: "15/01/2025", status: "assinado" as const },
    { nome: "Maria Santos", cargo: "Diretora Financeira", data: "16/01/2025", status: "assinado" as const },
    { nome: "Gabriel Miranda", cargo: "Analista de Contratos", data: "", status: "pendente" as const },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Visualizar Documento
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

        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Preview do documento */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{documento.nome}</h3>
                  <p className="text-sm text-gray-600">{documento.numeroProcesso}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">Prazo: {documento.prazo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {documento.tipo}
                  </span>
                </div>
              </div>
            </div>

            {/* Preview do PDF (mock) */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg flex items-center justify-center min-h-0">
              <div className="text-center text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Preview do documento PDF</p>
                <p className="text-xs text-gray-400 mt-2">Aqui seria exibido o conteúdo do documento</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 flex-shrink-0">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Visualizar Completo
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Baixar PDF
              </Button>
            </div>
          </div>

          {/* Lista de assinaturas */}
          <div className="w-full lg:w-80 flex flex-col">
            <div className="bg-gray-50 rounded-lg p-4 flex-1 flex flex-col">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 flex-shrink-0">
                <User className="w-4 h-4" />
                Assinaturas
              </h4>
              
              <ScrollArea className="flex-1">
                <div className="space-y-3">
                  {assinaturas.map((assinatura, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{assinatura.nome}</p>
                          <p className="text-xs text-gray-600">{assinatura.cargo}</p>
                        </div>
                        {assinatura.status === "assinado" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                      
                      {assinatura.status === "assinado" ? (
                        <p className="text-xs text-gray-500">Assinado em {assinatura.data}</p>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                          Pendente
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Botão de assinar */}
            {documento.status === "pendente" || documento.status === "atrasado" ? (
              <div className="mt-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    // Aqui seria implementada a funcionalidade de assinatura
                    console.log("Assinando documento:", documento.id);
                    onClose();
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Assinar Documento
                </Button>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Documento já assinado</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 