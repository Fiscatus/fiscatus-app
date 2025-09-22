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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ProgressaoTemporal from '@/components/ProgressaoTemporal';
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
  Square,
  Settings,
  Scale,
  Gavel,
  Shield,
  ClipboardCheck,
  ListChecks,
  Flag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import TextareaWithMentions from './TextareaWithMentions';
import CommentsSection from './CommentsSection';
import { useDFD, DFDData, DFDVersion, DFDVersionStatus, DFDAnnex } from '@/hooks/useDFD';
import { formatDateBR, formatDateTimeBR, legendaDiasRestantes, classesPrazo } from '@/lib/utils';

// Tipos para o sistema de análise jurídica
type AnaliseJuridicaStatus = 'AGUARDANDO_ANALISE' | 'APROVADA_COM_RESSALVAS' | 'DEVOLVIDA_CORRECAO' | 'ANALISE_FAVORAVEL';

interface AnaliseJuridica {
  texto: string;
  analisadoEm?: string; // ISO
  analisadoPor?: { id: string; nome: string; cargo: string };
  justificativa?: string;
  status: AnaliseJuridicaStatus;
}

interface VersaoEdital {
  id: string;
  numeroVersao: number;
  status: 'enviada' | 'aprovada' | 'reprovada';
  autorId: string;
  criadoEm: string;
  decididoEm?: string;
  prazoDiasUteis?: number;
  slaStatus?: 'ok' | 'risco' | 'estourado';
  documentoPrincipal?: { nome: string; url: string; mimeType: string };
}

interface InteracaoAnalise {
  id: string;
  setor: string;
  responsavel: string;
  dataHora: string;
  resultado: AnaliseJuridicaStatus;
  justificativa?: string;
  parecer: string;
}

interface DFDAnaliseJuridicaSectionProps {
  processoId: string;
  etapaId: number;
  onComplete: (data: DFDData) => void;
  onSave: (data: DFDData) => void;
  initialData?: DFDData;
  canEdit?: boolean;
}

export default function DFDAnaliseJuridicaSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true
}: DFDAnaliseJuridicaSectionProps) {
  const { user } = useUser();
  const { podeEditarCard, isNAJ } = usePermissoes();
  const { toast } = useToast();
  const { 
    dfdData, 
    addAnnex, 
    removeAnnex, 
    updateObservations
  } = useDFD(processoId);
  
  // Estados principais
  const [analiseJuridica, setAnaliseJuridica] = useState('');
  const [dataAnalise, setDataAnalise] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showDevolverDialog, setShowDevolverDialog] = useState(false);
  const [showAnaliseFavoravelDialog, setShowAnaliseFavoravelDialog] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [activeTab, setActiveTab] = useState('documentos');
  const [analiseExiste, setAnaliseExiste] = useState(false);
  const [editalArquivo, setEditalArquivo] = useState<{ name: string; size: string; uploadedAt: string; uploadedBy: string } | null>(null);
  const [modeloAnalise, setModeloAnalise] = useState('');
  const [interacoes, setInteracoes] = useState<InteracaoAnalise[]>([]);
  const [diasNoCard, setDiasNoCard] = useState(0);
  const [responsavelAtual, setResponsavelAtual] = useState('');
  const prazoInicialDiasUteis = 5;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editalFileInputRef = useRef<HTMLInputElement>(null);

  // Verificar se é usuário da NAJ (Gabriel Radamesis Gomes Nascimento)
  const isNAJUser = () => {
    // Verificar se é da gerência NAJ (corrigindo nome da gerência)
    const isNAJGerencia = user?.gerencia === 'NAJ - Assessoria Jurídica';
    
    // Para maior segurança, também verificar o nome do usuário
    const isGabrielRadamesis = user?.nome === 'Gabriel Radamesis Gomes Nascimento';
    
    // Debug: log para verificar o usuário atual
    console.log('Debug NAJ Check:', {
      userName: user?.nome,
      userGerencia: user?.gerencia,
      isNAJGerencia,
      isGabrielRadamesis
    });
    
    // Retornar true se for da NAJ (e opcionalmente, se for o Gabriel)
    return isNAJGerencia; // Usar apenas gerência por enquanto
    
    // Para usar verificação dupla (gerência + nome):
    // return isNAJGerencia && isGabrielRadamesis;
  };

  // Verificar se pode editar - usar lógica de permissões
  const canEditAnaliseJuridica = () => {
    // Permitir edição se:
    // 1. Usuário é da NAJ (Gabriel Radamesis Gomes Nascimento)
    // 2. Processo está em andamento
    // 3. Card não foi concluído
    
    if (isNAJUser()) {
      return true; // NAJ pode editar em qualquer situação
    }
    
    // Outros usuários não podem editar este card específico
    return false;
  };

  // Calcular SLA da análise
  const calcularSLA = (dataEnvio: string, dataAnalise?: string) => {
    const inicio = new Date(dataEnvio);
    const fim = dataAnalise ? new Date(dataAnalise) : new Date();
    const diasUteis = countBusinessDays(inicio, fim);
    
    // Regras para análise jurídica
    const prazoUrgente = 3; // 3 dias úteis para urgência
    const prazoOrdinario = 5; // 5 dias úteis para ordinário
    
    // Determinar prazo baseado no regime do processo (mock)
    const prazoMaximo = prazoOrdinario; // Por padrão, usar ordinário
    
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
    
    if (!analiseJuridica.trim()) {
      errors.push('Análise Jurídica Preliminar é obrigatória');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };


  const handleDevolverCorrecao = () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha a Análise Jurídica Preliminar.",
        variant: "destructive"
      });
      return;
    }

    setShowDevolverDialog(true);
  };

  const confirmarDevolverCorrecao = () => {
    if (!justificativa.trim()) {
      toast({
        title: "Erro",
        description: "A justificativa das ressalvas é obrigatória.",
        variant: "destructive"
      });
      return;
    }

    const dataAnaliseAtual = new Date().toISOString();
    setDataAnalise(dataAnaliseAtual);
    
    // Salvar análise jurídica
    const analiseData: AnaliseJuridica = {
      texto: analiseJuridica,
      analisadoEm: dataAnaliseAtual,
      analisadoPor: {
        id: user?.id || '',
        nome: user?.nome || 'Usuário',
        cargo: user?.cargo || ''
      },
      justificativa: justificativa,
      status: 'DEVOLVIDA_CORRECAO'
    };
    
    // Mock: salvar no localStorage
    localStorage.setItem(`analise-juridica-${processoId}`, JSON.stringify(analiseData));
    setAnaliseExiste(true);
    
    // Adicionar interação
    const novaInteracao: InteracaoAnalise = {
      id: `interacao-${Date.now()}`,
      setor: 'NAJ - Assessoria Jurídica',
      responsavel: user?.nome || 'Usuário',
      dataHora: dataAnaliseAtual,
      resultado: 'DEVOLVIDA_CORRECAO',
      justificativa: justificativa,
      parecer: analiseJuridica
    };
    
    setInteracoes(prev => [...prev, novaInteracao]);
    localStorage.setItem(`interacoes-analise-juridica-${processoId}`, JSON.stringify([...interacoes, novaInteracao]));
    
    onSave(dfdData);
    
    toast({
      title: "Encaminhamento Realizado",
      description: "O edital foi encaminhado para cumprimento de ressalvas e o card 'Cumprimento de Ressalvas pós Análise Jurídica Prévia' foi criado."
    });
    
    setShowDevolverDialog(false);
    setJustificativa('');
  };

  const handleAnaliseFavoravel = () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha a Análise Jurídica Preliminar.",
        variant: "destructive"
      });
      return;
    }

    setShowAnaliseFavoravelDialog(true);
  };

  const confirmarAnaliseFavoravel = () => {
    const dataAnaliseAtual = new Date().toISOString();
    setDataAnalise(dataAnaliseAtual);
    
    // Salvar análise jurídica
    const analiseData: AnaliseJuridica = {
      texto: analiseJuridica,
      analisadoEm: dataAnaliseAtual,
      analisadoPor: {
        id: user?.id || '',
        nome: user?.nome || 'Usuário',
        cargo: user?.cargo || ''
      },
      status: 'ANALISE_FAVORAVEL'
    };
    
    // Mock: salvar no localStorage
    localStorage.setItem(`analise-juridica-${processoId}`, JSON.stringify(analiseData));
    setAnaliseExiste(true);
    
    // Adicionar interação
    const novaInteracao: InteracaoAnalise = {
      id: `interacao-${Date.now()}`,
      setor: 'NAJ - Assessoria Jurídica',
      responsavel: user?.nome || 'Usuário',
      dataHora: dataAnaliseAtual,
      resultado: 'ANALISE_FAVORAVEL',
      parecer: analiseJuridica
    };
    
    setInteracoes(prev => [...prev, novaInteracao]);
    localStorage.setItem(`interacoes-analise-juridica-${processoId}`, JSON.stringify([...interacoes, novaInteracao]));
    
    onComplete(dfdData);
    
    toast({
      title: "Aprovação Realizada",
      description: "A análise jurídica foi aprovada integralmente e a próxima etapa foi liberada."
    });
    
    setShowAnaliseFavoravelDialog(false);
  };

  // Funções para upload de documentos
  const handleUploadEdital = () => {
    editalFileInputRef.current?.click();
  };

  const handleEditalFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const arquivoInfo = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.nome || 'Usuário'
      };
      
      setEditalArquivo(arquivoInfo);
      
      // Mock: salvar no localStorage
      localStorage.setItem(`edital-arquivo-${processoId}`, JSON.stringify(arquivoInfo));
      
      toast({
        title: "Arquivo do Edital enviado",
        description: `${file.name} foi enviado com sucesso.`
      });
    }
    
    // Limpar o input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleBaixarEdital = () => {
    if (!editalArquivo) {
      toast({
        title: "Nenhum arquivo",
        description: "Nenhum arquivo do edital foi enviado ainda.",
        variant: "destructive"
      });
      return;
    }

    // Mock: simular download do edital
    toast({
      title: "Download Iniciado",
      description: `O arquivo ${editalArquivo.name} está sendo baixado.`
    });
  };

  const handleExcluirEdital = () => {
    setEditalArquivo(null);
    localStorage.removeItem(`edital-arquivo-${processoId}`);
    
    toast({
      title: "Arquivo removido",
      description: "O arquivo do edital foi removido com sucesso."
    });
  };

  // Função para carregar modelo de análise
  const handleCarregarModelo = () => {
    const modelo = `ANÁLISE JURÍDICA PRELIMINAR

1. CONFORMIDADE LEGAL
   - Verificação da conformidade com a legislação aplicável
   - Análise dos requisitos legais para a contratação

2. ASPECTOS JURÍDICOS
   - Identificação de possíveis riscos jurídicos
   - Recomendações para mitigação de riscos

3. OBSERVAÇÕES
   - Pontos que merecem atenção especial
   - Sugestões de melhorias

4. CONCLUSÃO
   - Parecer final sobre a viabilidade jurídica`;
    
    setModeloAnalise(modelo);
    setAnaliseJuridica(modelo);
    
    toast({
      title: "Modelo Carregado",
      description: "O modelo de análise jurídica foi carregado com sucesso."
    });
  };

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

  // Carregar dados salvos
  useEffect(() => {
    const analiseSalva = localStorage.getItem(`analise-juridica-${processoId}`);
    if (analiseSalva) {
      try {
        const analiseData = JSON.parse(analiseSalva);
        setAnaliseJuridica(analiseData.texto || '');
        setDataAnalise(analiseData.analisadoEm || '');
        setAnaliseExiste(true);
      } catch (error) {
        console.error('Erro ao carregar análise salva:', error);
      }
    }

    // Carregar arquivo do edital
    const editalArquivoSalvo = localStorage.getItem(`edital-arquivo-${processoId}`);
    if (editalArquivoSalvo) {
      try {
        const arquivoData = JSON.parse(editalArquivoSalvo);
        setEditalArquivo(arquivoData);
      } catch (error) {
        console.error('Erro ao carregar arquivo do edital salvo:', error);
      }
    }

    // Carregar interações
    const interacoesSalvas = localStorage.getItem(`interacoes-analise-juridica-${processoId}`);
    if (interacoesSalvas) {
      try {
        const interacoesData = JSON.parse(interacoesSalvas);
        setInteracoes(interacoesData);
      } catch (error) {
        console.error('Erro ao carregar interações salvas:', error);
      }
    }

    // Calcular dias no card (mock)
    setDiasNoCard(2);
    setResponsavelAtual(user?.nome || 'Sem responsável definido');
  }, [processoId, user?.nome]);

  // Usar as funções padronizadas do utils
  const formatDate = formatDateBR;
  const formatDateTime = formatDateTimeBR;

  const getStatusConfig = (status: AnaliseJuridicaStatus) => {
    switch (status) {
      case 'AGUARDANDO_ANALISE':
        return {
          label: 'Aguardando Análise',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Clock className="w-3 h-3" />
        };
      case 'APROVADA_COM_RESSALVAS':
        return {
          label: 'Aprovada com Ressalvas',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <AlertTriangle className="w-3 h-3" />
        };
      case 'DEVOLVIDA_CORRECAO':
        return {
          label: 'Devolvida para Correção',
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: <XCircle className="w-3 h-3" />
        };
      case 'ANALISE_FAVORAVEL':
        return {
          label: 'Análise Favorável',
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

  // Helpers visuais similares ao ETP
  const getPrazoColorClasses = (diasRestantes: number | null): { text: string; badge: string } => {
    if (diasRestantes === null) return { text: 'text-gray-600', badge: 'bg-gray-100 text-gray-800' };
    if (diasRestantes < 0) return { text: 'text-red-600', badge: 'bg-red-100 text-red-800' };
    if (diasRestantes <= 2) return { text: 'text-orange-600', badge: 'bg-orange-100 text-orange-800' };
    return { text: 'text-green-600', badge: 'bg-green-100 text-green-800' };
  };

  const getDiasRestantes = (): number | null => {
    if (diasNoCard === undefined || diasNoCard === null) return null;
    return prazoInicialDiasUteis - diasNoCard;
  };

  const getProgressColor = (progresso: number) => {
    if (progresso <= 70) return 'bg-green-500';
    if (progresso <= 100) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Progresso temporal padronizado (dias úteis)
  const getTemporalProgress = () => {
    const inicio = new Date(dataCriacaoISO);
    const fim = new Date(addBusinessDays(dataCriacaoISO, prazoInicialDiasUteis));
    const total = Math.max(1, countBusinessDays(inicio, fim));
    const hoje = new Date();
    const passados = Math.min(total, countBusinessDays(inicio, hoje));
    const percent = Math.min(100, Math.round((passados / total) * 100));
    return { percent, total, passados };
  };

  const getEtapaStatus = () => {
    const temFavoravel = interacoes.some(i => i.resultado === 'ANALISE_FAVORAVEL');
    const temDevolucao = interacoes.some(i => i.resultado === 'DEVOLVIDA_CORRECAO');
    if (temFavoravel) return 'Concluída';
    if (temDevolucao) return 'Em ressalvas';
    return 'Em análise';
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Concluída':
        return 'bg-green-100 text-green-800';
      case 'Em ressalvas':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Helpers de datas para o novo card de prazos
  const addBusinessDays = (startISO: string, businessDays: number): string => {
    const date = new Date(startISO);
    let added = 0;
    while (added < businessDays) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day >= 1 && day <= 5) {
        added++;
      }
    }
    return date.toISOString();
  };

  const dataCriacaoISO = (() => {
    const d = new Date();
    // Aproximação: subtrai dias corridos equivalentes aos dias no card
    d.setDate(d.getDate() - Math.max(0, diasNoCard));
    return d.toISOString();
  })();

  type TimelineItem = { id: string; autor: string; descricao: string; dataHora: string; tipo: 'revisao' | 'anexo' | 'status' };
  const generateTimeline = (): TimelineItem[] => {
    const arr: TimelineItem[] = [];
    interacoes.forEach((it) => {
      arr.push({ id: `int-${it.id}`, autor: it.responsavel, descricao: `Revisão ${getStatusConfig(it.resultado).label}`, dataHora: it.dataHora, tipo: 'revisao' });
    });
    dfdData.annexes.slice(0, 2).forEach((ax) => {
      arr.push({ id: `ax-${ax.id}`, autor: ax.uploadedBy || 'Usuário', descricao: 'Documento anexado', dataHora: ax.uploadedAt, tipo: 'anexo' });
    });
    return arr.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()).slice(0, 3);
  };

  const getTimelineIcon = (item: TimelineItem) => {
    switch (item.tipo) {
      case 'revisao':
        if (item.descricao.toLowerCase().includes('favorável')) return <CheckCircle2 className="w-4 h-4 text-green-600" />;
        return <FileText className="w-4 h-4 text-slate-600" />;
      case 'anexo':
        return <Upload className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white">
      {/* Container central ocupando toda a área */}
      <div className="w-full px-2">
        
        {/* Grid principal 12 colunas */}
        <div className="cards-gap">
          
          {/* Análise Jurídica Prévia (full-width) */}
          <section id="analise-juridica" className="col-span-12 w-full">
            <div className="card-shell overflow-hidden">
              <div className="p-4 md:p-6">
                <header className="card-header-title">
                  <Scale className="w-6 h-6 text-purple-600" />
                  <h2 className="text-lg font-bold text-slate-900">Análise Jurídica Preliminar</h2>
                </header>
                <div className="card-separator-indigo"></div>
                <div className="space-y-4">
                  <div>
                    <div className="mt-2">
                      <Textarea
                        id="analise-juridica-textarea"
                        value={analiseJuridica}
                        onChange={(e) => setAnaliseJuridica(e.target.value)}
                        placeholder="Descreva a análise preliminar do edital..."
                        disabled={!canEditAnaliseJuridica()}
                        className="min-h-[320px] resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                      />
                    </div>
                    {validationErrors.includes('Análise Jurídica Preliminar é obrigatória') && (
                      <p className="text-red-500 text-sm mt-1">Análise Jurídica Preliminar é obrigatória</p>
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

                  {/* Input oculto para upload de arquivos */}
                  <input
                    ref={editalFileInputRef}
                    type="file"
                    onChange={handleEditalFileUpload}
                    accept="*/*"
                    className="hidden"
                  />

                  {/* Exibir arquivo do edital enviado */}
                  {editalArquivo && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">{editalArquivo.name}</p>
                            <p className="text-xs text-blue-600">{editalArquivo.size} • {formatDate(editalArquivo.uploadedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={handleBaixarEdital} className="h-6 w-6 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                          {isNAJUser() && (
                            <Button size="sm" variant="outline" onClick={handleExcluirEdital} className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* GERENCIAMENTO: embaixo do balão de Análise Jurídica (full-width) */}
          <section id="gerenciamento" className="col-span-12 w-full">
            <div className="card-shell">
              <header className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6 text-slate-600" />
                <h2 className="text-lg font-bold text-slate-900">Gerenciamento</h2>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Gerenciamento</span>
                </div>
              </header>
              <div className="border-b-2 border-slate-200 mb-6"></div>
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* Coluna Revisões (igual ao ETP, substitui Interações) */}
                <div className="col-span-12 lg:col-span-6">
                  <div className="rounded-xl border shadow-sm bg-white h-full min-h-[420px]">
                    <div className="px-4 py-6 rounded-t-xl border-b">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <History className="w-4 h-4 text-purple-600" />
                        Revisões
                      </h3>
                    </div>
                    <div className="p-4">
                      {interacoes.length === 0 ? (
                        <div className="text-center py-8 w-full">
                          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <History className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Nenhuma revisão registrada</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[420px] overflow-y-auto">
                          {[...interacoes].slice().reverse().map((interacao, idx) => {
                            const statusConfig = getStatusConfig(interacao.resultado);
                            const revisaoNumero = interacoes.length - idx;
                            return (
                              <div key={interacao.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs font-medium">R{revisaoNumero}</Badge>
                                    <Badge className={`text-xs font-medium ${statusConfig.color}`}>
                                      {statusConfig.icon}
                                      <span className="ml-1">{statusConfig.label}</span>
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <p><strong>Setor:</strong> {interacao.setor}</p>
                                  <p><strong>Responsável:</strong> {interacao.responsavel}</p>
                                  <p><strong>Data:</strong> {formatDateTime(interacao.dataHora)}</p>
                                  {interacao.justificativa && (
                                    <p><strong>Justificativa:</strong> {interacao.justificativa}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Coluna Documentos/Anexos */}
                <div className="col-span-12 lg:col-span-6">
                  <div className="rounded-xl border shadow-sm bg-white h-full min-h-[420px]">
                    <div className="px-4 py-6 rounded-t-xl border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <Upload className="w-4 h-4 text-green-600" />
                          Anexos
                        </h3>
                        <span className="text-xs text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md font-medium">{dfdData.annexes.length}</span>
                      </div>
                    </div>
                    <div className="p-4">
                    {canEditAnaliseJuridica() && (
                        <div className="w-full mb-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileUpload}
                          accept=".docx,.xlsx,.pdf,.odt,.csv,.png,.jpg,.txt"
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                            className="w-full h-9 border-dashed border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors text-sm"
                        >
                            <Upload className="w-4 h-4 mr-2" />Adicionar Anexo
                        </Button>
                      </div>
                    )}

                    {dfdData.annexes.length === 0 ? (
                        <div className="pt-4">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                          <p className="text-center text-gray-500 font-medium">Nenhum anexo adicionado</p>
                        {!canEditAnaliseJuridica() && (
                            <p className="text-sm text-gray-400 mt-1 text-center">Apenas usuários autorizados podem adicionar anexos</p>
                        )}
                      </div>
                    ) : (
                        <div className={`${dfdData.annexes.length > 6 ? 'max-h-[420px] overflow-y-auto' : ''} space-y-0`}>
                          {dfdData.annexes.map((annex, idx) => (
                            <React.Fragment key={annex.id}>
                              <div className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="p-2 bg-slate-100 rounded-lg">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{annex.name}</p>
                                    <p className="text-xs text-gray-500">{annex.size} • {formatDate(annex.uploadedAt)}</p>
                              </div>
                            </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-blue-50"><Eye className="w-3 h-3" /></Button>
                                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-green-50"><Download className="w-3 h-3" /></Button>
                              {canEditAnaliseJuridica() && (
                                    <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => removeAnnex(annex.id)}><Trash2 className="w-3 h-3" /></Button>
                              )}
                            </div>
                          </div>
                              {idx < dfdData.annexes.length - 1 && <div className="border-b border-slate-200" />}
                            </React.Fragment>
                        ))}
                      </div>
                    )}
                        </div>
                      </div>
                </div>
              </div>
            </div>
          </section>

          {/* Painel da Etapa (igual estrutura do ETP) */}
          <section className="col-span-12 w-full">
            <div className="rounded-2xl border border-slate-300 shadow-md bg-white p-6 min-h-[700px]">
              <header className="card-header-title">
                <ClipboardCheck className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-bold text-slate-900">Painel da Etapa</h2>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Checklist</span>
                </div>
              </header>
              <div className="card-separator-green"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
                  <header className="flex items-center justify-between mb-4">
                    <div className="flex items中心 gap-2">
                      <Flag className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-sm font-semibold text-slate-800">Status & Prazo</h3>
                    </div>
                    <Badge className={`text-sm font-semibold px-3 py-2 ${getStatusClasses(getEtapaStatus())}`}>{getEtapaStatus()}</Badge>
                  </header>
                  <div className="space-y-4">
                    {/* Card de prazos detalhados (modelo do DFD Assinatura) */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                          <Calendar className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Data de Criação</p>
                          <p className="text-lg font-bold text-slate-900">{formatDate(dataCriacaoISO)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                          <Clock className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Prazo Inicial</p>
                          <p className="text-lg font-bold text-slate-900">{formatDate(dataCriacaoISO)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                          <Flag className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Prazo Final</p>
                          <p className="text-lg font-bold text-slate-900">{formatDate(addBusinessDays(dataCriacaoISO, prazoInicialDiasUteis))}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 my-3 pt-4">
                    {(() => {
                      const diasRest = getDiasRestantes();
                      const prazo = classesPrazo(diasRest);
                      const isAtraso = diasRest !== null && diasRest < 0;
                          return (
                        <div className="text-center py-4">
                          <div className={`text-3xl font-bold ${prazo.text} mb-2`}>{diasRest === null ? '—' : Math.abs(diasRest)}</div>
                          <div className={`text-sm font-medium ${prazo.text}`}>{legendaDiasRestantes(diasRest)}</div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="space-y-2">
                    {(() => { const t = getTemporalProgress(); return (
                      <ProgressaoTemporal startISO={dataCriacaoISO} endISO={addBusinessDays(dataCriacaoISO, prazoInicialDiasUteis)} />
                    ); })()}
                  </div>
                </div>

                <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
                  <header className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-sm font-semibold text-slate-800">Checklist da Etapa</h3>
                                </div>
                  </header>
                  <div className="space-y-1">
                    {(() => {
                      const items = [
                        { id: 'texto', label: analiseJuridica.trim() ? 'Análise preenchida' : 'Análise pendente', status: analiseJuridica.trim() ? 'completed' : 'pending' },
                        { id: 'anexos', label: dfdData.annexes.length > 0 ? 'Documentos anexados' : 'Documentos anexados (nenhum)', status: dfdData.annexes.length > 0 ? 'completed' : 'pending' },
                        { id: 'mov', label: interacoes.length > 0 ? 'Revisões registradas' : 'Revisões (nenhuma)', status: interacoes.length > 0 ? 'completed' : 'pending' }
                      ];
                      const icon = (st: string) => st === 'completed' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />;
                      return items.map(it => (
                        <div key={it.id} className="flex items-center gap-3 py-2 px-2 hover:bg-slate-50 rounded transition-colors">
                          {icon(it.status)}
                          <span className="text-sm text-slate-700 flex-1">{it.label}</span>
                              </div>
                      ));
                    })()}
                              </div>
                            </div>

                <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6 flex flex-col min-h-[320px]">
                  <header className="card-header-title">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-semibold text-slate-800">Mini Timeline</h3>
                  </header>
                  <div className="flex-1 flex flex-col">
                    {generateTimeline().length === 0 ? (
                      <div className="flex-1 flex items-center justify-center"><p className="text-sm text-gray-500 italic text-center">Ainda não há ações registradas.</p></div>
                    ) : (
                      <>
                        <div className="flex-1 relative pr-2">
                          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                          <div className="max-h-[280px] overflow-y-auto">
                            <div className="flex flex-col gap-4 pl-6">
                              {generateTimeline().map(item => (
                                <div key={item.id} className="relative group">
                                  <div className="absolute -left-6 top-0 w-4 h-4 bg-white rounded-full flex items-center justify-center">{getTimelineIcon(item)}</div>
                                  <div className="hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors">
                                    <p className="text-sm font-semibold text-slate-700 mb-1">{item.descricao}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500"><span>{item.autor}</span><span>•</span><span>{formatDateTime(new Date(item.dataHora))}</span></div>
                      </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-slate-200 pt-3 mt-4">
                          <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">Ver todas as ações</button>
                        </div>
                      </>
                    )}
              </div>
            </div>
              </div>
            </div>
          </section>

          {/* FULL: Comentários */}
          <section id="comentarios" className="col-span-12 w-full">
            <div className="card-shell">
              <CommentsSection
                processoId={processoId}
                etapaId={etapaId.toString()}
                cardId="comentarios-analise-juridica"
                title="Comentários"
              />
            </div>
          </section>

          {/*  Ações da Etapa (layout do ETP) */}
          {isNAJUser() && (
            <section className="col-span-12 w-full">
              <div className="rounded-2xl border border-slate-300 shadow-md bg-white p-6">
              <header className="card-header-title">
                  <Flag className="w-6 h-6 text-orange-600" />
                  <h2 className="text-lg font-bold text-slate-900">Ações da Etapa</h2>
                  <div className="ml-auto"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Ações</span></div>
                </header>
              <div className="card-separator-orange"></div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300"><Clock className="w-5 h-5 text-slate-600" /></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Prazo</p>
                        <p className={`text-lg font-bold ${(() => { const diasRest = getDiasRestantes(); const prazo = getPrazoColorClasses(diasRest); return prazo.text; })()}`}>
                          {(() => { const diasRest = getDiasRestantes(); return diasRest === null ? 'Sem prazo' : diasRest < 0 ? `${Math.abs(diasRest)} dias atrasado` : `${diasRest} dias restantes`; })()}
                        </p>
                      </div>
                      </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300"><User className="w-5 h-5 text-slate-600" /></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Responsável</p>
                        <p className="text-lg font-bold text-slate-900">{responsavelAtual || 'Sem responsável'}</p>
                    </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button onClick={handleDevolverCorrecao} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50"><XCircle className="w-4 h-4 mr-2" />Encaminhar para Cumprimento de Ressalvas</Button>
                      <Button onClick={handleAnaliseFavoravel} className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="w-4 h-4 mr-2" />Aprovação</Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>


      {/* Dialog de Confirmação - Devolver para Correção */}
      <Dialog open={showDevolverDialog} onOpenChange={setShowDevolverDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Confirmar Encaminhamento para Cumprimento de Ressalvas
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja encaminhar para cumprimento de ressalvas? Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Registrar a análise jurídica com justificativa</li>
                <li>Criar automaticamente o card "Cumprimento de Ressalvas pós Análise Jurídica Prévia"</li>
                <li>Encaminhar o fluxo para cumprimento de ressalvas</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="justificativa-devolucao" className="text-sm font-medium">
                Justificativa das Ressalvas *
              </Label>
              <Textarea
                id="justificativa-devolucao"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Descreva as ressalvas que devem ser cumpridas..."
                className="min-h-[100px] mt-2 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDevolverDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarDevolverCorrecao} className="bg-red-600 hover:bg-red-700">
              <XCircle className="w-4 h-4 mr-2" />
              Confirmar Encaminhamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação - Análise Favorável */}
      <Dialog open={showAnaliseFavoravelDialog} onOpenChange={setShowAnaliseFavoravelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Confirmar Aprovação
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja aprovar integralmente? Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Registrar a análise jurídica como aprovada</li>
                <li>Liberar automaticamente a próxima etapa no fluxo</li>
                <li>Salvar a análise jurídica preliminar</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAnaliseFavoravelDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarAnaliseFavoravel} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Aprovação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
