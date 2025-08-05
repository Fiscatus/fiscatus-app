import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type DFDVersionStatus = 'rascunho' | 'enviado_analise' | 'devolvido' | 'aprovado';

export interface DFDVersion {
  id: string;
  version: number;
  content: string;
  createdAt: string;
  createdBy: string;
  isFinal: boolean;
  status: DFDVersionStatus;
  objetivoContratacao: string;
  justificativaDemanda: string;
  unidadeDemandante: string;
  dataElaboracao: string;
  responsavelElaboracao: string;
  devolucaoJustificativa?: string;
  devolucaoData?: string;
  devolucaoPor?: string;
  enviadoData?: string;
  enviadoPor?: string;
  aprovadoData?: string;
  aprovadoPor?: string;
}

export interface DFDAnnex {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  size: string;
}

export interface DFDData {
  currentVersion: DFDVersion | null;
  versions: DFDVersion[];
  annexes: DFDAnnex[];
  observations: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  isDevolvido: boolean;
  devolucaoJustificativa?: string;
  devolucaoData?: string;
  devolucaoPor?: string;
  status: DFDVersionStatus;
  enviadoData?: string;
  enviadoPor?: string;
  aprovadoData?: string;
  aprovadoPor?: string;
}

export function useDFD(processoId: string) {
  const [dfdData, setDfdData] = useState<DFDData>({
    currentVersion: null,
    versions: [],
    annexes: [],
    observations: '',
    isCompleted: false,
    isDevolvido: false,
    status: 'rascunho'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Carregar dados do DFD do localStorage (simulando backend)
  useEffect(() => {
    const savedData = localStorage.getItem(`dfd_${processoId}`);
    if (savedData) {
      try {
        setDfdData(JSON.parse(savedData));
      } catch (error) {
        console.error('Erro ao carregar dados do DFD:', error);
      }
    }
  }, [processoId]);

  // Salvar dados do DFD
  const saveDFDData = (data: DFDData) => {
    try {
      localStorage.setItem(`dfd_${processoId}`, JSON.stringify(data));
      setDfdData(data);
    } catch (error) {
      console.error('Erro ao salvar dados do DFD:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados do DFD.",
        variant: "destructive"
      });
    }
  };

  // Criar versão inicial (V1)
  const createInitialVersion = (versionData: Omit<DFDVersion, 'id' | 'version' | 'createdAt' | 'createdBy' | 'isFinal' | 'status'>) => {
    const initialVersion: DFDVersion = {
      ...versionData,
      id: 'v1',
      version: 1,
      createdAt: new Date().toISOString(),
      createdBy: 'Usuário',
      isFinal: true,
      status: 'rascunho'
    };

          const updatedData = {
        ...dfdData,
        currentVersion: initialVersion,
        versions: [initialVersion],
        status: 'rascunho' as DFDVersionStatus
      };

    saveDFDData(updatedData);
    return initialVersion;
  };

  // Adicionar nova versão
  const addVersion = (versionData: Omit<DFDVersion, 'id' | 'version' | 'createdAt' | 'createdBy' | 'isFinal' | 'status'>) => {
    const newVersionNumber = dfdData.versions.length + 1;
    const newVersion: DFDVersion = {
      ...versionData,
      id: `v${newVersionNumber}`,
      version: newVersionNumber,
      createdAt: new Date().toISOString(),
      createdBy: 'Usuário',
      isFinal: false,
      status: 'rascunho'
    };

          const updatedData = {
        ...dfdData,
        currentVersion: newVersion,
        versions: [...dfdData.versions, newVersion],
        status: 'rascunho' as DFDVersionStatus,
        isDevolvido: false,
        devolucaoJustificativa: undefined,
        devolucaoData: undefined,
        devolucaoPor: undefined
      };

    saveDFDData(updatedData);
    return newVersion;
  };

  // Enviar para análise
  const enviarParaAnalise = (enviadoPor: string) => {
    const latestVersion = dfdData.versions[dfdData.versions.length - 1];
    if (latestVersion) {
      const updatedVersions = dfdData.versions.map(version => ({
        ...version,
        status: version.id === latestVersion.id ? 'enviado_analise' as DFDVersionStatus : version.status,
        isFinal: version.id === latestVersion.id
      }));

      const updatedData = {
        ...dfdData,
        versions: updatedVersions,
        currentVersion: updatedVersions.find(v => v.id === latestVersion.id) || dfdData.currentVersion,
        status: 'enviado_analise' as DFDVersionStatus,
        enviadoData: new Date().toISOString(),
        enviadoPor
      };

      saveDFDData(updatedData);
    }
  };

  // Devolver versão para correção
  const devolverParaCorrecao = (justificativa: string, devolvidoPor: string) => {
    const finalVersion = dfdData.versions.find(v => v.isFinal);
    if (finalVersion) {
      const updatedVersions = dfdData.versions.map(version => ({
        ...version,
        status: version.isFinal ? 'devolvido' as DFDVersionStatus : version.status,
        devolucaoJustificativa: version.isFinal ? justificativa : version.devolucaoJustificativa,
        devolucaoData: version.isFinal ? new Date().toISOString() : version.devolucaoData,
        devolucaoPor: version.isFinal ? devolvidoPor : version.devolucaoPor
      }));

      const updatedData = {
        ...dfdData,
        versions: updatedVersions,
        status: 'devolvido' as DFDVersionStatus,
        isDevolvido: true,
        devolucaoJustificativa: justificativa,
        devolucaoData: new Date().toISOString(),
        devolucaoPor: devolvidoPor
      };

      saveDFDData(updatedData);
    }
  };

  // Aprovar versão (apenas GSP)
  const aprovarVersao = (aprovadoPor: string) => {
    const finalVersion = dfdData.versions.find(v => v.isFinal);
    if (finalVersion) {
      const updatedVersions = dfdData.versions.map(version => ({
        ...version,
        status: version.isFinal ? 'aprovado' as DFDVersionStatus : version.status,
        aprovadoData: version.isFinal ? new Date().toISOString() : version.aprovadoData,
        aprovadoPor: version.isFinal ? aprovadoPor : version.aprovadoPor
      }));

      const updatedData = {
        ...dfdData,
        versions: updatedVersions,
        currentVersion: updatedVersions.find(v => v.id === finalVersion.id) || dfdData.currentVersion,
        status: 'aprovado' as DFDVersionStatus,
        isCompleted: true,
        completedAt: new Date().toISOString(),
        completedBy: aprovadoPor,
        aprovadoData: new Date().toISOString(),
        aprovadoPor
      };

      saveDFDData(updatedData);
    }
  };

  // Adicionar anexo
  const addAnnex = (annex: DFDAnnex) => {
    const updatedData = {
      ...dfdData,
      annexes: [...dfdData.annexes, annex]
    };
    saveDFDData(updatedData);
  };

  // Remover anexo
  const removeAnnex = (annexId: string) => {
    const updatedData = {
      ...dfdData,
      annexes: dfdData.annexes.filter(annex => annex.id !== annexId)
    };
    saveDFDData(updatedData);
  };

  // Atualizar observações
  const updateObservations = (observations: string) => {
    const updatedData = {
      ...dfdData,
      observations
    };
    saveDFDData(updatedData);
  };

  // Obter versão mais recente editável
  const getLatestEditableVersion = () => {
    return dfdData.versions[dfdData.versions.length - 1];
  };

  // Verificar se pode criar nova versão
  const canCreateNewVersion = () => {
    return dfdData.status === 'devolvido' || dfdData.versions.length === 0;
  };

  // Verificar se pode editar (apenas rascunho ou devolvido)
  const canEdit = () => {
    return dfdData.status === 'rascunho' || dfdData.status === 'devolvido';
  };

  // Verificar se pode enviar para análise
  const canSendToAnalysis = () => {
    return dfdData.status === 'rascunho';
  };

  // Verificar se pode aprovar (apenas GSP)
  const canApprove = (userGerencia: string) => {
    return dfdData.status === 'enviado_analise' && userGerencia === 'Gerência de Soluções e Projetos';
  };

  // Verificar se pode devolver (apenas GSP)
  const canDevolver = (userGerencia: string) => {
    return dfdData.status === 'enviado_analise' && userGerencia === 'Gerência de Soluções e Projetos';
  };

  // Resetar DFD (para testes)
  const resetDFD = () => {
    const resetData = {
      currentVersion: null,
      versions: [],
      annexes: [],
      observations: '',
      isCompleted: false,
      isDevolvido: false,
      status: 'rascunho' as DFDVersionStatus
    };
    saveDFDData(resetData);
  };

  return {
    dfdData,
    isLoading,
    createInitialVersion,
    addVersion,
    enviarParaAnalise,
    devolverParaCorrecao,
    aprovarVersao,
    addAnnex,
    removeAnnex,
    updateObservations,
    resetDFD,
    saveDFDData,
    getLatestEditableVersion,
    canCreateNewVersion,
    canEdit,
    canSendToAnalysis,
    canApprove,
    canDevolver
  };
} 