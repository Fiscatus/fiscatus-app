import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  History,
  Upload,
  Download,
  Trash2,
  User,
  Edit3,
  Clock,
  Search,
  Settings,
  ClipboardCheck,
  Flag,
  Calendar,
  ListChecks,
  AlertCircle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import CommentsSection from './CommentsSection';
import { useDFD, DFDData, DFDVersionStatus, DFDAnnex } from '@/hooks/useDFD';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';

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
  slaStatus?: 'ok' | 'risco' | 'nao_cumprido';
  documentoPrincipal?: { nome: string; url: string; mimeType: string };
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
  const { toast } = useToast();
  const { 
    dfdData, 
    aprovarVersao, 
    devolverParaCorrecao,
    addAnnex, 
    removeAnnex
  } = useDFD(processoId);
  // Ordenação e helpers de anexos (padrão Card 1)
  const [attachmentsSort, setAttachmentsSort] = useState<'desc' | 'asc'>('desc');
  const openInNewTab = (url?: string) => {
    if (!url) {
      toast({ title: 'Link indisponível', description: 'Link expirado, atualize a página ou gere novo link.', variant: 'destructive' });
      return;
    }
    try {
      const win = window.open(url, '_blank');
      if (!win) throw new Error('Popup bloqueado');
    } catch (e) {
      toast({ title: 'Não foi possível abrir o documento', description: 'Verifique o bloqueador de popups ou gere um novo link.', variant: 'destructive' });
    }
  };
  const anexosOrdenados = useMemo(() => {
    const arr = [...dfdData.annexes];
    arr.sort((a, b) => {
      const da = new Date(a.uploadedAt).getTime();
      const db = new Date(b.uploadedAt).getTime();
      return attachmentsSort === 'desc' ? db - da : da - db;
    });
    return arr;
  }, [dfdData.annexes, attachmentsSort]);
  
  // Estados principais
  const [parecerTecnico, setParecerTecnico] = useState('');
  const [dataAnalise, setDataAnalise] = useState<string>('');
  const [parecerExiste, setParecerExiste] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showAprovarDialog, setShowAprovarDialog] = useState(false);
  const [showCorrecaoDialog, setShowCorrecaoDialog] = useState(false);
  const [justificativaCorrecao, setJustificativaCorrecao] = useState('');
  const [activeTab, setActiveTab] = useState('versoes');
  const fileInputRef = useRef<HTMLInputElement>(null);

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


  // Verificar se pode editar o parecer técnico - permitir para usuários autorizados
  const canEditParecerTecnico = () => {
    // Permitir edição se:
    // 1. DFD está enviado para análise (situação normal)
    // 2. DFD está em rascunho mas usuário tem permissão (preparação antecipada)
    // 3. DFD foi devolvido mas usuário tem permissão (revisão)
    // 4. DFD foi aprovado mas usuário tem permissão (complementação)
    
    if (dfdData.status === 'enviado_analise') {
      return true; // Sempre permitir quando enviado para análise
    }
    
    // Para outros status, verificar se usuário tem permissão
    if (isGSPUser()) {
      return true; // GSP pode editar em qualquer situação
    }
    
    // Outros usuários autorizados podem editar se o processo está em andamento
    return dfdData.status !== 'aprovado' || canEdit;
  };

  // Calcular SLA da análise
  const calcularSLA = (prazoInicial: number, prazoCumprido: number | undefined) => {
    // Se não foi enviado ainda, não há como avaliar
    if (prazoCumprido === undefined) {
      return { status: 'nao_enviado' as const, dias: 0 };
    }
    
    // Comparar prazo cumprido com prazo inicial
    if (prazoCumprido <= prazoInicial) {
      return { status: 'ok' as const, dias: prazoCumprido };
    } else if (prazoCumprido <= prazoInicial + 1) {
      return { status: 'risco' as const, dias: prazoCumprido };
    } else {
      return { status: 'nao_cumprido' as const, dias: prazoCumprido };
    }
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
    
    // Salvar parecer técnico
    const parecerData = {
      texto: parecerTecnico,
      analisadoEm: dataAnaliseAtual,
      analisadoPor: {
        id: user?.id || '',
        nome: user?.nome || 'Usuário',
        cargo: user?.cargo || ''
      }
    };
    
    // Mock: salvar no localStorage
    localStorage.setItem(`parecer-tecnico-${processoId}`, JSON.stringify(parecerData));
    setParecerExiste(true);
    
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
        description: "A justificativa das ressalvas é obrigatória.",
        variant: "destructive"
      });
      return;
    }

    setShowCorrecaoDialog(true);
  };

  const confirmarSolicitarCorrecao = () => {
    const dataAnaliseAtual = new Date().toISOString();
    setDataAnalise(dataAnaliseAtual);
    
    // Salvar parecer técnico
    const parecerData = {
      texto: parecerTecnico,
      analisadoEm: dataAnaliseAtual,
      analisadoPor: {
        id: user?.id || '',
        nome: user?.nome || 'Usuário',
        cargo: user?.cargo || ''
      }
    };
    
    // Mock: salvar no localStorage
    localStorage.setItem(`parecer-tecnico-${processoId}`, JSON.stringify(parecerData));
    setParecerExiste(true);
    
    devolverParaCorrecao(justificativaCorrecao, user?.nome || 'Usuário');
    onSave(dfdData);
    
    toast({
      title: "Encaminhamento Realizado",
      description: "O DFD foi encaminhado para cumprimento de ressalvas."
    });
    
    setShowCorrecaoDialog(false);
    setJustificativaCorrecao('');
  };

  // Funções para os botões de ação
  // Removidos: handlers de upload/download/exclusão de DFD e Parecer

  // Função para upload de anexos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Mock: simular upload
      const newAnnex: DFDAnnex = {
        id: `anexo-${Date.now().toString()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.nome || 'Usuário',
        url: `mock-url-${Date.now().toString()}`
      };
      
      addAnnex(newAnnex);
      
      toast({
        title: "Anexo adicionado",
        description: `${file.name} foi anexado com sucesso.`,
      });
    }
    
    // Limpar o input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Carregar dados salvos do parecer
  useEffect(() => {
    const parecerSalvo = localStorage.getItem(`parecer-tecnico-${processoId}`);
    if (parecerSalvo) {
      try {
        const parecerData = JSON.parse(parecerSalvo);
        setParecerTecnico(parecerData.texto || '');
        setDataAnalise(parecerData.analisadoEm || '');
      } catch (error) {
        console.error('Erro ao carregar parecer salvo:', error);
      }
    }
  }, [processoId]);

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

  // Usar as funções padronizadas do utils
  const formatDate = formatDateBR;
  const formatDateTime = formatDateTimeBR;

  // Obter versão enviada para análise (última)
  const versaoEnviada = dfdData.versions.find(v => v.status === 'enviado_analise' && v.isFinal);
  
  // Para não-GSP, mostrar apenas versão final aprovada
  const versaoParaExibir = !isGSPUser() && dfdData.status === 'aprovado' 
    ? dfdData.versions.find(v => v.status === 'aprovado' && v.isFinal)
    : versaoEnviada;

  // Helpers de prazo/datas para o Painel da Etapa (espelhar Elaboração)
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

  const addBusinessDays = (startISO: string, businessDays: number): Date => {
    const date = new Date(startISO);
    let added = 0;
    const result = new Date(date);
    while (added < businessDays) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day >= 1 && day <= 5) added++;
    }
    return result;
  };

  const getPrazoFinalRevisao = () => {
    const base = versaoParaExibir || dfdData.currentVersion || dfdData.versions[dfdData.versions.length - 1];
    if (!base) return null;
    const dias = base.prazoInicialDiasUteis ?? 0;
    return addBusinessDays(base.createdAt, dias);
  };

  const getPrazoFinalEtapa = () => {
    if (!dfdData.versions || dfdData.versions.length === 0) return null;
    const ordered = [...dfdData.versions].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const oldest = ordered[0];
    const dias = oldest.prazoInicialDiasUteis ?? (versaoParaExibir?.prazoInicialDiasUteis ?? 7);
    return addBusinessDays(oldest.createdAt, dias);
  };

  const getDiasRestantes = () => {
    const base = versaoParaExibir || dfdData.currentVersion || dfdData.versions[dfdData.versions.length - 1];
    if (!base || base.prazoInicialDiasUteis === undefined) return null;
    const cumprido = base.prazoCumpridoDiasUteis ?? 0;
    return (base.prazoInicialDiasUteis || 0) - cumprido;
  };

  const getPrazoColorClasses = (diasRestantes: number | null): { text: string; badge: string } => {
    if (diasRestantes === null) return { text: 'text-gray-600', badge: 'bg-gray-100 text-gray-800' };
    if (diasRestantes < 0) return { text: 'text-red-600', badge: 'bg-red-100 text-red-800' };
    if (diasRestantes <= 2) return { text: 'text-orange-600', badge: 'bg-orange-100 text-orange-800' };
    return { text: 'text-green-600', badge: 'bg-green-100 text-green-800' };
  };

  const getPrazoFinalPrevisto = () => {
    const base = versaoParaExibir || dfdData.currentVersion || dfdData.versions[dfdData.versions.length - 1];
    if (!base) return new Date();
    const diasUteis = base.prazoInicialDiasUteis || 7;
    return addBusinessDays(base.createdAt, diasUteis);
  };

  const getProgressoTemporal = () => {
    const base = versaoParaExibir || dfdData.currentVersion || dfdData.versions[dfdData.versions.length - 1];
    if (!base) return 0;
    const prazoInicial = new Date(base.createdAt);
    const prazoLimite = getPrazoFinalPrevisto();
    const hoje = new Date();
    const diasUteisTotal = Math.max(1, countBusinessDays(prazoInicial, prazoLimite));
    const diasUteisPassados = countBusinessDays(prazoInicial, hoje);
    if (hoje > prazoLimite) return 100;
    const progresso = Math.round((diasUteisPassados / diasUteisTotal) * 100);
    return Math.min(progresso, 100);
  };

  return (
    <div className="w-full space-y-6">
      {/* 1️⃣ Parecer Técnico */}
      <div className="card-shell mb-8">
        <header className="card-header-title">
          <Search className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Parecer Técnico</h2>
          <div className="ml-auto">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Análise
            </span>
          </div>
        </header>
        <div className="card-separator-indigo"></div>
        <div className="space-y-6">
          <div className="flex-1">
            <Textarea
              id="parecer-tecnico-textarea"
              value={parecerTecnico}
              onChange={(e) => setParecerTecnico(e.target.value)}
              placeholder="Descreva a análise técnica do DFD..."
              disabled={!canEditParecerTecnico()}
              className="min-h-[350px] resize-none border-gray-200 focus:border-indigo-300 focus:ring-indigo-300"
            />
            {validationErrors.includes('Parecer Técnico é obrigatório') && (
              <p className="text-red-500 text-sm mt-1">Parecer Técnico é obrigatório</p>
            )}
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

      {/* 2️⃣ Gerenciamento */}
      <div className="card-shell mb-8 min-h-[700px]">
        <header className="card-header-title">
          <Settings className="w-6 h-6 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900">Gerenciamento</h2>
          <div className="ml-auto">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
              Gerenciamento
            </span>
          </div>
        </header>
        <div className="card-separator-indigo"></div>
        <div>
          {/* Grid responsiva para Versões e Anexos */}
          <div className="grid grid-cols-12 gap-4 items-start">
            {/* Versões/Revisões - 6 colunas em desktop, 12 em mobile */}
            <div className="col-span-12 lg:col-span-6">
              <div className="rounded-xl border shadow-sm bg-white h-full min-h-[500px]">
                <div className="px-4 py-6 rounded-t-xl border-b">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-600" />
                    Versões/Revisões
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {dfdData.versions.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <History className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Nenhuma versão disponível</p>
                      </div>
                    ) : (
                      <div className="space-y-3 overflow-y-auto max-h-[450px]">
                        {dfdData.versions.map((version) => {
                          const statusConfig = getStatusConfig(version.status);
                          const sla = calcularSLA(version.prazoInicialDiasUteis || 0, version.prazoCumpridoDiasUteis);
                          
                          return (
                            <div key={version.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant={version.isFinal ? "default" : "outline"} className="text-xs font-medium">
                                    V{version.version}
                                    {version.isFinal && <CheckCircle className="w-3 h-3 ml-1" />}
                                  </Badge>
                                  <Badge className={`text-xs font-medium ${statusConfig.color}`}>
                                    {statusConfig.icon}
                                    <span className="ml-1">{statusConfig.label}</span>
                                  </Badge>
                                  {sla && (
                                    <Badge 
                                      className={`text-xs font-medium ${
                                        sla.status === 'ok' ? 'bg-green-100 text-green-800' :
                                        sla.status === 'risco' ? 'bg-yellow-100 text-yellow-800' :
                                        sla.status === 'nao_enviado' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {sla.status === 'ok' ? 'Prazo Cumprido' :
                                       sla.status === 'risco' ? 'Em Risco' : 
                                       sla.status === 'nao_enviado' ? 'Não Enviado' :
                                       'Prazo Não Cumprido'}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-blue-50">
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-green-50">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-xs text-gray-700 space-y-1">
                                <p><strong>Autor:</strong> {version.createdBy}</p>
                                <p><strong>Cargo:</strong> {version.createdByCargo || 'Não informado'}</p>
                                <p><strong>Gerência:</strong> {version.createdByGerencia || 'Não informado'}</p>
                                <p><strong>Criado:</strong> {formatDateTimeBR(new Date(version.createdAt))}</p>
                                <p><strong>Prazo inicial:</strong> {version.prazoInicialDiasUteis || 0} dias úteis</p>
                                <p><strong>Prazo cumprido:</strong> {version.prazoCumpridoDiasUteis !== undefined ? `${version.prazoCumpridoDiasUteis} dias úteis` : 'Não enviado'}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Anexos - 6 colunas em desktop, 12 em mobile */}
            <div className="col-span-12 lg:col-span-6">
              <div className="rounded-xl border shadow-sm bg-white h-full min-h-[500px]">
                <div className="px-4 py-6 rounded-t-xl border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-green-600" />
                      Anexos
                    </h3>
                    <span className="text-xs text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md font-medium">
                      {dfdData.annexes.length}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {/* Upload no topo */}
                    {canEditParecerTecnico() && (
                      <div className="w-full">
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg,.gif,.bmp,.tif,.tiff"
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="w-full h-9 border-dashed border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors text-sm"
                        >
                          <Upload className="w-4 h-4 mr-2"/>
                          Adicionar Anexo
                        </Button>
                      </div>
                    )}
                    
                    {/* Filtro de Ordenação */}
                    <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs text-slate-500 whitespace-nowrap">Ordenar:</span>
                        <div className="relative flex-1 sm:flex-none">
                          <select
                            aria-label="Ordenar anexos"
                            value={attachmentsSort}
                            onChange={(e) => setAttachmentsSort(e.target.value as 'desc' | 'asc')}
                            className="w-full h-7 rounded-md border border-slate-200 bg-white px-2 pr-6 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer hover:border-slate-300"
                          >
                            <option value="desc">Mais recente</option>
                            <option value="asc">Menos recente</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 pointer-events-none">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lista */}
                    {dfdData.annexes.length === 0 ? (
                      <div className="pt-4">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-center text-gray-500 font-medium">Nenhum anexo adicionado</p>
                        {!canEditParecerTecnico() && (
                          <p className="text-center text-sm text-gray-400 mt-1">
                            Apenas usuários autorizados podem adicionar anexos
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className={`${dfdData.annexes.length > 6 ? 'max-h-[450px] overflow-y-auto' : ''} space-y-0`}>
                        {anexosOrdenados.map((annex, idx) => (
                          <React.Fragment key={annex.id}>
                            <div className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{annex.name}</p>
                                  <p className="text-xs text-gray-500 hidden sm:block">{annex.uploadedBy} • {formatDate(annex.uploadedAt)}</p>
                                  <p className="text-xs text-gray-500 sm:hidden">{annex.uploadedBy} • {formatDate(annex.uploadedAt)}</p>
                                </div>
                              </div>
                              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                                <Button size="sm" variant="outline" aria-label="Visualizar" className="h-7 w-7 p-0 hover:bg-blue-50" onClick={() => openInNewTab(annex.url)}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" aria-label="Baixar" className="h-7 w-7 p-0 hover:bg-green-50">
                                  <Download className="w-3 h-3" />
                                </Button>
                                {canEditParecerTecnico() && (
                                  <Button size="sm" variant="outline" aria-label="Remover" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => removeAnnex(annex.id)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            {idx < anexosOrdenados.length-1 && (<div className="border-b border-slate-200" />)}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3️⃣ Painel da Etapa */}
      <div className="rounded-2xl border border-slate-300 shadow-md bg-white p-6 mb-8 min-h-[700px]">
        <header className="card-header-title">
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
            
          {/* 1️⃣ Card Status & Prazo */}
          <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-800">Status & Prazo</h3>
              </div>
              <Badge className="text-sm font-semibold px-3 py-2 bg-yellow-100 text-yellow-800">
                {dfdData.status === 'enviado_analise' ? 'Em Análise' : 
                 dfdData.status === 'aprovado' ? 'Aprovado' : 
                 dfdData.status === 'devolvido' ? 'Devolvido' : 'Pendente'}
              </Badge>
            </header>
            
            <div className="space-y-4">
            {/* Data de Criação */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Data de Criação</p>
                <p className="text-lg font-bold text-slate-900">
                  {versaoParaExibir?.createdAt ? formatDate(versaoParaExibir.createdAt) : dfdData.currentVersion?.createdAt ? formatDate(dfdData.currentVersion.createdAt) : '—'}
                </p>
              </div>
            </div>

            {/* Prazo Inicial da Revisão da versão X */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                  <Clock className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Prazo Inicial da Revisão {versaoParaExibir ? `da versão V${versaoParaExibir.version}` : ''}
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {versaoParaExibir?.createdAt ? formatDate(versaoParaExibir.createdAt) : dfdData.currentVersion?.createdAt ? formatDate(dfdData.currentVersion.createdAt) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Prazo Final da Revisão */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                  <Flag className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Prazo Final da Revisão</p>
                  <p className="text-lg font-bold text-slate-900">
                    {(() => { const d = getPrazoFinalRevisao(); return d ? formatDate(d.toISOString()) : '—'; })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Prazo Final da Etapa */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                  <Flag className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Prazo Final da Etapa</p>
                  <p className="text-lg font-bold text-slate-900">
                    {(() => { const d = getPrazoFinalEtapa(); return d ? formatDate(d.toISOString()) : '—'; })()}
                  </p>
                </div>
              </div>
            </div>

              {/* Destaque Central - Dias Restantes/Atraso */}
              <div className="border-t border-slate-200 my-3 pt-4">
                {(() => {
                  const diasRest = getDiasRestantes();
                  const prazo = getPrazoColorClasses(diasRest);
                  const isAtraso = diasRest !== null && diasRest < 0;
                  return (
                    <div className="text-center py-4">
                      <div className={`text-3xl font-bold ${prazo.text} mb-2`}>
                        {diasRest === null ? '—' : Math.abs(diasRest)}
                      </div>
                      <div className={`text-sm font-medium ${prazo.text}`}>
                        {diasRest === null ? 'Sem prazo definido' : 
                         isAtraso ? 'dias em atraso' : 
                         diasRest <= 2 ? 'dias restantes (urgente)' : 
                         'dias restantes'}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Barra de Progresso com tooltip */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Progresso</span>
                  <span>{getProgressoTemporal()}%</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full bg-slate-200 rounded-full h-2 cursor-help">
                        <div 
                          className={`h-2 rounded-full transition-all ${getProgressoTemporal() <= 70 ? 'bg-green-500' : getProgressoTemporal() <= 100 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(getProgressoTemporal(), 100)}%` }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {(() => {
                          const base = versaoParaExibir || dfdData.currentVersion || dfdData.versions[dfdData.versions.length - 1];
                          if (!base) return '—';
                          const prazoInicial = new Date(base.createdAt);
                          const prazoLimite = getPrazoFinalPrevisto();
                          const hoje = new Date();
                          const diasUteisTotal = Math.max(1, countBusinessDays(prazoInicial, prazoLimite));
                          const diasUteisPassados = countBusinessDays(prazoInicial, hoje);
                          return `${diasUteisPassados} dias úteis decorridos de ${diasUteisTotal} totais`;
                        })()}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* 2️⃣ Card Checklist da Etapa */}
          <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-800">Checklist da Etapa</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  3 itens
                </span>
              </div>
            </header>
            
            <div className="space-y-1">
              {/* Item 1 - DFD Recebido */}
              <div className="flex items-center gap-3 py-2 px-2 hover:bg-slate-50 rounded transition-colors">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-slate-700 flex-1">DFD recebido para análise</span>
              </div>
              
              {/* Item 2 - Parecer Técnico */}
              <div className="flex items-center gap-3 py-2 px-2 hover:bg-slate-50 rounded transition-colors">
                {parecerTecnico.trim() ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm text-slate-700 flex-1">Parecer técnico elaborado</span>
              </div>
              
              {/* Item 3 - Decisão Tomada */}
              <div className="flex items-center gap-3 py-2 px-2 hover:bg-slate-50 rounded transition-colors">
                {dfdData.status === 'aprovado' || dfdData.status === 'devolvido' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-sm text-slate-700 flex-1">Decisão de aprovação/devolução</span>
              </div>
            </div>
          </div>

          {/* 3️⃣ Card Mini Timeline */}
          <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6 flex flex-col min-h-[320px]">
            <header className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-800">Mini Timeline</h3>
            </header>

            <div className="flex-1 flex flex-col">
              <div className="flex-1 relative pr-2">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400">
                  <div className="flex flex-col gap-4 pl-6">
                    
                    {/* Timeline Item - DFD Enviado */}
                    {dfdData.enviadoData && (
                      <div className="relative group">
                        <div className="absolute -left-6 top-0 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <Upload className="w-3 h-3 text-blue-600" />
                        </div>
                        <div className="hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors">
                          <p className="text-sm font-semibold text-slate-700 mb-1">
                            DFD enviado para análise
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{dfdData.enviadoPor}</span>
                            <span>•</span>
                            <span>{formatDateTime(dfdData.enviadoData)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Timeline Item - Parecer Elaborado */}
                    {parecerTecnico.trim() && (
                      <div className="relative group">
                        <div className="absolute -left-6 top-0 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <Edit3 className="w-3 h-3 text-indigo-600" />
                        </div>
                        <div className="hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors">
                          <p className="text-sm font-semibold text-slate-700 mb-1">
                            Parecer técnico elaborado
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{user?.nome || 'Usuário'}</span>
                            <span>•</span>
                            <span>{dataAnalise ? formatDateTime(dataAnalise) : 'Hoje'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
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
            </div>
          </div>
        </div>
      </div>

      {/* 4️⃣ Comentários */}
      <div className="w-full">
        <div className="card-shell">
          <CommentsSection
            processoId={processoId}
            etapaId={etapaId.toString()}
            cardId="comentarios-aprovacao"
            title="Comentários"
          />
        </div>
      </div>


      {/* 5️⃣ Ações da Etapa */}
      <div className="card-shell mb-8">
        <header className="card-header-title">
          <Flag className="w-6 h-6 text-orange-600" />
          <h2 className="text-lg font-bold text-slate-900">Ações da Etapa</h2>
          <div className="ml-auto">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Ações
            </span>
          </div>
        </header>
        <div className="card-separator-orange"></div>
        
        <div className="space-y-4">
          {/* Informações de Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prazo */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Prazo</p>
                <p className="text-lg font-bold text-slate-900">
                  {dfdData.status === 'enviado_analise' ? '5 dias úteis' : 
                   dfdData.status === 'aprovado' ? 'Concluído' : 
                   dfdData.status === 'devolvido' ? 'Devolvido' : 'Aguardando'}
                </p>
              </div>
            </div>

            {/* Responsável */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                <User className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Responsável</p>
                <p className="text-lg font-bold text-slate-900">
                  {user?.nome || 'GSP - Analista'}
                </p>
              </div>
            </div>
          </div>

          {/* Ação Principal */}
          <div className="border-t border-slate-200 pt-4">
            {dfdData.status === 'aprovado' ? (
              <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-green-600">DFD Aprovado</p>
                    <p className="text-sm text-green-700">
                      {dfdData.aprovadoData ? formatDate(dfdData.aprovadoData) : ''} por {dfdData.aprovadoPor || user?.nome}
                    </p>
                  </div>
                </div>
              </div>
            ) : dfdData.status === 'devolvido' ? (
              <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-red-600">DFD Devolvido</p>
                    <p className="text-sm text-red-700">
                      {dfdData.devolucaoData ? formatDate(dfdData.devolucaoData) : ''} por {dfdData.devolucaoPor || user?.nome}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm text-slate-600 mb-4">
                  Analise o DFD e tome uma decisão:
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button 
                    onClick={handleSolicitarCorrecao}
                    variant="outline" 
                    disabled={!canSolicitarCorrecaoUser()}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Devolver para Correção
                  </Button>
                  <Button 
                    onClick={handleAprovar}
                    disabled={!canApproveUser()}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar DFD
                  </Button>
                </div>
              </div>
            )}
          </div>
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
              Confirmar Encaminhamento para Cumprimento de Ressalvas
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja encaminhar para cumprimento de ressalvas? Esta ação irá:
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
                Justificativa das Ressalvas *
              </Label>
              <Textarea
                id="justificativa"
                value={justificativaCorrecao}
                onChange={(e) => setJustificativaCorrecao(e.target.value)}
                placeholder="Descreva as ressalvas que devem ser cumpridas..."
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
              Confirmar Encaminhamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 