import React from "react";
import { CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionFooterProps {
  status: "pendente" | "assinado" | "atrasado";
  onAssinar: () => void;
}

export default function ActionFooter({ status, onAssinar }: ActionFooterProps) {
  const isPendente = status === "pendente" || status === "atrasado";

  if (!isPendente) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Documento já assinado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-700">
          <Lock className="w-4 h-4" />
          <span className="text-sm">Pronto para assinar</span>
        </div>
        
        <Button 
          onClick={onAssinar}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Assinar Documento
        </Button>
      </div>
    </div>
  );
} 