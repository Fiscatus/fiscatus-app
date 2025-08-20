import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/components/ui/use-toast";

interface ConcluirEtapaButtonProps {
  etapa: {
    id: string;
    numeroEtapa: number;
    nomeEtapa: string;
    gerenciaResponsavel: string;
    slug: string;
  };
  processoId: string;
  preCondicaoAtendida: boolean;
  tooltipPreCondicao: string;
  onConcluir: (dados: {
    observacao?: string;
    notificar: boolean;
  }) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  concluida?: boolean;
}

export function ConcluirEtapaButton({
  etapa,
  processoId,
  preCondicaoAtendida,
  tooltipPreCondicao,
  onConcluir,
  disabled = false,
  loading = false,
  concluida = false
}: ConcluirEtapaButtonProps) {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [notificar, setNotificar] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Verificar permissões
  const temPermissao = () => {
    if (!user) return false;
    
    // Gerência responsável da etapa
    const ehGerenciaResponsavel = user.gerencia.includes(etapa.gerenciaResponsavel);
    
    // Gerência de Soluções e Projetos (GSP)
    const ehGSP = user.gerencia.includes("GSP") || user.gerencia.includes("Gerência de Soluções e Projetos");
    
    return ehGerenciaResponsavel || ehGSP;
  };

  // Verificar se o botão deve estar visível (sempre visível se tem permissão)
  const deveExibir = temPermissao();

  // Verificar se o botão deve estar habilitado
  const deveHabilitar = !concluida && preCondicaoAtendida && !disabled && !loading;

  const handleConcluir = async () => {
    setIsProcessing(true);
    try {
      await onConcluir({
        observacao: observacao.trim() || undefined,
        notificar
      });
      
      setShowModal(false);
      setObservacao("");
      setNotificar(true);
      
      toast({
        title: "Etapa concluída",
        description: "Etapa concluída. Próxima etapa liberada.",
      });
    } catch (error) {
      toast({
        title: "Erro ao concluir etapa",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!deveExibir) {
    return null;
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                onClick={() => setShowModal(true)}
                disabled={!deveHabilitar}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Concluir
              </Button>
            </div>
          </TooltipTrigger>
          {!deveHabilitar && (
            <TooltipContent>
              <p>{tooltipPreCondicao}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Modal de Confirmação */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Concluir etapa</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Resumo da etapa */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Etapa {etapa.numeroEtapa}:</strong> {etapa.nomeEtapa}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Gerência responsável: {etapa.gerenciaResponsavel}
              </p>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacao">Observações de conclusão (opcional)</Label>
              <Textarea
                id="observacao"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Adicione observações sobre a conclusão desta etapa..."
                rows={3}
              />
            </div>

            {/* Checkbox notificar */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notificar"
                checked={notificar}
                onCheckedChange={(checked) => setNotificar(!!checked)}
              />
              <Label htmlFor="notificar" className="text-sm">
                Notificar partes interessadas
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConcluir}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Concluindo...
                </>
              ) : (
                "Concluir etapa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
