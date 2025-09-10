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
  Square,
  Settings
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import TextareaWithMentions from './TextareaWithMentions';
import CommentsSection from './CommentsSection';
import { useDFD, DFDData, DFDVersion, DFDVersionStatus, DFDAnnex } from '@/hooks/useDFD';
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
  const [parecerExiste, setParecerExiste] = useState(false);
  const [dfdArquivoExiste, setDfdArquivoExiste] = useState(false);
  const [dfdArquivo, setDfdArquivo] = useState<{ name: string; size: string; uploadedAt: string; uploadedBy: string } | null>(null);
  const [parecerArquivo, setParecerArquivo] = useState<{ name: string; size: string; uploadedAt: string; uploadedBy: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dfdFileInputRef = useRef<HTMLInputElement>(null);
  const parecerFileInputRef = useRef<HTMLInputElement>(null);

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
  const handleUploadDFD = () => {
    dfdFileInputRef.current?.click();
  };

  const handleUploadParecer = () => {
    parecerFileInputRef.current?.click();
  };

  const handleDFDFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const arquivoInfo = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.nome || 'Usuário'
      };
      
      setDfdArquivo(arquivoInfo);
      setDfdArquivoExiste(true);
      
      // Mock: salvar no localStorage
      localStorage.setItem(`dfd-arquivo-${processoId}`, JSON.stringify(arquivoInfo));
      
      toast({
        title: "Arquivo DFD enviado",
        description: `${file.name} foi enviado com sucesso.`
      });
    }
    
    // Limpar o input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleParecerFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const arquivoInfo = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.nome || 'Usuário'
      };
      
      setParecerArquivo(arquivoInfo);
      setParecerExiste(true);
      
      // Mock: salvar no localStorage
      localStorage.setItem(`parecer-arquivo-${processoId}`, JSON.stringify(arquivoInfo));
      
      toast({
        title: "Arquivo Parecer enviado",
        description: `${file.name} foi enviado com sucesso.`
      });
    }
    
    // Limpar o input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleBaixarDFD = () => {
    if (!dfdArquivo) {
      toast({
        title: "Nenhum arquivo",
        description: "Nenhum arquivo DFD foi enviado ainda.",
        variant: "destructive"
      });
      return;
    }

    // Mock: simular download do DFD
    toast({
      title: "Download Iniciado",
      description: `O arquivo ${dfdArquivo.name} está sendo baixado.`
    });
  };

  const handleBaixarParecer = () => {
    if (!parecerArquivo) {
      toast({
        title: "Nenhum arquivo",
        description: "Nenhum arquivo de parecer foi enviado ainda.",
        variant: "destructive"
      });
      return;
    }

    // Mock: simular download do parecer
    toast({
      title: "Download Iniciado", 
      description: `O arquivo ${parecerArquivo.name} está sendo baixado.`
    });
  };

  const handleExcluirDFD = () => {
    setDfdArquivo(null);
    setDfdArquivoExiste(false);
    localStorage.removeItem(`dfd-arquivo-${processoId}`);
    
    toast({
      title: "Arquivo removido",
      description: "O arquivo DFD foi removido com sucesso."
    });
  };

  const handleExcluirParecer = () => {
    setParecerArquivo(null);
    setParecerExiste(false);
    localStorage.removeItem(`parecer-arquivo-${processoId}`);
    
    toast({
      title: "Arquivo removido",
      description: "O arquivo de parecer foi removido com sucesso."
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

  // Carregar dados salvos do parecer
  useEffect(() => {
    const parecerSalvo = localStorage.getItem(`parecer-tecnico-${processoId}`);
    if (parecerSalvo) {
      try {
        const parecerData = JSON.parse(parecerSalvo);
        setParecerTecnico(parecerData.texto || '');
        setDataAnalise(parecerData.analisadoEm || '');
        setParecerExiste(true);
      } catch (error) {
        console.error('Erro ao carregar parecer salvo:', error);
      }
    }

    // Carregar arquivos salvos
    const dfdArquivoSalvo = localStorage.getItem(`dfd-arquivo-${processoId}`);
    if (dfdArquivoSalvo) {
      try {
        const arquivoData = JSON.parse(dfdArquivoSalvo);
        setDfdArquivo(arquivoData);
        setDfdArquivoExiste(true);
      } catch (error) {
        console.error('Erro ao carregar arquivo DFD salvo:', error);
      }
    }

    const parecerArquivoSalvo = localStorage.getItem(`parecer-arquivo-${processoId}`);
    if (parecerArquivoSalvo) {
      try {
        const arquivoData = JSON.parse(parecerArquivoSalvo);
        setParecerArquivo(arquivoData);
        setParecerExiste(true);
      } catch (error) {
        console.error('Erro ao carregar arquivo parecer salvo:', error);
      }
    }

    // Lógica melhorada para habilitar botões de download
    // Para GSP: habilitar se houver qualquer versão ou se for GSP
    // Para outros: habilitar apenas se houver versão enviada para análise
    if (isGSPUser()) {
      // GSP pode baixar DFD se houver qualquer versão
      const temQualquerVersao = dfdData.versions.length > 0;
      setDfdArquivoExiste(temQualquerVersao);
    } else {
      // Outros usuários só podem baixar se houver versão enviada para análise
      const temVersaoEnviada = dfdData.versions.some(v => v.status === 'enviado_analise');
      setDfdArquivoExiste(temVersaoEnviada);
    }
  }, [processoId, dfdData.versions, isGSPUser]);

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

  return (
    <div className="bg-white">
      {/* Container central ocupando toda a área */}
      <div className="w-full px-2">
        
        {/* Grid principal 12 colunas */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* ESQUERDA: Parecer Técnico da GSP (8 colunas) */}
          <section id="parecer-tecnico" className="col-span-12 lg:col-span-8 w-full">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-indigo-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-lg">
                    <Search className="w-5 h-5 text-indigo-600" />
                    Parecer Técnico
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUploadDFD}
                      disabled={!isGSPUser()}
                      className="text-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Enviar DFD
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUploadParecer}
                      disabled={!isGSPUser()}
                      className="text-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Enviar Parecer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBaixarDFD}
                      disabled={!dfdArquivoExiste}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Baixar DFD enviado
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBaixarParecer}
                      disabled={!parecerExiste && !isGSPUser()}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Baixar Parecer (PDF)
                    </Button>
                    {dfdArquivo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExcluirDFD}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir DFD
                      </Button>
                    )}
                    {parecerArquivo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExcluirParecer}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir Parecer
                      </Button>
                    )}
                  </div>
                </div>
              </header>
              <div className="p-4 md:p-6">
                    <div className="space-y-4">
                      <div>
                    <Textarea
                      id="parecer-tecnico-textarea"
                      value={parecerTecnico}
                      onChange={(e) => setParecerTecnico(e.target.value)}
                      placeholder="Descreva a análise técnica do DFD..."
                      disabled={!canEditParecerTecnico()}
                      className="min-h-[200px] mt-2 resize-none border-gray-200 focus:border-indigo-300 focus:ring-indigo-300"
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

                  {/* Inputs ocultos para upload de arquivos */}
                  <input
                    ref={dfdFileInputRef}
                    type="file"
                    onChange={handleDFDFileUpload}
                    accept="*/*"
                    className="hidden"
                  />
                  <input
                    ref={parecerFileInputRef}
                    type="file"
                    onChange={handleParecerFileUpload}
                    accept="*/*"
                    className="hidden"
                  />

                  {/* Exibir arquivos enviados */}
                  {dfdArquivo && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">{dfdArquivo.name}</p>
                            <p className="text-xs text-blue-600">{dfdArquivo.size} • {formatDate(dfdArquivo.uploadedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={handleBaixarDFD} className="h-6 w-6 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                          {isGSPUser() && (
                            <Button size="sm" variant="outline" onClick={handleExcluirDFD} className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {parecerArquivo && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-sm font-medium text-green-900">{parecerArquivo.name}</p>
                            <p className="text-xs text-green-600">{parecerArquivo.size} • {formatDate(parecerArquivo.uploadedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={handleBaixarParecer} className="h-6 w-6 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                          {isGSPUser() && (
                            <Button size="sm" variant="outline" onClick={handleExcluirParecer} className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
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

          {/* DIREITA: Gerenciamento (4 colunas) */}
          <aside id="gerenciamento" className="col-span-12 lg:col-span-4 w-full flex flex-col">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white flex-1 flex flex-col">
              <header className="bg-purple-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Gerenciamento
                </div>
              </header>
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="versoes">Versões</TabsTrigger>
                    <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="versoes" className="mt-0 p-4">
                    {dfdData.versions.length === 0 ? (
                      <div className="text-center py-8 w-full">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <History className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Nenhuma versão disponível</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {dfdData.versions.map((version) => {
                          const statusConfig = getStatusConfig(version.status);
                          const sla = calcularSLA(version.prazoInicialDiasUteis || 0, version.prazoCumpridoDiasUteis);
                          
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
                                <p><strong>Cargo:</strong> {version.createdByCargo || 'Não informado'}</p>
                                <p><strong>Gerência:</strong> {version.createdByGerencia || 'Não informado'}</p>
                                <p><strong>Criado:</strong> {formatDateTimeBR(new Date(version.createdAt))}</p>
                                <p><strong>Prazo inicial:</strong> {version.prazoInicialDiasUteis || 0} dias úteis</p>
                                <p><strong>Prazo cumprido:</strong> {version.prazoCumpridoDiasUteis !== undefined ? `${version.prazoCumpridoDiasUteis} dias úteis` : 'Não enviado'}</p>
                                {sla && (
                                  <div className="flex items-center gap-2">
                                    <span><strong>SLA:</strong> {sla.dias} dias úteis</span>
                                    <Badge 
                                      className={`text-xs ${
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
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="anexos" className="mt-0 p-4">
                    {/* Upload de Anexos */}
                    {canEditParecerTecnico() && (
                      <div className="mb-4">
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
                          className="w-full border-dashed border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Adicionar Anexo
                        </Button>
                      </div>
                    )}

                    {dfdData.annexes.length === 0 ? (
                      <div className="text-center py-8 w-full">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Nenhum anexo adicionado</p>
                        {!canEditParecerTecnico() && (
                          <p className="text-sm text-gray-400 mt-1">
                            Apenas usuários autorizados podem adicionar anexos
                          </p>
                        )}
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
                              {canEditParecerTecnico() && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  onClick={() => removeAnnex(annex.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
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

          {/* FULL: Comentários */}
          <section id="comentarios" className="col-span-12 w-full">
            <CommentsSection
              processoId={processoId}
              etapaId={etapaId.toString()}
              cardId="comentarios-aprovacao"
              title="Comentários"
            />
          </section>

          {/* FULL: Ações (rodapé não fixo) */}
          {isGSPUser() && (
            <section id="acoes" className="col-span-12 w-full mt-6 pb-6">
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
                          {dfdData.enviadoPor || 'Sem responsável definido'}
                        </span>
                      </div>
                    </div>

                    {/* Lado direito - Botões de ação */}
                    <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleSolicitarCorrecao}
                    variant="outline" 
                    disabled={!canSolicitarCorrecaoUser()}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Encaminhar para Cumprimento de Ressalvas
                  </Button>
                  <Button 
                    onClick={handleAprovar}
                    disabled={!canApproveUser()}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovação
                  </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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