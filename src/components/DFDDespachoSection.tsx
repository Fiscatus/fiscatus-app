import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  Shield
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import TextareaWithMentions from './TextareaWithMentions';
import CommentsSection from './CommentsSection';

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
  const { podeEditarCard, isGSP } = usePermissoes();
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

  // Verificar permissões
  const podeEditar = (user?.gerencia && (
    user.gerencia.includes('GSP') || 
    user.gerencia.includes('SE')
  )) && canEdit;

  const podeAssinar = user?.gerencia && user.gerencia.includes('SE');

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
          id: user?.id || '',
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                    placeholder="Descreva as observações do despacho... Use @ para mencionar usuários"
                    disabled={!podeEditar || despachoData.status !== 'PENDENTE'}
                    className="w-full border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                    minHeight="100px"
                    maxLength={1000}
                    processoId={processoId}
                    etapaId={etapaId}
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

          {/* DIREITA: Visualização do DFD Assinado (4 colunas) */}
          <aside id="visualizacao-dfd-assinado" className="col-span-12 lg:col-span-4 w-full flex flex-col">
            
            {/* Card de Visualização */}
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white flex-1 flex flex-col">
              <header className="bg-indigo-100 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  DFD Assinado
                </div>
              </header>
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                
                {/* Metadados do documento */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Versão:</span>
                      <span className="ml-2 text-gray-600">Final</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Autor:</span>
                      <span className="ml-2 text-gray-600">{initialData?.responsavelElaboracao || 'Yasmin Pissolati Mattos Bretz'} - {initialData?.areaSetorDemandante?.split(' - ')[0] || 'GSP'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Data de Aprovação:</span>
                      <span className="ml-2 text-gray-600">{initialData?.aprovadoData ? formatDate(initialData.aprovadoData) : '15/01/2025'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Status:</span>
                      <span className="ml-2 text-gray-600">Aprovado por {initialData?.aprovadoPor || 'Yasmin Pissolati Mattos Bretz'}</span>
                    </div>
                  </div>
                </div>

                {/* Visualização do PDF */}
                <div className="w-full min-h-[300px] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium">Visualização do DFD</p>
                    <p className="text-xs">Documento final aprovado por {initialData?.aprovadoPor || 'Yasmin Pissolati Mattos Bretz'}</p>
                    <p className="text-xs mt-1">(Bloqueado para edição)</p>
                  </div>
                </div>

              </div>
            </div>

          </aside>
        </div>

        {/* FULL: Comentários */}
        <section id="comentarios" className="col-span-12 w-full mt-6">
          <CommentsSection
            processoId={processoId}
            etapaId={etapaId}
            cardId="comentarios-despacho"
            title="Comentários"
          />
        </section>

        {/* Rodapé com botões */}
        <div className="mt-6 p-4">
          <div className="flex flex-wrap items-center justify-end gap-4">
            <div className="flex items-center gap-3">
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
      </div>
    </div>
  );
}
