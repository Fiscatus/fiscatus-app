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
import ProgressaoTemporal from '@/components/ProgressaoTemporal';
import Timeline from '@/components/timeline/Timeline';
import { TimelineItemModel, TimelineStatus } from '@/types/timeline';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateRealisticDates, validateAndFixTimeline } from '@/lib/realisticDates';

// Gerar timeline realista para o DFD Assinatura
const realisticAssinaturaTimeline = validateAndFixTimeline(generateRealisticDates({
  now: new Date(),
  isCompleted: false,
  maxDaysBack: 10,
  maxDaysForward: 5
}));

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
  Ban,
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
  Paperclip,
  Search
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
      selecionadoEm: realisticAssinaturaTimeline.startedAt
    },
    {
      id: "2",
      nome: "Gabriel Radamesis Gomes Nascimento",
      cargo: "Assessor Jurídico",
      email: "gabriel.radamesis@hospital.gov.br",
      status: "PENDENTE",
      selecionadoPorId: "gsp-1",
      selecionadoEm: realisticAssinaturaTimeline.startedAt
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
  const [selectedAnnexId, setSelectedAnnexId] = useState<string | null>(null);
  const [attachmentsSort, setAttachmentsSort] = useState<'desc'|'asc'>('desc');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const viewerFileInputRef = useRef<HTMLInputElement>(null);
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

  const selectedAnnex = useMemo(() => annexes.find(a => a.id === selectedAnnexId) || anexosOrdenados[0], [annexes, selectedAnnexId, anexosOrdenados]);

  useEffect(() => {
    if (!selectedAnnexId && anexosOrdenados.length > 0) {
      setSelectedAnnexId(anexosOrdenados[0].id);
    }
  }, [selectedAnnexId, anexosOrdenados]);

  useEffect(() => {
    // ativar skeleton quando trocar de arquivo visualizado
    if (selectedAnnex?.url) {
      setViewerLoading(true);
      // fallback de segurança caso onLoad não dispare
      const t = setTimeout(()=>setViewerLoading(false), 2000);
      return () => clearTimeout(t);
    } else {
      setViewerLoading(false);
    }
  }, [selectedAnnex?.url]);

  // Helpers de visualização
  const getFileExtension = (name?: string) => {
    if (!name) return '';
    const idx = name.lastIndexOf('.');
    return idx >= 0 ? name.substring(idx + 1).toLowerCase() : '';
  };
  const isPdf = (name?: string) => ['pdf'].includes(getFileExtension(name));
  const isImage = (name?: string) => ['png','jpg','jpeg','gif','bmp','tif','tiff','webp','svg'].includes(getFileExtension(name));

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
  
  // Timeline (balão) — seguir layout do Card Elaboração
  const mapToNewTimelineItems = (): TimelineItemModel[] => {
    const items: TimelineItemModel[] = [];

    // Assinaturas realizadas
    cardData.assinantes.forEach((a) => {
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

    // Ordenar por data desc
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

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
            <div className="flex items-center gap-2">
              <input
                ref={viewerFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg,.gif,.bmp,.tif,.tiff"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const newId = `a-${Date.now()}`;
                  const newAnnex = { id: newId, name: f.name, uploadedAt: new Date().toISOString(), uploadedBy: user?.nome || 'Usuário', url: URL.createObjectURL(f) };
                  setAnnexes(prev => [newAnnex, ...prev]);
                  setSelectedAnnexId(newId);
                  if (e.target) e.target.value = '';
                  toast({ title: 'Anexo adicionado', description: `${f.name} foi anexado.` });
                }}
              />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                  if (selectedAnnex?.url) {
                    openInNewTab(selectedAnnex.url);
                  } else {
                    toast({ title: 'Sem documento', description: 'Adicione um anexo para visualizar.', variant: 'destructive' });
                  }
                }}
                className="h-8 px-2 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                  if (selectedAnnex?.url) {
                    const link = document.createElement('a');
                    link.href = selectedAnnex.url;
                    link.download = selectedAnnex.name || 'documento.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    toast({ title: 'Sem documento', description: 'Adicione um anexo para baixar.', variant: 'destructive' });
                  }
                }}
                className="h-8 px-2 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Baixar
                    </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => viewerFileInputRef.current?.click()}
                className="h-8 px-2 text-xs"
              >
                <Upload className="w-3 h-3 mr-1" />
                Incluir
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!selectedAnnex) {
                    toast({ title: 'Nada para excluir', description: 'Não há documento selecionado.', variant: 'destructive' });
                    return;
                  }
                  setAnnexes(prev => {
                    const updated = prev.filter(a => a.id !== selectedAnnex.id);
                    setSelectedAnnexId(updated[0]?.id ?? null);
                    return updated;
                  });
                  toast({ title: 'Anexo removido', description: `${selectedAnnex.name} foi excluído.` });
                }}
                disabled={!selectedAnnex}
                className="h-8 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Excluir
              </Button>
                  </div>
          </div>
        </header>
        <div className="border-b-2 border-indigo-200 mb-6"></div>
        <div className="space-y-4">
          {/* Visualização do PDF (preenche toda a área) */}
          <div className="relative w-full min-h-[560px] h-[calc(100vh-320px)] rounded-xl border border-slate-200 bg-white overflow-hidden">
            {selectedAnnex?.url ? (
              isPdf(selectedAnnex.name) ? (
                <>
                  {viewerLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <div className="w-10 h-10 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
                    </div>
                  )}
                  <iframe src={selectedAnnex.url} className="absolute inset-0 w-full h-full" title="visualizacao-dfd" onLoad={()=>setViewerLoading(false)} />
                </>
              ) : isImage(selectedAnnex.name) ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  {viewerLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <div className="w-10 h-10 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
                    </div>
                  )}
                  <img src={selectedAnnex.url} alt={selectedAnnex.name} className="max-w-full max-h-full object-contain" onLoad={()=>setViewerLoading(false)} />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-gray-600 bg-white">
                  <div>
                    <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">{selectedAnnex.name}</p>
                    <p className="text-sm mb-3">Tipo não suportado para pré-visualização. Use Visualizar/Baixar.</p>
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="outline" onClick={()=>openInNewTab(selectedAnnex.url)}>
                        <Eye className="w-3 h-3 mr-1" /> Visualizar
                      </Button>
                      <Button size="sm" variant="outline" onClick={()=>{ const link=document.createElement('a'); link.href=selectedAnnex.url!; link.download=selectedAnnex.name||'documento'; document.body.appendChild(link); link.click(); document.body.removeChild(link); }}>
                        <Download className="w-3 h-3 mr-1" /> Baixar
                      </Button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-gray-500 bg-white">
                <div>
                     <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhum documento selecionado</p>
                  <p className="text-sm">Use Incluir no topo ou adicione um anexo na aba Anexos</p>
                   </div>
              </div>
            )}
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
                                    <Trash2 className="w-3 h-3" />
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
                                    <Ban className="w-3 h-3" />
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
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg,.gif,.bmp,.tif,.tiff" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if(!f) return; const newId = `a-${Date.now()}`; const newAnnex = {id:newId,name:f.name,uploadedAt:new Date().toISOString(),uploadedBy:user?.nome||'Usuário', url: URL.createObjectURL(f)}; setAnnexes(prev=>[newAnnex,...prev]); setSelectedAnnexId(newId); if(e.target) e.target.value=''; toast({title:'Anexo adicionado', description:`${f.name} foi anexado.`}); }} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
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
                      legenda = 'dias restantes (urgente)';
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
                
                {/* 3. Barra de SLA (progresso temporal) - padronizada */}
                    {(() => {
                  const inicio = new Date().toISOString();
                  const fim = new Date(Date.now() + cardData.sla.prazoDiasUteis * 24 * 60 * 60 * 1000).toISOString();
                  return <ProgressaoTemporal startISO={inicio} endISO={fim} className="space-y-2" />;
                    })()}
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
                  const items: Array<{id:string; label:string; status:'completed'|'pending'|'warning'; description?:string}> = [];
                  items.push({ id: 'assinantes', label: totalAssinaturas > 0 ? 'Assinantes selecionados' : 'Selecionar assinantes', status: totalAssinaturas > 0 ? 'completed' : 'pending', description: totalAssinaturas > 0 ? `${totalAssinaturas} assinante(s) selecionado(s)` : 'Nenhum assinante foi selecionado' });
                  items.push({ id: 'coleta', label: progresso === 100 ? 'Assinaturas concluídas' : 'Coletar assinaturas restantes', status: progresso === 100 ? 'completed' : (progresso > 0 ? 'warning' : 'pending'), description: progresso === 100 ? 'Todas as assinaturas foram coletadas' : `${assinaturasConcluidas} de ${totalAssinaturas} assinaturas coletadas` });
                  const completed = items.filter(i => i.status === 'completed').length;
                  const total = items.length;
                  return (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      <ListChecks className="w-4 h-4" />
                      <span>{completed}/{total}</span>
                    </div>
                  );
                })()}
              </header>
              {(() => {
                // gerar e ordenar
                const items: Array<{id:string; label:string; status:'completed'|'pending'|'warning'; description?:string}> = [];
                items.push({ id: 'assinantes', label: totalAssinaturas > 0 ? 'Assinantes selecionados' : 'Selecionar assinantes', status: totalAssinaturas > 0 ? 'completed' : 'pending', description: totalAssinaturas > 0 ? `${totalAssinaturas} assinante(s) selecionado(s)` : 'Nenhum assinante foi selecionado' });
                items.push({ id: 'coleta', label: progresso === 100 ? 'Assinaturas concluídas' : 'Coletar assinaturas restantes', status: progresso === 100 ? 'completed' : (progresso > 0 ? 'warning' : 'pending'), description: progresso === 100 ? 'Todas as assinaturas foram coletadas' : `${assinaturasConcluidas} de ${totalAssinaturas} assinaturas coletadas` });
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


      {/* 4️⃣ Timeline (balão) */}
      <Timeline data={mapToNewTimelineItems()} />

      {/* 5️⃣ Comentários */}
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
