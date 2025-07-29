import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DocumentHeader from "./DocumentHeader";
import DocumentMetadataCard from "./DocumentMetadataCard";
import PdfPreview from "./PdfPreview";
import SignatureList from "./SignatureList";
import ActionFooter from "./ActionFooter";

interface SignatureModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  documento: {
    id: string;
    numeroProcesso: string;
    nome: string;
    tipo: string;
    prazo: string;
    status: "pendente" | "assinado" | "atrasado";
  } | null;
}

export default function SignatureModalV2({ isOpen, onClose, documento }: SignatureModalV2Props) {
  const actionFooterRef = useRef<HTMLDivElement>(null);

  // Efeito para scroll automático para a área de assinatura quando o modal abrir
  useEffect(() => {
    if (isOpen && documento && documento.status === "pendente" && actionFooterRef.current) {
      // Aguarda um pouco para o modal estar completamente renderizado
      setTimeout(() => {
        actionFooterRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);
    }
  }, [isOpen, documento?.status]);

  if (!documento) return null;

  // Dados mockados das assinaturas - baseados no status do documento
  const assinaturas = [
    { 
      nome: "João Silva", 
      cargo: "Gerente de Suprimentos", 
      data: "15/01/2025", 
      status: "assinado" as const 
    },
    { 
      nome: "Maria Santos", 
      cargo: "Diretora Financeira", 
      data: "16/01/2025", 
      status: "assinado" as const 
    },
    { 
      nome: "Gabriel Miranda", 
      cargo: "Analista de Contratos", 
      data: documento.status === "assinado" ? "17/01/2025" : "", 
      status: documento.status === "assinado" ? "assinado" as const : "pendente" as const 
    },
  ];

  const handleAssinar = () => {
    console.log("Assinando documento:", documento.id);
    // Aqui seria implementada a funcionalidade de assinatura
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-screen h-screen p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Cabeçalho */}
          <DocumentHeader onClose={onClose} />
          
          {/* Conteúdo principal */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
            {/* Coluna esquerda - Documento e Preview */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              {/* Metadados do documento */}
              <DocumentMetadataCard documento={documento} />
              
              {/* Preview do PDF */}
              <PdfPreview documento={documento} />
            </div>
            
            {/* Coluna direita - Assinaturas */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
              {/* Lista de assinaturas */}
              <div className="flex-1 min-h-0">
                <SignatureList assinaturas={assinaturas} />
              </div>
              
              {/* Footer com ação de assinatura */}
              <div ref={actionFooterRef}>
                <ActionFooter 
                  status={documento.status} 
                  onAssinar={handleAssinar} 
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 