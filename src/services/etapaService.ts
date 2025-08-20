interface DadosConclusao {
  usuarioId: string;
  observacao?: string;
  dataConclusao: string;
  notificar: boolean;
}

interface RespostaConclusao {
  success: boolean;
  message: string;
  proximaEtapa?: string;
}

export class EtapaService {
  private static baseUrl = '/api/processos';

  /**
   * Conclui uma etapa específica
   */
  static async concluirEtapa(
    processoId: string, 
    slugEtapa: string, 
    dados: DadosConclusao
  ): Promise<RespostaConclusao> {
    try {
      const response = await fetch(`${this.baseUrl}/${processoId}/etapas/${slugEtapa}/concluir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao concluir etapa: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao concluir etapa:', error);
      throw error;
    }
  }

  /**
   * Libera a próxima etapa do fluxo
   */
  static async liberarProximaEtapa(
    processoId: string, 
    proximaEtapa: string
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${processoId}/fluxo/proxima-etapa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ etapa: proximaEtapa }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao liberar próxima etapa: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao liberar próxima etapa:', error);
      throw error;
    }
  }

  /**
   * Conclui etapa e libera próxima automaticamente
   */
  static async concluirEtapaCompleta(
    processoId: string,
    slugEtapa: string,
    dados: DadosConclusao,
    proximaEtapa?: string
  ): Promise<RespostaConclusao> {
    try {
      // Concluir etapa atual
      const resultado = await this.concluirEtapa(processoId, slugEtapa, dados);

      // Se há próxima etapa e a conclusão foi bem-sucedida, liberar próxima etapa
      if (resultado.success && proximaEtapa) {
        await this.liberarProximaEtapa(processoId, proximaEtapa);
      }

      return resultado;
    } catch (error) {
      console.error('Erro na conclusão completa da etapa:', error);
      throw error;
    }
  }

  /**
   * Mock para desenvolvimento - simula a conclusão de etapa
   */
  static async mockConcluirEtapa(
    processoId: string,
    slugEtapa: string,
    dados: DadosConclusao
  ): Promise<RespostaConclusao> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simular sucesso ou erro aleatório (10% de chance de erro)
    if (Math.random() < 0.1) {
      throw new Error('Erro simulado: Falha na conexão com o servidor');
    }

    return {
      success: true,
      message: 'Etapa concluída com sucesso',
      proximaEtapa: this.getProximaEtapa(slugEtapa)
    };
  }

  /**
   * Determina a próxima etapa baseada na etapa atual
   */
  private static getProximaEtapa(etapaAtual: string): string {
    const mapeamentoEtapas: Record<string, string> = {
      'elaboracao-dfd': 'aprovacao-dfd',
      'aprovacao-dfd': 'assinatura-dfd',
      'assinatura-dfd': 'despacho-dfd',
      'despacho-dfd': 'elaboracao-etp',
      'elaboracao-etp': 'assinatura-etp',
      // Adicionar mais mapeamentos conforme necessário
    };

    return mapeamentoEtapas[etapaAtual] || '';
  }
}
