import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye, FileText, CheckCircle2 } from "lucide-react";
import { ConcluirEtapaButton } from "./ConcluirEtapaButton";
import { usePreCondicoesEtapa } from "@/hooks/usePreCondicoesEtapa";
import { EtapaService } from "@/services/etapaService";
import { useUser } from "@/contexts/UserContext";

interface EtapaCardProps {
  etapa: {
    id: string;
    numeroEtapa: number;
    nomeEtapa: string;
    descricao: string;
    gerenciaResponsavel: string;
    prazoPadrao: number;
    status: string;
    slug: string;
    // Dados específicos para pré-condições
    versaoEnviada?: boolean;
    decisaoRegistrada?: boolean;
    assinaturasConcluidas?: number;
    totalAssinaturas?: number;
    despachoGerado?: boolean;
    despachoAssinado?: boolean;
    documentoAnexado?: boolean;
    statusDocumento?: string;
  };
  processoId: string;
  concluida?: boolean;
  onStatusChange?: (etapaId: string, novoStatus: string) => void;
}

export function EtapaCardComConcluir({ 
  etapa, 
  processoId, 
  concluida = false,
  onStatusChange 
}: EtapaCardProps) {
  const { user } = useUser();
  
  // Usar hook para verificar pré-condições
  const preCondicao = usePreCondicoesEtapa({
    numeroEtapa: etapa.numeroEtapa,
    nomeEtapa: etapa.nomeEtapa,
    status: etapa.status,
    versaoEnviada: etapa.versaoEnviada,
    decisaoRegistrada: etapa.decisaoRegistrada,
    assinaturasConcluidas: etapa.assinaturasConcluidas,
    totalAssinaturas: etapa.totalAssinaturas,
    despachoGerado: etapa.despachoGerado,
    despachoAssinado: etapa.despachoAssinado,
    documentoAnexado: etapa.documentoAnexado,
    statusDocumento: etapa.statusDocumento
  });

  const handleConcluir = async (dados: { observacao?: string; notificar: boolean }) => {
    if (!user) throw new Error("Usuário não autenticado");

    try {
      // Usar mock para desenvolvimento
      const resultado = await EtapaService.mockConcluirEtapa(
        processoId,
        etapa.slug,
        {
          usuarioId: user.id,
          observacao: dados.observacao,
          dataConclusao: new Date().toISOString(),
          notificar: dados.notificar
        }
      );

      // Atualizar status da etapa
      if (onStatusChange) {
        onStatusChange(etapa.id, "concluida");
      }

      return resultado;
    } catch (error) {
      console.error("Erro ao concluir etapa:", error);
      throw error;
    }
  };

  // Determinar cor do card baseada no status
  const getCardColor = () => {
    if (concluida) return "border-green-200 bg-green-50";
    if (etapa.status === "em_andamento") return "border-blue-200 bg-blue-50";
    return "border-gray-200 bg-white";
  };

  // Determinar cor do badge de status
  const getStatusBadgeColor = () => {
    if (concluida) return "bg-green-100 text-green-800 border-green-300";
    if (etapa.status === "em_andamento") return "bg-blue-100 text-blue-800 border-blue-300";
    return "bg-gray-100 text-gray-600 border-gray-300";
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${getCardColor()}`}>
      {/* Header do Card */}
      <CardHeader className="bg-indigo-50 px-4 py-3 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              concluida ? 'bg-green-500' : 
              etapa.status === "em_andamento" ? 'bg-blue-500' : 
              'bg-gray-500'
            }`}>
              {etapa.numeroEtapa}
            </div>
            <div>
              <CardTitle className="text-slate-900 font-semibold text-base">
                {etapa.nomeEtapa}
              </CardTitle>
              <p className="text-sm text-slate-600">
                {etapa.gerenciaResponsavel}
              </p>
            </div>
          </div>
          
          <Badge variant="outline" className={`text-xs ${getStatusBadgeColor()}`}>
            {concluida ? 'Concluído ✓' : 
             etapa.status === "em_andamento" ? 'Em Andamento' : 
             'Pendente'}
          </Badge>
        </div>
      </CardHeader>

      {/* Conteúdo do Card */}
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Descrição */}
          <p className="text-sm text-gray-600">
            {etapa.descricao}
          </p>

          {/* Informações da etapa */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{etapa.prazoPadrao} dias úteis</span>
            </div>
            
            {/* Mostrar progresso de assinaturas se aplicável */}
            {etapa.totalAssinaturas && etapa.totalAssinaturas > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{etapa.assinaturasConcluidas || 0}/{etapa.totalAssinaturas}</span>
              </div>
            )}
          </div>

          {/* Seção de Ações - Rodapé não fixo */}
          <section id="acoes" className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs">
                <Eye className="w-4 h-4 mr-1" />
                Ver Detalhes
              </Button>
              
              {etapa.uploadObrigatorio && (
                <Button variant="ghost" size="sm" className="text-xs">
                  <FileText className="w-4 h-4 mr-1" />
                  Documentos
                </Button>
              )}
            </div>

            {/* Botão Concluir - lado a lado com outros botões */}
            <div className="flex items-center gap-2">
              <ConcluirEtapaButton
                etapa={{
                  id: etapa.id,
                  numeroEtapa: etapa.numeroEtapa,
                  nomeEtapa: etapa.nomeEtapa,
                  gerenciaResponsavel: etapa.gerenciaResponsavel,
                  slug: etapa.slug
                }}
                processoId={processoId}
                preCondicaoAtendida={preCondicao.atendida}
                tooltipPreCondicao={preCondicao.tooltip}
                onConcluir={handleConcluir}
                concluida={concluida}
              />
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
