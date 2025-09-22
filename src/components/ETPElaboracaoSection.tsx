import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Removido: radio-group não é mais usado aqui
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ProgressaoTemporal from '@/components/ProgressaoTemporal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  History,
  Upload, 
  Plus,
  Download, 
  Info,
  Trash2, 
  Save, 
  MessageCircle,
  User, 
  Calendar,
  Building2,
  Edit3,
  Lock,
  Unlock,
  XCircle as XCircleIcon,
  Clock,
  File,
  Send,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Hash,
  ChevronDown,
  Flag,
  Settings,
  ClipboardCheck,
  ListChecks,
  Paperclip
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/date';
import CommentsSection from './CommentsSection';
import ResponsavelSelector from './ResponsavelSelector';
import { formatDateBR, formatDateTimeBR, legendaDiasRestantes, classesPrazo } from '@/lib/utils';

// Tipos TypeScript conforme especificação
type ETPVersionStatus = 'rascunho' | 'finalizada' | 'enviada_para_assinatura';

interface ETPVersion {
  id: string;
  numeroRevisao: number;
  status: ETPVersionStatus;
  autorId: string;
  autorNome: string;
  autorCargo?: string;
  autorGerencia?: string;
  autorEmail?: string;
  criadoEm: string;
  atualizadoEm: string;
  enviadoParaAssinaturaEm?: string;
  finalizadoEm?: string;
  prazoDiasUteis?: number;
  prazoInicialDiasUteis?: number;
  prazoCumpridoDiasUteis?: number;
  documentoUrl?: string;
  documentoNome?: string;
  payload: {
    justificativaContratacao: string;
    estudosPreliminares: string;
    descricaoObjeto: string;
    estimativaPrecos: string;
    impactoOrcamentario: string;
    beneficiosEsperados: string;
    riscosIdentificados: string;
    observacoesComplementares: string;
    responsaveis: {
      id: string;
      nome: string;
      cargo: string;
      gerencia: string;
    }[];
    dataElaboracao: string;
    numeroETP: string;
    prioridade: 'ALTO' | 'MEDIO' | 'BAIXO';
  };
}

interface Anexo {
  id: string;
  nome: string;
  tamanhoBytes: number;
  mimeType: string;
  criadoEm: string;
  autorId: string;
  autorNome: string;
  versaoId: string;
  urlDownload: string;
}

interface Comentario {
  id: string;
  autorId: string;
  autorNome: string;
  criadoEm: string;
  texto: string;
}

interface PermissoesETP {
  podeEditar: boolean;
  podeCriarNovaRevisao: boolean;
  podeUploadAnexo: boolean;
  podeRemoverAnexo: boolean;
  podeConcluirEtapa: boolean;
}

interface ConclusaoEtapa {
  usuarioId: string;
  usuarioNome: string;
  observacao?: string;
  versaoId: string;
  dataConclusao: string;
  notificar: boolean;
}

interface ETPElaboracaoSectionProps {
  processoId: string;
  etapaId: string;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
  initialData?: any;
  canEdit?: boolean;
  gerenciaCriadora?: string; // Gerência que criou o processo
}

// Utilitário para contar dias úteis
const countBusinessDays = (startISO: string, endISO: string, holidays: string[] = []): number => {
  const start = new Date(startISO);
  const end = new Date(endISO);
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateString = current.toISOString().split('T')[0];
    
    // Segunda a sexta (1-5) e não é feriado
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidays.includes(dateString)) {
      count++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

// Mock de dados iniciais
const mockVersions: ETPVersion[] = [
  {
    id: 'v1',
    numeroRevisao: 1,
  status: 'rascunho',
    autorId: 'user1',
    autorNome: 'Lucas Moreira Brito',
    autorCargo: 'Analista de Projetos',
    autorGerencia: 'GSP - Gerência de Soluções e Projetos',
    autorEmail: 'lucas.brito@hospital.gov.br',
    criadoEm: '2024-01-15T14:30:00Z',
    atualizadoEm: '2024-01-18T16:45:00Z',
    prazoDiasUteis: 5,
    prazoInicialDiasUteis: 5,
    prazoCumpridoDiasUteis: 0,
    payload: {
    justificativaContratacao: '',
      estudosPreliminares: '',
      descricaoObjeto: '',
      estimativaPrecos: '',
      impactoOrcamentario: '',
      beneficiosEsperados: '',
    riscosIdentificados: '',
      observacoesComplementares: '',
      responsaveis: [
        {
          id: 'user1',
          nome: 'Lucas Moreira Brito',
          cargo: 'Analista de Projetos',
          gerencia: 'GSP - Gerência de Soluções e Projetos'
        }
      ],
      dataElaboracao: '2024-01-15',
      numeroETP: 'ETP-2024-001',
      prioridade: 'MEDIO'
    }
  }
];

const mockAnexos: Anexo[] = [
  {
    id: 'anexo1',
    nome: 'Documento_Referencia.pdf',
    tamanhoBytes: 1024000,
    mimeType: 'application/pdf',
    criadoEm: '2024-01-15T10:30:00Z',
    autorId: 'user1',
    autorNome: 'Lucas Moreira Brito',
    versaoId: 'v1',
    urlDownload: '#'
  }
];



export default function ETPElaboracaoSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true,
  gerenciaCriadora
}: ETPElaboracaoSectionProps) {
  const { user } = useUser();
  const { toast } = useToast();
  
  // Estados principais
  const [versions, setVersions] = useState<ETPVersion[]>(mockVersions);
  const [currentVersion, setCurrentVersion] = useState<ETPVersion>(mockVersions[0]);
  const [formData, setFormData] = useState(currentVersion.payload);
  const [anexos, setAnexos] = useState<Anexo[]>(mockAnexos);
  const [attachmentsSort, setAttachmentsSort] = useState<'desc' | 'asc'>('desc'); // desc = mais recente primeiro
  const [showAllRevisions, setShowAllRevisions] = useState(false);
  const [expandedRevisions, setExpandedRevisions] = useState<Record<string, boolean>>({});

  // Feature flag para multiversão (default OFF)
  const allowMultipleEtpVersions = false; // orgBehavior.allowMultipleEtpVersions



  // Função para salvar alterações nos responsáveis
  const salvarResponsaveis = useCallback((novosResponsaveis: any[]) => {
    console.log('Salvando responsáveis:', novosResponsaveis);
    
    // Atualizar apenas o formData
    setFormData(prev => {
      console.log('Atualizando formData:', {
        prev: prev.responsaveis,
        novos: novosResponsaveis
      });
      return {
        ...prev,
        responsaveis: novosResponsaveis
      };
    });
    
  }, []);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('revisoes');
  
  // Estados para conclusão da etapa
  const [showConcluirModal, setShowConcluirModal] = useState(false);
  const [observacaoConclusao, setObservacaoConclusao] = useState('');
  const [notificarPartes, setNotificarPartes] = useState(true);
  const [etapaConcluida, setEtapaConcluida] = useState<ConclusaoEtapa | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função utilitária: garantir que o scroll global esteja destravado
  const unlockScroll = useCallback(() => {
    try {
      const html = document.documentElement;
      const body = document.body;
      if (body) {
        body.style.overflow = 'auto';
        body.style.position = '';
        body.style.top = '';
        body.style.height = '';
        body.classList.remove('overflow-hidden', 'fixed');
      }
      if (html) {
        html.style.overflow = 'auto';
        html.style.height = '';
        html.classList.remove('overflow-hidden');
      }
    } catch {}
  }, []);

  // Garante que o scroll global nunca fique travado ao retornar para a tela
  useEffect(() => {
    // Destrava ao montar (caso alguma tela anterior tenha deixado travado)
    unlockScroll();
    // Destrava ao desmontar por segurança
    return () => unlockScroll();
  }, [unlockScroll]);

  // Se o modal não está aberto, garantir que o scroll global esteja destravado
  useEffect(() => {
    if (!showConcluirModal) {
      unlockScroll();
      requestAnimationFrame(unlockScroll);
      setTimeout(unlockScroll, 0);
    }
  }, [showConcluirModal, unlockScroll]);

  // Ao mudar a expansão de revisões ou a listagem, reforçar destravamento
  useEffect(() => {
    if (!showConcluirModal) {
      unlockScroll();
    }
  }, [expandedRevisions, showAllRevisions, unlockScroll, showConcluirModal]);

  // Função para normalizar e comparar gerências
  const isGerenciaResponsavel = (userGerencia: string, gerenciaCriadora: string): boolean => {
    if (!userGerencia || !gerenciaCriadora) {
      return false;
    }
    
    // Normalizar as strings para comparação
    const normalize = (str: string) => str.toLowerCase().replace(/[-\s]/g, '').trim();
    
    const userNormalized = normalize(userGerencia);
    const criadoraNormalized = normalize(gerenciaCriadora);
    
    // Comparação direta
    if (userNormalized === criadoraNormalized) {
      return true;
    }
    
    // Mapeamento de variações comuns
    const mapeamentoGerencia: { [key: string]: string[] } = {
      'grh': ['gerenciaderecursoshumanos', 'grh', 'rh', 'recursoshumanos'],
      'gsp': ['gerenciadesolucoeseprojetos', 'gsp', 'solucoeseprojetos'],
      'gsl': ['gerenciadesuprimentoselogistica', 'gsl', 'suprimentoselogistica'],
      'gue': ['gerenciadeurgenciaeemergencia', 'gue', 'urgenciaeemergencia'],
      'glc': ['gerenciadelicitacoesecontratos', 'glc', 'licitacoesecontratos'],
      'gfc': ['gerenciafinanceiraecontabil', 'gfc', 'financeiraecontabil'],
      'naj': ['assessoriajuridica', 'naj', 'juridica'],
      'ci': ['comissaodeimplantacao', 'ci', 'implantacao'],
      'se': ['secretariaexecutiva', 'se', 'executiva'],
      'ouv': ['ouvidoria', 'ouv']
    };
    
    // Verificar se ambas as gerências estão no mesmo grupo
    for (const [key, variacoes] of Object.entries(mapeamentoGerencia)) {
      if (variacoes.includes(userNormalized) && variacoes.includes(criadoraNormalized)) {
        return true;
      }
    }
    
    return false;
  };

  // Permissões (mock - em produção viria do contexto)
  const permissoes: PermissoesETP = {
    podeEditar: (isGerenciaResponsavel(user?.gerencia || '', gerenciaCriadora || '') || user?.gerencia?.includes('GSP') || false) && !etapaConcluida,
    podeCriarNovaRevisao: canCreateNewRevision() && !etapaConcluida,
    podeUploadAnexo: (isGerenciaResponsavel(user?.gerencia || '', gerenciaCriadora || '') || user?.gerencia?.includes('GSP') || false) && !etapaConcluida,
    podeRemoverAnexo: (isGerenciaResponsavel(user?.gerencia || '', gerenciaCriadora || '') || user?.gerencia?.includes('GSP') || false) && !etapaConcluida,
    podeConcluirEtapa: canConcluirEtapa()
  };

  // Verificar se pode criar nova revisão
  function canCreateNewRevision(): boolean {
    if (!currentVersion) return false;
    return allowMultipleEtpVersions && ['finalizada', 'enviada_para_assinatura'].includes(currentVersion.status);
  }

  // Verificar se pode finalizar
  function canFinalizar(): boolean {
    return formData.descricaoObjeto.trim() !== '';
  }

  // Verificar se pode enviar para assinatura
  function canSendToSignature(): boolean {
    return currentVersion.status === 'finalizada';
  }

  // Verificar se pode concluir a etapa
  function canConcluirEtapa(): boolean {
    // Verificar se o usuário tem permissão baseada na gerência
    const gerenciaPermitida = user?.gerencia && (
      isGerenciaResponsavel(user.gerencia, gerenciaCriadora || '') || 
      ['GSP', 'CI', 'SE', 'OUV'].includes(user.gerencia)
    );
    if (!gerenciaPermitida) return false;

    // Verificar se existe ao menos 1 versão válida (não rascunho)
    const versaoValida = versions.some(v => v.status !== 'rascunho');
    if (!versaoValida) return false;

    // Verificar se todos os campos obrigatórios estão preenchidos
    const camposObrigatoriosOk = canFinalizar();

    return versaoValida && camposObrigatoriosOk;
  }

  // Verificar se pode concluir a etapa (para exibição do botão)
  function canShowConcluirButton(): boolean {
    return user?.gerencia && (
      isGerenciaResponsavel(user.gerencia, gerenciaCriadora || '') || 
      ['GSP', 'CI', 'SE', 'OUV'].includes(user.gerencia)
    );
  }

  // Handlers
  const handleSaveRevision = async () => {
    setIsLoading(true);
    try {
      const updatedVersion: ETPVersion = {
        ...currentVersion,
        status: 'rascunho',
        atualizadoEm: new Date().toISOString(),
        payload: formData
      };
      
      setCurrentVersion(updatedVersion);
      setVersions(prev => prev.map(v => v.id === updatedVersion.id ? updatedVersion : v));
      
      toast({
        title: "Revisão salva",
        description: "Rascunho salvo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar revisão.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizar = async () => {
    if (!canFinalizar()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de finalizar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedVersion: ETPVersion = {
        ...currentVersion,
        status: 'finalizada',
        finalizadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        payload: formData
      };
      
      setCurrentVersion(updatedVersion);
      setVersions(prev => prev.map(v => v.id === updatedVersion.id ? updatedVersion : v));
    
    toast({
        title: "Versão finalizada",
        description: "ETP finalizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao finalizar ETP.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToSignature = async () => {
    if (!canSendToSignature()) {
      toast({
        title: "Versão não finalizada",
        description: "Finalize a versão antes de enviar para assinatura.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Calcular prazo cumprido em dias úteis
      const dataCriacao = new Date(currentVersion.criadoEm);
      const dataEnvio = new Date();
      const prazoCumprido = countBusinessDays(dataCriacao.toISOString(), dataEnvio.toISOString());

      const updatedVersion: ETPVersion = {
        ...currentVersion,
        status: 'enviada_para_assinatura',
        enviadoParaAssinaturaEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        prazoCumpridoDiasUteis: prazoCumprido,
        payload: formData
      };
      
      setCurrentVersion(updatedVersion);
      setVersions(prev => prev.map(v => v.id === updatedVersion.id ? updatedVersion : v));
    
    toast({
        title: "Enviado para assinatura",
        description: "ETP enviado para assinatura com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar para assinatura.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewVersion = async () => {
    if (!canCreateNewRevision()) return;

    setIsLoading(true);
    try {
      const newVersionNumber = Math.max(...versions.map(v => v.numeroRevisao)) + 1;
      const newVersion: ETPVersion = {
        id: `v${newVersionNumber}`,
        numeroRevisao: newVersionNumber,
        status: 'rascunho',
        autorId: (user as any)?._id || (user as any)?.id || 'user1',
        autorNome: user?.nome || 'Usuário Atual',
        autorCargo: user?.cargo,
        autorGerencia: user?.gerencia,
        autorEmail: (user as any)?.email,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        prazoDiasUteis: 5,
        prazoInicialDiasUteis: 5,
        payload: {
          ...currentVersion.payload,
          descricaoObjeto: ''
        }
      };
      
      setVersions(prev => [newVersion, ...prev]);
      setCurrentVersion(newVersion);
      setFormData(newVersion.payload);
      setExpandedRevisions(prev => ({ ...prev, [newVersion.id]: true }));
    
    toast({
        title: "Nova versão criada",
        description: `Versão ${newVersionNumber} criada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar nova versão.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Prazo restante e classes de cor
  const getDiasRestantes = (version: ETPVersion): number | null => {
    if (version.prazoInicialDiasUteis === undefined) return null;
    const cumprido = version.prazoCumpridoDiasUteis ?? 0;
    return (version.prazoInicialDiasUteis || 0) - cumprido;
  };

  const getPrazoColorClasses = (diasRestantes: number | null): { text: string; badge: string } => {
    if (diasRestantes === null) return { text: 'text-gray-600', badge: 'bg-gray-100 text-gray-800' };
    if (diasRestantes < 0) return { text: 'text-red-600', badge: 'bg-red-100 text-red-800' };
    if (diasRestantes <= 2) return { text: 'text-orange-600', badge: 'bg-orange-100 text-orange-800' };
    return { text: 'text-green-600', badge: 'bg-green-100 text-green-800' };
  };

  // Expandir somente a revisão mais recente por padrão
  useEffect(() => {
    if (versions.length > 0) {
      setExpandedRevisions(prev => {
        const next: Record<string, boolean> = { ...prev };
        versions.forEach((v, idx) => {
          if (next[v.id] === undefined) next[v.id] = idx === 0;
        });
        return next;
      });
    }
  }, [versions]);

  // Handler para abrir modal de conclusão
  const handleOpenConcluirModal = () => {
    setShowConcluirModal(true);
  };

  // Handler para concluir a etapa
  const handleConcluirEtapa = async () => {
    setIsLoading(true);
    try {
      // Simular chamada da API
      const conclusaoData: ConclusaoEtapa = {
        usuarioId: user?._id || 'user1',
        usuarioNome: user?.nome || 'Usuário Atual',
        observacao: observacaoConclusao.trim() || undefined,
        versaoId: currentVersion.id,
        dataConclusao: new Date().toISOString(),
        notificar: notificarPartes
      };

      // Mock da chamada POST /processos/:processoId/etapas/elaboracao-etp/concluir
      console.log('Concluindo etapa:', conclusaoData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Atualizar estado local
      setEtapaConcluida(conclusaoData);
      setShowConcluirModal(false);
      setObservacaoConclusao('');
      setNotificarPartes(true);

      // Chamar callback de conclusão
      onComplete({
        etapaId,
        processoId,
        conclusao: conclusaoData,
        versaoBase: currentVersion
      });

      toast({
        title: "Etapa concluída",
        description: "A etapa Elaboração do ETP foi concluída com sucesso.",
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao concluir a etapa.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simular upload
      const newAnexo: Anexo = {
        id: `anexo-${Date.now()}`,
      nome: file.name,
        tamanhoBytes: file.size,
        mimeType: file.type,
        criadoEm: new Date().toISOString(),
        autorId: user?._id || '',
        autorNome: user?.nome || '',
        versaoId: currentVersion.id,
        urlDownload: '#'
      };
      
      setAnexos(prev => [...prev, newAnexo]);
      
      toast({
        title: "Anexo adicionado",
        description: `${file.name} foi anexado com sucesso.`,
      });
    }
  };

  const handleDeleteAnexo = (anexoId: string) => {
    setAnexos(prev => prev.filter(a => a.id !== anexoId));
    
    toast({
      title: "Anexo removido",
      description: "Anexo removido com sucesso.",
    });
  };



  const getStatusConfig = (status: ETPVersionStatus) => {
    switch (status) {
      case 'rascunho':
        return { label: 'Em elaboração', color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-3 h-3" /> };
      case 'finalizada':
        return { label: 'Finalizada', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3" /> };
      case 'enviada_para_assinatura':
        return { label: 'Enviada p/ assinatura', color: 'bg-blue-100 text-blue-800', icon: <Send className="w-3 h-3" /> };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-3 h-3" /> };
    }
  };

  const getSLABadge = (prazoInicial: number, prazoCumprido: number | undefined) => {
    // Se não foi enviado ainda, não há como avaliar
    if (prazoCumprido === undefined) {
      return { label: 'Não Enviado', color: 'bg-gray-100 text-gray-800' };
    }
    
    // Comparar prazo cumprido com prazo inicial
    if (prazoCumprido <= prazoInicial) {
      return { label: 'Prazo Cumprido', color: 'bg-green-100 text-green-800' };
    } else if (prazoCumprido <= prazoInicial + 1) {
      return { label: 'Em Risco', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'Prazo Não Cumprido', color: 'bg-red-100 text-red-800' };
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Usar as funções padronizadas do utils
  const formatDate = formatDateBR;
  const formatDateTime = formatDateTimeBR;

  // Helpers de anexos (UI-only)
  const getFileIcon = (mime: string) => {
    const lower = (mime || '').toLowerCase();
    if (lower.includes('pdf')) return <File className="w-4 h-4 text-red-600" />;
    if (lower.includes('word') || lower.includes('doc')) return <File className="w-4 h-4 text-blue-600" />;
    if (lower.includes('excel') || lower.includes('sheet') || lower.includes('xls')) return <File className="w-4 h-4 text-green-600" />;
    if (lower.startsWith('image/')) return <File className="w-4 h-4 text-pink-600" />;
    return <File className="w-4 h-4 text-gray-600" />;
  };

  // Ordenação de anexos por data
  const anexosOrdenados = useMemo(() => {
    const arr = [...anexos];
    arr.sort((a, b) => {
      const da = new Date(a.criadoEm).getTime();
      const db = new Date(b.criadoEm).getTime();
      return attachmentsSort === 'desc' ? db - da : da - db;
    });
    return arr;
  }, [anexos, attachmentsSort]);

  const openInNewTab = (url?: string) => {
    try {
      if (!url) throw new Error('missing');
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win) {
        toast({ title: 'Não foi possível abrir', description: 'Verifique o bloqueador de pop-up.', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Link expirado', description: 'Atualize a página ou gere um novo link.', variant: 'destructive' });
    }
  };

  // Formata o número do ETP para o padrão "ETP 006/2025" apenas para exibição
  const formatNumeroETP = (value: string): string => {
    if (!value) return '';

    // Já está no formato desejado
    const desired = /^ETP\s+\d{3}\/\d{4}$/i;
    if (desired.test(value)) {
      return value.replace(/\s+/, ' ').toUpperCase();
    }

    // Padrões comuns: ETP-2024-001, ETP_2024_001, ETP 2024 1, 001/2024, ETP 1/2024
    let match = /ETP[-_\s]?(\d{4})[-_\s]?(\d{1,4})/i.exec(value);
    if (match) {
      const year = match[1];
      const num = match[2].padStart(3, '0');
      return `ETP ${num}/${year}`;
    }

    match = /(?:ETP)?\s*(\d{1,4})\/(\d{4})/i.exec(value);
    if (match) {
      const num = match[1].padStart(3, '0');
      const year = match[2];
      return `ETP ${num}/${year}`;
    }

    const yearOnly = /(\d{4})/.exec(value);
    const lastNum = /(\d{1,4})(?!.*\d)/.exec(value);
    if (yearOnly && lastNum) {
      const year = yearOnly[1];
      const num = lastNum[1].padStart(3, '0');
      return `ETP ${num}/${year}`;
    }

    return value;
  };

  // ===== Helpers adicionais para Painel da Etapa (espelhando DFD) =====
  const getEtapaStatus = () => {
    if (etapaConcluida) return 'Concluída';
    if (versions.some(v => v.status === 'enviada_para_assinatura')) return 'Em assinatura';
    if (versions.some(v => v.status === 'finalizada')) return 'Finalizada';
    return 'Em elaboração';
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Concluída':
      case 'Finalizada':
        return 'bg-green-100 text-green-800';
      case 'Em assinatura':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPrazoFinalPrevisto = () => {
    const inicio = new Date(currentVersion.criadoEm);
    const diasUteis = currentVersion.prazoInicialDiasUteis || 5;
    let dataFinal = new Date(inicio);
    let diasAdicionados = 0;
    while (diasAdicionados < diasUteis) {
      dataFinal.setDate(dataFinal.getDate() + 1);
      const dayOfWeek = dataFinal.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        diasAdicionados++;
      }
    }
    return dataFinal;
  };

  const getTempoDecorrido = () => {
    const inicio = new Date(currentVersion.criadoEm);
    const agora = etapaConcluida ? new Date(etapaConcluida.dataConclusao) : new Date();
    const diasUteis = countBusinessDays(currentVersion.criadoEm, agora.toISOString());
    return { diasUteis };
  };

  const getProgressoTemporal = () => {
    const prazoInicial = new Date(currentVersion.criadoEm);
    const prazoLimite = getPrazoFinalPrevisto();
    const hoje = etapaConcluida ? new Date(etapaConcluida.dataConclusao) : new Date();
    const diasUteisTotal = Math.max(1, countBusinessDays(prazoInicial.toISOString(), prazoLimite.toISOString()));
    const diasUteisPassados = countBusinessDays(prazoInicial.toISOString(), hoje.toISOString());
    if (hoje > prazoLimite && !etapaConcluida) {
      return 100;
    }
    const progresso = Math.round((diasUteisPassados / diasUteisTotal) * 100);
    return Math.min(progresso, 100);
  };

  const getProgressColor = (progresso: number) => {
    if (progresso <= 70) return 'bg-green-500';
    if (progresso <= 100) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  type ChecklistStatus = 'completed' | 'pending' | 'warning';
  interface ChecklistItem { id: string; label: string; status: ChecklistStatus; description?: string }
  interface TimelineItem { id: string; autor: string; descricao: string; dataHora: string; tipo: 'revisao' | 'anexo' | 'status' }

  const getChecklistIcon = (status: ChecklistStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const generateChecklist = (): ChecklistItem[] => {
    const checklist: ChecklistItem[] = [];
    // Revisão inicial criada
    if (versions.length === 0) {
      checklist.push({ id: 'rev-criada', label: 'Revisão inicial ainda não criada', status: 'pending', description: 'Nenhuma revisão foi criada' });
    } else {
      checklist.push({ id: 'rev-criada', label: 'Revisão inicial criada', status: 'completed', description: `${versions.length} revisão(ões)` });
    }
    // Anexos
    if (anexos.length === 0) {
      checklist.push({ id: 'anexos', label: 'Documentos anexados (nenhum encontrado)', status: 'pending', description: 'Nenhum anexo adicionado' });
    } else {
      checklist.push({ id: 'anexos', label: 'Documentos anexados', status: 'completed', description: `${anexos.length} documento(s)` });
    }
    // Responsáveis
    if (!formData.responsaveis || formData.responsaveis.length === 0) {
      checklist.push({ id: 'responsaveis', label: 'Responsáveis definidos (nenhum encontrado)', status: 'pending', description: 'Nenhum responsável atribuído' });
    } else if (formData.responsaveis.length < 2) {
      checklist.push({ id: 'responsaveis', label: `Responsáveis definidos (${formData.responsaveis.length} de 2)`, status: 'warning', description: 'Recomenda-se ao menos 2' });
    } else {
      checklist.push({ id: 'responsaveis', label: 'Responsáveis definidos', status: 'completed', description: `${formData.responsaveis.length} responsável(is)` });
    }
    // Descrição do objeto
    if (!formData.descricaoObjeto || formData.descricaoObjeto.trim() === '') {
      checklist.push({ id: 'descricao', label: 'Descrição do objeto preenchida', status: 'pending', description: 'Campo obrigatório do ETP' });
    } else {
      checklist.push({ id: 'descricao', label: 'Descrição do objeto preenchida', status: 'completed', description: 'Campo preenchido' });
    }
    // Envio para assinatura
    const hasSent = versions.some(v => v.status === 'enviada_para_assinatura');
    checklist.push({ id: 'envio-ass', label: 'Revisão enviada para assinatura', status: hasSent ? 'completed' : 'pending', description: hasSent ? 'Enviado com sucesso' : 'Nenhuma revisão enviada' });
    return checklist.sort((a, b) => {
      const order: Record<ChecklistStatus, number> = { pending: 0, warning: 1, completed: 2 };
      return order[a.status] - order[b.status];
    });
  };

  const generateTimeline = (): TimelineItem[] => {
    const timeline: TimelineItem[] = [];
    versions.slice(0, 2).forEach(version => {
      if (version.status === 'enviada_para_assinatura' && version.enviadoParaAssinaturaEm) {
        timeline.push({ id: `rev-${version.id}-envio`, autor: version.autorNome, descricao: `Revisão ${version.numeroRevisao} enviada para assinatura`, dataHora: version.enviadoParaAssinaturaEm, tipo: 'revisao' });
      }
      if (version.status === 'finalizada') {
        timeline.push({ id: `rev-${version.id}-finalizada`, autor: version.autorNome, descricao: `Revisão ${version.numeroRevisao} finalizada`, dataHora: version.atualizadoEm, tipo: 'status' });
      }
    });
    anexos.slice(0, 2).forEach(anexo => {
      timeline.push({ id: `anexo-${anexo.id}`, autor: anexo.autorNome, descricao: `Documento comentado anexado`, dataHora: anexo.criadoEm, tipo: 'anexo' });
    });
    return timeline.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()).slice(0, 3);
  };

  const getTimelineIcon = (item: TimelineItem) => {
    switch (item.tipo) {
      case 'revisao':
        if (item.descricao.includes('finalizada')) return <CheckCircle2 className="w-4 h-4 text-green-600" />;
        if (item.descricao.includes('enviada')) return <Send className="w-4 h-4 text-blue-600" />;
        return <FileText className="w-4 h-4 text-slate-600" />;
      case 'anexo':
        return <Paperclip className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1️⃣ Formulário do ETP */}
      <div className="card-shell mb-8 min-h-[700px]">
        <header className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-bold text-slate-900">Formulário do ETP</h2>
          <div className="ml-auto">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Formulário</span>
                 </div>
               </header>
        <div className="border-b-2 border-purple-200 mb-6"></div>
        <div className="space-y-0">
                <div className="w-full p-4 border-b border-slate-200 my-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      <Label htmlFor="numeroProcesso" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4" />
                        Número do Processo Administrativo
                      </Label>
                <Input id="numeroProcesso" value={formatNumeroETP(formData.numeroETP)} readOnly className="w-full bg-gray-50 border-gray-200 text-gray-600" />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <Label htmlFor="dataElaboracao" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" />
                        Data da Elaboração
                      </Label>
                <Input id="dataElaboracao" value={formatDate(formData.dataElaboracao)} readOnly className="w-full bg-gray-50 border-gray-200 text-gray-600" />
                    </div>
                  </div>
                </div>
                <div className="w-full p-4 border-b border-slate-200 my-4">
                  <Label htmlFor="descricaoObjeto" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4" />
                    Descrição do Objeto *
                  </Label>
            <Textarea id="descricaoObjeto" value={formData.descricaoObjeto} onChange={(e) => setFormData({ ...formData, descricaoObjeto: e.target.value })} placeholder="Descreva detalhadamente o objeto da contratação..." disabled={!permissoes.podeEditar || currentVersion.status !== 'rascunho'} className="w-full min-h-[100px] resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-300" />
                </div>
                <div className="w-full p-4 border-b border-slate-200 my-4">
                  <Label htmlFor="observacoesComplementares" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4" />
                    Observações Complementares
                       </Label>
            <Textarea id="observacoesComplementares" value={formData.observacoesComplementares} onChange={(e) => setFormData({ ...formData, observacoesComplementares: e.target.value })} placeholder="Adicione observações complementares relevantes..." disabled={!permissoes.podeEditar || currentVersion.status !== 'rascunho'} className="w-full min-h-[100px] resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-300" />
                     </div>
          <ResponsavelSelector value={formData.responsaveis || []} onChange={(responsaveis) => { salvarResponsaveis(responsaveis || []); }} disabled={!permissoes.podeEditar || currentVersion.status !== 'rascunho'} canEdit={permissoes.podeEditar} processoId={processoId} className="w-full border-b border-slate-200 my-4" maxResponsaveis={5} />
                 </div>
            </div>

      {/* 2️⃣ Gerenciamento */}
      <div className="card-shell mb-8 min-h-[700px]">
        <header className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900">Gerenciamento</h2>
          <div className="ml-auto">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Gerenciamento</span>
                          </div>
              </header>
        <div className="border-b-2 border-slate-200 mb-6"></div>
        <div>
          <div className="grid grid-cols-12 gap-4 items-start">
            <div className="col-span-12 lg:col-span-6">
              <div className="rounded-xl border shadow-sm bg-white h-full min-h-[500px]">
                <div className="px-4 py-6 rounded-t-xl border-b">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-600" />
                    Versões
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {permissoes.podeCriarNovaRevisao && (
                      <Button onClick={handleCreateNewVersion} variant="outline" className="w-full border-dashed border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50">
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Nova Versão
                        </Button>
                      )}
                      {versions.length === 0 ? (
                      <div className="text-center py-8">
                          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Ainda não há versões criadas</p>
                        </div>
                      ) : (
                      <div className="space-y-3 overflow-y-auto max-h-[450px]">
                        {!showAllRevisions && <div className="text-sm font-semibold text-purple-700">Última versão</div>}
                          {(showAllRevisions ? versions : [versions[0]]).map((version, idx, arr) => {
                            const statusConfig = getStatusConfig(version.status);
                            const slaBadge = getSLABadge(version.prazoInicialDiasUteis || 0, version.prazoCumpridoDiasUteis);
                            const diasRestantes = getDiasRestantes(version);
                            const prazoClasses = getPrazoColorClasses(diasRestantes);
                            return (
                              <React.Fragment key={version.id}>
                              <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs font-medium">V{version.numeroRevisao}</Badge>
                                    <Badge className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.icon}<span className="ml-1">{statusConfig.label}</span></Badge>
                                    <Badge className={`text-xs font-medium ${slaBadge.color}`}>{slaBadge.label}</Badge>
                                    <Badge className={`text-xs font-medium ${prazoClasses.badge}`}>{diasRestantes === null ? 'Sem prazo' : diasRestantes < 0 ? `${Math.abs(diasRestantes)}d atrasado` : `${diasRestantes}d restantes`}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                                    {(showAllRevisions || versions[0].id !== version.id) && (
                                      <Button size="sm" variant="ghost" aria-label={expandedRevisions[version.id] ? 'Recolher detalhes' : 'Expandir detalhes'} className="h-7 px-2 text-gray-600" onClick={() => { setExpandedRevisions(prev => ({ ...prev, [version.id]: !prev[version.id] })); requestAnimationFrame(unlockScroll); setTimeout(unlockScroll, 0); }}>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedRevisions[version.id] ? 'rotate-180' : ''}`} />
                              </Button>
                          )}
                        </div>
                      </div>
                                {(expandedRevisions[version.id] ?? true) && (
                                  <>
                                    <div className="text-xs text-gray-700 space-y-1 mb-3">
                                      <p><strong>Autor:</strong> {version.autorNome}</p>
                                      <p><strong>Cargo:</strong> {version.autorCargo || 'Não informado'}</p>
                                      <p><strong>Gerência:</strong> {version.autorGerencia || 'Não informado'}</p>
                                      <p><strong>Criado:</strong> {formatDateTimeBR(new Date(version.criadoEm))}</p>
                                      <p><strong>Prazo inicial:</strong> {version.prazoInicialDiasUteis || 0} dias úteis</p>
                                      <p><strong>Prazo cumprido:</strong> {version.prazoCumpridoDiasUteis !== undefined ? `${version.prazoCumpridoDiasUteis} dias úteis` : 'Não enviado'}</p>
                  </div>
                                    {version.documentoNome && (
                                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                           <div className="flex items-center gap-2">
                                          <File className="w-4 h-4 text-blue-600" />
                                          <span className="text-sm font-medium text-blue-800">{version.documentoNome}</span>
                           </div>
                                        <div className="flex items-center gap-1">
                                          <Button size="sm" variant="outline" aria-label="Visualizar documento" className="h-7 w-7 p-0 hover:bg-blue-50"><Eye className="w-3 h-3" /></Button>
                                          <Button size="sm" variant="outline" aria-label="Baixar documento" className="h-7 w-7 p-0 hover:bg-green-50"><Download className="w-3 h-3" /></Button>
                         </div>
                       </div>
                                    )}
                                  </>
                                )}
                         </div>
                              {idx < arr.length - 1 && <div className="border-b border-slate-200 my-2" />}
                              </React.Fragment>
                            );
                          })}
                          {versions.length > 1 && (
                            <div className="pt-2">
                            <Button variant="ghost" aria-label={showAllRevisions ? 'Recolher lista de versões' : 'Ver todas as versões'} className="text-sm text-purple-700 hover:text-purple-800 hover:bg-purple-50" onClick={() => setShowAllRevisions(v => !v)}>
                                {showAllRevisions ? 'Ocultar versões antigas' : 'Ver todas as versões'}
                              </Button>
                       </div>
                          )}
                   </div>
                 )}
               </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6">
              <div className="rounded-xl border shadow-sm bg-white h-full min-h-[500px]">
                <div className="px-4 py-6 rounded-t-xl border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-green-600" />
                      Anexos
                    </h3>
                    <span className="text-xs text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md font-medium">{anexos.length}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                      <div className="w-full">
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg,.gif,.bmp,.tif,.tiff" className="hidden" onChange={handleFileUpload} />
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full h-9 border-dashed border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors text-sm">
                        <Upload className="w-4 h-4 mr-2" />Adicionar Anexo
                        </Button>
                 </div>
                      <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-xs text-slate-500 whitespace-nowrap">Ordenar:</span>
                          <div className="relative flex-1 sm:flex-none">
                          <select aria-label="Ordenar anexos" value={attachmentsSort} onChange={(e) => setAttachmentsSort(e.target.value as 'desc' | 'asc')} className="w-full h-7 rounded-md border border-slate-200 bg-white px-2 pr-6 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer hover:border-slate-300">
                              <option value="desc">Mais recente</option>
                              <option value="asc">Menos recente</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 pointer-events-none">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                          </div>
                        </div>
                      </div>
                      {anexos.length === 0 ? (
                        <div className="pt-4">
                          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                          <p className="text-center text-gray-500 font-medium">Nenhum anexo adicionado</p>
                      </div>
                      ) : (
                      <div className={`${anexos.length > 6 ? 'max-h-[450px] overflow-y-auto' : ''} space-y-0`}>
                        {anexosOrdenados.map((anexo, idx) => (
                            <React.Fragment key={anexo.id}>
                            <div className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="p-2 bg-slate-100 rounded-lg">
                                    <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{anexo.nome}</p>
                                    <p className="text-xs text-gray-500 hidden sm:block">{anexo.autorNome} • {formatDate(anexo.criadoEm)}</p>
                                    <p className="text-xs text-gray-500 sm:hidden">{anexo.autorNome} • {formatDate(anexo.criadoEm)}</p>
                      </div>
                        </div>
                                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                                <Button size="sm" variant="outline" aria-label="Visualizar" className="h-7 w-7 p-0 hover:bg-blue-50" onClick={() => openInNewTab(anexo.urlDownload)}><Eye className="w-3 h-3" /></Button>
                                <Button size="sm" variant="outline" aria-label="Baixar" className="h-7 w-7 p-0 hover:bg-green-50"><Download className="w-3 h-3" /></Button>
                                <Button size="sm" variant="outline" aria-label="Remover" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteAnexo(anexo.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                            {idx < anexosOrdenados.length - 1 && <div className="border-b border-slate-200" />}
                            </React.Fragment>
                          ))}
                  </div>
                      )}
               </div>
             </div>
        </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3️⃣ Painel da Etapa */}
      <div className="card-shell mb-8 min-h-[700px]">
        <header className="flex items-center gap-3 mb-4">
          <ClipboardCheck className="w-6 h-6 text-green-600" />
          <h2 className="text-lg font-bold text-slate-900">Painel da Etapa</h2>
          <div className="ml-auto">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Checklist</span>
          </div>
        </header>
        <div className="border-b-2 border-green-200 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-800">Status & Prazo</h3>
              </div>
              <Badge className={`text-sm font-semibold px-3 py-2 ${getStatusClasses(getEtapaStatus())}`}>{getEtapaStatus()}</Badge>
            </header>
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                    <Calendar className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Data de Criação</p>
                    <p className="text-lg font-bold text-slate-900">{formatDateBR(currentVersion.criadoEm)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                      <Clock className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Prazo Inicial</p>
                      <p className="text-lg font-bold text-slate-900">{formatDateBR(currentVersion.criadoEm)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border border-slate-300 text-slate-700">{currentVersion.prazoInicialDiasUteis || 5} dias úteis</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                      <Flag className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Prazo Final</p>
                      <p className="text-lg font-bold text-slate-900">{formatDateBR(getPrazoFinalPrevisto().toISOString())}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border border-slate-300 text-slate-700">prazo limite</span>
                  </div>
                </div>
                {etapaConcluida && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border border-green-300">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-600">Prazo Cumprido</p>
                          <p className="text-lg font-bold text-green-700">{formatDateBR(etapaConcluida.dataConclusao)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border border-green-300 text-green-700">{getTempoDecorrido().diasUteis} dias úteis</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-200 my-3 pt-4">
                      {(() => {
                        const diasRest = getDiasRestantes(currentVersion);
                      const prazo = classesPrazo(diasRest);
                  const isAtraso = diasRest !== null && diasRest < 0;
                        return (
                    <div className="text-center py-4">
                      <div className={`text-3xl font-bold ${prazo.text} mb-2`}>{diasRest === null ? '—' : Math.abs(diasRest)}</div>
                      <div className={`text-sm font-medium ${prazo.text}`}>{legendaDiasRestantes(diasRest)}</div>
                    </div>
                        );
                      })()}
                </div>
              <div className="space-y-2">
                {(() => { const inicio = currentVersion.criadoEm; const fim = getPrazoFinalPrevisto().toISOString(); return (
                  <ProgressaoTemporal startISO={inicio} endISO={fim} />
                ); })()}
              </div>
                </div>
              </div>

          <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-800">Checklist da Etapa</h3>
              </div>
              {(() => {
                const checklist = generateChecklist();
                const pendentes = checklist.filter(i => i.status === 'pending').length;
                const total = checklist.length;
                return (
                  <div className="flex items-center gap-2">
                    {pendentes > 0 && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">{pendentes} pendente{pendentes !== 1 ? 's' : ''}</span>}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{total} item{total !== 1 ? 's' : ''}</span>
                  </div>
                );
              })()}
            </header>
            <div className="space-y-1">
              {generateChecklist().length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-6">Nenhum requisito definido para esta etapa.</p>
              ) : (
                generateChecklist().map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-2 px-2 hover:bg-slate-50 rounded transition-colors cursor-pointer">
                    {getChecklistIcon(item.status)}
                    <span className="text-sm text-slate-700 flex-1">{item.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6 flex flex-col min-h-[320px]">
            <header className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-800">Mini Timeline</h3>
            </header>
            <div className="flex-1 flex flex-col">
              {generateTimeline().length === 0 ? (
                <div className="flex-1 flex items-center justify-center"><p className="text-sm text-gray-500 italic text-center">Ainda não há ações registradas.</p></div>
              ) : (
                <>
                  <div className="flex-1 relative pr-2">
                    <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                    <div className="max-h-[280px] overflow-y-auto">
                      <div className="flex flex-col gap-4 pl-6">
                        {generateTimeline().map(item => (
                          <div key={item.id} className="relative group">
                            <div className="absolute -left-6 top-0 w-4 h-4 bg-white rounded-full flex items-center justify-center">{getTimelineIcon(item)}</div>
                            <div className="hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors cursor-pointer">
                              <p className="text-sm font-semibold text-slate-700 mb-1">{item.descricao}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500"><span>{item.autor}</span><span>•</span><span>{formatDateTimeBR(new Date(item.dataHora))}</span></div>
                        </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-3 mt-4">
                    <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 hover:underline transition-colors" aria-label="Ver histórico completo de ações">Ver todas as ações</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4️⃣ Comentários */}
      <div className="w-full">
        <div className="card-shell">
          <CommentsSection processoId={processoId} etapaId={String(etapaId)} cardId="etp-form" title="Comentários" />
                        </div>
      </div>

      {/* 5️⃣ Ações da Etapa */}
      <div className="card-shell mb-8">
        <header className="flex items-center gap-3 mb-4">
          <Flag className="w-6 h-6 text-orange-600" />
          <h2 className="text-lg font-bold text-slate-900">Ações da Etapa</h2>
          <div className="ml-auto"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Ações</span></div>
        </header>
        <div className="border-b-2 border-orange-200 mb-6"></div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300"><Clock className="w-5 h-5 text-slate-600" /></div>
                          <div>
                <p className="text-sm font-semibold text-slate-500">Prazo</p>
                <p className={`text-lg font-bold ${(() => { const diasRest = getDiasRestantes(currentVersion); const prazo = getPrazoColorClasses(diasRest); return prazo.text; })()}`}>
                  {(() => { const diasRest = getDiasRestantes(currentVersion); return diasRest === null ? 'Sem prazo' : diasRest < 0 ? `${Math.abs(diasRest)} dias atrasado` : `${diasRest} dias restantes`; })()}
                </p>
                          </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300"><User className="w-5 h-5 text-slate-600" /></div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Responsável</p>
                <p className="text-lg font-bold text-slate-900">{currentVersion.autorNome || 'Sem responsável'}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4">
            {etapaConcluida ? (
              <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-green-600">Etapa Concluída</p>
                    <p className="text-sm text-green-700">{formatDate(etapaConcluida.dataConclusao)} por {etapaConcluida.usuarioNome}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {permissoes.podeEditar && currentVersion.status === 'rascunho' && (
                  <Button onClick={handleSaveRevision} variant="outline" disabled={isLoading} size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50"><Save className="w-4 h-4 mr-2" />Salvar Rascunho</Button>
                )}
                <Button onClick={handleFinalizar} variant="outline" disabled={!canFinalizar() || isLoading || !permissoes.podeEditar || currentVersion.status !== 'rascunho'} size="sm" className="border-green-300 text-green-700 hover:bg-green-50"><CheckCircle2 className="w-4 h-4 mr-2" />Finalizar</Button>
                <Button onClick={handleSendToSignature} variant="outline" disabled={!canSendToSignature() || isLoading || !permissoes.podeEditar} size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50"><Send className="w-4 h-4 mr-2" />Enviar para Assinatura</Button>
                {canShowConcluirButton() && (
                  <Button onClick={handleOpenConcluirModal} variant="outline" disabled={!canConcluirEtapa() || isLoading} size="sm" className="border-green-300 text-green-700 hover:bg-green-50"><Flag className="w-4 h-4 mr-2" />Concluir Etapa</Button>
                )}
                {!permissoes.podeEditar && (<div className="flex items-center gap-2 text-sm text-gray-500"><Info className="w-4 h-4" />Somente visualização</div>)}
                  </div>
                )}
              </div>
          {currentVersion.enviadoParaAssinaturaEm && (
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                <span>Enviado para assinatura em {formatDateBR(currentVersion.enviadoParaAssinaturaEm)}</span>
              </div>
                  </div>
                )}
            </div>
        </div>

      {/* Modais */}
        <Dialog open={showConcluirModal} onOpenChange={setShowConcluirModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Flag className="w-5 h-5 text-green-600" />Concluir Etapa</DialogTitle>
            <DialogDescription>Concluir a etapa Elaboração do ETP para o processo {processoId}?</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
              <Label htmlFor="observacao" className="text-sm font-medium">Observações de conclusão (opcional)</Label>
              <Textarea id="observacao" value={observacaoConclusao} onChange={(e) => setObservacaoConclusao(e.target.value)} placeholder="Adicione observações sobre a conclusão da etapa..." className="min-h-[80px] resize-none" />
              </div>
              <div className="flex items-center space-x-2">
              <Checkbox id="notificar" checked={notificarPartes} onCheckedChange={(checked) => setNotificarPartes(checked as boolean)} />
              <Label htmlFor="notificar" className="text-sm font-medium">Notificar partes interessadas</Label>
              </div>
            <Alert><AlertCircle className="h-4 w-4" /><AlertDescription><strong>Atenção:</strong> Ao concluir esta etapa, o card será bloqueado para edição e a próxima etapa do fluxo será habilitada.</AlertDescription></Alert>
            </div>
            <div className="flex justify-end gap-3 pt-4 pb-2">
            <Button variant="outline" onClick={() => setShowConcluirModal(false)} disabled={isLoading}>Cancelar</Button>
            <Button onClick={handleConcluirEtapa} disabled={isLoading} className="bg-green-600 hover:bg-green-700">{isLoading ? (<><RotateCcw className="w-4 h-4 mr-2 animate-spin" />Concluindo...</>) : (<><Flag className="w-4 h-4 mr-2" />Concluir Etapa</>)}</Button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}
