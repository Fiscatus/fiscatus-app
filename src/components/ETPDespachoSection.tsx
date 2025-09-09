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
  numeroProcesso: string;
  observacoes: string;
  cidadeDataEmissao: string;
  responsavel: {
    id: string;
    nome: string;
    cargo: string;
    gerencia: string;
  };
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado do despacho
  const [despachoData, setDespachoData] = useState<DespachoData>({
    numeroProcesso: 'ETP-012-2025',
    observacoes: '',
    cidadeDataEmissao: `Brasília, ${formatDateBR(new Date())}`,
    responsavel: {
      id: '2',
      nome: 'Diran Rodrigues de Souza Filho',
      cargo: 'Secretário Executivo',
      gerencia: 'SE - Secretaria Executiva'
    },
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

  // Estado dos comentários
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState('');

  // Estado dos modais
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSubstituirModal, setShowSubstituirModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<string | null>(null);

  // Estado do arquivo
  const [arquivoDespacho, setArquivoDespacho] = useState<File | null>(null);
  const [arquivoNome, setArquivoNome] = useState<string>('');

  // Carregar dados iniciais
  useEffect(() => {
    if (initialData) {
      setDespachoData(initialData);
    }
  }, [initialData]);

  // Função para obter configuração do status
  const getStatusConfig = (status: DespachoStatus) => {
    switch (status) {
      case 'PENDENTE':
        return {
          label: 'Pendente',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock
        };
      case 'GERADO':
        return {
          label: 'Gerado',
          color: 'bg-blue-100 text-blue-800',
          icon: FileCheck
        };
      case 'ASSINADO':
        return {
          label: 'Assinado',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle
        };
      case 'CANCELADO':
        return {
          label: 'Cancelado',
          color: 'bg-red-100 text-red-800',
          icon: XCircle
        };
      default:
        return {
          label: 'Desconhecido',
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle
        };
    }
  };

  // Função para adicionar assinante
  const adicionarAssinante = () => {
    if (user && isSE) {
      const novoAssinante = {
        id: user.id,
        nome: user.nome,
        cargo: user.cargo,
        gerencia: user.gerencia,
        email: user.email,
        status: 'PENDENTE' as const
      };
      
      setAssinantes(prev => [...prev, novoAssinante]);
      toast({
        title: "Assinante adicionado",
        description: "Você foi adicionado como assinante do despacho.",
      });
    }
  };

  // Função para remover assinante
  const removerAssinante = (assinanteId: string) => {
    setAssinantes(prev => prev.filter(a => a.id !== assinanteId));
    toast({
      title: "Assinante removido",
      description: "Assinante removido com sucesso.",
    });
  };

  // Função para cancelar assinatura
  const cancelarAssinatura = (assinanteId: string) => {
    setAssinantes(prev => prev.map(a => 
      a.id === assinanteId 
        ? { ...a, status: 'CANCELADO' as const }
        : a
    ));
    toast({
      title: "Assinatura cancelada",
      description: "Assinatura cancelada com sucesso.",
    });
  };

  // Função para gerar despacho
  const gerarDespacho = () => {
    if (!despachoData.observacoes.trim()) {
      toast({
        title: "Erro",
        description: "Observações são obrigatórias para gerar o despacho.",
        variant: "destructive",
      });
      return;
    }

    setDespachoData(prev => ({
      ...prev,
      status: 'GERADO',
      atualizadoEm: new Date().toISOString()
    }));

    toast({
      title: "Despacho gerado",
      description: "O despacho do ETP foi gerado com sucesso.",
    });
  };

  // Função para assinar despacho
  const assinarDespacho = () => {
    if (despachoData.status !== 'GERADO') {
      toast({
        title: "Erro",
        description: "O despacho deve estar gerado para ser assinado.",
        variant: "destructive",
      });
      return;
    }

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
  };

  // Função para fazer download do despacho
  const downloadDespacho = () => {
    if (despachoData.status === 'ASSINADO') {
      toast({
        title: "Download iniciado",
        description: "O download do despacho foi iniciado.",
      });
    } else {
      toast({
        title: "Erro",
        description: "O despacho deve estar assinado para download.",
        variant: "destructive",
      });
    }
  };

  // Função para salvar alterações
  const salvarAlteracoes = () => {
    onSave(despachoData);
    toast({
      title: "Alterações salvas",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  // Função para concluir etapa
  const concluirEtapa = () => {
    if (despachoData.status === 'ASSINADO') {
      onComplete(despachoData);
      toast({
        title: "Etapa concluída",
        description: "A etapa de despacho do ETP foi concluída.",
      });
    } else {
      toast({
        title: "Erro",
        description: "O despacho deve estar assinado para concluir a etapa.",
        variant: "destructive",
      });
    }
  };

  // Função para adicionar comentário
  const adicionarComentario = () => {
    if (novoComentario.trim() && user) {
      const comentario: Comentario = {
        id: Date.now().toString(),
        autor: user.nome,
        cargo: user.cargo,
        data: new Date().toISOString(),
        texto: novoComentario.trim()
      };
      
      setComentarios(prev => [...prev, comentario]);
      setNovoComentario('');
      
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi adicionado com sucesso.",
      });
    }
  };

  // Função para upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setArquivoDespacho(file);
        setArquivoNome(file.name);
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

  // Função para remover arquivo
  const removerArquivo = () => {
    setArquivoDespacho(null);
    setArquivoNome('');
    toast({
      title: "Arquivo removido",
      description: "O arquivo foi removido com sucesso.",
    });
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
                
                {/* Número do Processo Administrativo */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="numeroProcesso" className="text-sm font-medium text-gray-700">
                    Número do Processo Administrativo
                  </Label>
                  <Input
                    id="numeroProcesso"
                    value={despachoData.numeroProcesso}
                    onChange={(e) => setDespachoData(prev => ({ ...prev, numeroProcesso: e.target.value }))}
                    className="w-full"
                    disabled={!canEdit}
                    placeholder="Número do processo"
                  />
                </div>

                {/* Observações */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700">
                    Observações <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="observacoes"
                    value={despachoData.observacoes}
                    onChange={(e) => setDespachoData(prev => ({ ...prev, observacoes: e.target.value }))}
                    className="w-full min-h-[100px]"
                    disabled={!canEdit}
                    placeholder="Digite as observações do despacho..."
                  />
                </div>

                {/* Cidade/Data de Emissão */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="cidadeData" className="text-sm font-medium text-gray-700">
                    Cidade/Data de Emissão
                  </Label>
                  <Input
                    id="cidadeData"
                    value={despachoData.cidadeDataEmissao}
                    onChange={(e) => setDespachoData(prev => ({ ...prev, cidadeDataEmissao: e.target.value }))}
                    className="w-full"
                    disabled={!canEdit}
                    placeholder="Cidade, data de emissão"
                  />
                </div>

                {/* Nome e Cargo do Responsável */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="responsavel" className="text-sm font-medium text-gray-700">
                    Nome e Cargo do Responsável
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="responsavel"
                      value={`${despachoData.responsavel.nome} - ${despachoData.responsavel.cargo}`}
                      className="w-full"
                      disabled
                      placeholder="Responsável pela etapa"
                    />
                    <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                      <User className="w-4 h-4 mr-1" />
                      SE
                    </Badge>
                  </div>
                </div>

                {/* Visualização do ETP assinado */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    ETP Assinado
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">ETP_012_2025_v1.pdf</p>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar ETP
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* DIREITA: Gerenciamento (4 colunas) */}
          <aside id="gerenciamento" className="col-span-12 lg:col-span-4 w-full">
            
            {/* Card de Gerenciamento */}
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-purple-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Gerenciamento
                </div>
              </header>
              <div className="p-4 md:p-6 space-y-4">
                
                {/* Responsável pela Etapa */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Responsável pela Etapa
                  </Label>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {despachoData.responsavel.nome}
                        </p>
                        <p className="text-xs text-blue-700">
                          {despachoData.responsavel.cargo}
                        </p>
                        <p className="text-xs text-blue-600">
                          {despachoData.responsavel.gerencia}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seleção de Assinantes */}
                {isSE && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Assinantes
                    </Label>
                    <Button
                      onClick={adicionarAssinante}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Adicionar Assinante
                    </Button>
                  </div>
                )}

                {/* Lista de Assinantes */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Assinantes Selecionados
                  </Label>
                  {assinantes.length > 0 ? (
                    <div className="space-y-2">
                      {assinantes.map((assinante) => (
                        <div key={assinante.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {assinante.nome}
                              </p>
                              <p className="text-xs text-gray-600">
                                {assinante.cargo}
                              </p>
                              <Badge 
                                className={`text-xs ${
                                  assinante.status === 'PENDENTE' 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : assinante.status === 'ASSINADO'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {assinante.status === 'PENDENTE' ? 'Pendente' :
                                 assinante.status === 'ASSINADO' ? 'Assinado' : 'Cancelado'}
                              </Badge>
                            </div>
                            {isSE && assinante.status === 'PENDENTE' && (
                              <Button
                                onClick={() => removerAssinante(assinante.id)}
                                variant="ghost"
                                size="sm"
                              >
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum assinante selecionado
                    </p>
                  )}
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Progresso da Execução
                  </Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progresso</span>
                      <span>
                        {despachoData.status === 'PENDENTE' ? '0%' :
                         despachoData.status === 'GERADO' ? '50%' :
                         despachoData.status === 'ASSINADO' ? '100%' : '0%'}
                      </span>
                    </div>
                    <Progress 
                      value={
                        despachoData.status === 'PENDENTE' ? 0 :
                        despachoData.status === 'GERADO' ? 50 :
                        despachoData.status === 'ASSINADO' ? 100 : 0
                      } 
                      className="h-2"
                    />
                  </div>
                </div>

              </div>
            </div>
          </aside>
        </div>

        {/* FULL: Documento do Despacho + Comentários */}
        <section id="documento-comentarios" className="col-span-12 w-full mt-6">
          
          {/* Card do Documento */}
          <div className="rounded-2xl border shadow-sm overflow-hidden bg-white mb-6">
            <header className="bg-orange-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-orange-600" />
                Documento do Despacho
              </div>
            </header>
            <div className="p-4 md:p-6 space-y-4">
              
              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={gerarDespacho}
                  disabled={!isSE || despachoData.status === 'GERADO' || despachoData.status === 'ASSINADO'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Gerar Despacho do ETP
                </Button>
                
                <Button
                  onClick={assinarDespacho}
                  disabled={!isSE || despachoData.status !== 'GERADO'}
                  variant="outline"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  Assinar Despacho
                </Button>
                
                <Button
                  onClick={downloadDespacho}
                  disabled={despachoData.status !== 'ASSINADO'}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF do Despacho
                </Button>
              </div>

              {/* Visualização do Despacho */}
              {despachoData.status === 'GERADO' || despachoData.status === 'ASSINADO' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Despacho_ETP_{despachoData.numeroProcesso}.pdf
                  </p>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar Despacho
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    O despacho será exibido aqui após ser gerado
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Comentários */}
          <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
            <header className="bg-indigo-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                Comentários
              </div>
            </header>
            <div className="p-4 md:p-6 space-y-4">
              
              {/* Área de novo comentário */}
              <div className="space-y-2">
                <TextareaWithMentions
                  value={novoComentario}
                  onChange={setNovoComentario}
                  placeholder="Adicione um comentário... (use @ para mencionar usuários)"
                  className="min-h-[80px]"
                  disabled={!canEdit}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={adicionarComentario}
                    disabled={!novoComentario.trim() || !canEdit}
                    size="sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Adicionar Comentário
                  </Button>
                </div>
              </div>

              {/* Lista de comentários */}
              <div className="space-y-3">
                {comentarios.length > 0 ? (
                  comentarios.map((comentario) => (
                    <div key={comentario.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {comentario.autor}
                            </span>
                            <span className="text-xs text-gray-500">
                              {comentario.cargo}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDateTimeBR(new Date(comentario.data))}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {comentario.texto}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum comentário ainda
                  </p>
                )}
              </div>

            </div>
          </div>
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
                      {despachoData.responsavel.nome || 'Sem responsável definido'}
                    </span>
                  </div>
                </div>

                {/* Lado direito - Botões de ação */}
                <div className="flex items-center gap-2">
              {/* Botão Salvar */}
              {canEdit && (
                <Button
                  onClick={salvarAlteracoes}
                  variant="outline"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              )}

              {/* Botão Concluir */}
              {canEdit && despachoData.status === 'ASSINADO' && (
                <Button
                  onClick={concluirEtapa}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Concluir Etapa
                </Button>
              )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
