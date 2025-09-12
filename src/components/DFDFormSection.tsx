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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  CheckCircle,
  XCircle,
  // Removido: AlertTriangle não é mais usado
  Eye,
  History,
  Upload,
  Plus,
  Download,
  Info,
  Trash2,
  Save,
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
  Edit,
  MoreHorizontal,
  ArrowLeftRight
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/date';
import CommentsSection from './CommentsSection';
import ResponsavelSelector from './ResponsavelSelector';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';

// Tipos TypeScript conforme especificação
type DFDVersionStatus = 'rascunho' | 'finalizada' | 'enviada_para_analise' | 'aprovada' | 'reprovada';

interface DFDVersion {
  id: string;
  numeroVersao: number;
  status: DFDVersionStatus;
  autorId: string;
  autorNome: string;
  autorCargo?: string;
  autorGerencia?: string;
  autorEmail?: string;
  criadoEm: string;
  atualizadoEm: string;
  enviadoParaAnaliseEm?: string;
  finalizadoEm?: string;
  prazoDiasUteis?: number;
  prazoInicialDiasUteis?: number;
  prazoCumpridoDiasUteis?: number;
  documentoUrl?: string;
  documentoNome?: string;
  payload: {
    objeto: string;
    areaSetorDemandante: string;
    responsaveis: {
      id: string;
      nome: string;
      cargo: string;
      gerencia: string;
    }[];
    dataElaboracao: string;
    numeroDFD: string;
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

interface PermissoesDFD {
  podeEditar: boolean;
  podeCriarNovaVersao: boolean;
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

interface DFDFormSectionProps {
  processoId: string;
  etapaId: number;
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
const mockVersions: DFDVersion[] = [
  {
    id: 'v1',
    numeroVersao: 1,
    status: 'enviada_para_analise',
    autorId: 'user1',
    autorNome: 'Lucas Moreira Brito',
    autorCargo: 'Analista de Projetos',
    autorGerencia: 'GSP - Gerência de Soluções e Projetos',
    autorEmail: 'lucas.brito@hospital.gov.br',
    criadoEm: '2024-01-15T14:30:00Z',
    atualizadoEm: '2024-01-18T16:45:00Z',
    enviadoParaAnaliseEm: '2024-01-18T16:45:00Z',
    prazoDiasUteis: 7,
    prazoInicialDiasUteis: 7,
    prazoCumpridoDiasUteis: 3,
    documentoUrl: '#',
    documentoNome: 'DFD_V1_LucasMoreiraBrito.pdf',
    payload: {
      objeto: 'Contratação de serviços de limpeza hospitalar para modernização das instalações',
      areaSetorDemandante: 'GRH - Gerência de Recursos Humanos',
      responsaveis: [
        {
          id: 'user1',
          nome: 'Lucas Moreira Brito',
          cargo: 'Analista de Projetos',
          gerencia: 'GSP - Gerência de Soluções e Projetos'
        }
      ],
      dataElaboracao: '2024-01-15',
      numeroDFD: 'DFD-2024-001',
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



export default function DFDFormSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true,
  gerenciaCriadora
}: DFDFormSectionProps) {
  const { user } = useUser();
  const { toast } = useToast();
  
  // Estados principais
  const [versions, setVersions] = useState<DFDVersion[]>(mockVersions);
  const [currentVersion, setCurrentVersion] = useState<DFDVersion>(mockVersions[0]);
  const [formData, setFormData] = useState(currentVersion.payload);
  const [anexos, setAnexos] = useState<Anexo[]>(mockAnexos);
  const [attachmentsSort, setAttachmentsSort] = useState<'desc' | 'asc'>('desc'); // desc = mais recente primeiro
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({});



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
  const [activeTab, setActiveTab] = useState('versoes');
  
  // Estados para conclusão da etapa
  const [showConcluirModal, setShowConcluirModal] = useState(false);
  const [observacaoConclusao, setObservacaoConclusao] = useState('');
  const [notificarPartes, setNotificarPartes] = useState(true);
  const [etapaConcluida, setEtapaConcluida] = useState<ConclusaoEtapa | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const permissoes: PermissoesDFD = {
    podeEditar: (isGerenciaResponsavel(user?.gerencia || '', gerenciaCriadora || '') || user?.gerencia?.includes('GSP') || false) && !etapaConcluida,
    podeCriarNovaVersao: canCreateNewVersion() && !etapaConcluida,
    podeUploadAnexo: (isGerenciaResponsavel(user?.gerencia || '', gerenciaCriadora || '') || user?.gerencia?.includes('GSP') || false) && !etapaConcluida,
    podeRemoverAnexo: (isGerenciaResponsavel(user?.gerencia || '', gerenciaCriadora || '') || user?.gerencia?.includes('GSP') || false) && !etapaConcluida,
    podeConcluirEtapa: canConcluirEtapa()
  };

  // Verificar se pode criar nova versão
  function canCreateNewVersion(): boolean {
    if (!currentVersion) return false;
    return ['finalizada', 'enviada_para_analise', 'aprovada'].includes(currentVersion.status);
  }

  // Verificar se pode enviar para análise
  function canSendToAnalysis(): boolean {
    return formData.objeto.trim() !== '' && 
           formData.areaSetorDemandante.trim() !== '' && 
           formData.responsaveis && formData.responsaveis.length > 0;
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
    const camposObrigatoriosOk = canSendToAnalysis();

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
  const handleSaveVersion = async () => {
    setIsLoading(true);
    try {
      const updatedVersion: DFDVersion = {
        ...currentVersion,
        status: 'rascunho',
        atualizadoEm: new Date().toISOString(),
        payload: formData
      };
      
      setCurrentVersion(updatedVersion);
      setVersions(prev => prev.map(v => v.id === updatedVersion.id ? updatedVersion : v));
      
      toast({
        title: "Versão salva",
        description: "Rascunho salvo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar versão.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToAnalysis = async () => {
    if (!canSendToAnalysis()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de enviar para análise.",
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

      const updatedVersion: DFDVersion = {
        ...currentVersion,
        status: 'enviada_para_analise',
        enviadoParaAnaliseEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        prazoCumpridoDiasUteis: prazoCumprido,
        payload: formData
      };
      
      setCurrentVersion(updatedVersion);
      setVersions(prev => prev.map(v => v.id === updatedVersion.id ? updatedVersion : v));
      
      toast({
        title: "Enviado para análise",
        description: "DFD enviado para análise técnica com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar para análise.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewVersion = async () => {
    if (!canCreateNewVersion()) return;

    setIsLoading(true);
    try {
      const newVersionNumber = Math.max(...versions.map(v => v.numeroVersao)) + 1;
      const newVersion: DFDVersion = {
        id: `v${newVersionNumber}`,
        numeroVersao: newVersionNumber,
        status: 'rascunho',
        autorId: user?._id || 'user1',
        autorNome: user?.nome || 'Usuário Atual',
        autorCargo: user?.cargo,
        autorGerencia: user?.gerencia,
        autorEmail: user?.email,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        prazoDiasUteis: 7,
        prazoInicialDiasUteis: 7,
        payload: {
          ...currentVersion.payload,
          objeto: ''
        }
      };
      
      setVersions(prev => [newVersion, ...prev]);
      setCurrentVersion(newVersion);
      setFormData(newVersion.payload);
      setExpandedVersions(prev => ({ ...prev, [newVersion.id]: true }));
      
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
  const getDiasRestantes = (version: DFDVersion): number | null => {
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

  // Expandir somente a versão mais recente por padrão
  useEffect(() => {
    if (versions.length > 0) {
      setExpandedVersions(prev => {
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

      // Mock da chamada POST /processos/:processoId/etapas/elaboracao-dfd/concluir
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
        description: "A etapa Elaboração do DFD foi concluída com sucesso.",
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



  const getStatusConfig = (status: DFDVersionStatus) => {
    switch (status) {
      case 'rascunho':
        return { label: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-3 h-3" /> };
      case 'finalizada':
        return { label: 'Finalizada', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3" /> };
      case 'enviada_para_analise':
        return { label: 'Enviada para Análise', color: 'bg-blue-100 text-blue-800', icon: <Send className="w-3 h-3" /> };
      case 'aprovada':
        return { label: 'Aprovada', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="w-3 h-3" /> };
      case 'reprovada':
        return { label: 'Reprovada', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" /> };
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

  // Formata o número do DFD para o padrão "DFD 006/2025" apenas para exibição
  const formatNumeroDFD = (value: string): string => {
    if (!value) return '';

    // Já está no formato desejado
    const desired = /^DFD\s+\d{3}\/\d{4}$/i;
    if (desired.test(value)) {
      return value.replace(/\s+/, ' ').toUpperCase();
    }

    // Padrões comuns: DFD-2024-001, DFD_2024_001, DFD 2024 1, 001/2024, DFD 1/2024
    let match = /DFD[-_\s]?(\d{4})[-_\s]?(\d{1,4})/i.exec(value);
    if (match) {
      const year = match[1];
      const num = match[2].padStart(3, '0');
      return `DFD ${num}/${year}`;
    }

    match = /(?:DFD)?\s*(\d{1,4})\/(\d{4})/i.exec(value);
    if (match) {
      const num = match[1].padStart(3, '0');
      const year = match[2];
      return `DFD ${num}/${year}`;
    }

    const yearOnly = /(\d{4})/.exec(value);
    const lastNum = /(\d{1,4})(?!.*\d)/.exec(value);
    if (yearOnly && lastNum) {
      const year = yearOnly[1];
      const num = lastNum[1].padStart(3, '0');
      return `DFD ${num}/${year}`;
    }

    return value;
  };

  return (
    <div className="bg-white">
      {/* Container central ocupando toda a área */}
      <div className="w-full px-2">
        {/* Grid principal 12 colunas */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* ESQUERDA: Formulário do DFD */}
          <section id="formulario-dfd" className="col-span-12 lg:col-span-8 w-full">
            
            {/* Card do Formulário */}
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-indigo-100 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Formulário do DFD
                </div>
              </header>
              <div className="p-4 md:p-6 space-y-0">
                {/* Grupo: Número/Data */}
                <div className="w-full p-4 border-b border-slate-200 my-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      <Label htmlFor="numeroDFD" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4" />
                        Número do DFD
                      </Label>
                      <Input
                        id="numeroDFD"
                        value={formatNumeroDFD(formData.numeroDFD)}
                        readOnly
                        className="w-full bg-gray-50 border-gray-200 text-gray-600"
                      />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <Label htmlFor="dataElaboracao" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" />
                        Data da Elaboração
                      </Label>
                      <Input
                        id="dataElaboracao"
                        value={formatDate(formData.dataElaboracao)}
                        readOnly
                        className="w-full bg-gray-50 border-gray-200 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 3 - Objeto da Contratação */}
                <div className="w-full p-4 border-b border-slate-200 my-4">
                  <Label htmlFor="objeto" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4" />
                    Objeto da Contratação *
                  </Label>
                  <Textarea
                    id="objeto"
                    value={formData.objeto}
                    onChange={(e) => setFormData({...formData, objeto: e.target.value})}
                    placeholder="Descreva o objeto da contratação..."
                    disabled={!permissoes.podeEditar || currentVersion.status !== 'rascunho'}
                    className="w-full min-h-[100px] resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  />
                </div>

                {/* 4 - (Removido) Grau de Prioridade */}

                {/* 5 - Área/Setor Demandante */}
                <div className="w-full p-4 border-b border-slate-200 my-4">
                  <Label htmlFor="areaSetor" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4" />
                    Área/Setor Demandante
                  </Label>
                  <Input
                    id="areaSetor"
                    value={formData.areaSetorDemandante}
                    readOnly
                    className="w-full bg-gray-50 border-gray-200 text-gray-600"
                  />
                </div>

                {/* 6 - Responsáveis pela Elaboração */}
                <ResponsavelSelector
                  value={formData.responsaveis || []}
                  onChange={(responsaveis) => {
                    salvarResponsaveis(responsaveis || []);
                  }}
                  disabled={!permissoes.podeEditar || currentVersion.status !== 'rascunho'}
                  canEdit={permissoes.podeEditar}
                  processoId={processoId}
                  className="w-full border-b border-slate-200 my-4"
                  maxResponsaveis={5}
                />
              </div>
            </div>
          </section>

          {/* DIREITA: Gerenciamento (Versões/Anexos) */}
          <aside id="gerenciamento" className="col-span-12 lg:col-span-4 w-full flex flex-col">
            
            {/* Card com Abas */}
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white flex-1 flex flex-col">
              <header className="bg-purple-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Gerenciamento
                </div>
              </header>
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-none">
                    <TabsTrigger value="versoes">Versões</TabsTrigger>
                    <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  </TabsList>
                  
                  {/* Aba Versões */}
                  <TabsContent value="versoes" className="mt-0 p-4 flex-1 flex flex-col">
                    <div className="space-y-4 w-full flex-1 flex flex-col">
                      {/* Botão Criar Nova Versão */}
                      {permissoes.podeCriarNovaVersao && (
                        <Button
                          onClick={handleCreateNewVersion}
                          variant="outline"
                          className="w-full border-dashed border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Nova Versão
                        </Button>
                      )}

                      {/* Lista de Versões */}
                      {versions.length === 0 ? (
                        <div className="text-center py-8 w-full">
                          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Ainda não há versões criadas</p>
                        </div>
                      ) : (
                        <div className="space-y-3 w-full overflow-y-auto max-h-[400px]">
                          {!showAllVersions && (
                            <div className="text-sm font-semibold text-purple-700">Última versão</div>
                          )}
                          {(showAllVersions ? versions : [versions[0]]).map((version, idx, arr) => {
                            const statusConfig = getStatusConfig(version.status);
                            const slaBadge = getSLABadge(version.prazoInicialDiasUteis || 0, version.prazoCumpridoDiasUteis);
                            const diasRestantes = getDiasRestantes(version);
                            const prazoClasses = getPrazoColorClasses(diasRestantes);
                            
                            return (
                              <React.Fragment key={version.id}>
                              <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors w-full">
                                <div className="flex items-center justify-between mb-3 w-full">
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-xs font-medium">
                                      V{version.numeroVersao}
                                    </Badge>
                                    <Badge className={`text-xs font-medium ${statusConfig.color}`}>
                                      {statusConfig.icon}
                                      <span className="ml-1">{statusConfig.label}</span>
                                    </Badge>
                                    <Badge className={`text-xs font-medium ${slaBadge.color}`}>
                                      {slaBadge.label}
                                    </Badge>
                                    <Badge className={`text-xs font-medium ${prazoClasses.badge}`}>
                                      {diasRestantes === null ? 'Sem prazo' : diasRestantes < 0 ? `${Math.abs(diasRestantes)}d atrasado` : `${diasRestantes}d restantes`}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {(showAllVersions || versions[0].id !== version.id) && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        aria-label={expandedVersions[version.id] ? 'Recolher detalhes' : 'Expandir detalhes'}
                                        className="h-7 px-2 text-gray-600"
                                        onClick={() => setExpandedVersions(prev => ({ ...prev, [version.id]: !prev[version.id] }))}
                                      >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedVersions[version.id] ? 'rotate-180' : ''}`} />
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {(expandedVersions[version.id] ?? true) && (
                                  <>
                                    <div className="text-xs text-gray-700 space-y-1 mb-3 w-full">
                                      <p><strong>Autor:</strong> {version.autorNome}</p>
                                      <p><strong>Cargo:</strong> {version.autorCargo || 'Não informado'}</p>
                                      <p><strong>Gerência:</strong> {version.autorGerencia || 'Não informado'}</p>
                                      <p><strong>Criado:</strong> {formatDateTimeBR(new Date(version.criadoEm))}</p>
                                      <p><strong>Prazo inicial:</strong> {version.prazoInicialDiasUteis || 0} dias úteis</p>
                                      <p><strong>Prazo cumprido:</strong> {version.prazoCumpridoDiasUteis !== undefined ? `${version.prazoCumpridoDiasUteis} dias úteis` : 'Não enviado'}</p>
                                    </div>

                                    {version.documentoNome && (
                                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200 w-full">
                                        <div className="flex items-center gap-2">
                                          <File className="w-4 h-4 text-blue-600" />
                                          <span className="text-sm font-medium text-blue-800">{version.documentoNome}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button size="sm" variant="outline" aria-label="Visualizar documento" className="h-7 w-7 p-0 hover:bg-blue-50">
                                            <Eye className="w-3 h-3" />
                                          </Button>
                                          <Button size="sm" variant="outline" aria-label="Baixar documento" className="h-7 w-7 p-0 hover:bg-green-50">
                                            <Download className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                              {idx < arr.length - 1 && (
                                <div className="border-b border-slate-200 my-2" />
                              )}
                              </React.Fragment>
                            );
                          })}
                          {versions.length > 1 && (
                            <div className="pt-2">
                              <Button
                                variant="ghost"
                                aria-label={showAllVersions ? 'Recolher lista de versões' : 'Ver todas as versões'}
                                className="text-sm text-purple-700 hover:text-purple-800 hover:bg-purple-50"
                                onClick={() => setShowAllVersions(v => !v)}
                              >
                                {showAllVersions ? 'Ocultar versões antigas' : 'Ver todas as versões'}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Aba Anexos */}
                  <TabsContent value="anexos" className="mt-0 p-3">
                    <div className="space-y-3 w-full">
                      {/* Upload no topo */}
                      <div className="w-full">
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg,.gif,.bmp,.tif,.tiff" className="hidden" onChange={handleFileUpload} />
                        <Button onClick={()=>fileInputRef.current?.click()} variant="outline" className="w-full h-9 border-dashed border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors text-sm">
                          <Upload className="w-4 h-4 mr-2"/>Adicionar Anexo
                        </Button>
                      </div>
                      {/* Filtro de Ordenação */}
                      <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-800">Anexos</h3>
                          <span className="text-xs text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md font-medium">
                            {anexos.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-xs text-slate-500 whitespace-nowrap">Ordenar:</span>
                          <div className="relative flex-1 sm:flex-none">
                            <select
                              aria-label="Ordenar anexos"
                              value={attachmentsSort}
                              onChange={(e) => setAttachmentsSort(e.target.value as 'desc' | 'asc')}
                              className="w-full h-7 rounded-md border border-slate-200 bg-white px-2 pr-6 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer hover:border-slate-300"
                            >
                              <option value="desc">Mais recente</option>
                              <option value="asc">Menos recente</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 pointer-events-none">
                              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lista */}
                      {anexos.length === 0 ? (
                        <div className="pt-4">
                          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-center text-gray-500 font-medium">Nenhum anexo adicionado</p>
                        </div>
                      ) : (
                        <div className={`${anexos.length > 6 ? 'max-h-[280px] overflow-y-auto' : ''} space-y-0 w-full`}>
                          {anexosOrdenados.map((anexo, idx)=>(
                            <React.Fragment key={anexo.id}>
                              <div className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors w-full">
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
                                  <Button size="sm" variant="outline" aria-label="Visualizar" className="h-7 w-7 p-0 hover:bg-blue-50" onClick={()=>openInNewTab(anexo.urlDownload)}>
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" aria-label="Baixar" className="h-7 w-7 p-0 hover:bg-green-50">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" aria-label="Remover" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={()=>handleDeleteAnexo(anexo.id)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              {idx < anexosOrdenados.length-1 && (<div className="border-b border-slate-200" />)}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </aside>

          {/* FULL: Comentários */}
          <section id="comentarios" className="col-span-12 w-full">
            <CommentsSection
              processoId={processoId}
              etapaId={String(etapaId)}
              cardId="dfd-form"
              title="Comentários"
            />
          </section>

          {/* FULL: Ações (rodapé não fixo) */}
          <section id="acoes" className="col-span-12 w-full mt-4 pb-2">
            {/* Rodapé com Botões de Ação */}
            <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                  
                  {/* Lado esquerdo - Status e informações */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const diasRest = getDiasRestantes(currentVersion);
                        const prazo = getPrazoColorClasses(diasRest);
                        return (
                          <>
                            <Clock className={`w-4 h-4 ${prazo.text}`} />
                            <span className={`text-sm ${prazo.text}`}>
                              {diasRest === null ? 'Sem prazo' : diasRest < 0 ? `${Math.abs(diasRest)} dia(s) atrasado` : `${diasRest} dia(s) restantes`}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {currentVersion.autorNome || 'Sem responsável definido'}
                      </span>
                    </div>
                  </div>

                  {/* Lado direito - Botões de ação */}
                  <div className="flex items-center gap-2">
                  {/* Botão Salvar Versão */}
                  {permissoes.podeEditar && currentVersion.status === 'rascunho' && !etapaConcluida && (
                    <Button 
                      onClick={handleSaveVersion} 
                      variant="outline" 
                      disabled={isLoading}
                      aria-label="Salvar versão"
                      className="border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Versão
                    </Button>
                  )}
                  
                  {/* Botão Enviar para Análise */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button 
                            onClick={handleSendToAnalysis} 
                            variant="outline" 
                            disabled={!canSendToAnalysis() || isLoading || !permissoes.podeEditar || currentVersion.status !== 'rascunho' || !!etapaConcluida}
                            aria-label="Enviar para análise técnica"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar para Análise Técnica
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!canSendToAnalysis() && (
                        <TooltipContent>
                          <p>Preencha os campos obrigatórios</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                  {/* Botão Concluir Etapa */}
                  {canShowConcluirButton() && !etapaConcluida && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button 
                              onClick={handleOpenConcluirModal} 
                              variant="default" 
                              disabled={!canConcluirEtapa() || isLoading}
                              aria-label="Concluir etapa"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              Concluir Etapa
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {!canConcluirEtapa() && (
                          <TooltipContent>
                            <p>É necessário enviar uma versão para análise antes de concluir a etapa.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {!permissoes.podeEditar && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Info className="w-4 h-4" />
                      Somente visualização
                    </div>
                  )}
                </div>
                
                {/* Informações de Status */}
                {(currentVersion.status === 'enviada_para_analise' || etapaConcluida) && (
                  <div className="text-sm text-gray-500 mt-2">
                    {currentVersion.status === 'enviada_para_analise' && (
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Enviado para análise em {formatDate(currentVersion.enviadoParaAnaliseEm || '')}
                      </span>
                    )}
                    {etapaConcluida && (
                      <span className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Concluída em {formatDate(etapaConcluida.dataConclusao)} por {etapaConcluida.usuarioNome}
                      </span>
                    )}
                  </div>
                )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Modal de Confirmação de Conclusão */}
        <Dialog open={showConcluirModal} onOpenChange={setShowConcluirModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-green-600" />
                Concluir Etapa
              </DialogTitle>
              <DialogDescription>
                Concluir a etapa Elaboração do DFD para o processo {processoId}?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Observações de conclusão */}
              <div className="space-y-2">
                <Label htmlFor="observacao" className="text-sm font-medium">
                  Observações de conclusão (opcional)
                </Label>
                <Textarea
                  id="observacao"
                  value={observacaoConclusao}
                  onChange={(e) => setObservacaoConclusao(e.target.value)}
                  placeholder="Adicione observações sobre a conclusão da etapa..."
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Checkbox de notificação */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notificar"
                  checked={notificarPartes}
                  onCheckedChange={(checked) => setNotificarPartes(checked as boolean)}
                />
                <Label htmlFor="notificar" className="text-sm font-medium">
                  Notificar partes interessadas
                </Label>
              </div>

              {/* Resumo da ação */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> Ao concluir esta etapa, o card será bloqueado para edição e a próxima etapa do fluxo será habilitada.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex justify-end gap-3 pt-4 pb-2">
              <Button
                variant="outline"
                onClick={() => setShowConcluirModal(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConcluirEtapa}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Concluindo...
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4 mr-2" />
                    Concluir Etapa
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 