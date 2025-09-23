import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ProgressaoTemporal from '@/components/ProgressaoTemporal';
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
  Square,
  Settings,
  Scale,
  Gavel,
  Shield,
  FileEdit,
  FileCheck,
  RotateCcw,
  ClipboardCheck,
  ListChecks,
  Flag
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import TextareaWithMentions from './TextareaWithMentions';
import CommentsSection from './CommentsSection';
import { useDFD, DFDData, DFDVersion, DFDVersionStatus, DFDAnnex } from '@/hooks/useDFD';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';
import Timeline from '@/components/timeline/Timeline';
import { TimelineItemModel, TimelineStatus } from '@/types/timeline';

// Tipos para o sistema de cumprimento de ressalvas
type StatusRessalva = 'PENDENTE' | 'EM_CORRECAO' | 'CORRIGIDA' | 'FINALIZADA';

interface Ressalva {
  id: string;
  descricao: string;
  emitidaPor: string;
  emitidaEm: string;
  status: StatusRessalva;
  resposta?: string;
  respondidaEm?: string;
  respondidaPor?: string;
}

interface VersaoDocumento {
  id: string;
  numeroVersao: number;
  tipo: 'editavel' | 'final';
  status: 'rascunho' | 'enviada' | 'aprovada' | 'reprovada';
  autorId: string;
  criadoEm: string;
  enviadoEm?: string;
  aprovadoEm?: string;
  documento?: { nome: string; url: string; mimeType: string };
  justificativa?: string;
}

interface InteracaoCorrecao {
  id: string;
  setor: string;
  responsavel: string;
  dataHora: string;
  acao: 'salvou' | 'enviou_versao' | 'finalizou';
  versao?: number;
  justificativa?: string;
}

interface GerenciaParticipante {
  id: string;
  nome: string;
  gerencia: string;
  concluiu: boolean;
  dataConclusao?: string;
  dataInicioISO?: string;
  prazoDiasUteis?: number;
  observacoes?: string;
}

interface DFDCumprimentoRessalvasSectionProps {
  processoId: string;
  etapaId: number;
  onComplete: (data: DFDData) => void;
  onSave: (data: DFDData) => void;
  initialData?: DFDData;
  canEdit?: boolean;
}

export default function DFDCumprimentoRessalvasSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true
}: DFDCumprimentoRessalvasSectionProps) {
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
  const [respostasRessalvas, setRespostasRessalvas] = useState<{ [key: string]: string }>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showEnviarFinalDialog, setShowEnviarFinalDialog] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [activeTab, setActiveTab] = useState('gerencias');
  const [diasNoCard, setDiasNoCard] = useState(0);
  const [responsavelAtual, setResponsavelAtual] = useState('');
  const [versaoFinalEnviada, setVersaoFinalEnviada] = useState(false);
  
  // Estados para documentos
  const [documentoEditavel, setDocumentoEditavel] = useState<{ name: string; size: string; uploadedAt: string; uploadedBy: string } | null>(null);
  const [versaoFinal, setVersaoFinal] = useState<{ name: string; size: string; uploadedAt: string; uploadedBy: string } | null>(null);
  const [interacoes, setInteracoes] = useState<InteracaoCorrecao[]>([]);
  
  // Estados para controle de gerências participantes
  const [gerenciasParticipantes, setGerenciasParticipantes] = useState<GerenciaParticipante[]>([
    {
      id: '1',
      nome: 'Yasmin Pissolati Mattos Bretz',
      gerencia: 'GSP - Gerência de Soluções e Projetos',
      concluiu: false,
      dataInicioISO: new Date().toISOString(),
      prazoDiasUteis: 3
    },
    {
      id: '2',
      nome: 'Leticia Bonfim Guilherme',
      gerencia: 'GLC - Gerência de Licitações e Contratos',
      concluiu: false,
      dataInicioISO: new Date().toISOString(),
      prazoDiasUteis: 3
    },
    {
      id: '3',
      nome: 'Guilherme de Carvalho Silva',
      gerencia: 'GSL - Gerência de Suprimentos e Logística',
      concluiu: false,
      dataInicioISO: new Date().toISOString(),
      prazoDiasUteis: 3
    }
  ]);
  // Formulário de nova gerência
  const [novaGerencia, setNovaGerencia] = useState<string>('');
  const [novoResponsavel, setNovoResponsavel] = useState<string>('');
  const [editingGerenciaId, setEditingGerenciaId] = useState<string | null>(null);
  const [editingNome, setEditingNome] = useState<string>('');
  
  // Estado para responsável pelas correções
  const [responsavelCorrecoes, setResponsavelCorrecoes] = useState<string>('');
  
  // Mock das ressalvas emitidas pela NAJ
  const [ressalvas] = useState<Ressalva[]>([
    {
      id: '1',
      descricao: 'Incluir especificação técnica detalhada do item 3.2 do edital',
      emitidaPor: 'Gabriel Radamesis Gomes Nascimento',
      emitidaEm: '2025-01-15T10:30:00Z',
      status: 'PENDENTE'
    },
    {
      id: '2',
      descricao: 'Corrigir valor estimado do item 5.1 conforme tabela de preços vigente',
      emitidaPor: 'Gabriel Radamesis Gomes Nascimento',
      emitidaEm: '2025-01-15T10:30:00Z',
      status: 'PENDENTE'
    },
    {
      id: '3',
      descricao: 'Adicionar cláusula de garantia conforme art. 76 da Lei 14.133/2021',
      emitidaPor: 'Gabriel Radamesis Gomes Nascimento',
      emitidaEm: '2025-01-15T10:30:00Z',
      status: 'PENDENTE'
    }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editavelFileInputRef = useRef<HTMLInputElement>(null);
  const finalFileInputRef = useRef<HTMLInputElement>(null);

  // Verificar se pode editar - setores Demandante, GSP e GLC
  const canEditCorrecoes = () => {
    if (!user) return false;
    
    const gerenciasEditaveis = [
      'GSP - Gerência de Soluções e Projetos',
      'GLC - Gerência de Licitações e Contratos',
      'GSL - Gerência de Suprimentos e Logística',
      'GRH - Gerência de Recursos Humanos',
      'GUE - Gerência de Urgência e Emergência',
      'GFC - Gerência Financeira e Contábil'
    ];
    
    return gerenciasEditaveis.includes(user.gerencia);
  };

  // Verificar se é NAJ (apenas visualização)
  const isNAJUser = () => {
    return user?.gerencia === 'NAJ - Assessoria Jurídica';
  };

  // Calcular SLA da correção
  const calcularSLA = () => {
    // Mock: usar 3 dias úteis como padrão
    const prazoMaximo = 3;
    const diasUteis = diasNoCard;
    
    if (diasUteis <= prazoMaximo) return { status: 'ok' as const, dias: diasUteis };
    if (diasUteis <= prazoMaximo + 1) return { status: 'risco' as const, dias: diasUteis };
    return { status: 'estourado' as const, dias: diasUteis };
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Verificar se há versão final enviada
    if (!versaoFinal) {
      errors.push('É obrigatório enviar uma versão final em PDF');
    }

    // Verificar se foi definido responsável pelas correções
    if (!responsavelCorrecoes.trim()) {
      errors.push('É obrigatório definir quem irá cumprir as ressalvas');
    }

    // Verificar se todas as gerências participantes concluíram
    const gerenciasNaoConcluidas = gerenciasParticipantes.filter(g => !g.concluiu);
    if (gerenciasNaoConcluidas.length > 0) {
      errors.push('Todas as gerências participantes devem marcar como concluído');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSalvarAlteracoes = () => {
    // Salvar progresso sem finalizar
    const dataAtual = new Date().toISOString();
    
    // Adicionar interação
    const novaInteracao: InteracaoCorrecao = {
      id: `interacao-${Date.now()}`,
      setor: user?.gerencia || 'Setor',
      responsavel: user?.nome || 'Usuário',
      dataHora: dataAtual,
      acao: 'salvou',
      justificativa: justificativa
    };
    
    setInteracoes(prev => [...prev, novaInteracao]);
    localStorage.setItem(`interacoes-correcao-${processoId}`, JSON.stringify([...interacoes, novaInteracao]));
    
    // Respostas às ressalvas removidas do fluxo visual
    
    // Salvar responsável pelas correções
    localStorage.setItem(`responsavel-correcoes-${processoId}`, responsavelCorrecoes);
    
    // Salvar status das gerências participantes
    localStorage.setItem(`gerencias-participantes-${processoId}`, JSON.stringify(gerenciasParticipantes));
    
    onSave(dfdData);
    
    toast({
      title: "Alterações Salvas",
      description: "O progresso foi salvo com sucesso. Você pode continuar editando."
    });
    
    setJustificativa('');
  };

  const handleEnviarVersaoFinal = () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todas as respostas às ressalvas e envie a versão final.",
        variant: "destructive"
      });
      return;
    }

    setShowEnviarFinalDialog(true);
  };

  const confirmarEnviarVersaoFinal = () => {
    const dataAtual = new Date().toISOString();
    
    // Marcar versão final como enviada
    setVersaoFinalEnviada(true);
    
    // Atualizar status das ressalvas
    const ressalvasAtualizadas = ressalvas.map(ressalva => ({
      ...ressalva,
      status: 'CORRIGIDA' as StatusRessalva,
      respondidaEm: dataAtual,
      respondidaPor: user?.nome || 'Usuário'
    }));
    
    // Adicionar interação
    const novaInteracao: InteracaoCorrecao = {
      id: `interacao-${Date.now()}`,
      setor: user?.gerencia || 'Setor',
      responsavel: user?.nome || 'Usuário',
      dataHora: dataAtual,
      acao: 'finalizou',
      versao: versaoFinal ? 1 : undefined,
      justificativa: justificativa
    };
    
    setInteracoes(prev => [...prev, novaInteracao]);
    localStorage.setItem(`interacoes-correcao-${processoId}`, JSON.stringify([...interacoes, novaInteracao]));
    
    // Salvar dados finais
    localStorage.setItem(`versao-final-enviada-${processoId}`, 'true');
    // Respostas às ressalvas removidas do fluxo visual
    localStorage.setItem(`responsavel-correcoes-${processoId}`, responsavelCorrecoes);
    localStorage.setItem(`gerencias-participantes-${processoId}`, JSON.stringify(gerenciasParticipantes));
    
    onComplete(dfdData);
    
    toast({
      title: "Versão Final Enviada",
      description: "O cumprimento das ressalvas foi finalizado e enviado para nova análise."
    });
    
    setShowEnviarFinalDialog(false);
    setJustificativa('');
  };

  // Funções para upload de documentos
  const handleUploadEditavel = () => {
    editavelFileInputRef.current?.click();
  };

  const handleEditavelFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const arquivoInfo = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.nome || 'Usuário'
      };
      
      setDocumentoEditavel(arquivoInfo);
      
      // Mock: salvar no localStorage
      localStorage.setItem(`documento-editavel-${processoId}`, JSON.stringify(arquivoInfo));
      
      // Adicionar interação
      const novaInteracao: InteracaoCorrecao = {
        id: `interacao-${Date.now()}`,
        setor: user?.gerencia || 'Setor',
        responsavel: user?.nome || 'Usuário',
        dataHora: new Date().toISOString(),
        acao: 'enviou_versao',
        versao: 1
      };
      
      setInteracoes(prev => [...prev, novaInteracao]);
      
      toast({
        title: "Documento Editável enviado",
        description: `${file.name} foi enviado com sucesso.`
      });
    }
    
    // Limpar o input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUploadVersaoFinal = () => {
    finalFileInputRef.current?.click();
  };

  const handleVersaoFinalUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const arquivoInfo = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.nome || 'Usuário'
      };
      
      setVersaoFinal(arquivoInfo);
      
      // Mock: salvar no localStorage
      localStorage.setItem(`versao-final-${processoId}`, JSON.stringify(arquivoInfo));
      
      toast({
        title: "Versão Final enviada",
        description: `${file.name} foi enviado com sucesso.`
      });
    }
    
    // Limpar o input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleBaixarDocumento = (tipo: 'editavel' | 'final') => {
    const arquivo = tipo === 'editavel' ? documentoEditavel : versaoFinal;
    
    if (!arquivo) {
      toast({
        title: "Nenhum arquivo",
        description: `Nenhum arquivo ${tipo === 'editavel' ? 'editável' : 'final'} foi enviado ainda.`,
        variant: "destructive"
      });
      return;
    }

    // Mock: simular download
    toast({
      title: "Download Iniciado",
      description: `O arquivo ${arquivo.name} está sendo baixado.`
    });
  };

  const handleExcluirDocumento = (tipo: 'editavel' | 'final') => {
    if (tipo === 'editavel') {
      setDocumentoEditavel(null);
      localStorage.removeItem(`documento-editavel-${processoId}`);
    } else {
      setVersaoFinal(null);
      localStorage.removeItem(`versao-final-${processoId}`);
    }
    
    toast({
      title: "Arquivo removido",
      description: `O arquivo ${tipo === 'editavel' ? 'editável' : 'final'} foi removido com sucesso.`
    });
  };

  // Abrir link em nova aba (padrão Aprovação)
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

  // Função para marcar gerência como concluída
  const handleMarcarConcluido = (gerenciaId: string) => {
    setGerenciasParticipantes(prev => prev.map(g => 
      g.id === gerenciaId 
        ? { ...g, concluiu: true, dataConclusao: new Date().toISOString() }
        : g
    ));
    
    toast({
      title: "Gerência marcada como concluída",
      description: "Esta gerência foi marcada como concluída no cumprimento das ressalvas."
    });
  };

  // Função para desmarcar gerência como concluída
  const handleDesmarcarConcluido = (gerenciaId: string) => {
    setGerenciasParticipantes(prev => prev.map(g => 
      g.id === gerenciaId 
        ? { ...g, concluiu: false, dataConclusao: undefined }
        : g
    ));
    
    toast({
      title: "Gerência desmarcada",
      description: "Esta gerência foi desmarcada como concluída."
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
    // Carregar documento editável
    const editavelSalvo = localStorage.getItem(`documento-editavel-${processoId}`);
    if (editavelSalvo) {
      try {
        const arquivoData = JSON.parse(editavelSalvo);
        setDocumentoEditavel(arquivoData);
      } catch (error) {
        console.error('Erro ao carregar documento editável salvo:', error);
      }
    }

    // Carregar versão final
    const versaoFinalSalva = localStorage.getItem(`versao-final-${processoId}`);
    if (versaoFinalSalva) {
      try {
        const arquivoData = JSON.parse(versaoFinalSalva);
        setVersaoFinal(arquivoData);
      } catch (error) {
        console.error('Erro ao carregar versão final salva:', error);
      }
    }

    // Carregar respostas das ressalvas
    // Respostas às ressalvas removidas

    // Carregar interações
    const interacoesSalvas = localStorage.getItem(`interacoes-correcao-${processoId}`);
    if (interacoesSalvas) {
      try {
        const interacoesData = JSON.parse(interacoesSalvas);
        setInteracoes(interacoesData);
      } catch (error) {
        console.error('Erro ao carregar interações salvas:', error);
      }
    }

    // Verificar se versão final foi enviada
    const versaoFinalEnviada = localStorage.getItem(`versao-final-enviada-${processoId}`);
    if (versaoFinalEnviada === 'true') {
      setVersaoFinalEnviada(true);
    }

    // Carregar responsável pelas correções
    const responsavelSalvo = localStorage.getItem(`responsavel-correcoes-${processoId}`);
    if (responsavelSalvo) {
      setResponsavelCorrecoes(responsavelSalvo);
    }

    // Carregar status das gerências participantes
    const gerenciasSalvas = localStorage.getItem(`gerencias-participantes-${processoId}`);
    if (gerenciasSalvas) {
      try {
        const gerenciasData = JSON.parse(gerenciasSalvas);
        setGerenciasParticipantes(gerenciasData);
      } catch (error) {
        console.error('Erro ao carregar gerências participantes salvas:', error);
      }
    }

    // Calcular dias no card (mock)
    setDiasNoCard(1);
    setResponsavelAtual(user?.nome || 'Sem responsável definido');
  }, [processoId, user?.nome]);

  // Usar as funções padronizadas do utils
  const formatDate = formatDateBR;
  const formatDateTime = formatDateTimeBR;

  const getStatusConfig = (status: StatusRessalva) => {
    switch (status) {
      case 'PENDENTE':
        return {
          label: 'Pendente',
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: <Clock className="w-3 h-3" />
        };
      case 'EM_CORRECAO':
        return {
          label: 'Em Correção',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <Edit3 className="w-3 h-3" />
        };
      case 'CORRIGIDA':
        return {
          label: 'Corrigida',
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'FINALIZADA':
        return {
          label: 'Finalizada',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <FileCheck className="w-3 h-3" />
        };
      default:
        return {
          label: 'Pendente',
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <Clock className="w-3 h-3" />
        };
    }
  };

  const sla = calcularSLA();

  // Calcular progresso das gerências participantes
  const gerenciasConcluidas = gerenciasParticipantes.filter(g => g.concluiu).length;
  const totalGerencias = gerenciasParticipantes.length;
  const progressoGerencias = totalGerencias > 0 ? (gerenciasConcluidas / totalGerencias) * 100 : 0;

  const getProgressClasses = (percent: number) => {
    if (percent >= 80) return { bar: 'bg-green-600', text: 'text-green-700', chip: 'bg-green-100 text-green-800' };
    if (percent >= 40) return { bar: 'bg-yellow-500', text: 'text-yellow-700', chip: 'bg-yellow-100 text-yellow-800' };
    return { bar: 'bg-slate-400', text: 'text-slate-600', chip: 'bg-slate-100 text-slate-700' };
  };

  // Helpers de data
  const addBusinessDays = (startISO: string, businessDays: number = 3): string => {
    const date = new Date(startISO);
    let added = 0;
    while (added < businessDays) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day >= 1 && day <= 5) added++;
    }
    return date.toISOString();
  };

  // Progresso temporal padronizado (dias úteis) — igual aos outros cards
  const getTemporalProgress = () => {
    const inicioGlobalISO = (gerenciasParticipantes
      .map(g => g.dataInicioISO || new Date().toISOString())
      .sort((a,b) => new Date(a).getTime() - new Date(b).getTime())[0]) || new Date().toISOString();
    const prazoDias = 3; // prazo global igual para todas as gerências
    const finalISO = addBusinessDays(inicioGlobalISO, prazoDias);
    const start = new Date(inicioGlobalISO);
    const end = new Date(finalISO);
    const hoje = new Date();
    const total = Math.max(1, countBusinessDaysBetween(start.toISOString(), end.toISOString()));
    const passados = countBusinessDaysBetween(start.toISOString(), hoje.toISOString());
    const percent = Math.min(100, Math.round((Math.min(passados, total) / total) * 100));
    return { percent, start, end, passados, total };
  };

  const getGerenciaPrazoInfo = (g: GerenciaParticipante) => {
    const inicio = g.dataInicioISO || new Date().toISOString();
    const prazo = g.prazoDiasUteis ?? 3;
    const finalISO = addBusinessDays(inicio, prazo);
    return { inicioISO: inicio, finalISO, prazoDiasUteis: prazo };
  };

  const countBusinessDaysBetween = (startISO: string, endISO: string): number => {
    const start = new Date(startISO);
    const end = new Date(endISO);
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dow = cur.getDay();
      if (dow >= 1 && dow <= 5) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const getGerenciaPrazoStatus = (g: GerenciaParticipante) => {
    const { inicioISO, finalISO, prazoDiasUteis } = getGerenciaPrazoInfo(g);
    const fim = g.concluiu && g.dataConclusao ? g.dataConclusao : new Date().toISOString();
    const decorridos = countBusinessDaysBetween(inicioISO, fim);
    if (g.concluiu) {
      const dentro = new Date(g.dataConclusao || '') <= new Date(finalISO);
      return {
        text: dentro ? 'Concluído no prazo' : 'Concluído atrasado',
        chip: dentro ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
        decorridos
      };
    }
    return {
      text: 'Em andamento',
      chip: 'bg-slate-100 text-slate-700',
      decorridos
    };
  };

  const opcoesGerencias = [
    'GSP - Gerência de Soluções e Projetos',
    'GLC - Gerência de Licitações e Contratos',
    'GSL - Gerência de Suprimentos e Logística',
    'GRH - Gerência de Recursos Humanos',
    'GUE - Gerência de Urgência e Emergência',
    'GFC - Gerência Financeira e Contábil',
    'SE - Secretaria Executiva',
    'NAJ - Assessoria Jurídica'
  ];
  // Busca dinâmica no UserContext (mock users)
  const getUsuariosDaGerencia = (gerenciaNome: string): string[] => {
    try {
      // Importação dinâmica para evitar ciclo
      const { mockUsers } = require('@/contexts/UserContext');
      return (mockUsers as any[])
        .filter((u) => (u.gerencia || '').trim().toLowerCase() === (gerenciaNome || '').trim().toLowerCase())
        .map((u) => u.nome)
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  const handleAdicionarGerencia = () => {
    const nomeGerencia = (novaGerencia || '').trim();
    const nomeResp = (novoResponsavel || '').trim();
    if (!nomeGerencia || !nomeResp) {
      toast({ title: 'Preencha os campos', description: 'Selecione a gerência e informe o responsável.', variant: 'destructive' });
      return;
    }
    const existe = gerenciasParticipantes.some(g => g.gerencia === nomeGerencia && g.nome === nomeResp);
    if (existe) {
      toast({ title: 'Já existente', description: 'Esta gerência com esse responsável já está listada.', variant: 'destructive' });
      return;
    }
    const novo: GerenciaParticipante = {
      id: `${Date.now()}`,
      nome: nomeResp,
      gerencia: nomeGerencia,
      concluiu: false,
      dataInicioISO: new Date().toISOString(),
      prazoDiasUteis: 3
    };
    setGerenciasParticipantes(prev => [novo, ...prev]);
    setNovaGerencia('');
    setNovoResponsavel('');
    toast({ title: 'Gerência adicionada', description: `${nomeGerencia} incluída com sucesso.` });
  };

  const handleRemoverGerencia = (gerenciaId: string) => {
    setGerenciasParticipantes(prev => prev.filter(g => g.id !== gerenciaId));
    toast({ title: 'Gerência removida', description: 'Item removido da lista.' });
  };

  const iniciarEdicaoGerencia = (gerenciaId: string, nomeAtual: string) => {
    setEditingGerenciaId(gerenciaId);
    setEditingNome(nomeAtual);
  };

  const salvarEdicaoGerencia = (gerenciaId: string) => {
    const nome = editingNome.trim();
    if (!nome) {
      toast({ title: 'Informe o responsável', description: 'O campo responsável não pode ficar vazio.', variant: 'destructive' });
      return;
    }
    setGerenciasParticipantes(prev => prev.map(g => g.id === gerenciaId ? { ...g, nome } : g));
    setEditingGerenciaId(null);
    setEditingNome('');
    toast({ title: 'Atualizado', description: 'Responsável atualizado com sucesso.' });
  };

  const cancelarEdicaoGerencia = () => {
    setEditingGerenciaId(null);
    setEditingNome('');
  };

  return (
    <div className="bg-white">
      {/* Container central ocupando toda a área */}
      <div className="w-full px-2">
        
        {/* Grid principal 12 colunas */}
        <div className="cards-gap">
          
          {/* Cumprimento de Ressalvas (Parecer Técnico - texto) */}
           <section id="cumprimento-ressalvas" className="col-span-12 w-full">
             <div className="card-shell">
              <header className="card-header-title">
                <Search className="w-6 h-6 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Pós Cumprimento de Ressalvas</h2>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Análise</span>
                  </div>
              </header>
              <div className="card-separator-indigo"></div>
              <div className="p-4 md:p-6">
                <div className="space-y-6">
                  {/* Texto do parecer */}
                            <div className="flex-1">
                            <Textarea
                      id="cumprimento-ressalvas-textarea"
                      value={justificativa}
                      onChange={(e) => setJustificativa(e.target.value)}
                      placeholder="Descreva a análise técnica do DFD..."
                      disabled={!canEditCorrecoes() || versaoFinalEnviada}
                      className="min-h-[350px] resize-none border-gray-200 focus:border-indigo-300 focus:ring-indigo-300"
                            />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* GERENCIAMENTO: embaixo do balão principal (full-width) */}
           <section id="gerenciamento" className="col-span-12 w-full">
             <div className="card-shell">
              <header className="card-header-title">
                <Settings className="w-6 h-6 text-slate-600" />
                <h2 className="text-lg font-bold text-slate-900">Gerenciamento</h2>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Gerenciamento</span>
                </div>
              </header>
              <div className="card-separator-indigo"></div>
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                   <TabsList className="grid w-full grid-cols-2">
                     <TabsTrigger value="gerencias">Gerências</TabsTrigger>
                     <TabsTrigger value="anexos">Anexos</TabsTrigger>
                   </TabsList>
                  
                  <TabsContent value="gerencias" className="mt-0 p-0">
                    <div className="space-y-4">
                      {/* Título padrão (igual outros cards) */}
                      <div className="px-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-600" />
                            Gerências Participantes
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getProgressClasses(progressoGerencias).chip}`}>{gerenciasConcluidas} de {totalGerencias} concluíram</span>
                            </div>
                        <p className="text-xs text-slate-500">Marque "Concluir" quando a sua gerência finalizar as correções.</p>
                          </div>
                      
                      {/* Ferramenta: adicionar gerência */}
                            {canEditCorrecoes() && !versaoFinalEnviada && (
                        <div className="rounded-xl border border-slate-200 p-4 bg-white">
                          <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-12 md:col-span-5">
                              <Label htmlFor="nova-gerencia" className="text-xs font-medium text-slate-600">Gerência</Label>
                              <select id="nova-gerencia" value={novaGerencia} onChange={(e) => { setNovaGerencia(e.target.value); setNovoResponsavel(''); }} className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Selecione...</option>
                                {opcoesGerencias.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                          </div>
                            <div className="col-span-12 md:col-span-5">
                              <Label htmlFor="novo-responsavel" className="text-xs font-medium text-slate-600">Responsável</Label>
                              <select id="novo-responsavel" value={novoResponsavel} onChange={(e) => setNovoResponsavel(e.target.value)} disabled={!novaGerencia} className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-800 disabled:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">{novaGerencia ? 'Selecione o responsável...' : 'Selecione uma gerência primeiro'}</option>
                                {getUsuariosDaGerencia(novaGerencia).map(u => (
                                  <option key={u} value={u}>{u}</option>
                                ))}
                              </select>
                        </div>
                            <div className="col-span-12 md:col-span-2">
                              <Button onClick={handleAdicionarGerencia} className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white"><Plus className="w-4 h-4 mr-1" />Adicionar</Button>
                      </div>
                      </div>
                  </div>
                      )}

                      {/* Lista de gerências em cards modernos */}
                      <div className="space-y-3">
                        {gerenciasParticipantes.map((gerencia) => (
                          <div key={gerencia.id} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${gerencia.concluiu ? 'border-green-300' : 'border-slate-300'}`}>
                                {gerencia.concluiu ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-slate-500" />
                                  )}
                            </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 truncate">{gerencia.gerencia}</p>
                                  {editingGerenciaId === gerencia.id ? (
                                    <div className="flex items-center gap-2 mt-1">
                                      <select value={editingNome} onChange={(e) => setEditingNome(e.target.value)} className="h-7 text-xs rounded-md border border-slate-300 bg-white px-2">
                                        <option value="">Selecione o responsável...</option>
                                        {getUsuariosDaGerencia(gerencia.gerencia).map(u => (
                                          <option key={u} value={u}>{u}</option>
                                        ))}
                                      </select>
                                      <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => salvarEdicaoGerencia(gerencia.id)}><CheckCircle className="w-3 h-3" /></Button>
                                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={cancelarEdicaoGerencia}><XCircle className="w-3 h-3" /></Button>
                          </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-xs text-slate-600 truncate">
                                      <span className="truncate">{gerencia.nome}</span>
                            {canEditCorrecoes() && !versaoFinalEnviada && (
                                        <Button size="sm" variant="ghost" className="h-6 px-1 text-slate-500 hover:text-slate-700" onClick={() => iniciarEdicaoGerencia(gerencia.id, gerencia.nome)}>
                                          <Edit3 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                                  )}
                              {gerencia.concluiu && gerencia.dataConclusao && (
                                    <p className="text-[11px] text-green-700 mt-1">Concluído em {formatDateTime(gerencia.dataConclusao)}</p>
                                  )}
                        </div>
                      </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${gerencia.concluiu ? 'bg-green-100 text-green-800 border-green-300' : 'bg-slate-100 text-slate-800 border-slate-300'}`}>{gerencia.concluiu ? 'Concluída' : 'Pendente'}</Badge>
                              {canEditCorrecoes() && !versaoFinalEnviada && (
                                gerencia.concluiu ? (
                                    <Button size="sm" variant="outline" onClick={() => handleDesmarcarConcluido(gerencia.id)} className="h-7 px-2 text-red-600 hover:text-red-700"><XCircle className="w-3 h-3" /></Button>
                                  ) : (
                                    <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleMarcarConcluido(gerencia.id)}><CheckCircle className="w-3 h-3 mr-1" />Concluir</Button>
                                )
                              )}
                        {canEditCorrecoes() && !versaoFinalEnviada && (
                                  <Button size="sm" variant="outline" className="h-7 px-2 text-red-600 hover:text-red-700" onClick={() => handleRemoverGerencia(gerencia.id)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                        )}
                      </div>
                  </div>
                              </div>
                        ))}
                          </div>
                          
                      {/* Barra de progresso com cores dinâmicas */}
                      <div className="mt-1">
                        {(() => { const t = getTemporalProgress(); return (
                          <ProgressaoTemporal startISO={t.start.toISOString()} endISO={t.end.toISOString()} />
                        ); })()}
                      </div>

                      {validationErrors.includes('Todas as gerências participantes devem marcar como concluído') && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-600">Todas as gerências participantes devem marcar como concluído</p>
                        </div>
                    )}
                  </div>
                  </TabsContent>
                  
                  <TabsContent value="anexos" className="mt-0 p-0">
                    <div className="rounded-xl border shadow-sm bg-white h-full">
                      <div className="px-4 py-3 rounded-t-xl border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <Upload className="w-4 h-4 text-green-600" />
                            Anexos
                          </h3>
                          <span className="text-xs text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md font-medium">{dfdData.annexes.length}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="space-y-3">
                          <div className="w-full">
                  <input
                              ref={fileInputRef}
                    type="file"
                              onChange={handleFileUpload}
                              accept=".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg,.gif,.bmp,.tif,.tiff"
                    className="hidden"
                  />
                              {canEditCorrecoes() && !versaoFinalEnviada && (
                                  <Button
                                onClick={() => fileInputRef.current?.click()}
                                    variant="outline"
                                className="w-full h-9 border-dashed border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors text-sm"
                                  >
                                <Upload className="w-4 h-4 mr-2" />Adicionar Anexo
                                  </Button>
                              )}
                            </div>
                          {dfdData.annexes.length === 0 ? (
                            <div className="pt-4">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                              <p className="text-center text-gray-500 font-medium">Nenhum anexo adicionado</p>
                              {!canEditCorrecoes() && (
                                <p className="text-center text-sm text-gray-400 mt-1">Apenas usuários autorizados podem adicionar anexos</p>
                              )}
                            </div>
                    ) : (
                            <div className={`${dfdData.annexes.length > 6 ? 'max-h-[450px] overflow-y-auto' : ''} space-y-0`}>
                              {dfdData.annexes.map((annex, idx) => (
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
                                      {canEditCorrecoes() && !versaoFinalEnviada && (
                                        <Button size="sm" variant="outline" aria-label="Remover" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => removeAnnex(annex.id)}>
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                              )}
                        </div>
                      </div>
                                  {idx < dfdData.annexes.length - 1 && (<div className="border-b border-slate-200" />)}
                                </React.Fragment>
                        ))}
                        </div>
                      )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                        </div>
                      </div>
          </section>

          {/* Painel da Etapa (layout padrão) */}
          <section className="col-span-12 w-full">
            <div className="card-shell">
              <header className="card-header-title">
                <ClipboardCheck className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-bold text-slate-900">Painel da Etapa</h2>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Checklist</span>
                </div>
              </header>
              <div className="card-separator-green"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1) Status & Prazo - por Gerência */}
                <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
                  <header className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Flag className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-sm font-semibold text-slate-800">Status & Prazo por Gerência</h3>
                    </div>
                    <Badge className="text-sm font-semibold px-3 py-2 bg-yellow-100 text-yellow-800">
                      {versaoFinalEnviada ? 'Finalizado' : 'Em correção'}
                              </Badge>
                  </header>
                  <div className="space-y-4">
                    {gerenciasParticipantes.map((g) => {
                      const prazoInfo = getGerenciaPrazoInfo(g);
                      return (
                        <div key={g.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-medium">{g.gerencia.split(' - ')[0]}</Badge>
                            </div>
                            {(() => { const st = getGerenciaPrazoStatus(g); return (
                              <Badge className={`text-xs px-2 py-1 ${st.chip}`}>{st.text}</Badge>
                            ); })()}
                          </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-300 bg-white">
                              <Clock className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-[12px] font-semibold text-slate-500">Prazo Inicial</p>
                              <p className="text-sm font-bold text-slate-900">{formatDate(prazoInfo.inicioISO)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-300 bg-white">
                              <Flag className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-[12px] font-semibold text-slate-500">Prazo Final</p>
                              <p className="text-sm font-bold text-slate-900">{formatDate(prazoInfo.finalISO)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-[12px] text-slate-500">
                            {g.concluiu && g.dataConclusao ? (
                              <span>Concluiu em {formatDateTime(g.dataConclusao)}</span>
                            ) : (
                              <span>Não concluído</span>
                            )}
                          </div>
                          {(() => { const st = getGerenciaPrazoStatus(g); return (
                            <span className="text-[12px] text-slate-500">{st.decorridos} dias úteis decorridos</span>
                          ); })()}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-slate-200 my-3 pt-4">
                    <div className="text-center py-2">
                      <div className={`text-2xl font-bold ${sla.status === 'ok' ? 'text-green-600' : sla.status === 'risco' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {sla.status === 'ok' ? 'Dentro do Prazo' : sla.status === 'risco' ? 'Em Risco' : 'Atrasado'}
                      </div>
                      <div className="text-sm text-slate-600">{diasNoCard} dias no card</div>
                    </div>
                  </div>
                </div>

                {/* 2) Checklist */}
                <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
                  <header className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-sm font-semibold text-slate-800">Checklist da Etapa</h3>
                              </div>
                  </header>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 py-2 px-2">
                      {documentoEditavel ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                      <span className="text-sm text-slate-700 flex-1">Documento editável anexado</span>
                            </div>
                    <div className="flex items-center gap-3 py-2 px-2">
                      {versaoFinal ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                      <span className="text-sm text-slate-700 flex-1">Versão final anexada</span>
                    </div>
                    <div className="flex items-center gap-3 py-2 px-2">
                      {gerenciasConcluidas === totalGerencias && totalGerencias > 0 ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                      <span className="text-sm text-slate-700 flex-1">Gerências participantes concluídas</span>
                    </div>
                  </div>
                </div>

                {/* Mini Timeline removida do painel para padronização */}
              </div>
            </div>
            {/* Timeline (balão) */}
            <div className="mt-6">
            <Timeline data={(() => {
              const items: TimelineItemModel[] = [];
              interacoes.forEach((it) => {
                const status: TimelineStatus = it.acao === 'finalizou' ? 'aprovado' : it.acao === 'enviou_versao' ? 'versao' : 'comentario';
                items.push({ id: `int-${it.id}`, status, title: it.acao === 'finalizou' ? 'Correções finalizadas' : it.acao === 'enviou_versao' ? 'Versão enviada' : 'Alterações salvas', author: { name: it.responsavel }, createdAt: it.dataHora });
              });
              const anexosRecentes = [...dfdData.annexes].sort((a,b)=> new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).slice(0,2);
              anexosRecentes.forEach(ax => items.push({ id: `anexo-${ax.id}`, status: 'anexo', title: `Anexo adicionado: ${ax.name}`, author: { name: ax.uploadedBy || 'Usuário' }, createdAt: ax.uploadedAt }));
              return items.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            })()} />
            </div>
          </section>

          {/* FULL: Comentários */}
          <section id="comentarios" className="col-span-12 w-full">
            <div className="card-shell">
              <CommentsSection
                processoId={processoId}
                etapaId={etapaId.toString()}
                cardId="comentarios-cumprimento-ressalvas"
                title="Comentários"
              />
            </div>
          </section>

          {/* Ações da Etapa (layout padrão) */}
          <section className="col-span-12 w-full">
            <div className="card-shell">
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
                      <p className="text-lg font-bold text-slate-900">{sla.status === 'ok' ? 'Dentro do prazo' : sla.status === 'risco' ? 'Em risco' : 'Em atraso'}</p>
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
                {!versaoFinalEnviada ? (
                  <div className="border-t border-slate-200 pt-4 flex flex-wrap gap-2 justify-center">
                    <Button onClick={handleSalvarAlteracoes} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50"><Save className="w-4 h-4 mr-2" />Salvar Alterações</Button>
                    <Button onClick={handleEnviarVersaoFinal} className="bg-green-600 hover:bg-green-700 text-white"><Send className="w-4 h-4 mr-2" />Enviar Versão Final Corrigida</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-green-600">Correções Finalizadas</p>
                        <p className="text-sm text-green-700">Enviado para nova análise da NAJ</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Status Finalizado */}
          {versaoFinalEnviada && (
            <section id="status-finalizado" className="col-span-12 w-full mt-6 pb-6">
              <Card className="w-full shadow-lg border-0 bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div className="text-center">
                      <h3 className="font-semibold text-green-900">Correções Finalizadas</h3>
                      <p className="text-sm text-green-700">
                        O cumprimento das ressalvas foi concluído e enviado para nova análise da NAJ.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>

      {/* Dialog de Confirmação - Enviar Versão Final */}
      <Dialog open={showEnviarFinalDialog} onOpenChange={setShowEnviarFinalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Confirmar Envio da Versão Final
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja enviar a versão final corrigida? Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Finalizar o cumprimento das ressalvas</li>
                <li>Bloquear edições futuras</li>
                <li>Encaminhar para nova análise da NAJ</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="justificativa-final" className="text-sm font-medium">
                Justificativa (opcional)
              </Label>
              <Textarea
                id="justificativa-final"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Adicione uma justificativa para o envio..."
                className="min-h-[100px] mt-2 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowEnviarFinalDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarEnviarVersaoFinal} className="bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              Confirmar Envio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
