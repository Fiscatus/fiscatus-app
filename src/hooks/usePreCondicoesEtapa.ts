import { useMemo } from "react";

interface PreCondicaoEtapa {
  atendida: boolean;
  tooltip: string;
}

interface DadosEtapa {
  numeroEtapa: number;
  nomeEtapa: string;
  status: string;
  // Dados específicos por etapa
  versaoEnviada?: boolean;
  decisaoRegistrada?: boolean;
  assinaturasConcluidas?: number;
  totalAssinaturas?: number;
  despachoGerado?: boolean;
  despachoAssinado?: boolean;
  documentoAnexado?: boolean;
  statusDocumento?: string;
}

export function usePreCondicoesEtapa(etapa: DadosEtapa): PreCondicaoEtapa {
  return useMemo(() => {
    // Se a etapa não está em andamento, não atende às pré-condições
    if (etapa.status !== "em_andamento") {
      return {
        atendida: false,
        tooltip: "Aguarde a etapa estar em andamento para concluir."
      };
    }

    switch (etapa.numeroEtapa) {
      case 1: // Elaboração do DFD
        return {
          atendida: etapa.versaoEnviada === true,
          tooltip: "Envie uma versão do DFD para análise antes de concluir."
        };

      case 2: // Aprovação do DFD
        return {
          atendida: etapa.decisaoRegistrada === true,
          tooltip: "Registre a decisão (aprovar ou solicitar correção) para concluir."
        };

      case 3: // Assinatura do DFD
        return {
          atendida: etapa.assinaturasConcluidas === etapa.totalAssinaturas && etapa.totalAssinaturas > 0,
          tooltip: "Aguarde todas as assinaturas para concluir."
        };

      case 4: // Despacho do DFD
        return {
          atendida: etapa.despachoGerado === true && etapa.despachoAssinado === true,
          tooltip: "Gere e assine o despacho para concluir."
        };

      case 5: // Elaboração do ETP
        return {
          atendida: etapa.documentoAnexado === true && etapa.statusDocumento === "Finalizado para Assinatura",
          tooltip: "Envie o ETP para assinatura para concluir."
        };

      default:
        // Para etapas futuras, permitir conclusão se não há pré-condições específicas
        return {
          atendida: true,
          tooltip: "Etapa pronta para conclusão."
        };
    }
  }, [etapa]);
}
