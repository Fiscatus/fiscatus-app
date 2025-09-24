import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Square,
  Hash,
  ChevronDown,
  Flag,
  PenTool,
  Users,
  UserPlus,
  UserMinus,
  GripVertical,
  FileCheck,
  Printer,
  Shield,
  Settings,
  ClipboardCheck,
  ListChecks,
  Paperclip,
  Search
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import TextareaWithMentions from './TextareaWithMentions';
import CommentsSection from './CommentsSection';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';
import ResponsavelSelector from './ResponsavelSelector';
import Timeline from '@/components/timeline/Timeline';
import { TimelineItemModel, TimelineStatus } from '@/types/timeline';

// Tipos TypeScript conforme especificação
type DespachoStatus = 'PENDENTE' | 'GERADO' | 'ASSINADO' | 'CANCELADO';

interface DespachoData {
  numeroDFD: string;
  objeto: string;
  regimeTramitacao: 'ORDINARIO' | 'URGENCIA';
  observacoes: string;
  cidadeDataEmissao: string;
  responsaveis: {
    id: string;
    nome: string;
    cargo: string;
    gerencia: string;
  }[];
  documentoUrl?: string;
  documentoNome?: string;
  assinadoPor?: {
    id: string;
    nome: string;
    cargo: string;
    dataAssinatura: string;
  };
  status: DespachoStatus;
  criadoEm: string;
  atualizadoEm: string;
}

interface Comentario {
  id: string;
  autor: string;
  cargo: string;
  data: string;
  texto: string;
  avatar?: string;
}

interface DFDDespachoSectionProps {
  processoId: string;
  etapaId: number;
  onComplete?: (data: any) => void;
  onSave?: (data: any) => void;
  initialData?: any;
  canEdit?: boolean;
  gerenciaCriadora?: string;
}

// Função para criar dados iniciais baseados nos dados do DFD
const createInitialDespachoData = (dfdData: any): DespachoData => {
  return {
    numeroDFD: dfdData?.numeroDFD || 'DFD 006/2025',
    objeto: dfdData?.objeto || 'Aquisição de equipamentos de informática para modernização dos sistemas da GSP',
    regimeTramitacao: dfdData?.regimeTramitacao || 'ORDINARIO',
    observacoes: '',
    cidadeDataEmissao: 'Brasília, 15 de janeiro de 2025',
    responsaveis: [],
    status: 'PENDENTE',
    criadoEm: '2025-01-15T10:00:00Z',
    atualizadoEm: '2025-01-15T10:00:00Z'
  };
};

// Usuários reais do sistema "Simular Usuário (Para Teste de Permissões)"
const mockUsuariosDisponiveis = [
  {
    id: 'user1',
    nome: 'Yasmin Pissolati Mattos Bretz',
    cargo: 'Gerente de Soluções e Projetos',
    gerencia: 'GSP - Gerência de Soluções e Projetos',
    email: 'yasmin.pissolati@hospital.gov.br'
  },
  {
    id: 'user2',
    nome: 'Diran Rodrigues de Souza Filho',
    cargo: 'Secretário Executivo',
    gerencia: 'SE - Secretaria Executiva',
    email: 'diran.rodrigues@hospital.gov.br'
  },
  {
    id: 'user3',
    nome: 'Gabriel Radamesis Gomes Nascimento',
    cargo: 'Assessor Jurídico',
    gerencia: 'NAJ - Assessoria Jurídica',
    email: 'gabriel.radamesis@hospital.gov.br'
  },
  {
    id: 'user4',
    nome: 'Lara Rubia Vaz Diniz Fraguas',
    cargo: 'Gerente de Suprimentos e Logística',
    gerencia: 'GSL - Gerência de Suprimentos e Logística',
    email: 'lara.fraguas@hospital.gov.br'
  },
  {
    id: 'user5',
    nome: 'Maria Eduarda Silva Santos',
    cargo: 'Gerente de Recursos Humanos',
    gerencia: 'GRH - Gerência de Recursos Humanos',
    email: 'maria.santos@hospital.gov.br'
  },
  {
    id: 'user6',
    nome: 'Guilherme de Carvalho Silva',
    cargo: 'Gerente Suprimentos e Logistica',
    gerencia: 'GSL - Gerência de Suprimentos e Logística',
    email: 'guilherme.silva@hospital.gov.br'
  },
  {
    id: 'user7',
    nome: 'Andressa Sterfany Santos da Silva',
    cargo: 'Assessora Técnica de Saúde',
    gerencia: 'GUE - Gerência de Urgência e Emergência',
    email: 'andressa.silva@hospital.gov.br'
  },
  {
    id: 'user8',
    nome: 'Leticia Bonfim Guilherme',
    cargo: 'Gerente de Licitações e Contratos',
    gerencia: 'GLC - Gerência de Licitações e Contratos',
    email: 'leticia.guilherme@hospital.gov.br'
  },
  {
    id: 'user9',
    nome: 'Dallas Kelson Francisco de Souza',
    cargo: 'Gerente Financeiro',
    gerencia: 'GFC - Gerência Financeira e Contábil',
    email: 'dallas.souza@hospital.gov.br'
  },
  {
    id: 'user10',
    nome: 'Georgia Guimaraes Pereira',
    cargo: 'Controladora Interna',
    gerencia: 'OUV - Ouvidoria',
    email: 'georgia.pereira@hospital.gov.br'
  }
];

const mockComentarios: Comentario[] = [
  {
    id: 'comentario1',
    autor: 'Yasmin Pissolati Mattos Bretz',
    cargo: 'Analista de Projetos - GSP',
    data: '2025-01-15T10:00:00Z',
    texto: 'Iniciando elaboração do despacho conforme solicitado.'
  }
];

export default function DFDDespachoSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true,
  gerenciaCriadora
}: DFDDespachoSectionProps) {
  const { user } = useUser();
  const { podeEditarCard, isGSP, isGSPouSE } = usePermissoes();
  const { toast } = useToast();
  
  // Estados principais
  const [despachoData, setDespachoData] = useState<DespachoData>(() => 
    createInitialDespachoData(initialData)
  );
  const [comentarios, setComentarios] = useState<Comentario[]>(mockComentarios);
  const [novoComentario, setNovoComentario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usuariosSelecionados, setUsuariosSelecionados] = useState<string[]>([]);
  const [showConcluirModal, setShowConcluirModal] = useState(false);
  const [observacaoConclusao, setObservacaoConclusao] = useState('');
  const [notificarPartes, setNotificarPartes] = useState(true);

  // Estados para gerenciamento de arquivos do despacho
  const [despachoArquivo, setDespachoArquivo] = useState<{ 
    name: string; 
    size: string; 
    uploadedAt: string; 
    uploadedBy: string;
    uploadedByCargo: string;
    uploadedByGerencia: string;
    uploadedByEmail: string;
  } | null>(null);
  const [showSubstituirConfirmacao, setShowSubstituirConfirmacao] = useState(false);
  const [arquivoParaSubstituir, setArquivoParaSubstituir] = useState<File | null>(null);
  const despachoFileInputRef = useRef<HTMLInputElement>(null);

  // Estados para gerenciamento de assinaturas
  const [assinantes, setAssinantes] = useState<{
    id: string;
    nome: string;
    cargo: string;
    email: string;
    status: 'PENDENTE' | 'ASSINADO' | 'CANCELADO';
    assinadoEm?: string;
  }[]>([]);
  const [assinanteSelecionado, setAssinanteSelecionado] = useState<{
    id: string;
    nome: string;
    cargo: string;
    email: string;
    status: 'PENDENTE' | 'ASSINADO' | 'CANCELADO';
    assinadoEm?: string;
  } | null>(null);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [showAdicionarAssinante, setShowAdicionarAssinante] = useState(false);

  // Gerenciamento > Anexos (replicado dos cards de assinatura)
  const [annexes, setAnnexes] = useState<Array<{id:string; name:string; uploadedAt:string; uploadedBy:string; url?:string}>>([]);
  const [attachmentsSort, setAttachmentsSort] = useState<'desc'|'asc'>('desc');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const anexosOrdenados = React.useMemo(() => {
    const arr = [...annexes];
    arr.sort((a,b)=> new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    if (attachmentsSort === 'asc') arr.reverse();
    return arr;
  }, [annexes, attachmentsSort]);
  const openInNewTab = (url?: string) => {
    if (!url) { toast({ title: 'Link indisponível', description: 'Link expirado, atualize a página ou gere novo link.', variant: 'destructive' }); return; }
    try { const win = window.open(url, '_blank'); if (!win) throw new Error('Popup bloqueado'); }
    catch { toast({ title: 'Não foi possível abrir o documento', description: 'Verifique popups ou gere novo link.', variant: 'destructive' }); }
  };

  // SLA
  const sla = {
    prazoDiasUteis: 3,
    decorridosDiasUteis: 0,
    badge: 'Em Dia'
  };

  // Progresso das assinaturas
  const totalAssinaturas = assinantes.length;
  const assinaturasConcluidas = assinantes.filter(a => a.status === 'ASSINADO').length;
  const progresso = totalAssinaturas > 0 ? (assinaturasConcluidas / totalAssinaturas) * 100 : 0;

  // Timeline (balão) — padronizada com Elaboração
  const mapToNewTimelineItems = (): TimelineItemModel[] => {
    const items: TimelineItemModel[] = [];

    // Evento: despacho gerado
    if (despachoData.status === 'GERADO' && despachoData.atualizadoEm) {
      items.push({
        id: 'despacho-gerado',
        status: 'versao',
        title: 'Despacho gerado',
        author: { name: user?.nome || 'Usuário' },
        createdAt: despachoData.atualizadoEm
      });
    }

    // Evento: despacho assinado
    if (despachoData.status === 'ASSINADO' && despachoData.assinadoPor?.dataAssinatura) {
      items.push({
        id: 'despacho-assinado',
        status: 'aprovado',
        title: 'Despacho assinado',
        author: { name: despachoData.assinadoPor?.nome || 'Usuário' },
        createdAt: despachoData.assinadoPor.dataAssinatura
      });
    }

    // Assinaturas de responsáveis
    assinantes.forEach(a => {
      if (a.assinadoEm) {
        items.push({
          id: `assinatura-${a.id}`,
          status: 'aprovado',
          title: 'Assinatura registrada',
          author: { name: a.nome },
          createdAt: a.assinadoEm
        });
      }
    });

    // Anexos recentes (até 2)
    const anexosRecentes = [...annexes]
      .sort((x, y) => new Date(y.uploadedAt).getTime() - new Date(x.uploadedAt).getTime())
      .slice(0, 2);
    anexosRecentes.forEach((ax) => {
      items.push({
        id: `anexo-${ax.id}`,
        status: 'anexo' as TimelineStatus,
        title: `Anexo adicionado: ${ax.name}`,
        author: { name: ax.uploadedBy || 'Usuário' },
        createdAt: ax.uploadedAt
      });
    });

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Verificar permissões
  const podeEditar = (user?.gerencia && (
    user.gerencia.includes('GSP') || 
    user.gerencia.includes('SE')
  )) && canEdit;

  const podeAssinar = user?.gerencia && user.gerencia.includes('SE');

  // Funções para gerenciamento de arquivos do despacho
  const handleUploadDespacho = () => {
    despachoFileInputRef.current?.click();
  };

  const handleDespachoFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se já existe um arquivo
      if (despachoArquivo) {
        // Mostrar confirmação de substituição
        setArquivoParaSubstituir(file);
        setShowSubstituirConfirmacao(true);
      } else {
        // Adicionar arquivo diretamente
        processarArquivoDespacho(file);
      }
    }
    
    // Limpar o input
    if (event.target) {
      event.target.value = '';
    }
  };

  const processarArquivoDespacho = (file: File) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }

    const arquivoInfo = {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.nome,
      uploadedByCargo: user.cargo,
      uploadedByGerencia: user.gerencia,
      uploadedByEmail: user.email
    };
    
    setDespachoArquivo(arquivoInfo);
    
    // Mock: salvar no localStorage
    localStorage.setItem(`despacho-arquivo-${processoId}`, JSON.stringify(arquivoInfo));
    
    toast({
      title: "Arquivo enviado",
      description: `${file.name} foi enviado com sucesso.`
    });
  };

  const handleConfirmarSubstituicao = () => {
    if (arquivoParaSubstituir) {
      processarArquivoDespacho(arquivoParaSubstituir);
      setArquivoParaSubstituir(null);
      setShowSubstituirConfirmacao(false);
    }
  };

  const handleCancelarSubstituicao = () => {
    setArquivoParaSubstituir(null);
    setShowSubstituirConfirmacao(false);
  };

  const handleBaixarDespacho = () => {
    if (!despachoArquivo) {
      toast({
        title: "Nenhum arquivo",
        description: "Nenhum arquivo de despacho foi enviado ainda.",
        variant: "destructive"
      });
      return;
    }

    // Mock: simular download do arquivo
    toast({
      title: "Download Iniciado",
      description: `O arquivo ${despachoArquivo.name} está sendo baixado.`
    });
  };

  const handleEditarDespacho = () => {
    despachoFileInputRef.current?.click();
  };

  const handleExcluirDespacho = () => {
    setDespachoArquivo(null);
    localStorage.removeItem(`despacho-arquivo-${processoId}`);
    
    toast({
      title: "Arquivo removido",
      description: "O arquivo de despacho foi removido com sucesso."
    });
  };

  const handleVisualizarDocumento = () => {
    if (!despachoArquivo) {
      toast({
        title: "Nenhum arquivo",
        description: "Nenhum arquivo de despacho foi enviado ainda.",
        variant: "destructive"
      });
      return;
    }

    // Mock: simular abertura do documento em nova aba
    // Em um ambiente real, isso abriria o documento em uma nova aba
    const url = `#documento-despacho-${processoId}`;
    window.open(url, '_blank');
    
    toast({
      title: "Documento aberto",
      description: "O documento foi aberto em uma nova aba."
    });
  };

  // Carregar arquivo salvo do despacho
  useEffect(() => {
    const despachoArquivoSalvo = localStorage.getItem(`despacho-arquivo-${processoId}`);
    if (despachoArquivoSalvo) {
      try {
        const arquivoData = JSON.parse(despachoArquivoSalvo);
        setDespachoArquivo(arquivoData);
      } catch (error) {
        console.error('Erro ao carregar arquivo de despacho salvo:', error);
      }
    }
  }, [processoId]);

  // Atualizar dados quando initialData mudar
  useEffect(() => {
    if (initialData) {
      setDespachoData(prevData => ({
        ...prevData,
        numeroDFD: initialData.numeroDFD || prevData.numeroDFD,
        objeto: initialData.objeto || prevData.objeto,
        regimeTramitacao: initialData.regimeTramitacao || prevData.regimeTramitacao
      }));
    }
  }, [initialData]);

  // Handlers
  const handleSaveDespacho = async () => {
    setIsLoading(true);
    try {
      const updatedData = {
        ...despachoData,
        atualizadoEm: new Date().toISOString()
      };
      
      setDespachoData(updatedData);
      
      if (onSave) {
        onSave(updatedData);
      }
      
      toast({
        title: "Despacho salvo",
        description: "Dados do despacho salvos com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar despacho.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGerarDespacho = async () => {
    if (!despachoData.observacoes.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O campo 'Observações' é obrigatório para gerar o despacho.",
        variant: "destructive"
      });
      return;
    }

    if (despachoData.responsaveis.length === 0) {
      toast({
        title: "Responsáveis obrigatórios",
        description: "Selecione pelo menos um responsável para gerar o despacho.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedData = {
        ...despachoData,
        status: 'GERADO' as DespachoStatus,
        documentoUrl: '#',
        documentoNome: `Despacho_${despachoData.numeroDFD.replace(/\s+/g, '_')}.pdf`,
        atualizadoEm: new Date().toISOString()
      };
      
      setDespachoData(updatedData);
      
      toast({
        title: "Despacho gerado",
        description: "Documento de despacho gerado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar despacho.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssinarDespacho = async () => {
    if (!podeAssinar) {
      toast({
        title: "Permissão negada",
        description: "Apenas usuários da Secretaria Executiva podem assinar o despacho.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedData = {
        ...despachoData,
        status: 'ASSINADO' as DespachoStatus,
        assinadoPor: {
          id: user?.email || '',
          nome: user?.nome || '',
          cargo: user?.cargo || '',
          dataAssinatura: new Date().toISOString()
        },
        atualizadoEm: new Date().toISOString()
      };
      
      setDespachoData(updatedData);
      
      toast({
        title: "Despacho assinado",
        description: "Despacho assinado com sucesso pela Secretaria Executiva.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao assinar despacho.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (despachoData.status === 'PENDENTE') {
      toast({
        title: "Despacho não gerado",
        description: "Gere o despacho antes de fazer o download.",
        variant: "destructive"
      });
      return;
    }

    // Simular download
    toast({
      title: "Download iniciado",
      description: `Download do arquivo ${despachoData.documentoNome} iniciado.`,
    });
  };

  

  const handleAddComentario = () => {
    if (!novoComentario.trim()) return;

    const newComentario: Comentario = {
      id: `comentario-${Date.now()}`,
      autor: user?.nome || '',
      cargo: `${user?.cargo || ''} - ${user?.gerencia || ''}`,
      data: new Date().toISOString(),
      texto: novoComentario
    };
    
    setComentarios(prev => [newComentario, ...prev]);
    setNovoComentario('');
    
    toast({
      title: "Comentário adicionado",
      description: "Comentário adicionado com sucesso.",
    });
  };

  const handleConcluirEtapa = async () => {
    if (despachoData.status !== 'ASSINADO') {
      toast({
        title: "Despacho não assinado",
        description: "O despacho deve estar assinado para concluir a etapa.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onComplete) {
        onComplete({
          ...despachoData,
          observacaoConclusao,
          notificarPartes
        });
      }
      
      setShowConcluirModal(false);
      
      toast({
        title: "Etapa concluída",
        description: "Etapa Despacho do DFD concluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao concluir etapa.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdicionarAssinantes = async () => {
    if (usuariosSelecionados.length === 0) return;

    setIsLoading(true);
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const novosAssinantes = usuariosSelecionados.map(userId => {
        const usuario = mockUsuariosDisponiveis.find(u => u.id === userId);
        return {
          id: `assinante-${Date.now()}-${userId}`,
          nome: usuario?.nome || '',
          cargo: usuario?.cargo || '',
          email: usuario?.email || '',
          status: 'PENDENTE' as 'PENDENTE' | 'ASSINADO' | 'CANCELADO'
        };
      });

      setAssinantes(prev => [...prev, ...novosAssinantes]);
      
      setShowAdicionarAssinante(false);
      setUsuariosSelecionados([]);
      
      toast({
        title: "Assinantes adicionados",
        description: `${novosAssinantes.length} assinante(s) adicionado(s) com sucesso.`
      });

    } catch (error) {
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar os assinantes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoverAssinante = (assinanteId: string) => {
    setAssinantes(prev => prev.filter(a => a.id !== assinanteId));
    toast({
      title: "Assinante removido",
      description: "O assinante foi removido com sucesso.",
    });
  };

  const handleCancelarAssinatura = async () => {
    if (!assinanteSelecionado) return;

    setIsLoading(true);
    try {
      // Simular chamada para API de cancelamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAssinantes(prev => prev.map(a => 
        a.id === assinanteSelecionado.id ? { ...a, status: 'CANCELADO' } : a
      ));
      setAssinanteSelecionado(null);
      setShowCancelarModal(false);

      toast({
        title: "Assinatura cancelada",
        description: `A assinatura de ${assinanteSelecionado.nome} foi cancelada.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao cancelar assinatura",
        description: "Não foi possível cancelar a assinatura.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Usar as funções padronizadas do utils
  const formatDate = formatDateBR;
  const formatDateTime = formatDateTimeBR;

  const getStatusConfig = (status: DespachoStatus) => {
    switch (status) {
      case 'PENDENTE':
        return { label: 'Despacho Pendente', color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-3 h-3" /> };
      case 'GERADO':
        return { label: 'Despacho Gerado', color: 'bg-blue-100 text-blue-800', icon: <FileCheck className="w-3 h-3" /> };
      case 'ASSINADO':
        return { label: 'Despacho Assinado', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3" /> };
      case 'CANCELADO':
        return { label: 'Despacho Cancelado', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" /> };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-3 h-3" /> };
    }
  };

  const getAssinaturaStatusConfig = (status: 'PENDENTE' | 'ASSINADO' | 'CANCELADO') => {
    switch (status) {
      case 'PENDENTE':
        return { 
          label: 'Pendente', 
          icon: <Clock className="w-3 h-3 mr-1" />, 
          bgColor: 'bg-yellow-100', 
          textColor: 'text-yellow-800', 
          borderColor: 'border-yellow-200' 
        };
      case 'ASSINADO':
        return { 
          label: 'Assinado', 
          icon: <CheckCircle className="w-3 h-3 mr-1" />, 
          bgColor: 'bg-green-100', 
          textColor: 'text-green-800', 
          borderColor: 'border-green-200' 
        };
      case 'CANCELADO':
        return { 
          label: 'Cancelado', 
          icon: <XCircle className="w-3 h-3 mr-1" />, 
          bgColor: 'bg-red-100', 
          textColor: 'text-red-800', 
          borderColor: 'border-red-200' 
        };
      default:
        return { 
          label: 'Desconhecido', 
          icon: <AlertCircle className="w-3 h-3 mr-1" />, 
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-800', 
          borderColor: 'border-gray-200' 
        };
    }
  };

  const getSLABadgeConfig = (badge: string) => {
    switch (badge) {
      case 'Em Dia':
        return { label: 'Em Dia', className: 'bg-green-100 text-green-800 border-green-200' };
      case 'Atrasado':
        return { label: 'Atrasado', className: 'bg-red-100 text-red-800 border-red-200' };
      case 'Próximo ao Prazo':
        return { label: 'Próximo ao Prazo', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      default:
        return { label: 'Desconhecido', className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const statusConfig = getStatusConfig(despachoData.status);

  return (
    <div className="min-h-screen bg-white">
      {/* Container central ocupando toda a área */}
      <div className="w-full px-2 space-y-6">
        {/* Formulário do Despacho */}
        <section id="formulario-despacho" className="w-full">
            {/* Card do Formulário */}
            <div className="card-shell">
              <header className="flex items-center gap-3 mb-4">
                  <FileCheck className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Formulário do Despacho</h2>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Formulário</span>
                </div>
              </header>
              <div className="border-b-2 border-purple-200 mb-6"></div>
              <div className="space-y-0">
                
                {/* Número do DFD */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="numeroDFD" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4" />
                    Número do DFD
                  </Label>
                  <Input
                    id="numeroDFD"
                    value={despachoData.numeroDFD}
                    readOnly
                    className="w-full bg-gray-50 border-gray-200 text-gray-600"
                  />
                </div>

                {/* Objeto */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="objeto" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4" />
                    Objeto
                  </Label>
                  <Textarea
                    id="objeto"
                    value={despachoData.objeto}
                    readOnly
                    className="w-full min-h-[80px] resize-none bg-gray-50 border-gray-200 text-gray-600"
                  />
                </div>

                {/* Regime de Tramitação */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="regimeTramitacao" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    Regime de Tramitação
                  </Label>
                  <Input
                    id="regimeTramitacao"
                    value={despachoData.regimeTramitacao === 'URGENCIA' ? 'Urgência' : 'Ordinário'}
                    readOnly
                    className="w-full bg-gray-50 border-gray-200 text-gray-600"
                  />
                </div>

                {/* Observações */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="observacoes" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4" />
                    Observações *
                  </Label>
                  <TextareaWithMentions
                    value={despachoData.observacoes}
                    onChange={(value) => setDespachoData({...despachoData, observacoes: value})}
                    placeholder="Descreva as observações do despacho..."
                    disabled={!podeEditar || despachoData.status !== 'PENDENTE'}
                    className="min-h-[100px] resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                    minHeight="100px"
                    processoId={processoId}
                    etapaId={etapaId.toString()}
                    cardId="observacoes-despacho"
                  />
                </div>

                {/* Cidade/Data de emissão */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="cidadeDataEmissao" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Cidade/Data de emissão
                  </Label>
                  <Input
                    id="cidadeDataEmissao"
                    value={despachoData.cidadeDataEmissao}
                    onChange={(e) => setDespachoData({...despachoData, cidadeDataEmissao: e.target.value})}
                    placeholder="Ex: Brasília, 15 de janeiro de 2025"
                    disabled={!podeEditar || despachoData.status !== 'PENDENTE'}
                    className="w-full border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  />
                </div>

                {/* Nome e Cargo dos Responsáveis (mesma estrutura do card Elaboração do DFD) */}
                <div className="w-full p-4">
                  <ResponsavelSelector
                    value={despachoData.responsaveis}
                    onChange={(responsaveis) => setDespachoData({ ...despachoData, responsaveis: responsaveis || [] })}
                    disabled={!podeEditar || despachoData.status !== 'PENDENTE'}
                    canEdit={podeEditar && despachoData.status === 'PENDENTE'}
                    processoId={processoId}
                      className="w-full"
                    label="Responsáveis pelo Despacho *"
                  />
                </div>
              </div>
            </div>
          </section>

        {/* Gerenciamento (card horizontal abaixo do formulário) */}
        <section id="gerenciamento" className="w-full">
          <div className="card-shell">
            <header className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">Gerenciamento</h2>
              <div className="ml-auto">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Gerenciamento</span>
                </div>
              </header>
            <div className="border-b-2 border-slate-200 mb-6"></div>
            <div className="space-y-4">
                <Tabs defaultValue="assinaturas" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="assinaturas">Assinaturas</TabsTrigger>
                    <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="assinaturas" className="mt-0 pt-2 flex-1 flex flex-col space-y-4">
                {/* Seleção de assinantes (GSP ou SE) */}
                {isGSPouSE && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-gray-700">
                        Seleção de Assinantes
                      </Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAdicionarAssinante(true)}
                        className="h-8 px-3"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Lista de assinantes */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Assinantes Selecionados
                  </Label>
                  
                  {assinantes.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Nenhum assinante selecionado</p>
                    </div>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto space-y-2">
                      {assinantes.map((assinante) => {
                        const statusConfig = getAssinaturaStatusConfig(assinante.status);
                        const diasRest = sla.prazoDiasUteis - sla.decorridosDiasUteis;
                        const isUrgente = diasRest <= 2 && diasRest >= 0 && assinante.status === 'PENDENTE';
                        
                        return (
                          <div key={assinante.id} className="p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{assinante.nome}</span>
                                  <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} text-xs`}>
                                    {statusConfig.icon}
                                    <span className="ml-1">{statusConfig.label}</span>
                                  </Badge>
                                  {isUrgente && (
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      {diasRest} dia{diasRest !== 1 ? 's' : ''} útil{diasRest !== 1 ? 'eis' : ''}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600 mb-1">{assinante.cargo}</div>
                                <div className="text-xs text-gray-500">{assinante.email}</div>
                                {assinante.assinadoEm && (
                                  <div className="text-xs text-green-600 mt-1">
                                    Assinado em {formatDateTimeBR(new Date(assinante.assinadoEm))}
                                  </div>
                                )}
                              </div>
                              
                              {/* Ações */}
                              <div className="flex items-center gap-1">
                                {isGSPouSE && assinante.status === 'PENDENTE' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoverAssinante(assinante.id)}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <UserMinus className="w-3 h-3" />
                                  </Button>
                                )}
                                
                                {assinante.status === 'PENDENTE' && 
                                 (assinante.email === user?.email || isGSPouSE) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setAssinanteSelecionado(assinante);
                                      setShowCancelarModal(true);
                                    }}
                                    className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Progresso das assinaturas */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-700">
                      Progresso
                    </Label>
                    <span className="text-sm text-gray-600">
                      {assinaturasConcluidas} de {totalAssinaturas} assinaturas concluídas
                    </span>
                  </div>
                  <Progress value={progresso} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {progresso === 100 ? 'Todas as assinaturas concluídas' : 'Aguardando assinaturas restantes'}
                  </div>
                </div>


                  </TabsContent>

                  <TabsContent value="anexos" className="mt-0 p-3">
                    <div className="space-y-3 w-full">
                      {/* Upload no topo */}
                      <div className="w-full">
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg,.gif,.bmp,.tif,.tiff" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if(!f) return; setAnnexes(prev=>[{id:`a-${Date.now()}`,name:f.name,uploadedAt:new Date().toISOString(),uploadedBy:user?.nome||'Usuário'},...prev]); if(e.target) e.target.value=''; toast({title:'Anexo adicionado', description:`${f.name} foi anexado.`}); }} />
                        <Button onClick={()=>fileInputRef.current?.click()} variant="outline" className="w-full h-9 border-dashed border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors text-sm">
                          <Upload className="w-4 h-4 mr-2"/>Adicionar Anexo
                        </Button>
                      </div>
                      {/* Header + Filtro */}
                      <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-800">Anexos</h3>
                          <span className="text-xs text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md font-medium">{annexes.length}</span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-xs text-slate-500 whitespace-nowrap">Ordenar:</span>
                          <div className="relative flex-1 sm:flex-none">
                            <select aria-label="Ordenar anexos" value={attachmentsSort} onChange={(e)=>setAttachmentsSort(e.target.value as 'desc'|'asc')} className="w-full h-7 rounded-md border border-slate-200 bg-white px-2 pr-6 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer hover:border-slate-300">
                              <option value="desc">Mais recente</option>
                              <option value="asc">Menos recente</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 pointer-events-none">
                              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Lista */}
                      {annexes.length === 0 ? (
                        <div className="pt-4">
                          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-center text-gray-500 font-medium">Nenhum anexo adicionado</p>
                        </div>
                      ) : (
                        <div className={`${annexes.length > 6 ? 'max-h-[280px] overflow-y-auto' : ''} space-y-0 w-full`}>
                          {anexosOrdenados.map((annex, idx)=>(
                            <React.Fragment key={annex.id}>
                              <div className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors w-full">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="p-2 bg-slate-100 rounded-lg">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{annex.name}</p>
                                    <p className="text-xs text-gray-500 hidden sm:block">{annex.uploadedBy} • {formatDateBR(annex.uploadedAt)}</p>
                                    <p className="text-xs text-gray-500 sm:hidden">{annex.uploadedBy} • {formatDateBR(annex.uploadedAt)}</p>
                                  </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                                  <Button size="sm" variant="outline" aria-label="Visualizar" className="h-7 w-7 p-0 hover:bg-blue-50" onClick={()=>openInNewTab(annex.url)}>
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" aria-label="Baixar" className="h-7 w-7 p-0 hover:bg-green-50">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" aria-label="Remover" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={()=>setAnnexes(prev=>prev.filter(a=>a.id!==annex.id))}>
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
        </section>


        {/* Painel da Etapa (mesmo layout do card Assinatura) */}
        <div className="card-shell min-h-[700px]">
          <header className="flex items-center gap-3 mb-4">
            <ClipboardCheck className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-bold text-slate-900">Painel da Etapa</h2>
            <div className="ml-auto">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Checklist
                    </span>
        </div>
          </header>
          <div className="border-b-2 border-green-200 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status & Prazo */}
            <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
              <header className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-800">Status & Prazo</h3>
                </div>
                {(() => {
                  const statusMap: Record<DespachoStatus, {label: string; cls: string}> = {
                    PENDENTE: { label: 'Pendente', cls: 'bg-yellow-100 text-yellow-800' },
                    GERADO: { label: 'Gerado', cls: 'bg-blue-100 text-blue-800' },
                    ASSINADO: { label: 'Assinado', cls: 'bg-green-100 text-green-800' },
                    CANCELADO: { label: 'Cancelado', cls: 'bg-red-100 text-red-800' }
                  };
                  const cfg = statusMap[despachoData.status] || { label: 'Indefinido', cls: 'bg-gray-100 text-gray-800' } as any;
                  return <Badge className={`text-sm font-semibold px-3 py-2 ${cfg.cls}`}>{cfg.label}</Badge>;
                })()}
              </header>

              <div className="space-y-4">
                {/* Data de Criação */}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                    <Calendar className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Data de Criação</p>
                    <p className="text-lg font-bold text-slate-900">{formatDateBR(new Date().toISOString())}</p>
                  </div>
                </div>

                {/* Prazo Inicial */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                      <Clock className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Prazo Inicial</p>
                      <p className="text-lg font-bold text-slate-900">{formatDateBR(new Date().toISOString())}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border border-slate-300 text-slate-700">
                      {sla.prazoDiasUteis} dias úteis
                    </span>
                  </div>
                </div>

                {/* Prazo Final */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                      <Flag className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Prazo Final</p>
                      <p className="text-lg font-bold text-slate-900">{formatDateBR(new Date(Date.now() + sla.prazoDiasUteis * 24 * 60 * 60 * 1000).toISOString())}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border border-slate-300 text-slate-700">prazo limite</span>
                  </div>
                </div>

                {/* Destaque dias restantes */}
                <div className="border-t border-slate-200 pt-4">
                  {(() => {
                    const diasRest = sla.prazoDiasUteis - sla.decorridosDiasUteis;
                    const isAtraso = diasRest < 0;
                    const isUrgente = diasRest <= 2 && diasRest >= 0;
                    let corTexto = 'text-green-600';
                    let legenda = 'dias restantes';
                    if (isAtraso) { corTexto = 'text-red-600'; legenda = 'dias em atraso'; }
                    else if (isUrgente) { corTexto = 'text-amber-600'; legenda = 'dias restantes (urgente)'; }
                    return (
                      <div className="text-center py-4">
                        <div className={`text-4xl font-extrabold ${corTexto} mb-2`}>{Math.abs(diasRest)}</div>
                        <div className={`text-sm font-medium ${corTexto}`}>{legenda}</div>
                      </div>
                    );
                  })()}
                </div>

                {/* Barra de SLA */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Progresso Temporal</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full bg-slate-200 rounded-full h-3 cursor-help">
                          {(() => {
                            const total = Math.max(1, sla.prazoDiasUteis);
                            const passados = Math.max(0, Math.min(sla.decorridosDiasUteis, total));
                            const perc = Math.round((passados / total) * 100);
                            let corBarra = 'bg-emerald-500';
                            if (perc >= 71 && perc <= 99) corBarra = 'bg-amber-500';
                            else if (perc >= 100) corBarra = 'bg-red-500';
                            return <div className={`h-3 rounded-full transition-all ${corBarra}`} style={{ width: `${Math.min(perc, 100)}%` }} />
                          })()}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{sla.decorridosDiasUteis} de {sla.prazoDiasUteis} dias úteis decorridos</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Decorridos: {sla.decorridosDiasUteis} / {sla.prazoDiasUteis} dias úteis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist da Etapa */}
            <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
              <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-800">Checklist da Etapa</h3>
                </div>
                {(() => {
                    const items: Array<{id:string; label:string; status:'completed'|'pending'|'warning'; description?:string}> = [];
                    items.push({ id: 'responsaveis', label: despachoData.responsaveis.length > 0 ? 'Responsáveis definidos' : 'Selecionar responsáveis', status: despachoData.responsaveis.length > 0 ? 'completed' : 'pending', description: despachoData.responsaveis.length > 0 ? `${despachoData.responsaveis.length} responsável(is) selecionado(s)` : 'Nenhum responsável selecionado' });
                    items.push({ id: 'geracao', label: despachoData.status !== 'PENDENTE' ? 'Despacho gerado' : 'Gerar despacho', status: despachoData.status !== 'PENDENTE' ? 'completed' : 'pending', description: despachoData.documentoNome ? despachoData.documentoNome : 'Documento ainda não gerado' });
                    items.push({ id: 'assinatura', label: despachoData.status === 'ASSINADO' ? 'Assinatura concluída' : 'Coletar assinatura', status: despachoData.status === 'ASSINADO' ? 'completed' : (despachoData.status === 'GERADO' ? 'warning' : 'pending'), description: despachoData.status === 'ASSINADO' ? 'Despacho assinado' : (despachoData.status === 'GERADO' ? 'Aguardando assinatura da SE' : 'Gere o despacho para assinar') });
                  const completed = items.filter(i=>i.status==='completed').length;
                  return (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      <ListChecks className="w-4 h-4" />
                      <span>{completed}/{items.length}</span>
                    </div>
                  );
                })()}
              </header>

                {(() => {
                    const items: Array<{id:string; label:string; status:'completed'|'pending'|'warning'; description?:string}> = [];
                    items.push({ id: 'responsaveis', label: despachoData.responsaveis.length > 0 ? 'Responsáveis definidos' : 'Selecionar responsáveis', status: despachoData.responsaveis.length > 0 ? 'completed' : 'pending', description: despachoData.responsaveis.length > 0 ? `${despachoData.responsaveis.length} responsável(is) selecionado(s)` : 'Nenhum responsável selecionado' });
                    items.push({ id: 'geracao', label: despachoData.status !== 'PENDENTE' ? 'Despacho gerado' : 'Gerar despacho', status: despachoData.status !== 'PENDENTE' ? 'completed' : 'pending', description: despachoData.documentoNome ? despachoData.documentoNome : 'Documento ainda não gerado' });
                    items.push({ id: 'assinatura', label: despachoData.status === 'ASSINADO' ? 'Assinatura concluída' : 'Coletar assinatura', status: despachoData.status === 'ASSINADO' ? 'completed' : (despachoData.status === 'GERADO' ? 'warning' : 'pending'), description: despachoData.status === 'ASSINADO' ? 'Despacho assinado' : (despachoData.status === 'GERADO' ? 'Aguardando assinatura da SE' : 'Gere o despacho para assinar') });
                const order = { warning: 0, pending: 1, completed: 2 } as const;
                const allItems = items.sort((a,b)=> order[a.status]-order[b.status]);
                const [filter, setFilter] = React.useState<'all' | 'open' | 'completed'>('all');
                const [query, setQuery] = React.useState('');
                const stats = { total: allItems.length, completed: allItems.filter(i=>i.status==='completed').length, open: allItems.filter(i=>i.status!=='completed').length };
                const percent = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);
                const filtered = allItems.filter(i=>{
                  if(filter==='open' && i.status==='completed') return false;
                  if(filter==='completed' && i.status!=='completed') return false;
                  if(!query.trim()) return true;
                  const q=query.toLowerCase();
                  return i.label.toLowerCase().includes(q) || (i.description||'').toLowerCase().includes(q);
                });
                const renderIcon = (status:'completed'|'pending'|'warning') => status==='completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />;
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Progresso</p>
                        <p className="text-sm font-semibold text-slate-800">{percent}% concluído</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{stats.total} itens</span>
                    </div>
                    <Progress value={percent} />
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={()=>setFilter('all')} className={`px-2 py-1 rounded text-xs ${filter==='all'?'bg-slate-200 text-slate-800':'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Todos</button>
                      <button type="button" onClick={()=>setFilter('open')} className={`px-2 py-1 rounded text-xs ${filter==='open'?'bg-amber-100 text-amber-900':'bg-amber-50 text-amber-800 hover:bg-amber-100'}`}>Pendentes ({stats.open})</button>
                      <button type="button" onClick={()=>setFilter('completed')} className={`px-2 py-1 rounded text-xs ${filter==='completed'?'bg-green-100 text-green-800':'bg-green-50 text-green-700 hover:bg-green-100'}`}>Concluídos ({stats.completed})</button>
                    </div>
                    <div className="relative">
                      <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar item..." className="pl-3 pr-8 h-8 text-sm" />
                      <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    <div className="max-h-72 overflow-auto space-y-1">
                      {filtered.length===0 ? (
                        <div className="text-xs text-slate-500 text-center py-6">Nenhum item encontrado.</div>
                      ) : (
                        filtered.map(item => (
                          <div key={item.id} className="flex items-start gap-3 py-2 px-2 rounded hover:bg-slate-50">
                            <div className="mt-0.5">{renderIcon(item.status)}</div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-800 truncate">{item.label}</div>
                              {item.description && <div className="text-xs text-slate-500">{item.description}</div>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  );
                })()}
            </div>

            {/* Mini Timeline removida do painel para padronização com Elaboração */}
          </div>
        </div>

        {/* Timeline (balão) */}
        <Timeline data={mapToNewTimelineItems()} />

        {/* FULL: Comentários */}
        <section id="comentarios" className="col-span-12 w-full">
          <div className="card-shell">
            <CommentsSection
              processoId={processoId}
              etapaId={etapaId.toString()}
              cardId="comentarios-despacho"
              title="Comentários"
            />
          </div>
        </section>

        {/* Ações da Etapa (igual ao card Assinatura) */}
        <div className="card-shell">
          <header className="flex items-center gap-3 mb-4">
            <Flag className="w-6 h-6 text-orange-600" />
            <h2 className="text-lg font-bold text-slate-900">Ações da Etapa</h2>
            <div className="ml-auto">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Ações</span>
                  </div>
          </header>
          <div className="border-b-2 border-orange-200 mb-6"></div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Responsável</p>
                  <p className="text-lg font-bold text-slate-900">{despachoData.responsaveis[0]?.nome || 'Sem responsável definido'}</p>
                </div>
                  </div>
                </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {podeEditar && despachoData.status === 'PENDENTE' && (
                  <Button variant="outline" onClick={handleSaveDespacho} className="text-blue-600 border-blue-300 hover:bg-blue-50">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              )}
              {podeAssinar && despachoData.status === 'GERADO' && (
                  <Button onClick={handleAssinarDespacho} className="bg-green-600 hover:bg-green-700">
                      <PenTool className="w-4 h-4 mr-2" />
                      Assinar Despacho
                </Button>
              )}
              {despachoData.status !== 'PENDENTE' && (
                  <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button onClick={() => setShowConcluirModal(true)} disabled={despachoData.status !== 'ASSINADO'} className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Concluir
                </Button>
                      </div>
                    </TooltipTrigger>
                    {despachoData.status !== 'ASSINADO' && (
                      <TooltipContent>
                        <p>Aguarde o despacho ser assinado para concluir.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                </div>
              </div>
          </div>
        </div>

        {/* Removido: Rodapé antigo com botões (substituído por Ações da Etapa) */}

        

        {/* Modal de Confirmação de Conclusão */}
        <Dialog open={showConcluirModal} onOpenChange={setShowConcluirModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-green-600" />
                Concluir Etapa
              </DialogTitle>
              <DialogDescription>
                Concluir a etapa Despacho do DFD para o processo {processoId}?
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

        {/* Modal de Confirmação de Substituição */}
        <Dialog open={showSubstituirConfirmacao} onOpenChange={setShowSubstituirConfirmacao}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Substituir Documento
              </DialogTitle>
              <DialogDescription>
                Deseja substituir o documento de despacho existente por um novo?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> Ao substituir o documento, o arquivo anterior será removido.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex justify-end gap-3 pt-4 pb-2">
              <Button
                variant="outline"
                onClick={handleCancelarSubstituicao}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmarSubstituicao}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Substituindo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Substituir Documento
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Adicionar Assinantes (GSP ou SE) */}
        <Dialog open={showAdicionarAssinante} onOpenChange={setShowAdicionarAssinante}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Adicionar Assinantes
              </DialogTitle>
              <DialogDescription>
                Selecione os usuários que devem assinar o documento.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Usuários Disponíveis
                </Label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {mockUsuariosDisponiveis
                    .filter(usuario => !assinantes.some(a => a.email === usuario.email))
                    .map((usuario) => (
                      <div key={usuario.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Checkbox
                          id={usuario.id}
                          checked={usuariosSelecionados.includes(usuario.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setUsuariosSelecionados([...usuariosSelecionados, usuario.id]);
                            } else {
                              setUsuariosSelecionados(usuariosSelecionados.filter(id => id !== usuario.id));
                            }
                          }}
                        />
                        <Label htmlFor={usuario.id} className="text-sm flex-1 cursor-pointer">
                          <div className="font-medium">{usuario.nome}</div>
                          <div className="text-xs text-gray-500">{usuario.cargo}</div>
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdicionarAssinante(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAdicionarAssinantes}
                disabled={isLoading || usuariosSelecionados.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar ({usuariosSelecionados.length})
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Cancelar Assinatura */}
        <Dialog open={showCancelarModal} onOpenChange={setShowCancelarModal}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Cancelar Assinatura
              </DialogTitle>
              <DialogDescription>
                Deseja cancelar a assinatura de {assinanteSelecionado?.nome}?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> Ao cancelar a assinatura, a etapa será marcada como concluída, mas a assinatura será removida.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex justify-end gap-3 pt-4 pb-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelarModal(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCancelarAssinatura}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar Assinatura
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
