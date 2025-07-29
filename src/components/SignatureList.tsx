import React from "react";
import { User, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SignatureCard from "./SignatureCard";

interface SignatureListProps {
  assinaturas: Array<{
    nome: string;
    cargo: string;
    data?: string;
    status: "assinado" | "pendente" | "recusado";
  }>;
}

export default function SignatureList({ assinaturas }: SignatureListProps) {
  const assinadas = assinaturas.filter(a => a.status === "assinado").length;
  const total = assinaturas.length;

  return (
    <div className="bg-gray-50 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-4 h-4 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Assinaturas</h3>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>{assinadas}/{total} assinaram</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {assinaturas.map((assinatura, index) => (
            <SignatureCard key={index} assinatura={assinatura} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 