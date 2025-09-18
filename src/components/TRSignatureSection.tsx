import React, { useState, useEffect } from 'react';
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
  Settings,
  Info
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import TextareaWithMentions from './TextareaWithMentions';
import CommentsSection from './CommentsSection';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';

// Tipos TypeScript para Assinatura do Termo de Referência
type AssinaturaStatus = 'PENDENTE' | 'ASSINADO' | 'CANCELADO';
type EtapaAssinaturaStatus = 'PENDENTE_ASSINATURA' | 'ASSINADO_N_N' | 'CONCLUIDO';

interface Assinante {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  status: AssinaturaStatus;
  selecionadoPorId: string;     // GSP
  selecionadoEm: string;        // ISO
  assinadoEm?: string;          // ISO
  canceladoEm?: string;         // ISO
  observacoes?: string;
}

interface CardAssinaturaTR {
  processoId: string;
  versaoFinalId: string;  // versão aprovada do Termo de Referência
  statusEtapa: EtapaAssinaturaStatus;
  responsavelEtapa: { id: string; nome: string; cargo: string };
  assinantes: Assinante[];
  sla: {
    regime: 'URGENCIA' | 'ORDINARIO';
    prazoDiasUteis: number;
    decorridosDiasUteis: number;
    badge: 'ok' | 'risco' | 'estourado';
  };
  documentoTR?: {
    nome: string;
    url: string;
    mimeType: string;
    tamanho: string;
    uploadedAt: string;
    uploadedBy: string;
  };
}

interface Comentario {
  id: string;
  autor: string;
  cargo: string;
  data: string;
  texto: string;
  avatar?: string;
}

interface TRSignatureSectionProps {
  processoId: string;
  etapaId: number;
  onComplete?: (data: any) => void;
  onSave?: (data: any) => void;
  initialData?: any;
  canEdit?: boolean;
  gerenciaCriadora?: string;
}

// Mock data usando usuários reais do sistema
const mockCardAssinaturaTR: CardAssinaturaTR = {
  processoId: "1",
  versaoFinalId: "v1",
  statusEtapa: "PENDENTE_ASSINATURA",
  responsavelEtapa: {
    id: "8",
    nome: "Leticia Bonfim Guilherme",
    cargo: "Gerente de Licitações e Contratos"
  },
  assinantes: [
    {
      id: "1",
      nome: "Leticia Bonfim Guilherme",
      cargo: "Gerente de Licitações e Contratos",
      email: "leticia.bonfim@hospital.gov.br",
      status: "PENDENTE",
      selecionadoPorId: "gsp-1",
      selecionadoEm: "2025-01-15T10:00:00Z"
    },
    {
      id: "2",
      nome: "Gabriel Radamesis Gomes Nascimento",
      cargo: "Assessor Jurídico",
      email: "gabriel.radamesis@hospital.gov.br",
      status: "PENDENTE",
      selecionadoPorId: "gsp-1",
      selecionadoEm: "2025-01-15T10:00:00Z"
    }
  ],
  sla: {
    regime: "ORDINARIO",
    prazoDiasUteis: 3,
    decorridosDiasUteis: 0,
    badge: "ok"
  },
  documentoTR: {
    nome: "Termo_Referencia_Versao_Final.pdf",
    url: "mock-url-tr-final",
    mimeType: "application/pdf",
    tamanho: "2.1 MB",
    uploadedAt: "2025-01-15T09:30:00Z",
    uploadedBy: "Yasmin Pissolati Mattos Bretz"
  }
};

const mockComentarios: Comentario[] = [
  {
    id: "1",
    autor: "Yasmin Pissolati Mattos Bretz",
    cargo: "Gerente de Soluções e Projetos",
    data: "15/01/2025 10:30",
    texto: "Termo de Referência aprovado e enviado para assinatura. Aguardando assinaturas dos responsáveis."
  },
  {
    id: "2",
    autor: "Leticia Bonfim Guilherme",
    cargo: "Gerente de Licitações e Contratos",
    data: "15/01/2025 14:15",
    texto: "Documento revisado e pronto para assinatura."
  }
];

// Mock usuários disponíveis para seleção (usuários reais do sistema)
const mockUsuariosDisponiveis = [
  { id: "1", nome: "Lara Rubia Vaz Diniz Fraguas", cargo: "Supervisão contratual", email: "lara.fraguas@hospital.gov.br" },
  { id: "2", nome: "Diran Rodrigues de Souza Filho", cargo: "Secretário Executivo", email: "diran.rodrigues@hospital.gov.br" },
  { id: "3", nome: "Georgia Guimaraes Pereira", cargo: "Controladora Interna", email: "georgia.guimaraes@hospital.gov.br" },
  { id: "4", nome: "Yasmin Pissolati Mattos Bretz", cargo: "Gerente de Soluções e Projetos", email: "yasmin.pissolati@hospital.gov.br" },
  { id: "5", nome: "Guilherme de Carvalho Silva", cargo: "Gerente Suprimentos e Logistica", email: "guilherme.carvalho@hospital.gov.br" },
  { id: "6", nome: "Lucas Moreira Brito", cargo: "GERENTE DE RH", email: "lucas.moreira@hospital.gov.br" },
  { id: "7", nome: "Andressa Sterfany Santos da Silva", cargo: "Assessora Técnica de Saúde", email: "andressa.sterfany@hospital.gov.br" },
  { id: "8", nome: "Leticia Bonfim Guilherme", cargo: "Gerente de Licitações e Contratos", email: "leticia.bonfim@hospital.gov.br" },
  { id: "9", nome: "Dallas Kelson Francisco de Souza", cargo: "Gerente Financeiro", email: "dallas.kelson@hospital.gov.br" },
  { id: "10", nome: "Gabriel Radamesis Gomes Nascimento", cargo: "Assessor Jurídico", email: "gabriel.radamesis@hospital.gov.br" }
];

export default function TRSignatureSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true,
  gerenciaCriadora
}: TRSignatureSectionProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const { podeEditarCard } = usePermissoes();
  
  // Estados principais
  const [cardData, setCardData] = useState<CardAssinaturaTR>(mockCardAssinaturaTR);
  const [comentarios, setComentarios] = useState<Comentario[]>(mockComentarios);
  const [novoComentario, setNovoComentario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para modais
  const [showAssinarModal, setShowAssinarModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [assinanteSelecionado, setAssinanteSelecionado] = useState<Assinante | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  
  // Estados para seleção de assinantes (GSP)
  const [showAdicionarAssinante, setShowAdicionarAssinante] = useState(false);
  const [usuariosSelecionados, setUsuariosSelecionados] = useState<string[]>([]);
  // Gerenciamento > Anexos (replicado do ETP)
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

  // Estados para o botão Concluir
  const [showConcluirModal, setShowConcluirModal] = useState(false);
  const [observacaoConclusao, setObservacaoConclusao] = useState('');
  const [notificarPartes, setNotificarPartes] = useState(true);
  const [isConcluindo, setIsConcluindo] = useState(false);

  // Verificar se é GSP (pode gerenciar assinaturas)
  const isGSP = user?.gerencia?.includes('GSP') || false;
  
  // Verificar se o usuário atual é um assinante pendente
  const isAssinantePendente = cardData.assinantes.some(
    assinante => assinante.email === user?.email && assinante.status === 'PENDENTE'
  );

  // Verificar se pode editar o card
  const podeEditar = podeEditarCard(
    cardData.responsavelEtapa.id,
    etapaId,
    gerenciaCriadora
  );

  // Verificar se pode concluir a etapa (Gerência responsável ou GSP)
  const podeConcluir = isGSP || user?._id === cardData.responsavelEtapa.id;

  // Verificar se todos os assinantes assinaram
  const todosAssinados = cardData.assinantes.every(assinante => assinante.status === 'ASSINADO');

  // Calcular progresso das assinaturas
  const progressoAssinaturas = cardData.assinantes.length > 0 
    ? (cardData.assinantes.filter(a => a.status === 'ASSINADO').length / cardData.assinantes.length) * 100 
    : 0;

  // Função para obter configuração do status da assinatura
  const getAssinaturaStatusConfig = (status: AssinaturaStatus) => {
    switch (status) {
      case 'ASSINADO':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          label: 'Assinado',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'PENDENTE':
        return {
          icon: <Clock className="w-4 h-4 text-yellow-600" />,
          label: 'Pendente',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200'
        };
      case 'CANCELADO':
        return {
          icon: <XCircle className="w-4 h-4 text-red-600" />,
          label: 'Cancelado',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-gray-600" />,
          label: 'Pendente',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Funções de assinatura
  const handleAssinar = (assinante: Assinante) => {
    setAssinanteSelecionado(assinante);
    setShowAssinarModal(true);
  };

  const confirmarAssinatura = () => {
    if (!assinanteSelecionado) return;

    const agora = new Date().toISOString();
    const assinanteAtualizado = {
      ...assinanteSelecionado,
      status: 'ASSINADO' as AssinaturaStatus,
      assinadoEm: agora
    };

    setCardData(prev => ({
      ...prev,
      assinantes: prev.assinantes.map(a => 
        a.id === assinanteAtualizado.id ? assinanteAtualizado : a
      )
    }));

    toast({
      title: "Assinatura Realizada",
      description: `Documento assinado por ${assinanteAtualizado.nome}`,
    });

    setShowAssinarModal(false);
    setAssinanteSelecionado(null);
  };

  const handleCancelarAssinatura = (assinante: Assinante) => {
    setAssinanteSelecionado(assinante);
    setShowCancelarModal(true);
  };

  const confirmarCancelamento = () => {
    if (!assinanteSelecionado || !motivoCancelamento.trim()) return;

    const agora = new Date().toISOString();
    const assinanteAtualizado = {
      ...assinanteSelecionado,
      status: 'CANCELADO' as AssinaturaStatus,
      canceladoEm: agora,
      observacoes: motivoCancelamento
    };

    setCardData(prev => ({
      ...prev,
      assinantes: prev.assinantes.map(a => 
        a.id === assinanteAtualizado.id ? assinanteAtualizado : a
      )
    }));

    toast({
      title: "Assinatura Cancelada",
      description: `Assinatura cancelada por ${assinanteAtualizado.nome}`,
      variant: "destructive"
    });

    setShowCancelarModal(false);
    setAssinanteSelecionado(null);
    setMotivoCancelamento('');
  };

  // Funções de gerenciamento de assinantes
  const handleAdicionarAssinantes = () => {
    if (usuariosSelecionados.length === 0) {
      toast({
        title: "Nenhum usuário selecionado",
        description: "Selecione pelo menos um usuário para adicionar como assinante.",
        variant: "destructive"
      });
      return;
    }

    const novosAssinantes = usuariosSelecionados.map(usuarioId => {
      const usuario = mockUsuariosDisponiveis.find(u => u.id === usuarioId);
      return {
        id: `assinante-${Date.now()}-${usuarioId}`,
        nome: usuario?.nome || '',
        cargo: usuario?.cargo || '',
        email: usuario?.email || '',
        status: 'PENDENTE' as AssinaturaStatus,
        selecionadoPorId: user?._id || '',
        selecionadoEm: new Date().toISOString()
      };
    });

    setCardData(prev => ({
      ...prev,
      assinantes: [...prev.assinantes, ...novosAssinantes]
    }));

    toast({
      title: "Assinantes Adicionados",
      description: `${novosAssinantes.length} assinante(s) adicionado(s) com sucesso.`,
    });

    setShowAdicionarAssinante(false);
    setUsuariosSelecionados([]);
  };

  const handleRemoverAssinante = (assinanteId: string) => {
    setCardData(prev => ({
      ...prev,
      assinantes: prev.assinantes.filter(a => a.id !== assinanteId)
    }));

    toast({
      title: "Assinante Removido",
      description: "Assinante removido com sucesso.",
    });
  };

  // Função de conclusão
  const handleConcluir = () => {
    if (!todosAssinados) {
      toast({
        title: "Assinaturas Pendentes",
        description: "Todos os assinantes devem assinar antes de concluir a etapa.",
        variant: "destructive"
      });
      return;
    }

    setShowConcluirModal(true);
  };

  const confirmarConclusao = async () => {
    setIsConcluindo(true);

    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCardData(prev => ({
        ...prev,
        statusEtapa: 'CONCLUIDO' as EtapaAssinaturaStatus
      }));

      toast({
        title: "Etapa Concluída",
        description: "A assinatura do Termo de Referência foi concluída com sucesso.",
      });

      if (onComplete) {
        onComplete(cardData);
      }

      setShowConcluirModal(false);
      setObservacaoConclusao('');
    } catch (error) {
      toast({
        title: "Erro ao Concluir",
        description: "Ocorreu um erro ao concluir a etapa.",
        variant: "destructive"
      });
    } finally {
      setIsConcluindo(false);
    }
  };

  // Função para download do documento Termo de Referência
  const handleDownloadTR = () => {
    if (!cardData.documentoTR) {
      toast({
        title: "Nenhum documento",
        description: "Nenhum documento de Termo de Referência foi enviado ainda.",
        variant: "destructive"
      });
      return;
    }

    // Mock: simular download
    toast({
      title: "Download Iniciado",
      description: `O arquivo ${cardData.documentoTR.nome} está sendo baixado.`
    });
  };

  // Função para visualizar o documento Termo de Referência
  const handleVisualizarTR = () => {
    if (!cardData.documentoTR) {
      toast({
        title: "Nenhum documento",
        description: "Nenhum documento de Termo de Referência foi enviado ainda.",
        variant: "destructive"
      });
      return;
    }

    // Mock: simular visualização
    toast({
      title: "Visualização",
      description: `Abrindo ${cardData.documentoTR.nome} para visualização.`
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Container central ocupando toda a área */}
      <div className="w-full px-2">
        
        {/* Grid principal 12 colunas */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* ESQUERDA: Visualização do Termo de Referência (8 colunas) */}
          <section id="visualizacao-tr" className="col-span-12 lg:col-span-8 w-full">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-purple-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PenTool className="w-5 h-5 text-purple-600" />
                    <span className="text-lg">Visualização do Termo de Referência</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleVisualizarTR}
                      disabled={!cardData.documentoTR}
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadTR}
                      disabled={!cardData.documentoTR}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </header>
              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  
                  {/* Informações do Documento removidas para padronizar (sem bloco acima da visualização) */}

                  {/* Área de Visualização do Documento */}
                  <div className="w-full min-h-[520px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">Visualização do Termo de Referência</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {cardData.documentoTR ? 'Clique em "Visualizar" para abrir o documento' : 'Nenhum documento disponível'}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </section>

          {/* DIREITA: Gerenciamento de Assinaturas (4 colunas) */}
          <aside id="gerenciamento-assinaturas" className="col-span-12 lg:col-span-4 w-full flex flex-col">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white flex-1 flex flex-col">
              <header className="bg-purple-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Gerenciamento
                </div>
              </header>
              <div className="p-4 md:p-6 space-y-4 flex-1 flex flex-col">
                <Tabs defaultValue="assinaturas" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="assinaturas">Assinaturas</TabsTrigger>
                    <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="assinaturas" className="mt-0 pt-2 flex-1 flex flex-col space-y-4">
                {/* Seleção de assinantes (GSP) */}
                {isGSP && (
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
                  
                  {cardData.assinantes.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Nenhum assinante selecionado</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cardData.assinantes.map((assinante) => {
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
                                {isGSP && assinante.status === 'PENDENTE' && (
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
                                 (assinante.email === user?.email || isGSP) && (
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
                      {cardData.assinantes.filter(a => a.status === 'ASSINADO').length}/{cardData.assinantes.length}
                    </span>
                  </div>
                  <Progress value={progressoAssinaturas} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {progressoAssinaturas === 100 ? 'Todas as assinaturas concluídas' : 'Aguardando assinaturas'}
                  </div>
                </div>

                {/* SLA */}
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      SLA
                    </Label>
                    <Badge className={`text-xs ${
                      cardData.sla.badge === 'ok' ? 'bg-green-100 text-green-800' :
                      cardData.sla.badge === 'risco' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {cardData.sla.badge === 'ok' ? 'Dentro do Prazo' :
                       cardData.sla.badge === 'risco' ? 'Em Risco' : 'Estourado'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Prazo: {cardData.sla.prazoDiasUteis} dias úteis</div>
                    <div>Decorridos: {cardData.sla.decorridosDiasUteis} dias úteis</div>
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
          </aside>

          {/* FULL: Comentários */}
          <section id="comentarios" className="col-span-12 w-full">
            <div className="card-shell">
              <CommentsSection
                processoId={processoId}
                etapaId={etapaId.toString()}
                cardId="comentarios-assinatura-tr"
                title="Comentários"
              />
            </div>
          </section>

          {/* FULL: Ações (rodapé não fixo) */}
          <section id="acoes" className="col-span-12 w-full mt-6">
            {/* Rodapé com Botões de Ação */}
            <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                  
                  {/* Lado esquerdo - Status e informações */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {cardData.sla.decorridosDiasUteis} dias no card
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {cardData.responsavelEtapa.nome || 'Sem responsável definido'}
                      </span>
                    </div>
                  </div>

                  {/* Lado direito - Botões de ação */}
                  <div className="flex items-center gap-2">
            
            {/* Salvar (para GSP) */}
            {isGSP && (
              <Button
                variant="outline"
                onClick={() => {
                  if (onSave) {
                    onSave(cardData);
                  }
                }}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            )}

            {/* Botão Concluir - conforme especificação */}
            {(podeConcluir) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        id="btn-concluir-card6"
                        data-testid="btn-concluir-card6"
                        onClick={() => setShowConcluirModal(true)}
                        disabled={!podeConcluir || isConcluindo || !todosAssinados || cardData.statusEtapa === 'CONCLUIDO'}
                        className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isConcluindo ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Concluindo...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Concluir
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {(!todosAssinados || cardData.statusEtapa === 'CONCLUIDO') && (
                    <TooltipContent>
                      <p>
                        {!todosAssinados 
                          ? "Aguarde todas as assinaturas para concluir." 
                          : "Etapa já concluída"}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Cancelar Assinatura (para assinante pendente) */}
            {isAssinantePendente && (
              <Button
                variant="outline"
                onClick={() => {
                  const meuAssinante = cardData.assinantes.find(
                    a => a.email === user?.email && a.status === 'PENDENTE'
                  );
                  if (meuAssinante) {
                    setAssinanteSelecionado(meuAssinante);
                    setShowCancelarModal(true);
                  }
                }}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar Assinatura
              </Button>
            )}

            {/* Assinar Documento (para assinante pendente) */}
            {isAssinantePendente && (
              <Button
                onClick={() => {
                  const meuAssinante = cardData.assinantes.find(
                    a => a.email === user?.email && a.status === 'PENDENTE'
                  );
                  if (meuAssinante) {
                    setAssinanteSelecionado(meuAssinante);
                    setShowAssinarModal(true);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Assinar Documento
              </Button>
            )}

                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        </div>
      </div>

      {/* Modal de Assinatura */}
      <Dialog open={showAssinarModal} onOpenChange={setShowAssinarModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-purple-600" />
              Confirmar Assinatura
            </DialogTitle>
            <DialogDescription>
              Confirme os dados da sua assinatura digital no documento do Termo de Referência.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium">Assinante:</div>
                <div className="text-gray-600">{assinanteSelecionado?.nome}</div>
                <div className="text-gray-500 text-xs">{assinanteSelecionado?.cargo}</div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium">Documento:</div>
                <div className="text-gray-600">Termo de Referência - Versão Final (V{cardData.versaoFinalId})</div>
                <div className="text-gray-500 text-xs">Aprovado por: Yasmin Pissolati Mattos Bretz</div>
                <div className="text-gray-500 text-xs">Hash: {Math.random().toString(36).substring(2, 15)}</div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium">Data/Hora:</div>
                <div className="text-gray-600">{formatDateTimeBR(new Date())}</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssinarModal(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarAssinatura} className="bg-purple-600 hover:bg-purple-700">
              <PenTool className="w-4 h-4 mr-2" />
              Confirmar Assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <Dialog open={showCancelarModal} onOpenChange={setShowCancelarModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Cancelar Assinatura
            </DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento da assinatura.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="motivo-cancelamento" className="text-sm font-medium">
                Motivo do Cancelamento *
              </Label>
              <Textarea
                id="motivo-cancelamento"
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Descreva o motivo do cancelamento..."
                className="min-h-[100px] mt-2 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelarModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmarCancelamento} 
              disabled={!motivoCancelamento.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Assinantes */}
      <Dialog open={showAdicionarAssinante} onOpenChange={setShowAdicionarAssinante}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              Adicionar Assinantes
            </DialogTitle>
            <DialogDescription>
              Selecione os usuários que devem assinar o Termo de Referência.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-80 overflow-y-auto">
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
                  <div>
                    <div className="font-medium">{usuario.nome}</div>
                    <div className="text-gray-500 text-xs">{usuario.cargo}</div>
                  </div>
                </Label>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdicionarAssinante(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdicionarAssinantes} className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Selecionados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Conclusão */}
      <Dialog open={showConcluirModal} onOpenChange={setShowConcluirModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Concluir Assinatura do Termo de Referência
            </DialogTitle>
            <DialogDescription>
              Confirme a conclusão da etapa de assinatura do Termo de Referência.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-800">
                <div className="font-medium">Status das Assinaturas:</div>
                <div className="mt-1">
                  {cardData.assinantes.map(assinante => (
                    <div key={assinante.id} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>{assinante.nome} - {assinante.status === 'ASSINADO' ? 'Assinado' : 'Pendente'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="observacao-conclusao" className="text-sm font-medium">
                Observação Final (Opcional)
              </Label>
              <Textarea
                id="observacao-conclusao"
                value={observacaoConclusao}
                onChange={(e) => setObservacaoConclusao(e.target.value)}
                placeholder="Adicione uma observação final sobre a conclusão..."
                className="min-h-[80px] mt-2 resize-none"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notificar-partes"
                checked={notificarPartes}
                onCheckedChange={(checked) => setNotificarPartes(checked === true)}
              />
              <Label htmlFor="notificar-partes" className="text-sm">
                Notificar todas as partes envolvidas
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConcluirModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmarConclusao} 
              disabled={isConcluindo}
              className="bg-green-600 hover:bg-green-700"
            >
              {isConcluindo ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Concluindo...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Conclusão
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
