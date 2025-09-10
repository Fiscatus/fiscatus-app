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
  Settings
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import TextareaWithMentions from './TextareaWithMentions';
import CommentsSection from './CommentsSection';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';

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
  const [showAdicionarResponsavel, setShowAdicionarResponsavel] = useState(false);
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

  const handleAdicionarResponsavel = async () => {
    if (usuariosSelecionados.length === 0) return;

    setIsLoading(true);
    
    try {
      const novosResponsaveis = usuariosSelecionados.map(userId => {
        const usuario = mockUsuariosDisponiveis.find(u => u.id === userId);
        return {
          id: usuario?.id || '',
          nome: usuario?.nome || '',
          cargo: usuario?.cargo || '',
          gerencia: usuario?.gerencia || ''
        };
      });

      setDespachoData({
        ...despachoData,
        responsaveis: [...despachoData.responsaveis, ...novosResponsaveis]
      });
      
      setShowAdicionarResponsavel(false);
      setUsuariosSelecionados([]);
      
      toast({
        title: "Responsáveis adicionados",
        description: `${novosResponsaveis.length} responsável(is) adicionado(s) com sucesso.`
      });

    } catch (error) {
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar os responsáveis.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoverResponsavel = (responsavelId: string) => {
    const responsaveisAtualizados = despachoData.responsaveis.filter(r => r.id !== responsavelId);
    
    setDespachoData({
      ...despachoData,
      responsaveis: responsaveisAtualizados
    });
    
    toast({
      title: "Responsável removido",
      description: "O responsável foi removido com sucesso."
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
      <div className="w-full px-2">
        {/* Grid principal 12 colunas */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* ESQUERDA: Formulário do Despacho (8 colunas) */}
          <section id="formulario-despacho" className="col-span-12 lg:col-span-8 w-full">
            
            {/* Card do Formulário */}
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-indigo-100 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-indigo-600" />
                  Formulário do Despacho
                </div>
              </header>
              <div className="p-4 md:p-6 space-y-0">
                
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

                {/* Nome e Cargo dos Responsáveis */}
                <div className="w-full p-4">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    Nome e Cargo dos Responsáveis *
                  </Label>
                  
                  {/* Lista de responsáveis */}
                  {despachoData.responsaveis.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {despachoData.responsaveis.map((responsavel) => (
                        <div key={responsavel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div>
                            <div className="font-medium text-gray-900">{responsavel.nome}</div>
                            <div className="text-sm text-gray-600">{responsavel.cargo} - {responsavel.gerencia}</div>
                          </div>
                          {podeEditar && despachoData.status === 'PENDENTE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoverResponsavel(responsavel.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
                      Nenhum responsável selecionado
                    </div>
                  )}

                  {/* Botão para adicionar responsáveis */}
                  {podeEditar && despachoData.status === 'PENDENTE' && (
                    <Button
                      variant="outline"
                      onClick={() => setShowAdicionarResponsavel(true)}
                      className="w-full"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Adicionar Responsáveis
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* DIREITA: Gerenciamento (4 colunas) */}
          <aside id="gerenciamento" className="col-span-12 lg:col-span-4 w-full flex flex-col">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white flex-1 flex flex-col">
              <header className="bg-purple-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Gerenciamento
                </div>
              </header>
              <div className="p-4 md:p-6 space-y-4 flex-1 flex flex-col">
                
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
                    <div className="space-y-2">
                      {assinantes.map((assinante) => {
                        const statusConfig = getAssinaturaStatusConfig(assinante.status);
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
                      {assinaturasConcluidas}/{totalAssinaturas}
                    </span>
                  </div>
                  <Progress value={progresso} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {progresso === 100 ? 'Todas as assinaturas concluídas' : 'Aguardando assinaturas'}
                  </div>
                </div>

                {/* SLA */}
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      SLA
                    </Label>
                    <Badge className={getSLABadgeConfig(sla.badge).className}>
                      {getSLABadgeConfig(sla.badge).label}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Prazo: {sla.prazoDiasUteis} dia útil</div>
                    <div>Decorridos: {sla.decorridosDiasUteis} dias úteis</div>
                  </div>
                </div>

              </div>
            </div>
          </aside>
        </div>

        {/* FULL: Despacho do DFD */}
        <section id="despacho-dfd" className="col-span-12 w-full mt-6">
          <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
            <header className="bg-indigo-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                Despacho do DFD
              </div>
            </header>
            <div className="p-4 md:p-6 flex flex-col gap-4">
              
              {/* Input oculto para upload de arquivo */}
              <input
                ref={despachoFileInputRef}
                type="file"
                onChange={handleDespachoFileUpload}
                accept=".pdf,.docx"
                className="hidden"
              />

              {/* Botão Adicionar Documento */}
              <div className="flex justify-center">
                <Button
                  onClick={handleUploadDespacho}
                  variant="outline"
                  className="border-dashed border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Documento
                </Button>
              </div>

              {/* Lista de arquivos */}
              {despachoArquivo ? (
                <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    {/* Informações do documento */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex-shrink-0">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {despachoArquivo.name}
                        </h3>
                      </div>
                    </div>

                    {/* Informações do usuário */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {despachoArquivo.uploadedBy}
                        </p>
                        <p className="text-xs text-gray-600 font-medium truncate">
                          {despachoArquivo.uploadedByCargo}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {despachoArquivo.uploadedByGerencia}
                        </p>
                      </div>
                    </div>

                    {/* Data e horário */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex-shrink-0">
                        <Calendar className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDateBR(new Date(despachoArquivo.uploadedAt))} às {new Date(despachoArquivo.uploadedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Botões de ação */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleVisualizarDocumento}
                              className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visualizar documento em nova aba</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleBaixarDespacho}
                              className="h-9 w-9 p-0 hover:bg-gray-50"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Baixar arquivo</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleEditarDespacho}
                              className="h-9 w-9 p-0 hover:bg-gray-50"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar/Substituir arquivo</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleExcluirDespacho}
                              className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir arquivo</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Nenhum documento de despacho enviado ainda.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Clique em "Adicionar Documento" para enviar um arquivo PDF ou DOCX
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FULL: Comentários */}
        <section id="comentarios" className="col-span-12 w-full mt-6">
          <CommentsSection
            processoId={processoId}
            etapaId={etapaId.toString()}
            cardId="comentarios-despacho"
            title="Comentários"
          />
        </section>

        {/* Rodapé com botões */}
        <div className="mt-6">
          {/* Rodapé com Botões de Ação */}
          <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                
                {/* Lado esquerdo - Status e informações */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      1 dia no card
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {despachoData.responsaveis[0]?.nome || 'Sem responsável definido'}
                    </span>
                  </div>
                </div>

                {/* Lado direito - Botões de ação */}
                <div className="flex items-center gap-2">
              {/* Botão Salvar */}
              {podeEditar && despachoData.status === 'PENDENTE' && (
                <Button
                  variant="outline"
                  onClick={handleSaveDespacho}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              )}

              {/* Botão Gerar Despacho */}
              {podeEditar && despachoData.status === 'PENDENTE' && (
                <Button
                  onClick={handleGerarDespacho}
                  disabled={isLoading || !despachoData.observacoes.trim() || despachoData.responsaveis.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 mr-2" />
                      Gerar Despacho
                    </>
                  )}
                </Button>
              )}

              {/* Botão Assinar Despacho */}
              {podeAssinar && despachoData.status === 'GERADO' && (
                <Button
                  onClick={handleAssinarDespacho}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                      Assinando...
                    </>
                  ) : (
                    <>
                      <PenTool className="w-4 h-4 mr-2" />
                      Assinar Despacho
                    </>
                  )}
                </Button>
              )}

              {/* Botão Download PDF */}
              {despachoData.status !== 'PENDENTE' && (
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={isLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}

              {/* Botão Concluir Etapa */}
              {despachoData.status === 'ASSINADO' && (
                <Button
                  onClick={() => setShowConcluirModal(true)}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Concluir Etapa
                </Button>
              )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal para adicionar responsáveis */}
        <Dialog open={showAdicionarResponsavel} onOpenChange={setShowAdicionarResponsavel}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Adicionar Responsáveis
              </DialogTitle>
              <DialogDescription>
                Selecione os usuários responsáveis pelo despacho (GSP e SE).
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                {mockUsuariosDisponiveis.map((usuario) => (
                  <div key={usuario.id} className="flex items-center space-x-2">
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
                    <Label htmlFor={usuario.id} className="text-sm">
                      <div className="font-medium">{usuario.nome}</div>
                      <div className="text-gray-600">{usuario.cargo} - {usuario.gerencia}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 pb-2">
              <Button
                variant="outline"
                onClick={() => setShowAdicionarResponsavel(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAdicionarResponsavel}
                disabled={isLoading || usuariosSelecionados.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Responsáveis
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
