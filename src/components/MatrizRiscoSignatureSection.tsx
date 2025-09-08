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

// Tipos TypeScript para Assinatura da Matriz de Risco
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

interface CardAssinaturaMatrizRisco {
  processoId: string;
  versaoFinalId: string;  // versão aprovada da Matriz de Risco
  statusEtapa: EtapaAssinaturaStatus;
  responsavelEtapa: { id: string; nome: string; cargo: string };
  assinantes: Assinante[];
  sla: {
    regime: 'URGENCIA' | 'ORDINARIO';
    prazoDiasUteis: number;
    decorridosDiasUteis: number;
    badge: 'ok' | 'risco' | 'estourado';
  };
  documentoMatrizRisco?: {
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

interface MatrizRiscoSignatureSectionProps {
  processoId: string;
  etapaId: number;
  onComplete?: (data: any) => void;
  onSave?: (data: any) => void;
  initialData?: any;
  canEdit?: boolean;
  gerenciaCriadora?: string;
}

// Mock data usando usuários reais do sistema
const mockCardAssinaturaMatrizRisco: CardAssinaturaMatrizRisco = {
  processoId: "1",
  versaoFinalId: "v1",
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
    prazoDiasUteis: 3,
    decorridosDiasUteis: 0,
    badge: "ok"
  },
  documentoMatrizRisco: {
    nome: "Matriz_Risco_Versao_Final.pdf",
    url: "mock-url-matriz-risco-final",
    mimeType: "application/pdf",
    tamanho: "1.8 MB",
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
    texto: "Matriz de Risco aprovada e enviada para assinatura. Aguardando assinaturas dos responsáveis."
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

export default function MatrizRiscoSignatureSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true,
  gerenciaCriadora
}: MatrizRiscoSignatureSectionProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const { podeEditarCard } = usePermissoes();
  
  // Estados principais
  const [cardData, setCardData] = useState<CardAssinaturaMatrizRisco>(mockCardAssinaturaMatrizRisco);
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
        description: "A assinatura da Matriz de Risco foi concluída com sucesso.",
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

  // Função para download do documento Matriz de Risco
  const handleDownloadMatrizRisco = () => {
    if (!cardData.documentoMatrizRisco) {
      toast({
        title: "Nenhum documento",
        description: "Nenhum documento de Matriz de Risco foi enviado ainda.",
        variant: "destructive"
      });
      return;
    }

    // Mock: simular download
    toast({
      title: "Download Iniciado",
      description: `O arquivo ${cardData.documentoMatrizRisco.nome} está sendo baixado.`
    });
  };

  // Função para visualizar o documento Matriz de Risco
  const handleVisualizarMatrizRisco = () => {
    if (!cardData.documentoMatrizRisco) {
      toast({
        title: "Nenhum documento",
        description: "Nenhum documento de Matriz de Risco foi enviado ainda.",
        variant: "destructive"
      });
      return;
    }

    // Mock: simular visualização
    toast({
      title: "Visualização",
      description: `Abrindo ${cardData.documentoMatrizRisco.nome} para visualização.`
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Container central ocupando toda a área */}
      <div className="w-full px-2">
        
        {/* Grid principal 12 colunas */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* ESQUERDA: Visualização da Matriz de Risco (8 colunas) */}
          <section id="visualizacao-matriz-risco" className="col-span-12 lg:col-span-8 w-full">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-purple-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PenTool className="w-5 h-5 text-purple-600" />
                    <span className="text-lg">Visualização da Matriz de Risco</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleVisualizarMatrizRisco}
                      disabled={!cardData.documentoMatrizRisco}
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadMatrizRisco}
                      disabled={!cardData.documentoMatrizRisco}
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
                  
                  {/* Informações do Documento */}
                  {cardData.documentoMatrizRisco && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">{cardData.documentoMatrizRisco.nome}</p>
                            <p className="text-xs text-blue-600">
                              {cardData.documentoMatrizRisco.tamanho} • {formatDateBR(cardData.documentoMatrizRisco.uploadedAt)} • 
                              Enviado por: {cardData.documentoMatrizRisco.uploadedBy}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={handleVisualizarMatrizRisco} className="h-6 w-6 p-0">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleDownloadMatrizRisco} className="h-6 w-6 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Área de Visualização do Documento */}
                  <div className="w-full min-h-[520px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">Visualização da Matriz de Risco</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {cardData.documentoMatrizRisco ? 'Clique em "Visualizar" para abrir o documento' : 'Nenhum documento disponível'}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Gerenciamento
                  </div>
                  {isGSP && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAdicionarAssinante(true)}
                      className="text-xs"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </div>
              </header>
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                
                {/* Progresso das Assinaturas */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progresso das Assinaturas</span>
                    <span className="text-sm text-gray-500">
                      {cardData.assinantes.filter(a => a.status === 'ASSINADO').length} / {cardData.assinantes.length}
                    </span>
                  </div>
                  <Progress value={progressoAssinaturas} className="h-2" />
                  <div className="flex items-center justify-between mt-2">
                    <Badge className={`text-xs ${
                      cardData.sla.badge === 'ok' ? 'bg-green-100 text-green-800' :
                      cardData.sla.badge === 'risco' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {cardData.sla.badge === 'ok' ? 'Dentro do Prazo' :
                       cardData.sla.badge === 'risco' ? 'Em Risco' : 'Estourado'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {cardData.sla.decorridosDiasUteis} / {cardData.sla.prazoDiasUteis} dias úteis
                    </span>
                  </div>
                </div>

                {/* Lista de Assinantes */}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Assinantes Designados</h4>
                  {cardData.assinantes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">Nenhum assinante designado</p>
                      {isGSP && (
                        <p className="text-sm text-gray-400 mt-1">
                          Clique em "Adicionar" para designar assinantes
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {cardData.assinantes.map((assinante) => (
                        <div key={assinante.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${
                                assinante.status === 'ASSINADO' ? 'bg-green-100 text-green-800' :
                                assinante.status === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {assinante.status === 'ASSINADO' ? 'Assinado' :
                                 assinante.status === 'CANCELADO' ? 'Cancelado' : 'Pendente'}
                              </Badge>
                            </div>
                            {isGSP && assinante.status === 'PENDENTE' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoverAssinante(assinante.id)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <UserMinus className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p><strong>Nome:</strong> {assinante.nome}</p>
                            <p><strong>Cargo:</strong> {assinante.cargo}</p>
                            {assinante.assinadoEm && (
                              <p><strong>Assinado em:</strong> {formatDateTimeBR(assinante.assinadoEm)}</p>
                            )}
                            {assinante.canceladoEm && (
                              <p><strong>Cancelado em:</strong> {formatDateTimeBR(assinante.canceladoEm)}</p>
                            )}
                            {assinante.observacoes && (
                              <p><strong>Observações:</strong> {assinante.observacoes}</p>
                            )}
                          </div>
                          {assinante.status === 'PENDENTE' && assinante.email === user?.email && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => handleAssinar(assinante)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                              >
                                <PenTool className="w-3 h-3 mr-1" />
                                Assinar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelarAssinatura(assinante)}
                                className="text-red-600 hover:text-red-700 text-xs"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* FULL: Comentários */}
          <section id="comentarios" className="col-span-12 w-full">
            <CommentsSection
              processoId={processoId}
              etapaId={etapaId.toString()}
              cardId="comentarios-assinatura-matriz-risco"
              title="Comentários"
            />
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
              Confirme os dados da sua assinatura digital no documento da Matriz de Risco.
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
                <div className="text-gray-600">Matriz de Risco - Versão Final (V{cardData.versaoFinalId})</div>
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
              Selecione os usuários que devem assinar a Matriz de Risco.
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
              Concluir Assinatura da Matriz de Risco
            </DialogTitle>
            <DialogDescription>
              Confirme a conclusão da etapa de assinatura da Matriz de Risco.
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
