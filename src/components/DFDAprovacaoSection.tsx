import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Search,
  Info,
  Send,
  File,
  CalendarDays,
  Users,
  CheckSquare,
  Square
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import { useDFD, DFDData, DFDVersion, DFDVersionStatus, DFDAnnex } from '@/hooks/useDFD';

// Tipos para o novo sistema
type AnaliseStatus = 'AGUARDANDO_ANALISE' | 'APROVADA' | 'REPROVADA_NOVA_VERSAO';

interface ParecerTecnico {
  texto: string;
  analisadoEm?: string; // ISO
  analisadoPor?: { id: string; nome: string; cargo: string };
}

interface VersaoAnaliseResumo {
  versaoId: string;
  numeroVersao: number;
  status: 'enviada' | 'aprovada' | 'reprovada';
  autorId: string;
  criadoEm: string;
  decididoEm?: string;
  prazoDiasUteis?: number;
  slaStatus?: 'ok' | 'risco' | 'estourado';
  documentoPrincipal?: { nome: string; url: string; mimeType: string };
}

interface Comentario {
  id: string;
  autorId: string;
  autorNome: string;
  criadoEm: string;
  texto: string;
}

interface DFDAprovacaoSectionProps {
  processoId: string;
  etapaId: number;
  onComplete: (data: DFDData) => void;
  onSave: (data: DFDData) => void;
  initialData?: DFDData;
  canEdit?: boolean;
}

export default function DFDAprovacaoSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true
}: DFDAprovacaoSectionProps) {
  const { user } = useUser();
  const { podeEditarCard, isGSP } = usePermissoes();
  const { toast } = useToast();
  const { 
    dfdData, 
    aprovarVersao, 
    devolverParaCorrecao,
    addAnnex, 
    removeAnnex, 
    updateObservations, 
    canApprove,
    canDevolver
  } = useDFD(processoId);
  
  // Estados principais
  const [parecerTecnico, setParecerTecnico] = useState('');
  const [dataAnalise, setDataAnalise] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showAprovarDialog, setShowAprovarDialog] = useState(false);
  const [showCorrecaoDialog, setShowCorrecaoDialog] = useState(false);
  const [justificativaCorrecao, setJustificativaCorrecao] = useState('');
  const [activeTab, setActiveTab] = useState('versoes');
  const [comentarios, setComentarios] = useState<Comentario[]>([
    {
      id: '1',
      autorId: 'user1',
      autorNome: 'João Silva',
      criadoEm: '2024-01-15T10:00:00Z',
      texto: 'DFD enviado para análise técnica da GSP.'
    }
  ]);
  const [novoComentario, setNovoComentario] = useState('');

  // Verificar se é usuário da GSP
  const isGSPUser = () => {
    return user?.gerencia === 'GSP - Gerência de Soluções e Projetos';
  };

  // Verificar se pode aprovar - usar nova lógica de permissões
  const canApproveUser = () => {
    return isGSPUser() && dfdData.status === 'enviado_analise';
  };

  // Verificar se pode solicitar correção - usar nova lógica de permissões
  const canSolicitarCorrecaoUser = () => {
    return isGSPUser() && dfdData.status === 'enviado_analise';
  };

  // Verificar se pode editar - usar nova lógica de permissões
  const canEditCurrentVersion = () => {
    return dfdData.status === 'enviado_analise';
  };

  // Verificar se pode editar o parecer técnico - permitir para usuários autorizados
  const canEditParecerTecnico = () => {
    return dfdData.status === 'enviado_analise';
  };

  // Calcular SLA da análise
  const calcularSLA = (dataEnvio: string, dataAnalise?: string) => {
    const inicio = new Date(dataEnvio);
    const fim = dataAnalise ? new Date(dataAnalise) : new Date();
    const diasUteis = countBusinessDays(inicio, fim);
    
    // Regras padrão
    const prazoMaximo = 2; // 2 dias úteis para 1ª versão
    
    if (diasUteis <= prazoMaximo) return { status: 'ok' as const, dias: diasUteis };
    if (diasUteis <= prazoMaximo + 1) return { status: 'risco' as const, dias: diasUteis };
    return { status: 'estourado' as const, dias: diasUteis };
  };

  // Contar dias úteis
  const countBusinessDays = (start: Date, end: Date) => {
    let count = 0;
    const curDate = new Date(start.getTime());
    while (curDate <= end) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!parecerTecnico.trim()) {
      errors.push('Parecer Técnico é obrigatório');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleAprovar = () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha o Parecer Técnico.",
        variant: "destructive"
      });
      return;
    }

    setShowAprovarDialog(true);
  };

  const confirmarAprovar = () => {
    const dataAnaliseAtual = new Date().toISOString();
    setDataAnalise(dataAnaliseAtual);
    
    aprovarVersao(user?.nome || 'Usuário');
    onComplete(dfdData);
    
    toast({
      title: "DFD Aprovado",
      description: "O DFD foi aprovado e a próxima etapa foi liberada."
    });
    
    setShowAprovarDialog(false);
  };

  const handleSolicitarCorrecao = () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha o Parecer Técnico.",
        variant: "destructive"
      });
      return;
    }

    if (!justificativaCorrecao.trim()) {
      toast({
        title: "Erro",
        description: "A justificativa da correção é obrigatória.",
        variant: "destructive"
      });
      return;
    }

    setShowCorrecaoDialog(true);
  };

  const confirmarSolicitarCorrecao = () => {
    const dataAnaliseAtual = new Date().toISOString();
    setDataAnalise(dataAnaliseAtual);
    
    devolverParaCorrecao(justificativaCorrecao, user?.nome || 'Usuário');
    onSave(dfdData);
    
    toast({
      title: "Correção Solicitada",
      description: "O DFD foi devolvido para correção."
    });
    
    setShowCorrecaoDialog(false);
    setJustificativaCorrecao('');
  };

  const handleAddComentario = () => {
    if (!novoComentario.trim()) return;
    
    const comentario: Comentario = {
      id: `comentario_${Date.now()}`,
      autorId: user?.id || 'user1',
      autorNome: user?.nome || 'Usuário',
      criadoEm: new Date().toISOString(),
      texto: novoComentario.trim()
    };
    
    setComentarios(prev => [comentario, ...prev]);
    setNovoComentario('');
    
    toast({
      title: "Comentário Adicionado",
      description: "Comentário foi adicionado com sucesso."
    });
  };

  const getStatusConfig = (status: DFDVersionStatus) => {
    switch (status) {
      case 'rascunho':
        return {
          label: 'Em Elaboração',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Edit3 className="w-3 h-3" />
        };
      case 'enviado_analise':
        return {
          label: 'Enviado para Análise',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <Upload className="w-3 h-3" />
        };
      case 'devolvido':
        return {
          label: 'Devolvido para Correção',
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: <XCircle className="w-3 h-3" />
        };
      case 'aprovado':
        return {
          label: 'Aprovado',
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle className="w-3 h-3" />
        };
      default:
        return {
          label: 'Pendente',
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <Clock className="w-3 h-3" />
        };
    }
  };

  const getStatusInfo = () => {
    const statusConfig = getStatusConfig(dfdData.status);
    let actionInfo = '';

    switch (dfdData.status) {
      case 'enviado_analise':
        actionInfo = `Enviado por ${dfdData.enviadoPor} em ${formatDate(dfdData.enviadoData || '')}`;
        break;
      case 'devolvido':
        actionInfo = `Devolvido por ${dfdData.devolucaoPor} em ${formatDate(dfdData.devolucaoData || '')}`;
        break;
      case 'aprovado':
        actionInfo = `Aprovado por ${dfdData.aprovadoPor} em ${formatDate(dfdData.aprovadoData || '')}`;
        break;
      default:
        actionInfo = '';
    }

    return { statusConfig, actionInfo };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter versão enviada para análise (última)
  const versaoEnviada = dfdData.versions.find(v => v.status === 'enviado_analise' && v.isFinal);
  
  // Para não-GSP, mostrar apenas versão final aprovada
  const versaoParaExibir = !isGSPUser() && dfdData.status === 'aprovado' 
    ? dfdData.versions.find(v => v.status === 'aprovado' && v.isFinal)
    : versaoEnviada;

  return (
    <div className="bg-white">
      {/* Header Moderno */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Search className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aprovação do DFD</h1>
              <p className="text-gray-600">Análise e Aprovação Técnica do Documento de Formalização da Demanda</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(() => {
              const { statusConfig, actionInfo } = getStatusInfo();
              return (
                <>
                  <Badge className={`${statusConfig.color} px-3 py-1`}>
                    {statusConfig.icon}
                    <span className="ml-2">{statusConfig.label}</span>
                  </Badge>
                  {actionInfo && (
                    <span className="text-xs text-gray-500">{actionInfo}</span>
                  )}
                </>
              );
            })()}
            {!isGSPUser() && (
              <Badge variant="outline" className="px-3 py-1">
                <Lock className="w-4 h-4 mr-2" />
                Etapa Restrita à GSP
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Container central ocupando toda a área */}
      <div className="w-full">
        
        {/* Grid principal 12 colunas */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* ESQUERDA: Dados do DFD (8 colunas) */}
          <section id="dados-dfd" className="col-span-12 lg:col-span-8 w-full">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-indigo-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3 text-lg">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Dados do DFD
                  {versaoParaExibir && (
                    <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                      V{versaoParaExibir.version}
                    </Badge>
                  )}
                </div>
              </header>
              <div className="p-4 md:p-6">
                {versaoParaExibir ? (
                  <div className="space-y-4">
                    {/* Metadados curtos */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 border-b border-gray-100 pb-3">
                      <span>V{versaoParaExibir.version}</span>
                      <span>•</span>
                      <span>{versaoParaExibir.createdBy}</span>
                      <span>•</span>
                      <span>{formatDate(versaoParaExibir.createdAt)}</span>
                    </div>

                    {/* Visualização do documento */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          Objetivo da Contratação
                        </Label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-800">{versaoParaExibir.objetivoContratacao}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          Justificativa da Demanda
                        </Label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-800">{versaoParaExibir.justificativaDemanda}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Gerência Demandante</Label>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-800">{versaoParaExibir.unidadeDemandante}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Data de Elaboração</Label>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-800">{formatDate(versaoParaExibir.dataElaboracao)}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Responsável</Label>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-800">{versaoParaExibir.responsavelElaboracao}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[520px] w-full rounded-lg border flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Nenhuma versão encontrada</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {!isGSPUser() ? 'Aguarde a aprovação da versão final' : 'Aguarde o envio de uma versão para análise'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* DIREITA: Gerenciamento (4 colunas) */}
          <aside id="gerenciamento" className="col-span-12 lg:col-span-4 w-full">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-slate-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3 text-lg">
                  <History className="w-5 h-5 text-slate-600" />
                  Gerenciamento
                </div>
              </header>
              <div className="p-4 md:p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="versoes">Versões</TabsTrigger>
                    <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="versoes" className="mt-4">
                    {dfdData.versions.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                          <History className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">Nenhuma versão disponível</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {dfdData.versions.map((version) => {
                          const statusConfig = getStatusConfig(version.status);
                          const sla = calcularSLA(version.createdAt, version.aprovadoData);
                          
                          return (
                            <div key={version.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={version.isFinal ? "default" : "outline"} className="text-xs">
                                    V{version.version}
                                    {version.isFinal && <CheckCircle className="w-3 h-3 ml-1" />}
                                  </Badge>
                                  <Badge className={`text-xs ${statusConfig.color}`}>
                                    {statusConfig.icon}
                                    <span className="ml-1">{statusConfig.label}</span>
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <p><strong>Autor:</strong> {version.createdBy}</p>
                                <p><strong>Data:</strong> {formatDate(version.createdAt)}</p>
                                {sla && (
                                  <div className="flex items-center gap-2">
                                    <span><strong>SLA:</strong> {sla.dias} dias úteis</span>
                                    <Badge 
                                      className={`text-xs ${
                                        sla.status === 'ok' ? 'bg-green-100 text-green-800' :
                                        sla.status === 'risco' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {sla.status === 'ok' ? 'Dentro do Prazo' :
                                       sla.status === 'risco' ? 'Em Risco' : 'Estourado'}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="anexos" className="mt-4">
                    {dfdData.annexes.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">Nenhum anexo adicionado</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {dfdData.annexes.map((annex) => (
                          <div key={annex.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{annex.name}</p>
                                <p className="text-xs text-gray-500">
                                  {annex.size} • {formatDate(annex.uploadedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </aside>

          {/* FULL: Parecer Técnico */}
          <section id="parecer" className="col-span-12 w-full">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-green-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3 text-lg">
                  <Search className="w-5 h-5 text-green-600" />
                  Parecer Técnico
                </div>
              </header>
              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="parecer" className="text-sm font-semibold text-gray-700">
                      Parecer Técnico *
                    </Label>
                    <Textarea
                      id="parecer"
                      value={parecerTecnico}
                      onChange={(e) => setParecerTecnico(e.target.value)}
                      placeholder="Descreva a análise técnica do DFD..."
                      disabled={!canEditParecerTecnico()}
                      className="min-h-[120px] mt-2 resize-none border-gray-200 focus:border-green-300 focus:ring-green-300"
                    />
                  </div>
                  
                  {dataAnalise && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Data da Análise</Label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-800">{formatDate(dataAnalise)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* FULL: Comentários */}
          <section id="comentarios" className="col-span-12 w-full">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-orange-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3 text-lg">
                  <MessageCircle className="w-5 h-5 text-orange-600" />
                  Comentários
                </div>
              </header>
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Adicionar Comentário */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Adicionar Novo Comentário
                      </Label>
                      <Textarea
                        value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                        placeholder="Digite seu comentário aqui..."
                        maxLength={500}
                        className="w-full min-h-[120px] resize-none border-gray-200 focus:border-orange-300 focus:ring-orange-300"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Máx. 500 caracteres</span>
                        <span className="text-xs text-gray-400">{novoComentario.length}/500</span>
                      </div>
                      <Button
                        onClick={handleAddComentario}
                        disabled={!novoComentario.trim()}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Comentário
                      </Button>
                    </div>
                  </div>

                  {/* Lista de Comentários */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                      <Label className="text-sm font-semibold text-gray-700">
                        Histórico de Comentários ({comentarios.length})
                      </Label>
                      <span className="text-xs text-gray-400">Mais recentes primeiro</span>
                    </div>
                    
                    {comentarios.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <MessageCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Nenhum comentário ainda</p>
                        <p className="text-sm text-gray-400 mt-1">Seja o primeiro a comentar</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {comentarios.map((comentario) => (
                          <div key={comentario.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center shadow-inner">
                                  <User className="w-4 h-4 text-orange-600" />
                                </div>
                                <span className="text-sm font-semibold text-gray-800">{comentario.autorNome}</span>
                              </div>
                              <span className="text-xs text-gray-400">{formatDateTime(comentario.criadoEm)}</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{comentario.texto}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FULL: Ações (rodapé não fixo) */}
          {isGSPUser() && (
            <section id="acoes" className="col-span-12 w-full mt-6">
              <div className="flex w-full items-center justify-end gap-3">
                <Button 
                  onClick={handleSolicitarCorrecao}
                  variant="outline" 
                  disabled={!canSolicitarCorrecaoUser()}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Solicitar Correção
                </Button>
                <Button 
                  onClick={handleAprovar}
                  disabled={!canApproveUser()}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 shadow-lg"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar DFD
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Dialog de Confirmação - Aprovar */}
      <Dialog open={showAprovarDialog} onOpenChange={setShowAprovarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Confirmar Aprovação
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja aprovar o DFD? Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Marcar a versão como Aprovada e Versão Final</li>
                <li>Liberar a próxima etapa (Assinatura do DFD)</li>
                <li>Salvar o Parecer Técnico e Data da Análise</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAprovarDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarAprovar} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Aprovação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação - Solicitar Correção */}
      <Dialog open={showCorrecaoDialog} onOpenChange={setShowCorrecaoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Confirmar Solicitação de Correção
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja solicitar correção? Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Marcar a versão como Reprovada</li>
                <li>Devolver o DFD para o Card 1 para nova versão</li>
                <li>Salvar o Parecer Técnico e Data da Análise</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="justificativa" className="text-sm font-medium">
                Justificativa da Correção *
              </Label>
              <Textarea
                id="justificativa"
                value={justificativaCorrecao}
                onChange={(e) => setJustificativaCorrecao(e.target.value)}
                placeholder="Descreva os motivos da correção..."
                className="min-h-[100px] mt-2 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCorrecaoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarSolicitarCorrecao} className="bg-red-600 hover:bg-red-700">
              <XCircle className="w-4 h-4 mr-2" />
              Confirmar Correção
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 