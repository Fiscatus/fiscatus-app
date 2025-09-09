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
  numeroETP: string;
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

interface ETPDespachoSectionProps {
  processoId: string;
  etapaId: number;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
  initialData?: any;
  canEdit?: boolean;
  gerenciaCriadora?: string;
}

// Usuários reais do sistema "Simular Usuário (Para Teste de Permissões)"
const mockUsuariosDisponiveis = [
  {
    id: '1',
    nome: 'Yasmin Pissolati Mattos Bretz',
    cargo: 'Gerente de Soluções e Projetos',
    gerencia: 'GSP - Gerência de Soluções e Projetos',
    email: 'yasmin.pissolati@fiscatus.gov.br'
  },
  {
    id: '2',
    nome: 'Diran Rodrigues de Souza Filho',
    cargo: 'Secretário Executivo',
    gerencia: 'SE - Secretaria Executiva',
    email: 'diran.rodrigues@fiscatus.gov.br'
  },
  {
    id: '3',
    nome: 'Guilherme de Carvalho Silva',
    cargo: 'Gerente Suprimentos e Logistica',
    gerencia: 'GSL - Gerência de Suprimentos e Logística',
    email: 'guilherme.carvalho@fiscatus.gov.br'
  },
  {
    id: '4',
    nome: 'Leticia Bonfim Guilherme',
    cargo: 'Gerente de Licitações e Contratos',
    gerencia: 'GLC - Gerência de Licitações e Contratos',
    email: 'leticia.bonfim@fiscatus.gov.br'
  },
  {
    id: '5',
    nome: 'Dallas Kelson Francisco de Souza',
    cargo: 'Gerente Financeiro',
    gerencia: 'GFC - Gerência Financeira e Contábil',
    email: 'dallas.kelson@fiscatus.gov.br'
  }
];

export default function ETPDespachoSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true,
  gerenciaCriadora
}: ETPDespachoSectionProps) {
  const { user } = useUser();
  const { isSE, isGSP, isGSPouSE } = usePermissoes();
  const { toast } = useToast();
  const despachoFileInputRef = useRef<HTMLInputElement>(null);

  // Estado do despacho
  const [despachoData, setDespachoData] = useState<DespachoData>({
    numeroETP: 'ETP-012-2025',
    objeto: 'Contratação de Serviços de Limpeza Hospitalar',
    regimeTramitacao: 'URGENCIA',
    observacoes: '',
    cidadeDataEmissao: `Brasília, ${formatDateBR(new Date())}`,
    responsaveis: [
      {
        id: '2',
        nome: 'Diran Rodrigues de Souza Filho',
        cargo: 'Secretário Executivo',
        gerencia: 'SE - Secretaria Executiva'
      }
    ],
    status: 'PENDENTE',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  });

  // Estado dos assinantes
  const [assinantes, setAssinantes] = useState<Array<{
    id: string;
    nome: string;
    cargo: string;
    gerencia: string;
    email: string;
    status: 'PENDENTE' | 'ASSINADO' | 'CANCELADO';
    dataAssinatura?: string;
  }>>([]);

  // Estado dos modais
  const [showAdicionarResponsavel, setShowAdicionarResponsavel] = useState(false);
  const [showAdicionarAssinante, setShowAdicionarAssinante] = useState(false);
  const [showConcluirModal, setShowConcluirModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [assinanteSelecionado, setAssinanteSelecionado] = useState<any>(null);
  const [usuariosSelecionados, setUsuariosSelecionados] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado do arquivo do despacho
  const [despachoArquivo, setDespachoArquivo] = useState<{
    name: string;
    size: number;
    uploadedAt: string;
    file: File;
  } | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    if (initialData) {
      setDespachoData(initialData);
    }
  }, [initialData]);

  // Função para obter configuração do status
  const getStatusConfig = (status: 'PENDENTE' | 'ASSINADO' | 'CANCELADO') => {
    switch (status) {
      case 'PENDENTE':
        return {
          label: 'Pendente',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: <Clock className="w-3 h-3" />
        };
      case 'ASSINADO':
        return {
          label: 'Assinado',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'CANCELADO':
        return {
          label: 'Cancelado',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: <XCircle className="w-3 h-3" />
        };
      default:
        return {
          label: 'Desconhecido',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: <AlertCircle className="w-3 h-3" />
        };
    }
  };

  // Função para obter configuração do SLA
  const getSLABadgeConfig = (badge: string) => {
    switch (badge) {
      case 'no-prazo':
        return { label: 'No Prazo', className: 'bg-green-100 text-green-800' };
      case 'atencao':
        return { label: 'Atenção', className: 'bg-yellow-100 text-yellow-800' };
      case 'atrasado':
        return { label: 'Atrasado', className: 'bg-red-100 text-red-800' };
      default:
        return { label: 'No Prazo', className: 'bg-green-100 text-green-800' };
    }
  };

  // Dados do SLA (simulados)
  const sla = {
    prazoDiasUteis: 1,
    decorridosDiasUteis: 0,
    badge: 'no-prazo'
  };

  // Cálculos de progresso
  const totalAssinaturas = assinantes.length;
  const assinaturasConcluidas = assinantes.filter(a => a.status === 'ASSINADO').length;
  const progresso = totalAssinaturas > 0 ? (assinaturasConcluidas / totalAssinaturas) * 100 : 0;

  // Verificar permissões
  const podeEditar = (user?.gerencia && (
    user.gerencia.includes('GSP') || 
    user.gerencia.includes('SE')
  )) && canEdit;
  const podeAssinar = canEdit && isSE && despachoData.status === 'GERADO';

  // Função para adicionar responsável
  const handleAdicionarResponsavel = () => {
    if (usuariosSelecionados.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um usuário para adicionar como responsável.",
        variant: "destructive",
      });
      return;
    }

    const novosResponsaveis = usuariosSelecionados.map(usuarioId => {
      const usuario = mockUsuariosDisponiveis.find(u => u.id === usuarioId);
      return {
        id: usuario!.id,
        nome: usuario!.nome,
        cargo: usuario!.cargo,
        gerencia: usuario!.gerencia
      };
    });

    setDespachoData(prev => ({
      ...prev,
      responsaveis: [...prev.responsaveis, ...novosResponsaveis]
    }));
    setUsuariosSelecionados([]);
    setShowAdicionarResponsavel(false);
    
    toast({
      title: "Responsáveis adicionados",
      description: `${novosResponsaveis.length} responsável(is) adicionado(s) com sucesso.`,
    });
  };

  // Função para remover responsável
  const handleRemoverResponsavel = (responsavelId: string) => {
    setDespachoData(prev => ({
      ...prev,
      responsaveis: prev.responsaveis.filter(r => r.id !== responsavelId)
    }));
    toast({
      title: "Responsável removido",
      description: "Responsável removido com sucesso.",
    });
  };

  // Função para adicionar assinante
  const handleAdicionarAssinante = () => {
    if (usuariosSelecionados.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um usuário para adicionar como assinante.",
        variant: "destructive",
      });
      return;
    }

    const novosAssinantes = usuariosSelecionados.map(usuarioId => {
      const usuario = mockUsuariosDisponiveis.find(u => u.id === usuarioId);
      return {
        id: usuario!.id,
        nome: usuario!.nome,
        cargo: usuario!.cargo,
        gerencia: usuario!.gerencia,
        email: usuario!.email,
        status: 'PENDENTE' as const
      };
    });

    setAssinantes(prev => [...prev, ...novosAssinantes]);
    setUsuariosSelecionados([]);
    setShowAdicionarAssinante(false);
    
    toast({
      title: "Assinantes adicionados",
      description: `${novosAssinantes.length} assinante(s) adicionado(s) com sucesso.`,
    });
  };

  // Função para remover assinante
  const handleRemoverAssinante = (assinanteId: string) => {
    setAssinantes(prev => prev.filter(a => a.id !== assinanteId));
    toast({
      title: "Assinante removido",
      description: "Assinante removido com sucesso.",
    });
  };

  // Função para cancelar assinatura
  const handleCancelarAssinatura = () => {
    if (assinanteSelecionado) {
      setAssinantes(prev => prev.map(a => 
        a.id === assinanteSelecionado.id 
          ? { ...a, status: 'CANCELADO' as const }
          : a
      ));
      setShowCancelarModal(false);
      setAssinanteSelecionado(null);
      
      toast({
        title: "Assinatura cancelada",
        description: "Assinatura cancelada com sucesso.",
      });
    }
  };

  // Função para upload do arquivo do despacho
  const handleDespachoFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setDespachoArquivo({
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          file: file
        });
        toast({
          title: "Arquivo carregado",
          description: "O arquivo foi carregado com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Apenas arquivos PDF e DOCX são permitidos.",
          variant: "destructive",
        });
      }
    }
  };

  // Função para iniciar upload
  const handleUploadDespacho = () => {
    despachoFileInputRef.current?.click();
  };

  // Função para baixar despacho
  const handleBaixarDespacho = () => {
    if (despachoArquivo) {
      const url = URL.createObjectURL(despachoArquivo.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = despachoArquivo.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Função para editar despacho
  const handleEditarDespacho = () => {
    despachoFileInputRef.current?.click();
  };

  // Função para excluir despacho
  const handleExcluirDespacho = () => {
    setDespachoArquivo(null);
    toast({
      title: "Arquivo removido",
      description: "O arquivo foi removido com sucesso.",
    });
  };

  // Função para salvar despacho
  const handleSaveDespacho = async () => {
    setIsLoading(true);
    try {
      await onSave(despachoData);
      toast({
        title: "Despacho salvo",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar o despacho.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para gerar despacho
  const handleGerarDespacho = async () => {
    if (!despachoData.observacoes.trim()) {
      toast({
        title: "Erro",
        description: "Observações são obrigatórias para gerar o despacho.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      setDespachoData(prev => ({
        ...prev,
        status: 'GERADO',
        atualizadoEm: new Date().toISOString()
      }));
      
      toast({
        title: "Despacho gerado",
        description: "O despacho do ETP foi gerado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar o despacho.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para assinar despacho
  const handleAssinarDespacho = async () => {
    setIsLoading(true);
    try {
      setDespachoData(prev => ({
        ...prev,
        status: 'ASSINADO',
        assinadoPor: {
          id: user?.id || '',
          nome: user?.nome || '',
          cargo: user?.cargo || '',
          dataAssinatura: new Date().toISOString()
        },
        atualizadoEm: new Date().toISOString()
      }));
      
      toast({
        title: "Despacho assinado",
        description: "O despacho foi assinado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao assinar o despacho.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para download do PDF
  const handleDownloadPDF = () => {
    toast({
      title: "Download iniciado",
      description: "O download do despacho foi iniciado.",
    });
  };

  // Função para concluir etapa
  const handleConcluirEtapa = async () => {
    setIsLoading(true);
    try {
      await onComplete(despachoData);
      setShowConcluirModal(false);
      toast({
        title: "Etapa concluída",
        description: "A etapa de despacho do ETP foi concluída.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao concluir a etapa.",
        variant: "destructive",
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
                
                {/* Número do ETP */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="numeroETP" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4" />
                    Número do ETP
                  </Label>
                  <Input
                    id="numeroETP"
                    value={despachoData.numeroETP}
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
                    cardId="observacoes-despacho-etp"
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
                        const statusConfig = getStatusConfig(assinante.status);
                        return (
                          <div key={assinante.id} className="p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{assinante.nome}</span>
                                  <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} text-xs`}>
                                    {statusConfig.icon}
                                    <span className="ml-1">{statusConfig.label}</span>
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-600 mb-1">{assinante.cargo}</div>
                                <div className="text-xs text-gray-500">{assinante.email}</div>
                                {assinante.dataAssinatura && (
                                  <div className="text-xs text-green-600 mt-1">
                                    Assinado em {formatDateTimeBR(new Date(assinante.dataAssinatura))}
                                  </div>
                                )}
                              </div>
                              
                              {/* Ações */}
                              <div className="flex items-center gap-1">
                                {isSE && assinante.status === 'PENDENTE' && (
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
                                 (assinante.email === user?.email || isSE) && (
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

        {/* FULL: Despacho do ETP */}
        <section id="despacho-etp" className="col-span-12 w-full mt-6">
          <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
            <header className="bg-indigo-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                Despacho do ETP
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
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{despachoArquivo.name}</p>
                        <p className="text-xs text-gray-500">
                          {despachoArquivo.size} • {formatDateTimeBR(new Date(despachoArquivo.uploadedAt))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleBaixarDespacho}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="w-3 h-3" />
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
                              className="h-8 w-8 p-0"
                            >
                              <Edit3 className="w-3 h-3" />
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
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
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
            cardId="comentarios-despacho-etp"
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
              {podeEditar && (
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
              {podeEditar && (
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
              {podeAssinar && (
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

        {/* Modal para adicionar assinantes */}
        <Dialog open={showAdicionarAssinante} onOpenChange={setShowAdicionarAssinante}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Adicionar Assinantes
              </DialogTitle>
              <DialogDescription>
                Selecione os usuários que devem assinar o despacho do ETP.
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
                onClick={() => setShowAdicionarAssinante(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAdicionarAssinante}
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
                    Adicionar Assinantes
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
                Tem certeza que deseja concluir a etapa de Despacho do ETP? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>

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

        {/* Modal de Cancelamento de Assinatura */}
        <Dialog open={showCancelarModal} onOpenChange={setShowCancelarModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-orange-600" />
                Cancelar Assinatura
              </DialogTitle>
              <DialogDescription>
                Tem certeza que deseja cancelar a assinatura de {assinanteSelecionado?.nome}? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>

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
                className="bg-orange-600 hover:bg-orange-700"
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