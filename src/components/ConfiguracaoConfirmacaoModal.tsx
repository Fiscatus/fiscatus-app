import React from "react";
import { AlertTriangle, Shield, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConfiguracaoConfirmacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  configuracao: {
    nome: string;
    valorAtual: string | boolean;
    novoValor: string | boolean;
    categoria: string;
  } | null;
  isLoading?: boolean;
}

export default function ConfiguracaoConfirmacaoModal({
  isOpen,
  onClose,
  onConfirm,
  configuracao,
  isLoading = false,
}: ConfiguracaoConfirmacaoModalProps) {
  if (!configuracao) return null;

  const isConfiguracaoCritica = () => {
    const configsCriticas = [
      "max_usuarios",
      "tempo_sessao",
      "tentativas_login",
      "timeout_conexao",
      "pool_conexoes",
      "backup_frequencia",
      "smtp_servidor",
      "tamanho_max_upload",
      "retencao_documentos"
    ];
    
    return configsCriticas.some(config => 
      configuracao.nome.toLowerCase().includes(config.replace("_", " "))
    );
  };

  const getCategoriaInfo = () => {
    const categorias = {
      usuarios: { nome: "Usuários e Permissões", cor: "text-blue-600" },
      seguranca: { nome: "Segurança", cor: "text-red-600" },
      banco: { nome: "Banco de Dados", cor: "text-green-600" },
      notificacoes: { nome: "Notificações", cor: "text-purple-600" },
      documentos: { nome: "Documentos", cor: "text-orange-600" },
      interface: { nome: "Interface", cor: "text-indigo-600" }
    };
    
    return categorias[configuracao.categoria as keyof typeof categorias] || 
           { nome: "Geral", cor: "text-gray-600" };
  };

  const categoriaInfo = getCategoriaInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Confirmar Alteração
              </DialogTitle>
              <DialogDescription>
                Você está prestes a alterar uma configuração do sistema
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da Configuração */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {configuracao.nome}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Categoria:</span>
              <span className={`text-xs font-medium ${categoriaInfo.cor}`}>
                {categoriaInfo.nome}
              </span>
            </div>

            {/* Valores */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-xs text-gray-500">Valor Atual:</span>
                <div className="text-sm font-medium text-gray-700">
                  {typeof configuracao.valorAtual === "boolean" 
                    ? (configuracao.valorAtual ? "Ativado" : "Desativado")
                    : configuracao.valorAtual
                  }
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Novo Valor:</span>
                <div className="text-sm font-medium text-blue-700">
                  {typeof configuracao.novoValor === "boolean" 
                    ? (configuracao.novoValor ? "Ativado" : "Desativado")
                    : configuracao.novoValor
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {isConfiguracaoCritica() && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Esta é uma configuração crítica que pode afetar o funcionamento do sistema. 
                Certifique-se de que a alteração é necessária.
              </AlertDescription>
            </Alert>
          )}

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Algumas configurações podem requerer reinicialização do sistema para ter efeito completo.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirmando...
              </>
            ) : (
              "Confirmar Alteração"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 