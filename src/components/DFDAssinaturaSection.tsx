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
    <div className="min-h-screen bg-white">
      {/* Container central ocupando toda a área */}
      <div className="w-full px-2">
        {/* Grid principal 12 colunas */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* ESQUERDA: Visualização do DFD (8 colunas) */}
          <section id="visualizacao-dfd" className="col-span-12 lg:col-span-8 w-full">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-indigo-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PenTool className="w-5 h-5 text-indigo-600" />
                    <span className="text-lg">Visualização do DFD</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                </div>
              </header>
              <div className="p-4 md:p-6">
                
                {/* Metadados removidos para padronizar com Assinatura do ETP */}

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
                    <Badge className={getSLABadgeConfig(cardData.sla.badge).className}>
                      {getSLABadgeConfig(cardData.sla.badge).label}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Prazo: {cardData.sla.prazoDiasUteis} dia útil</div>
                    <div>Decorridos: {cardData.sla.decorridosDiasUteis} dias úteis</div>
                  </div>
                </div>

              </div>
            </div>
          </aside>
        </div>

        {/* Observações (FULL WIDTH) */}
        {isAssinantePendente && (
          <section className="mt-6">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-orange-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-orange-600" />
                  Observações (antes da assinatura)
                </div>
              </header>
              <div className="p-4 md:p-6">
                <TextareaWithMentions
                  value={observacoes}
                  onChange={(value) => setObservacoes(value)}
                  placeholder="Adicione observações antes de assinar o documento... Use @ para mencionar usuários"
                  minHeight="100px"
                  maxLength={500}
                  className="w-full border-gray-200 focus:border-orange-300 focus:ring-orange-300"
                  processoId={processoId}
                  etapaId={etapaId}
                  cardId="observacoes-assinatura"
                />
              </div>
            </div>
          </section>
        )}

        {/* Comentários (FULL WIDTH) */}
        <section className="mt-6">
          <CommentsSection
            processoId={processoId}
            etapaId={etapaId}
            cardId="comentarios-assinatura"
            title="Comentários"
          />
        </section>

        {/* Seção de Ações - Rodapé não fixo */}
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
                      1 dia no card
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
            </CardContent>
          </Card>
        </section>
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
