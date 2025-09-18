import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Info,
  MoreHorizontal,
  ClipboardCheck,
  ListChecks,
  CheckIcon,
  XIcon,
  Paperclip
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import TextareaWithMentions from './TextareaWithMentions';
import CommentsSection from './CommentsSection';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';

// Tipos TypeScript conforme especificação
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

interface CardAssinaturaDFD {
  processoId: string;
  versaoFinalId: string;  // versão aprovada pela GSP
  statusEtapa: EtapaAssinaturaStatus;
  responsavelEtapa: { id: string; nome: string; cargo: string }; // e.g., Diretor da SE
  assinantes: Assinante[];
  sla: {
    regime: 'URGENCIA' | 'ORDINARIO';
    prazoDiasUteis: 1;
    decorridosDiasUteis: number;
    badge: 'ok' | 'risco' | 'estourado';
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

interface DFDAssinaturaSectionProps {
  processoId: string;
  etapaId: number;
  onComplete?: (data: any) => void;
  onSave?: (data: any) => void;
  initialData?: any;
  canEdit?: boolean;
  gerenciaCriadora?: string;
}

// Mock data usando usuários reais do sistema
const mockCardAssinatura: CardAssinaturaDFD = {
  processoId: "1",
  versaoFinalId: "v3",
  statusEtapa: "PENDENTE_ASSINATURA",
  responsavelEtapa: {
    id: "2",
    nome: "Diran Rodrigues de Souza Filho",
    cargo: "Secretário Executivo"
  },
  assinantes: [
    {
      id: "1",
      nome: "Diran Rodrigues de Souza Filho",
      cargo: "Secretário Executivo",
      email: "diran.rodrigues@hospital.gov.br",
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
    prazoDiasUteis: 1,
    decorridosDiasUteis: 0,
    badge: "ok"
  }
};

const mockComentarios: Comentario[] = [
  {
    id: "1",
    autor: "Yasmin Pissolati Mattos Bretz",
    cargo: "Gerente de Soluções e Projetos",
    data: "15/01/2025 10:30",
    texto: "Documento aprovado e enviado para assinatura. Aguardando assinaturas dos responsáveis."
  },
  {
    id: "2",
    autor: "Diran Rodrigues de Souza Filho",
    cargo: "Secretário Executivo",
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

export default function DFDAssinaturaSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true,
  gerenciaCriadora
}: DFDAssinaturaSectionProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const { podeEditarCard } = usePermissoes();
  
  // Estados principais
  const [cardData, setCardData] = useState<CardAssinaturaDFD>(mockCardAssinatura);
  const [comentarios, setComentarios] = useState<Comentario[]>(mockComentarios);
  const [novoComentario, setNovoComentario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para modais
  const [showAssinarModal, setShowAssinarModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [assinanteSelecionado, setAssinanteSelecionado] = useState<Assinante | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  
  // Estados para seleção de assinantes (GSP ou SE)
  const [showAdicionarAssinante, setShowAdicionarAssinante] = useState(false);
  const [usuariosSelecionados, setUsuariosSelecionados] = useState<string[]>([]);

  // Estados para o botão Concluir
  const [showConcluirModal, setShowConcluirModal] = useState(false);
  const [observacaoConclusao, setObservacaoConclusao] = useState('');
  const [notificarPartes, setNotificarPartes] = useState(true);
  const [isConcluindo, setIsConcluindo] = useState(false);

  // Estado de anexos (aba Anexos)
  const [annexes, setAnnexes] = useState<Array<{id:string; name:string; uploadedAt:string; uploadedBy:string; url?:string}>>([]);
  const [attachmentsSort, setAttachmentsSort] = useState<'desc'|'asc'>('desc');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const anexosOrdenados = useMemo(() => {
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

  // Verificar se é GSP ou SE (pode gerenciar assinaturas)
  const isGSPouSE = user?.gerencia?.includes('GSP') || user?.gerencia?.includes('SE') || false;
  
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
  const podeConcluir = () => {
    if (!user) return false;
    
    // Gerência responsável da etapa (SE - Secretaria Executiva)
    const ehGerenciaResponsavel = user.gerencia?.includes('SE') || user.gerencia?.includes('Secretaria Executiva');
    
    // Gerência de Soluções e Projetos (GSP)
    const ehGSP = user.gerencia?.includes('GSP') || user.gerencia?.includes('Gerência de Soluções e Projetos');
    
    const resultado = ehGerenciaResponsavel || ehGSP;
    
    return resultado;
  };

  // Verificar se todas as assinaturas foram concluídas
  const todasAssinaturasConcluidas = cardData.assinantes.every(assinante => assinante.status === 'ASSINADO');

  // Calcular progresso das assinaturas
  const assinaturasConcluidas = cardData.assinantes.filter(a => a.status === 'ASSINADO').length;
  const totalAssinaturas = cardData.assinantes.length;
  const progresso = totalAssinaturas > 0 ? (assinaturasConcluidas / totalAssinaturas) * 100 : 0;

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

  // Função para obter configuração do badge SLA
  const getSLABadgeConfig = (badge: string) => {
    switch (badge) {
      case 'ok':
        return {
          className: 'bg-green-100 text-green-800 border-green-300',
          label: 'Dentro do Prazo'
        };
      case 'risco':
        return {
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          label: 'Em Risco'
        };
      case 'estourado':
        return {
          className: 'bg-red-100 text-red-800 border-red-300',
          label: 'Estourado'
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          label: 'Não definido'
        };
    }
  };

  // Função para adicionar comentário
  const handleAdicionarComentario = () => {
    if (!novoComentario.trim()) return;

    const comentario: Comentario = {
      id: Date.now().toString(),
      autor: user?.nome || 'Usuário',
      cargo: user?.cargo || 'Cargo não informado',
      data: formatDateTimeBR(new Date()),
      texto: novoComentario.trim()
    };

    setComentarios([...comentarios, comentario]);
    setNovoComentario('');
    
    toast({
      title: "Comentário adicionado",
      description: "Seu comentário foi adicionado com sucesso."
    });
  };

  // Função para assinar documento
  const handleAssinarDocumento = async () => {
    if (!assinanteSelecionado) return;

    setIsLoading(true);
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar status do assinante
      const assinantesAtualizados = cardData.assinantes.map(assinante => {
        if (assinante.id === assinanteSelecionado.id) {
          return {
            ...assinante,
            status: 'ASSINADO' as AssinaturaStatus,
            assinadoEm: new Date().toISOString(),
            observacoes: observacoes.trim() || undefined
          };
        }
        return assinante;
      });

      const novoCardData = {
        ...cardData,
        assinantes: assinantesAtualizados
      };

      // Verificar se todas as assinaturas foram concluídas
      const todasAssinadas = assinantesAtualizados.every(a => a.status === 'ASSINADO');
      if (todasAssinadas) {
        novoCardData.statusEtapa = 'ASSINADO_N_N';
        
        // Desbloquear próxima etapa
        if (onComplete) {
          onComplete({
            etapa: 'despacho-dfd',
            assinaturas: assinantesAtualizados
          });
        }
      }

      setCardData(novoCardData);
      setShowAssinarModal(false);
      setAssinanteSelecionado(null);
      setObservacoes('');
      
      toast({
        title: "Documento assinado",
        description: "Sua assinatura foi registrada com sucesso."
      });

    } catch (error) {
      toast({
        title: "Erro ao assinar",
        description: "Não foi possível registrar sua assinatura.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para cancelar assinatura
  const handleCancelarAssinatura = async () => {
    if (!assinanteSelecionado) return;

    setIsLoading(true);
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar status do assinante
      const assinantesAtualizados = cardData.assinantes.map(assinante => {
        if (assinante.id === assinanteSelecionado.id) {
          return {
            ...assinante,
            status: 'CANCELADO' as AssinaturaStatus,
            canceladoEm: new Date().toISOString()
          };
        }
        return assinante;
      });

      setCardData({
        ...cardData,
        assinantes: assinantesAtualizados
      });
      
      setShowCancelarModal(false);
      setAssinanteSelecionado(null);
      setMotivoCancelamento('');
      
      toast({
        title: "Assinatura cancelada",
        description: "A assinatura foi cancelada com sucesso."
      });

    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: "Não foi possível cancelar a assinatura.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para concluir etapa com modal de confirmação
  const handleConcluirEtapa = async () => {
    setIsConcluindo(true);
    
    try {
      // Simular chamada para API conforme especificação
      const response = await fetch(`/processos/${processoId}/etapas/assinatura-dfd/concluir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          observacao: observacaoConclusao.trim() || undefined,
          notificar: notificarPartes
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao concluir etapa');
      }

      // Atualizar status do card para concluído
      setCardData({
        ...cardData,
        statusEtapa: 'CONCLUIDO'
      });
      
      setShowConcluirModal(false);
      setObservacaoConclusao('');
      setNotificarPartes(true);
      
      // Chamar callback para avançar para próxima etapa
      if (onComplete) {
        onComplete({
          etapa: 'despacho-dfd',
          assinaturas: cardData.assinantes,
          concluidoPor: user?.nome || 'Usuário',
          concluidoEm: new Date().toISOString(),
          observacao: observacaoConclusao.trim() || undefined,
          notificar: notificarPartes
        });
      }
      
      toast({
        title: "Etapa concluída",
        description: "Etapa concluída. Próxima etapa liberada."
      });

    } catch (error) {
      toast({
        title: "Erro ao concluir",
        description: "Não foi possível concluir a etapa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsConcluindo(false);
    }
  };

  // Função para adicionar assinantes (GSP ou SE)
  const handleAdicionarAssinantes = async () => {
    if (usuariosSelecionados.length === 0) return;

    setIsLoading(true);
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const novosAssinantes: Assinante[] = usuariosSelecionados.map(userId => {
        const usuario = mockUsuariosDisponiveis.find(u => u.id === userId);
        return {
          id: `assinante-${Date.now()}-${userId}`,
          nome: usuario?.nome || '',
          cargo: usuario?.cargo || '',
          email: usuario?.email || '',
          status: 'PENDENTE' as AssinaturaStatus,
          selecionadoPorId: user?.id || '',
          selecionadoEm: new Date().toISOString()
        };
      });

      setCardData({
        ...cardData,
        assinantes: [...cardData.assinantes, ...novosAssinantes]
      });
      
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

  // Função para remover assinante (GSP ou SE)
  const handleRemoverAssinante = async (assinanteId: string) => {
    setIsLoading(true);
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assinantesAtualizados = cardData.assinantes.filter(a => a.id !== assinanteId);
      
      setCardData({
        ...cardData,
        assinantes: assinantesAtualizados
      });
      
      toast({
        title: "Assinante removido",
        description: "O assinante foi removido com sucesso."
      });

    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o assinante.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1️⃣ Visualização do DFD */}
      <div className="rounded-2xl border border-slate-300 shadow-md bg-white p-6 mb-8 min-h-[700px]">
        <header className="flex items-center gap-3 mb-4">
          <PenTool className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Visualização do DFD</h2>
          <div className="ml-auto">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Visualização
            </span>
                  </div>
        </header>
        <div className="border-b-2 border-indigo-200 mb-6"></div>
        <div className="space-y-4">
          {/* Botões de ação */}
          <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Visualização",
                          description: "Abrindo DFD para visualização."
                        });
                      }}
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Download Iniciado",
                          description: "O arquivo DFD está sendo baixado."
                        });
                      }}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Baixar
                    </Button>
                  </div>

                {/* Visualização do PDF */}
                <div className="w-full min-h-[520px] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                                     <div className="text-center text-gray-500">
                     <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                     <p className="text-lg font-medium">Visualização do DFD</p>
                     <p className="text-sm">Documento final aprovado por Yasmin Pissolati Mattos Bretz</p>
                     <p className="text-xs mt-2">(Bloqueado para edição)</p>
                   </div>
                </div>
              </div>
            </div>

      {/* 2️⃣ Gerenciamento */}
      <div className="rounded-2xl border border-slate-300 shadow-md bg-white p-6 mb-8 min-h-[700px]">
        <header className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900">Gerenciamento</h2>
          <div className="ml-auto">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  Gerenciamento
            </span>
                </div>
              </header>
        <div className="border-b-2 border-slate-200 mb-6"></div>
        <div>
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
                  
                  {cardData.assinantes.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Nenhum assinante selecionado</p>
                    </div>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto space-y-2">
                      {cardData.assinantes.map((assinante) => {
                        const statusConfig = getAssinaturaStatusConfig(assinante.status);
                        const diasRest = cardData.sla.prazoDiasUteis - cardData.sla.decorridosDiasUteis;
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
                                {/* Botão Assinar - para o usuário designado */}
                                {assinante.status === 'PENDENTE' && assinante.email === user?.email && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => {
                                      setAssinanteSelecionado(assinante);
                                      setShowAssinarModal(true);
                                    }}
                                    className="h-6 px-2 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                                  >
                                    <PenTool className="w-3 h-3 mr-1" />
                                    Assinar
                                  </Button>
                                )}
                                
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

                {/* Progresso das assinaturas (por quantidade) */}
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
                    {/* Upload */}
                    {isGSPouSE && (
                      <div>
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg,.gif,.bmp,.tif,.tiff" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if(!f) return; setAnnexes(prev=>[{id:`a-${Date.now()}`,name:f.name,uploadedAt:new Date().toISOString(),uploadedBy:user?.nome||'Usuário'},...prev]); if(e.target) e.target.value=''; toast({title:'Anexo adicionado', description:`${f.name} foi anexado.`}); }} />
                        <Button onClick={()=>fileInputRef.current?.click()} variant="outline" className="w-full h-9 border-dashed border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors text-sm">
                          <Upload className="w-4 h-4 mr-2"/>Adicionar Anexo
                        </Button>
                      </div>
                    )}
                    {/* Lista */}
                    {annexes.length === 0 ? (
                      <div className="pt-4">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-center text-gray-500 font-medium">Nenhum anexo adicionado</p>
                      </div>
                    ) : (
                      <div className={`${annexes.length > 6 ? 'max-h-[280px] overflow-y-auto' : ''} space-y-0 w-full` }>
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
                              {/* Ações - desktop */}
                              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                                <Button size="sm" variant="outline" aria-label="Visualizar" className="h-7 w-7 p-0 hover:bg-blue-50" onClick={()=>openInNewTab(annex.url)}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" aria-label="Baixar" className="h-7 w-7 p-0 hover:bg-green-50">
                                  <Download className="w-3 h-3" />
                                </Button>
                                {isGSPouSE && (
                                  <Button size="sm" variant="outline" aria-label="Remover" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={()=>setAnnexes(prev=>prev.filter(a=>a.id!==annex.id))}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                              {/* Ações - mobile (menu simples inline) */}
                              <div className="sm:hidden flex items-center flex-shrink-0">
                                <div className="relative">
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                  <div className="absolute right-0 mt-1 bg-white border rounded shadow-sm p-1 z-20">
                                    <button className="block px-3 py-1 text-sm hover:bg-slate-50 w-full text-left" onClick={()=>openInNewTab(annex.url)}>Visualizar</button>
                                    <button className="block px-3 py-1 text-sm hover:bg-slate-50 w-full text-left">Baixar</button>
                                    {isGSPouSE && (
                                      <button className="block px-3 py-1 text-sm hover:bg-slate-50 w-full text-left text-red-600" onClick={()=>setAnnexes(prev=>prev.filter(a=>a.id!==annex.id))}>Remover</button>
                                    )}
                                  </div>
                                </div>
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
      </div>

      {/* 3️⃣ Painel da Etapa */}
      <div className="rounded-2xl border border-slate-300 shadow-md bg-white p-6 mb-8 min-h-[700px]">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1️⃣ Card Status & Prazo (controle temporal completo) */}
            <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
              {/* Header com Status */}
              <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-800">Status & Prazo</h3>
                </div>
                {(() => {
                  const statusMap: Record<string, {label: string; cls: string}> = {
                    PENDENTE_ASSINATURA: { label: 'Pendente de Assinatura', cls: 'bg-yellow-100 text-yellow-800' },
                    ASSINADO_N_N: { label: 'Assinado (parcial)', cls: 'bg-blue-100 text-blue-800' },
                    CONCLUIDO: { label: 'Concluído', cls: 'bg-green-100 text-green-800' }
                  };
                  const cfg = statusMap[cardData.statusEtapa] || { label: 'Indefinido', cls: 'bg-gray-100 text-gray-800' };
                  return <Badge className={`text-sm font-semibold px-3 py-2 ${cfg.cls}`}>{cfg.label}</Badge>;
                })()}
              </header>
              
              <div className="space-y-4">
                {/* 1. Faixa de Prazos */}
                <div className="space-y-4">
                  {/* Data de Criação */}
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                      <Calendar className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Data de Criação</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatDateBR(new Date().toISOString())}
                      </p>
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
                        <p className="text-lg font-bold text-slate-900">
                          {formatDateBR(new Date().toISOString())}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border border-slate-300 text-slate-700">
                        {cardData.sla.prazoDiasUteis} dias úteis
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
                        <p className="text-lg font-bold text-slate-900">
                          {formatDateBR(new Date(Date.now() + cardData.sla.prazoDiasUteis * 24 * 60 * 60 * 1000).toISOString())}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border border-slate-300 text-slate-700">
                        prazo limite
                      </span>
                    </div>
                  </div>
                  
                  {/* Prazo Cumprido (quando aplicável) */}
                  {cardData.statusEtapa === 'CONCLUIDO' && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center border border-green-300">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-green-600">Prazo Cumprido</p>
                            <p className="text-lg font-bold text-green-700">
                              {formatDateBR(new Date().toISOString())}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border border-green-300 text-green-700">
                            {cardData.sla.decorridosDiasUteis} dias úteis
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 2. Destaque Central - Dias Restantes/Atraso */}
                <div className="border-t border-slate-200 pt-4">
                  {(() => {
                    const diasRest = cardData.sla.prazoDiasUteis - cardData.sla.decorridosDiasUteis;
                    const isAtraso = diasRest < 0;
                    const isUrgente = diasRest <= 2 && diasRest >= 0;
                    const isFinalizada = cardData.statusEtapa === 'CONCLUIDO';
                    
                    let corTexto = 'text-green-600';
                    let legenda = 'dias restantes';
                    
                    if (isFinalizada) {
                      corTexto = 'text-green-600';
                      legenda = 'etapa finalizada';
                    } else if (isAtraso) {
                      corTexto = 'text-red-600';
                      legenda = 'dias em atraso';
                    } else if (isUrgente) {
                      corTexto = 'text-amber-600';
                      legenda = 'dias restantes (≤2)';
                    }
                    
                    return (
                      <div className="text-center py-4">
                        <div className={`text-4xl font-extrabold ${corTexto} mb-2`}>
                          {isFinalizada ? '✓' : Math.abs(diasRest)}
                        </div>
                        <div className={`text-sm font-medium ${corTexto}`}>
                          {legenda}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                {/* 3. Barra de SLA (progresso temporal) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Progresso Temporal</span>
                    {(() => {
                      const diasRest = cardData.sla.prazoDiasUteis - cardData.sla.decorridosDiasUteis;
                      const isAtraso = diasRest < 0;
                      const isUrgente = diasRest <= 2 && diasRest >= 0;
                      const isFinalizada = cardData.statusEtapa === 'CONCLUIDO';
                      
                      if (isFinalizada) {
                        return <Badge className="bg-green-100 text-green-800 text-xs">Dentro do prazo</Badge>;
                      } else if (isAtraso) {
                        return <Badge className="bg-red-100 text-red-800 text-xs">Atrasado</Badge>;
                      } else if (isUrgente) {
                        return <Badge className="bg-amber-100 text-amber-800 text-xs">Próximo do prazo</Badge>;
                      } else {
                        return <Badge className="bg-green-100 text-green-800 text-xs">Dentro do prazo</Badge>;
                      }
                    })()}
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="w-full bg-slate-200 rounded-full h-3 cursor-help"
                          aria-label={`Progresso temporal da etapa de assinatura, ${Math.round((cardData.sla.decorridosDiasUteis / cardData.sla.prazoDiasUteis) * 100)}% concluído, ${cardData.sla.decorridosDiasUteis} de ${cardData.sla.prazoDiasUteis} dias úteis decorridos`}
                        >
                          {(() => {
                            const total = Math.max(1, cardData.sla.prazoDiasUteis);
                            const passados = Math.max(0, Math.min(cardData.sla.decorridosDiasUteis, total));
                            const perc = Math.round((passados / total) * 100);
                            const isFinalizada = cardData.statusEtapa === 'CONCLUIDO';
                            
                            let corBarra = 'bg-emerald-500';
                            if (isFinalizada) {
                              corBarra = 'bg-green-500';
                            } else if (perc >= 71 && perc <= 99) {
                              corBarra = 'bg-amber-500';
                            } else if (perc >= 100) {
                              corBarra = 'bg-red-500';
                            }
                            
                            return (
                              <div 
                                className={`h-3 rounded-full transition-all ${corBarra}`}
                                style={{ width: `${Math.min(perc, 100)}%` }}
                              />
                            );
                          })()}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {cardData.sla.decorridosDiasUteis} de {cardData.sla.prazoDiasUteis} dias úteis decorridos
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Legenda da barra */}
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Decorridos: {cardData.sla.decorridosDiasUteis} / {cardData.sla.prazoDiasUteis} dias úteis</span>
                    <span>Progresso: {Math.round((cardData.sla.decorridosDiasUteis / cardData.sla.prazoDiasUteis) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2️⃣ Card Checklist da Etapa (pendências primeiro) */}
            <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
              <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-800">Checklist da Etapa</h3>
                </div>
                {(() => {
                  const checklist = (() => {
                    const items: Array<{id:string; label:string; status:'completed'|'pending'|'warning'; description?:string}> = [];
                    items.push({ 
                      id: 'assinantes', 
                      label: totalAssinaturas > 0 ? 'Assinantes selecionados' : 'Selecionar assinantes', 
                      status: totalAssinaturas > 0 ? 'completed' : 'pending',
                      description: totalAssinaturas > 0 ? `${totalAssinaturas} assinante(s) selecionado(s)` : 'Nenhum assinante foi selecionado'
                    });
                    items.push({ 
                      id: 'coleta', 
                      label: progresso === 100 ? 'Assinaturas concluídas' : 'Coletar assinaturas restantes', 
                      status: progresso === 100 ? 'completed' : (progresso > 0 ? 'warning' : 'pending'),
                      description: progresso === 100 ? 'Todas as assinaturas foram coletadas' : `${assinaturasConcluidas} de ${totalAssinaturas} assinaturas coletadas`
                    });
                    return items;
                  })();
                  const pendentes = checklist.filter(item => item.status === 'pending').length;
                  const total = checklist.length;
                  
                  return (
                    <div className="flex items-center gap-2">
                      {pendentes > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {pendentes} pendente{pendentes !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {total} item{total !== 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })()}
              </header>
              
              <div className="space-y-1">
                {(() => {
                  const checklist = (() => {
                    const items: Array<{id:string; label:string; status:'completed'|'pending'|'warning'; description?:string}> = [];
                    items.push({ 
                      id: 'assinantes', 
                      label: totalAssinaturas > 0 ? 'Assinantes selecionados' : 'Selecionar assinantes', 
                      status: totalAssinaturas > 0 ? 'completed' : 'pending',
                      description: totalAssinaturas > 0 ? `${totalAssinaturas} assinante(s) selecionado(s)` : 'Nenhum assinante foi selecionado'
                    });
                    items.push({ 
                      id: 'coleta', 
                      label: progresso === 100 ? 'Assinaturas concluídas' : 'Coletar assinaturas restantes', 
                      status: progresso === 100 ? 'completed' : (progresso > 0 ? 'warning' : 'pending'),
                      description: progresso === 100 ? 'Todas as assinaturas foram coletadas' : `${assinaturasConcluidas} de ${totalAssinaturas} assinaturas coletadas`
                    });
                    return items;
                  })();
                  
                  return checklist.length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center py-6">
                      Nenhum requisito definido para esta etapa.
                    </p>
                  ) : (
                    checklist.map((item) => (
                      <TooltipProvider key={item.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-3 py-2 px-2 hover:bg-slate-50 rounded transition-colors cursor-pointer">
                              {item.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : item.status === 'warning' ? (
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="text-sm text-slate-700 flex-1">{item.label}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))
                  );
                })()}
              </div>
            </div>

            {/* 3️⃣ Card Mini Timeline (painel vertical completo) */}
            <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6 flex flex-col min-h-[320px]">
              <header className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-800">Mini Timeline</h3>
              </header>

              <div className="flex-1 flex flex-col">
                {(() => {
                  const timeline = [] as Array<{id:string; autor:string; descricao:string; dataHora:string; tipo:'assinatura'|'anexo'}>;
                  // Assinaturas recentes
                  cardData.assinantes.forEach(a => {
                    if (a.assinadoEm) {
                      timeline.push({ id: `ass-${a.id}`, autor: a.nome, descricao: 'Assinatura registrada', dataHora: a.assinadoEm, tipo: 'assinatura' });
                    }
                  });
                  // Anexos recentes
                  anexosOrdenados.slice(0, 2).forEach(ax => {
                    timeline.push({ id: `ax-${ax.id}`, autor: ax.uploadedBy, descricao: 'Anexo adicionado', dataHora: ax.uploadedAt, tipo: 'anexo' });
                  });
                  const ordered = timeline.sort((a,b)=> new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()).slice(0,3);
                  
                  return ordered.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-sm text-gray-500 italic text-center">
                        Ainda não há ações registradas.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Timeline com scroll */}
                      <div className="flex-1 relative pr-2">
                        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                        <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400">
                          <div className="flex flex-col gap-4 pl-6">
                            {ordered.map((item, index) => (
                              <div key={item.id} className="relative group">
                                {/* Ícone sobreposto à linha */}
                                <div className="absolute -left-6 top-0 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                  {item.tipo === 'assinatura' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Paperclip className="w-4 h-4 text-gray-600" />}
                                </div>
                                
                                {/* Conteúdo do item */}
                                <div className="hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors cursor-pointer">
                                  <p className="text-sm font-semibold text-slate-700 mb-1">
                                    {item.descricao}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{item.autor}</span>
                                    <span>•</span>
                                    <span>{formatDateTimeBR(new Date(item.dataHora))}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Rodapé fixo */}
                      <div className="border-t border-slate-200 pt-3 mt-4">
                        <button
                          className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                          aria-label="Ver histórico completo de ações"
                        >
                          Ver todas as ações
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
        </div>
      </div>


      {/* 4️⃣ Comentários */}
      <div className="w-full">
<div className="card-shell">
          <CommentsSection
            processoId={processoId}
            etapaId={etapaId}
            cardId="comentarios-assinatura"
            title="Comentários"
          />
        </div>
      </div>

      {/* 5️⃣ Ações da Etapa */}
      <div className="rounded-2xl border border-slate-300 shadow-md bg-white p-6 mb-8">
        <header className="flex items-center gap-3 mb-4">
          <Flag className="w-6 h-6 text-orange-600" />
          <h2 className="text-lg font-bold text-slate-900">Ações da Etapa</h2>
          <div className="ml-auto">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Ações
                    </span>
                  </div>
        </header>
        <div className="border-b-2 border-orange-200 mb-6"></div>
        <div className="space-y-4">
          {/* Informações de Status */}
          <div className="grid grid-cols-1 gap-4">
            {/* Responsável */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                <User className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Responsável</p>
                <p className="text-lg font-bold text-slate-900">
                      {cardData.responsavelEtapa.nome || 'Sem responsável definido'}
                </p>
              </div>
                  </div>
                </div>

          {/* Ações Principais */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Salvar (para GSP ou SE) */}
            {isGSPouSE && (
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
            {(podeConcluir()) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        id="btn-concluir-card3"
                        data-testid="btn-concluir-card3"
                        onClick={() => setShowConcluirModal(true)}
                        disabled={!podeConcluir() || isConcluindo || !todasAssinaturasConcluidas || cardData.statusEtapa === 'CONCLUIDO'}
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
                  {(!todasAssinaturasConcluidas || cardData.statusEtapa === 'CONCLUIDO') && (
                    <TooltipContent>
                      <p>
                        {!todasAssinaturasConcluidas 
                          ? "Aguarde todas as assinaturas para concluir." 
                          : "Etapa já concluída"}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Cancelar Assinatura (para assinante pendente ou GSP) */}
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
              Confirme os dados da sua assinatura digital no documento.
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
                 <div className="text-gray-600">DFD - Versão Final (V{cardData.versaoFinalId})</div>
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
            <Button 
              onClick={handleAssinarDocumento}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Assinando...
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4 mr-2" />
                  Confirmar Assinatura
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <Dialog open={showCancelarModal} onOpenChange={setShowCancelarModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-orange-600" />
              Cancelar Assinatura
            </DialogTitle>
            <DialogDescription>
              Confirme o cancelamento da assinatura pendente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium">Assinante:</div>
                <div className="text-gray-600">{assinanteSelecionado?.nome}</div>
                <div className="text-gray-500 text-xs">{assinanteSelecionado?.cargo}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motivo" className="text-sm font-medium">
                Motivo do Cancelamento (opcional)
              </Label>
              <Textarea
                id="motivo"
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Informe o motivo do cancelamento..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelarModal(false)}>
              Voltar
            </Button>
            <Button 
              onClick={handleCancelarAssinatura}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Cancelando...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Confirmar Cancelamento
                </>
              )}
            </Button>
          </DialogFooter>
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
                  .filter(usuario => !cardData.assinantes.some(a => a.email === usuario.email))
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

      {/* Modal de Confirmação para Concluir Etapa */}
      <Dialog open={showConcluirModal} onOpenChange={setShowConcluirModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-600" />
              Concluir etapa – Assinatura do DFD
            </DialogTitle>
            <DialogDescription>
              Deseja concluir esta etapa? Isso avançará o processo para a próxima fase.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Resumo da etapa */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Etapa 3:</strong> Assinatura do DFD
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Gerência responsável: Secretaria Executiva (SE)
              </p>
              <p className="text-xs text-gray-500">
                Assinaturas: {assinaturasConcluidas}/{totalAssinaturas} concluídas
              </p>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacao-conclusao">Observações de conclusão (opcional)</Label>
              <Textarea
                id="observacao-conclusao"
                value={observacaoConclusao}
                onChange={(e) => setObservacaoConclusao(e.target.value)}
                placeholder="Adicione observações sobre a conclusão desta etapa..."
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Checkbox notificar */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notificar-partes"
                checked={notificarPartes}
                onCheckedChange={(checked) => setNotificarPartes(!!checked)}
              />
              <Label htmlFor="notificar-partes" className="text-sm">
                Notificar partes interessadas
              </Label>
            </div>

            {/* Alerta de confirmação */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Ao concluir esta etapa, o card será bloqueado para edição e a próxima etapa do fluxo será habilitada.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConcluirModal(false)}
              disabled={isConcluindo}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConcluirEtapa}
              disabled={isConcluindo}
              className="bg-green-600 hover:bg-green-700"
            >
              {isConcluindo ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Concluindo...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Concluir Etapa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
