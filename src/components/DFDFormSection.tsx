import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
  Flag
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/date';

// Tipos TypeScript conforme especificação
type DFDVersionStatus = 'rascunho' | 'finalizada' | 'enviada_para_analise' | 'aprovada' | 'reprovada';

interface DFDVersion {
  id: string;
  numeroVersao: number;
  status: DFDVersionStatus;
  autorId: string;
  autorNome: string;
  criadoEm: string;
  atualizadoEm: string;
  enviadoParaAnaliseEm?: string;
  finalizadoEm?: string;
  prazoDiasUteis?: number;
  documentoUrl?: string;
  documentoNome?: string;
  payload: {
    objeto: string;
    areaSetorDemandante: string;
    responsavelId: string;
    responsavelNome: string;
    dataElaboracao: string;
    numeroDFD: string;
    prioridade: 'ALTO' | 'MEDIO' | 'BAIXO';
  };
}

interface Anexo {
  id: string;
  nome: string;
  tamanhoBytes: number;
  mimeType: string;
  criadoEm: string;
  autorId: string;
  autorNome: string;
  versaoId: string;
  urlDownload: string;
}

interface Comentario {
  id: string;
  autorId: string;
  autorNome: string;
  criadoEm: string;
  texto: string;
}

interface PermissoesDFD {
  podeEditar: boolean;
  podeCriarNovaVersao: boolean;
  podeUploadAnexo: boolean;
  podeRemoverAnexo: boolean;
  podeConcluirEtapa: boolean;
}

interface ConclusaoEtapa {
  usuarioId: string;
  usuarioNome: string;
  observacao?: string;
  versaoId: string;
  dataConclusao: string;
  notificar: boolean;
}

interface DFDFormSectionProps {
  processoId: string;
  etapaId: number;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
  initialData?: any;
  canEdit?: boolean;
  gerenciaCriadora?: string; // Gerência que criou o processo
}

// Utilitário para contar dias úteis
const countBusinessDays = (startISO: string, endISO: string, holidays: string[] = []): number => {
  const start = new Date(startISO);
  const end = new Date(endISO);
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateString = current.toISOString().split('T')[0];
    
    // Segunda a sexta (1-5) e não é feriado
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidays.includes(dateString)) {
      count++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

// Mock de dados iniciais
const mockVersions: DFDVersion[] = [
  {
    id: 'v1',
    numeroVersao: 1,
    status: 'rascunho',
    autorId: 'user1',
    autorNome: 'João Silva',
    criadoEm: '2024-01-15T10:00:00Z',
    atualizadoEm: '2024-01-15T10:00:00Z',
    prazoDiasUteis: 0,
    documentoUrl: '#',
    documentoNome: 'DFD_V1_JoaoSilva.pdf',
    payload: {
      objeto: '',
      areaSetorDemandante: 'GSP - Gerência de Soluções e Projetos',
      responsavelId: 'user1',
      responsavelNome: 'João Silva',
      dataElaboracao: '2024-01-15',
      numeroDFD: 'DFD-2024-001',
      prioridade: 'MEDIO'
    }
  }
];

const mockAnexos: Anexo[] = [
  {
    id: 'anexo1',
    nome: 'Documento_Referencia.pdf',
    tamanhoBytes: 1024000,
    mimeType: 'application/pdf',
    criadoEm: '2024-01-15T10:30:00Z',
    autorId: 'user1',
    autorNome: 'João Silva',
    versaoId: 'v1',
    urlDownload: '#'
  }
];

const mockComentarios: Comentario[] = [
  {
    id: 'comentario1',
    autorId: 'user1',
    autorNome: 'João Silva',
    criadoEm: '2024-01-15T11:00:00Z',
    texto: 'Iniciando elaboração do DFD conforme solicitado.'
  }
];

export default function DFDFormSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true,
  gerenciaCriadora
}: DFDFormSectionProps) {
  const { user } = useUser();
  const { toast } = useToast();
  
  // Estados principais
  const [versions, setVersions] = useState<DFDVersion[]>(mockVersions);
  const [currentVersion, setCurrentVersion] = useState<DFDVersion>(mockVersions[0]);
  const [formData, setFormData] = useState(currentVersion.payload);
  const [anexos, setAnexos] = useState<Anexo[]>(mockAnexos);
  const [comentarios, setComentarios] = useState<Comentario[]>(mockComentarios);
  const [novoComentario, setNovoComentario] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('versoes');
  
  // Estados para conclusão da etapa
  const [showConcluirModal, setShowConcluirModal] = useState(false);
  const [observacaoConclusao, setObservacaoConclusao] = useState('');
  const [notificarPartes, setNotificarPartes] = useState(true);
  const [etapaConcluida, setEtapaConcluida] = useState<ConclusaoEtapa | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para normalizar e comparar gerências
  const isGerenciaResponsavel = (userGerencia: string, gerenciaCriadora: string): boolean => {
    if (!userGerencia || !gerenciaCriadora) {
      return false;
    }
    
    // Normalizar as strings para comparação
    const normalize = (str: string) => str.toLowerCase().replace(/[-\s]/g, '').trim();
    
    const userNormalized = normalize(userGerencia);
    const criadoraNormalized = normalize(gerenciaCriadora);
    
    // Comparação direta
    if (userNormalized === criadoraNormalized) {
      return true;
    }
    
    // Mapeamento de variações comuns
    const mapeamentoGerencia: { [key: string]: string[] } = {
      'grh': ['gerenciaderecursoshumanos', 'grh', 'rh', 'recursoshumanos'],
      'gsp': ['gerenciadesolucoeseprojetos', 'gsp', 'solucoeseprojetos'],
      'gsl': ['gerenciadesuprimentoselogistica', 'gsl', 'suprimentoselogistica'],
      'gue': ['gerenciadeurgenciaeemergencia', 'gue', 'urgenciaeemergencia'],
      'glc': ['gerenciadelicitacoesecontratos', 'glc', 'licitacoesecontratos'],
      'gfc': ['gerenciafinanceiraecontabil', 'gfc', 'financeiraecontabil'],
      'naj': ['assessoriajuridica', 'naj', 'juridica'],
      'ci': ['comissaodeimplantacao', 'ci', 'implantacao'],
      'se': ['secretariaexecutiva', 'se', 'executiva'],
      'ouv': ['ouvidoria', 'ouv']
    };
    
    // Verificar se ambas as gerências estão no mesmo grupo
    for (const [key, variacoes] of Object.entries(mapeamentoGerencia)) {
      if (variacoes.includes(userNormalized) && variacoes.includes(criadoraNormalized)) {
        return true;
      }
    }
    
    return false;
  };

  // Permissões (mock - em produção viria do contexto)
  const permissoes: PermissoesDFD = {
    podeEditar: (isGerenciaResponsavel(user?.gerencia || '', gerenciaCriadora || '') || user?.gerencia?.includes('GSP') || false) && !etapaConcluida,
    podeCriarNovaVersao: canCreateNewVersion() && !etapaConcluida,
    podeUploadAnexo: (isGerenciaResponsavel(user?.gerencia || '', gerenciaCriadora || '') || user?.gerencia?.includes('GSP') || false) && !etapaConcluida,
    podeRemoverAnexo: (isGerenciaResponsavel(user?.gerencia || '', gerenciaCriadora || '') || user?.gerencia?.includes('GSP') || false) && !etapaConcluida,
    podeConcluirEtapa: canConcluirEtapa()
  };

  // Verificar se pode criar nova versão
  function canCreateNewVersion(): boolean {
    if (!currentVersion) return false;
    return ['finalizada', 'enviada_para_analise', 'aprovada'].includes(currentVersion.status);
  }

  // Verificar se pode enviar para análise
  function canSendToAnalysis(): boolean {
    return formData.objeto.trim() !== '' && 
           formData.areaSetorDemandante.trim() !== '' && 
           formData.responsavelNome.trim() !== '' && 
           formData.prioridade !== undefined;
  }

  // Verificar se pode concluir a etapa
  function canConcluirEtapa(): boolean {
    // Verificar se o usuário tem permissão baseada na gerência
    const gerenciaPermitida = user?.gerencia && (
      isGerenciaResponsavel(user.gerencia, gerenciaCriadora || '') || 
      ['GSP', 'CI', 'SE', 'OUV'].includes(user.gerencia)
    );
    if (!gerenciaPermitida) return false;

    // Verificar se existe ao menos 1 versão válida (não rascunho)
    const versaoValida = versions.some(v => v.status !== 'rascunho');
    if (!versaoValida) return false;

    // Verificar se todos os campos obrigatórios estão preenchidos
    const camposObrigatoriosOk = canSendToAnalysis();

    return versaoValida && camposObrigatoriosOk;
  }

  // Verificar se pode concluir a etapa (para exibição do botão)
  function canShowConcluirButton(): boolean {
    return user?.gerencia && (
      isGerenciaResponsavel(user.gerencia, gerenciaCriadora || '') || 
      ['GSP', 'CI', 'SE', 'OUV'].includes(user.gerencia)
    );
  }

  // Handlers
  const handleSaveVersion = async () => {
    setIsLoading(true);
    try {
      const updatedVersion: DFDVersion = {
        ...currentVersion,
        status: 'rascunho',
        atualizadoEm: new Date().toISOString(),
        payload: formData
      };
      
      setCurrentVersion(updatedVersion);
      setVersions(prev => prev.map(v => v.id === updatedVersion.id ? updatedVersion : v));
      
      toast({
        title: "Versão salva",
        description: "Rascunho salvo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar versão.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToAnalysis = async () => {
    if (!canSendToAnalysis()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de enviar para análise.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedVersion: DFDVersion = {
        ...currentVersion,
        status: 'enviada_para_analise',
        enviadoParaAnaliseEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        payload: formData
      };
      
      setCurrentVersion(updatedVersion);
      setVersions(prev => prev.map(v => v.id === updatedVersion.id ? updatedVersion : v));
      
      toast({
        title: "Enviado para análise",
        description: "DFD enviado para análise técnica com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar para análise.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewVersion = async () => {
    if (!canCreateNewVersion()) return;

    setIsLoading(true);
    try {
      const newVersionNumber = Math.max(...versions.map(v => v.numeroVersao)) + 1;
      const newVersion: DFDVersion = {
        id: `v${newVersionNumber}`,
        numeroVersao: newVersionNumber,
        status: 'rascunho',
        autorId: user?.id || 'user1',
        autorNome: user?.nome || 'Usuário Atual',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        prazoDiasUteis: 0,
        payload: {
          ...currentVersion.payload,
          objeto: '',
          responsavelNome: user?.nome || 'Usuário Atual'
        }
      };
      
      setVersions(prev => [newVersion, ...prev]);
      setCurrentVersion(newVersion);
      setFormData(newVersion.payload);
      
      toast({
        title: "Nova versão criada",
        description: `Versão ${newVersionNumber} criada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar nova versão.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para abrir modal de conclusão
  const handleOpenConcluirModal = () => {
    setShowConcluirModal(true);
  };

  // Handler para concluir a etapa
  const handleConcluirEtapa = async () => {
    setIsLoading(true);
    try {
      // Simular chamada da API
      const conclusaoData: ConclusaoEtapa = {
        usuarioId: user?.id || 'user1',
        usuarioNome: user?.nome || 'Usuário Atual',
        observacao: observacaoConclusao.trim() || undefined,
        versaoId: currentVersion.id,
        dataConclusao: new Date().toISOString(),
        notificar: notificarPartes
      };

      // Mock da chamada POST /processos/:processoId/etapas/elaboracao-dfd/concluir
      console.log('Concluindo etapa:', conclusaoData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Atualizar estado local
      setEtapaConcluida(conclusaoData);
      setShowConcluirModal(false);
      setObservacaoConclusao('');
      setNotificarPartes(true);

      // Chamar callback de conclusão
      onComplete({
        etapaId,
        processoId,
        conclusao: conclusaoData,
        versaoBase: currentVersion
      });

      toast({
        title: "Etapa concluída",
        description: "A etapa Elaboração do DFD foi concluída com sucesso.",
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao concluir a etapa.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simular upload
      const newAnexo: Anexo = {
        id: `anexo-${Date.now()}`,
        nome: file.name,
        tamanhoBytes: file.size,
        mimeType: file.type,
        criadoEm: new Date().toISOString(),
        autorId: user?.id || '',
        autorNome: user?.nome || '',
        versaoId: currentVersion.id,
        urlDownload: '#'
      };
      
      setAnexos(prev => [...prev, newAnexo]);
      
      toast({
        title: "Anexo adicionado",
        description: `${file.name} foi anexado com sucesso.`,
      });
    }
  };

  const handleDeleteAnexo = (anexoId: string) => {
    setAnexos(prev => prev.filter(a => a.id !== anexoId));
    
    toast({
      title: "Anexo removido",
      description: "Anexo removido com sucesso.",
    });
  };

  const handleAddComentario = () => {
    if (!novoComentario.trim()) return;

    const newComentario: Comentario = {
      id: `comentario-${Date.now()}`,
      autorId: user?.id || '',
      autorNome: user?.nome || '',
      criadoEm: new Date().toISOString(),
      texto: novoComentario
    };
    
    setComentarios(prev => [newComentario, ...prev]);
    setNovoComentario('');
    
    toast({
      title: "Comentário adicionado",
      description: "Comentário adicionado com sucesso.",
    });
  };

  const getStatusConfig = (status: DFDVersionStatus) => {
    switch (status) {
      case 'rascunho':
        return { label: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-3 h-3" /> };
      case 'finalizada':
        return { label: 'Finalizada', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3" /> };
      case 'enviada_para_analise':
        return { label: 'Enviada para Análise', color: 'bg-blue-100 text-blue-800', icon: <Send className="w-3 h-3" /> };
      case 'aprovada':
        return { label: 'Aprovada', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="w-3 h-3" /> };
      case 'reprovada':
        return { label: 'Reprovada', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" /> };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-3 h-3" /> };
    }
  };

  const getSLABadge = (diasUteis: number, numeroVersao: number) => {
    const slaPadrao = numeroVersao === 1 ? 2 : 1; // 1ª versão: 2 dias, demais: 1 dia
    
    if (diasUteis <= slaPadrao) {
      return { label: 'Dentro do Prazo', color: 'bg-green-100 text-green-800' };
    } else if (diasUteis <= slaPadrao + 1) {
      return { label: 'Em Risco', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'Estourado', color: 'bg-red-100 text-red-800' };
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  // Formata o número do DFD para o padrão "DFD 006/2025" apenas para exibição
  const formatNumeroDFD = (value: string): string => {
    if (!value) return '';

    // Já está no formato desejado
    const desired = /^DFD\s+\d{3}\/\d{4}$/i;
    if (desired.test(value)) {
      return value.replace(/\s+/, ' ').toUpperCase();
    }

    // Padrões comuns: DFD-2024-001, DFD_2024_001, DFD 2024 1, 001/2024, DFD 1/2024
    let match = /DFD[-_\s]?(\d{4})[-_\s]?(\d{1,4})/i.exec(value);
    if (match) {
      const year = match[1];
      const num = match[2].padStart(3, '0');
      return `DFD ${num}/${year}`;
    }

    match = /(?:DFD)?\s*(\d{1,4})\/(\d{4})/i.exec(value);
    if (match) {
      const num = match[1].padStart(3, '0');
      const year = match[2];
      return `DFD ${num}/${year}`;
    }

    const yearOnly = /(\d{4})/.exec(value);
    const lastNum = /(\d{1,4})(?!.*\d)/.exec(value);
    if (yearOnly && lastNum) {
      const year = yearOnly[1];
      const num = lastNum[1].padStart(3, '0');
      return `DFD ${num}/${year}`;
    }

    return value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Moderno - MANTIDO */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Elaboração/Análise do DFD</h1>
              <p className="text-gray-600">Documento de Formalização da Demanda</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
              <FileText className="w-4 h-4 mr-2" />
              <span>Versão {currentVersion.numeroVersao}</span>
            </Badge>
            {!permissoes.podeEditar && (
              <Badge variant="outline" className="px-3 py-1">
                <Lock className="w-4 h-4 mr-2" />
                Somente Visualização
              </Badge>
            )}
            {etapaConcluida && (
              <Badge className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Etapa Concluída
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal - NOVO LAYOUT SIMPLIFICADO */}
      <div className="p-4 w-full">
        {/* Layout Principal - Grid Duas Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Coluna Esquerda - Formulário */}
          <div className="space-y-4">
            
            {/* Card do Formulário */}
            <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-0">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 mb-0 p-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  Formulário do DFD
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-0">
                
                {/* Objeto da Contratação */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="objeto" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4" />
                    Objeto da Contratação *
                  </Label>
                  <Textarea
                    id="objeto"
                    value={formData.objeto}
                    onChange={(e) => setFormData({...formData, objeto: e.target.value})}
                    placeholder="Descreva o objeto da contratação..."
                    disabled={!permissoes.podeEditar || currentVersion.status !== 'rascunho'}
                    className="w-full min-h-[100px] resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  />
                </div>

                {/* Área/Setor Demandante */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="areaSetor" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4" />
                    Área/Setor Demandante
                  </Label>
                  <Input
                    id="areaSetor"
                    value={formData.areaSetorDemandante}
                    readOnly
                    className="w-full bg-gray-50 border-gray-200 text-gray-600"
                  />
                </div>

                {/* Responsável pela Elaboração */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="responsavel" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Responsável pela Elaboração *
                  </Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavelNome}
                    onChange={(e) => setFormData({...formData, responsavelNome: e.target.value})}
                    placeholder="Nome do responsável"
                    disabled={!permissoes.podeEditar || currentVersion.status !== 'rascunho'}
                    className="w-full border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  />
                </div>

                {/* Data da Elaboração */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="dataElaboracao" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Data da Elaboração
                  </Label>
                  <Input
                    id="dataElaboracao"
                    value={formatDate(formData.dataElaboracao)}
                    readOnly
                    className="w-full bg-gray-50 border-gray-200 text-gray-600"
                  />
                </div>

                {/* Número do DFD */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="numeroDFD" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4" />
                    Número do DFD
                  </Label>
                  <Input
                    id="numeroDFD"
                    value={formatNumeroDFD(formData.numeroDFD)}
                    readOnly
                    className="w-full bg-gray-50 border-gray-200 text-gray-600"
                  />
                </div>

                {/* Grau de Prioridade */}
                <div className="w-full p-4">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Grau de Prioridade *
                  </Label>
                  <RadioGroup
                    value={formData.prioridade}
                    onValueChange={(value: 'ALTO' | 'MEDIO' | 'BAIXO') => setFormData({...formData, prioridade: value})}
                    disabled={!permissoes.podeEditar || currentVersion.status !== 'rascunho'}
                    className="w-full space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ALTO" id="prioridade-alto" />
                      <Label htmlFor="prioridade-alto" className="text-sm">Alto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="MEDIO" id="prioridade-medio" />
                      <Label htmlFor="prioridade-medio" className="text-sm">Médio</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="BAIXO" id="prioridade-baixo" />
                      <Label htmlFor="prioridade-baixo" className="text-sm">Baixo</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Abas: Versões | Anexos */}
          <div className="space-y-4">
            
            {/* Card com Abas */}
            <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-0">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 mb-0 p-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <History className="w-5 h-5 text-purple-600" />
                  </div>
                  Gerenciamento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-none">
                    <TabsTrigger value="versoes">Versões</TabsTrigger>
                    <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  </TabsList>
                  
                  {/* Aba Versões */}
                  <TabsContent value="versoes" className="mt-0 p-4">
                    <div className="space-y-4 w-full">
                      {/* Botão Criar Nova Versão */}
                      {permissoes.podeCriarNovaVersao && (
                        <Button
                          onClick={handleCreateNewVersion}
                          variant="outline"
                          className="w-full border-dashed border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Nova Versão
                        </Button>
                      )}

                      {/* Lista de Versões */}
                      {versions.length === 0 ? (
                        <div className="text-center py-8 w-full">
                          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Ainda não há versões criadas</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-80 overflow-y-auto w-full">
                          {versions.map((version) => {
                            const statusConfig = getStatusConfig(version.status);
                            const slaBadge = getSLABadge(version.prazoDiasUteis || 0, version.numeroVersao);
                            
                            return (
                              <div key={version.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors w-full">
                                <div className="flex items-center justify-between mb-3 w-full">
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-xs font-medium">
                                      V{version.numeroVersao}
                                    </Badge>
                                    <Badge className={`text-xs font-medium ${statusConfig.color}`}>
                                      {statusConfig.icon}
                                      <span className="ml-1">{statusConfig.label}</span>
                                    </Badge>
                                    <Badge className={`text-xs font-medium ${slaBadge.color}`}>
                                      {slaBadge.label}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="text-xs text-gray-700 space-y-1 mb-3 w-full">
                                  <p><strong>Autor:</strong> {version.autorNome}</p>
                                  <p><strong>Criado:</strong> {formatDate(version.criadoEm)}</p>
                                  <p><strong>Prazo:</strong> {version.prazoDiasUteis || 0} dias úteis</p>
                                </div>

                                {/* Documento Vinculado */}
                                {version.documentoNome && (
                                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200 w-full">
                                    <div className="flex items-center gap-2">
                                      <File className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm font-medium text-blue-800">{version.documentoNome}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-blue-50">
                                        <Eye className="w-3 h-3" />
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-green-50">
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Aba Anexos */}
                  <TabsContent value="anexos" className="mt-0 p-4">
                    <div className="space-y-4 w-full">
                      {/* Upload */}
                      {permissoes.podeUploadAnexo && currentVersion.status === 'rascunho' && (
                        <div className="w-full">
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
                            className="w-full border-dashed border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Adicionar Anexo
                          </Button>
                        </div>
                      )}

                      {/* Lista de Anexos */}
                      {anexos.length === 0 ? (
                        <div className="text-center py-8 w-full">
                          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Nenhum anexo enviado</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-80 overflow-y-auto w-full">
                          {anexos.map((anexo) => (
                            <div key={anexo.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <File className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{anexo.nome}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(anexo.tamanhoBytes)} • {formatDate(anexo.criadoEm)} • {anexo.autorNome}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-green-50">
                                  <Download className="w-3 h-3" />
                                </Button>
                                {permissoes.podeRemoverAnexo && currentVersion.status === 'rascunho' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteAnexo(anexo.id)}
                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção de Comentários - SEMPRE VISÍVEL */}
        <div className="mt-4">
          <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 p-0">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 mb-0 p-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-orange-600" />
                </div>
                Comentários
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 w-full">
                
                {/* Adicionar Comentário */}
                <div className="lg:col-span-1 space-y-4 w-full p-4 border-r border-gray-100">
                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Adicionar Novo Comentário
                    </Label>
                    <Textarea
                      value={novoComentario}
                      onChange={(e) => setNovoComentario(e.target.value)}
                      placeholder="Digite seu comentário aqui..."
                      maxLength={500}
                      className="w-full min-h-[120px] resize-none border-gray-200 focus:border-orange-300 focus:ring-orange-300 bg-white"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Máx. 500 caracteres</span>
                      <span className="text-xs text-gray-400">{novoComentario.length}/500</span>
                    </div>
                    <Button
                      onClick={handleAddComentario}
                      disabled={!novoComentario.trim()}
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Comentário
                    </Button>
                  </div>
                </div>

                {/* Lista de Comentários */}
                <div className="lg:col-span-2 w-full p-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <Label className="text-sm font-semibold text-gray-700">
                      Histórico de Comentários ({comentarios.length})
                    </Label>
                    <span className="text-xs text-gray-400">Mais recentes primeiro</span>
                  </div>
                  
                  {comentarios.length === 0 ? (
                    <div className="text-center py-10 w-full">
                      <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">Nenhum comentário ainda</p>
                      <p className="text-sm text-gray-400 mt-1">Seja o primeiro a comentar</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto w-full">
                      {comentarios.map((comentario) => (
                        <div key={comentario.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition w-full">
                          <div className="flex items-center justify-between mb-2 w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center shadow-inner">
                                <User className="w-4 h-4 text-orange-600" />
                              </div>
                              <span className="text-sm font-semibold text-gray-800">{comentario.autorNome}</span>
                            </div>
                            <span className="text-xs text-gray-400">{formatDateTime(comentario.criadoEm)}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed w-full">{comentario.texto}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rodapé Fixo com Botões de Ação */}
        <div className="mt-4">
          <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Botão Salvar Versão */}
                  {permissoes.podeEditar && currentVersion.status === 'rascunho' && !etapaConcluida && (
                    <Button 
                      onClick={handleSaveVersion} 
                      variant="outline" 
                      disabled={isLoading}
                      className="border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Versão
                    </Button>
                  )}
                  
                  {/* Botão Enviar para Análise */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button 
                            onClick={handleSendToAnalysis} 
                            variant="outline" 
                            disabled={!canSendToAnalysis() || isLoading || !permissoes.podeEditar || currentVersion.status !== 'rascunho' || !!etapaConcluida}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar para Análise Técnica
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!canSendToAnalysis() && (
                        <TooltipContent>
                          <p>Preencha os campos obrigatórios</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                  {/* Botão Concluir Etapa */}
                  {canShowConcluirButton() && !etapaConcluida && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button 
                              onClick={handleOpenConcluirModal} 
                              variant="default" 
                              disabled={!canConcluirEtapa() || isLoading}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              Concluir Etapa
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {!canConcluirEtapa() && (
                          <TooltipContent>
                            <p>É necessário enviar uma versão para análise antes de concluir a etapa.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                {/* Informações de Status */}
                <div className="text-sm text-gray-500">
                  {currentVersion.status === 'enviada_para_analise' && (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Enviado para análise em {formatDate(currentVersion.enviadoParaAnaliseEm || '')}
                    </span>
                  )}
                  {etapaConcluida && (
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Concluída em {formatDate(etapaConcluida.dataConclusao)} por {etapaConcluida.usuarioNome}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de Confirmação de Conclusão */}
        <Dialog open={showConcluirModal} onOpenChange={setShowConcluirModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-green-600" />
                Concluir Etapa
              </DialogTitle>
              <DialogDescription>
                Concluir a etapa Elaboração do DFD para o processo {processoId}?
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

            <div className="flex justify-end gap-3 pt-4">
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