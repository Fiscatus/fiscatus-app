import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Shield,
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
  User,
  Calendar,
  Building2,
  Clock,
  File,
  Send,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Flag,
  Settings,
  Info,
  Hash
} from 'lucide-react';
// Ícones adicionais para alinhar com o DFD
import { FileText } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import CommentsSection from './CommentsSection';
import ResponsavelSelector from './ResponsavelSelector';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';

// Tipos TypeScript para Matriz de Risco
type MatrizRiscoVersionStatus = 'rascunho' | 'finalizada' | 'enviada_para_aprovacao' | 'aprovada' | 'reprovada';

interface RiscoItem {
  id: string;
  riscoIdentificado: string;
  causaRisco: string;
  consequenciaImpacto: string;
  nivelRisco: 'BAIXO' | 'MEDIO' | 'ALTO';
  medidasMitigadoras: string;
}

interface MatrizRiscoVersion {
  id: string;
  numeroVersao: number;
  status: MatrizRiscoVersionStatus;
  autorId: string;
  autorNome: string;
  criadoEm: string;
  atualizadoEm: string;
  enviadoParaAprovacaoEm?: string;
  finalizadoEm?: string;
  prazoDiasUteis?: number;
  documentoUrl?: string;
  documentoNome?: string;
  payload: {
    objetoETP: string;
    areaSetorDemandante: string;
    numeroETP: string;
    dataElaboracao: string;
    riscos: RiscoItem[];
    justificativasGerais: string;
    observacoesComplementares: string;
    responsaveis: {
      id: string;
      nome: string;
      cargo: string;
      gerencia: string;
    }[];
  };
}

interface MatrizRiscoElaboracaoSectionProps {
  processoId: string;
  etapaId: number;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
  initialData?: any;
  canEdit?: boolean;
  gerenciaCriadora?: string;
}

// Mock de dados iniciais
const mockVersions: MatrizRiscoVersion[] = [
  {
    id: 'v1',
    numeroVersao: 1,
    status: 'rascunho',
    autorId: 'user1',
    autorNome: 'Guilherme de Carvalho Silva',
    criadoEm: '2024-01-15T10:00:00Z',
    atualizadoEm: '2024-01-15T10:00:00Z',
    prazoDiasUteis: 0,
    documentoUrl: '#',
    documentoNome: 'MatrizRisco_V1_GuilhermeCarvalho.pdf',
    payload: {
      objetoETP: 'Aquisição de equipamentos para ampliação da capacidade de atendimento',
      areaSetorDemandante: 'GSL - Gerência de Suprimentos e Logística',
      numeroETP: 'ETP 006/2025',
      dataElaboracao: '2025-01-15',
      riscos: [
        {
          id: 'r1',
          riscoIdentificado: 'Atraso na entrega de equipamentos',
          causaRisco: 'Problemas na cadeia de suprimentos',
          consequenciaImpacto: 'Atraso no cronograma do projeto',
          nivelRisco: 'MEDIO',
          medidasMitigadoras: 'Contatos com fornecedores alternativos e monitoramento semanal'
        }
      ],
      justificativasGerais: '',
      observacoesComplementares: '',
      responsaveis: [
        {
          id: 'user1',
          nome: 'Guilherme de Carvalho Silva',
          cargo: 'Gerente Suprimentos e Logística',
          gerencia: 'GSL - Gerência de Suprimentos e Logística'
        }
      ]
    }
  }
];

export default function MatrizRiscoElaboracaoSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true,
  gerenciaCriadora
}: MatrizRiscoElaboracaoSectionProps) {
  const { user } = useUser();
  const { toast } = useToast();
  
  // Estados principais
  const [versions, setVersions] = useState<MatrizRiscoVersion[]>(mockVersions);
  const [currentVersion, setCurrentVersion] = useState<MatrizRiscoVersion>(mockVersions[0]);
  const [formData, setFormData] = useState(currentVersion.payload);
  const [anexos, setAnexos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('versoes');
  
  // Estados para conclusão da etapa
  const [showConcluirModal, setShowConcluirModal] = useState(false);
  const [observacaoConclusao, setObservacaoConclusao] = useState('');
  const [notificarPartes, setNotificarPartes] = useState(true);
  const [etapaConcluida, setEtapaConcluida] = useState(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para normalizar e comparar gerências
  const isGerenciaResponsavel = (userGerencia: string, gerenciaCriadora: string): boolean => {
    if (!userGerencia || !gerenciaCriadora) return false;
    const normalize = (str: string) => str.toLowerCase().replace(/[-\s]/g, '').trim();
    return normalize(userGerencia) === normalize(gerenciaCriadora);
  };

  // Permissões
  const permissoes = {
    podeEditar: (isGerenciaResponsavel(user?.gerencia || '', gerenciaCriadora || '') || user?.gerencia?.includes('GSP') || false) && !etapaConcluida,
    podeCriarNovaVersao: canCreateNewVersion() && !etapaConcluida,
    podeUploadAnexo: (isGerenciaResponsavel(user?.gerencia || '', gerenciaCriadora || '') || user?.gerencia?.includes('GSP') || false) && !etapaConcluida,
    podeConcluirEtapa: canConcluirEtapa()
  };

  function canCreateNewVersion(): boolean {
    if (!currentVersion) return false;
    return ['finalizada', 'enviada_para_aprovacao', 'aprovada'].includes(currentVersion.status);
  }

  function canSendToApproval(): boolean {
    return formData.riscos.length > 0 && 
           formData.riscos.every(r => r.riscoIdentificado.trim() !== '' && r.causaRisco.trim() !== '') &&
           formData.responsaveis && formData.responsaveis.length > 0;
  }

  function canConcluirEtapa(): boolean {
    const gerenciaPermitida = user?.gerencia && (
      isGerenciaResponsavel(user.gerencia, gerenciaCriadora || '') || 
      ['GSP', 'CI', 'SE', 'OUV'].includes(user.gerencia)
    );
    if (!gerenciaPermitida) return false;

    const versaoValida = versions.some(v => v.status !== 'rascunho');
    const camposObrigatoriosOk = canSendToApproval();

    return versaoValida && camposObrigatoriosOk;
  }

  // Handlers para riscos
  const handleAddRisco = () => {
    const novoRisco: RiscoItem = {
      id: `r${Date.now()}`,
      riscoIdentificado: '',
      causaRisco: '',
      consequenciaImpacto: '',
      nivelRisco: 'MEDIO',
      medidasMitigadoras: ''
    };
    
    setFormData(prev => ({
      ...prev,
      riscos: [...prev.riscos, novoRisco]
    }));
  };

  const handleRemoveRisco = (riscoId: string) => {
    setFormData(prev => ({
      ...prev,
      riscos: prev.riscos.filter(r => r.id !== riscoId)
    }));
  };

  const handleUpdateRisco = (riscoId: string, field: keyof RiscoItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      riscos: prev.riscos.map(r => 
        r.id === riscoId ? { ...r, [field]: value } : r
      )
    }));
  };

  // Handlers principais
  const handleSaveVersion = async () => {
    setIsLoading(true);
    try {
      const updatedVersion: MatrizRiscoVersion = {
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

  const handleSendToApproval = async () => {
    if (!canSendToApproval()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de enviar para aprovação.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedVersion: MatrizRiscoVersion = {
        ...currentVersion,
        status: 'enviada_para_aprovacao',
        enviadoParaAprovacaoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        payload: formData
      };
      
      setCurrentVersion(updatedVersion);
      setVersions(prev => prev.map(v => v.id === updatedVersion.id ? updatedVersion : v));
      
      toast({
        title: "Enviado para aprovação",
        description: "Matriz de Risco enviada para aprovação com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar para aprovação.",
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
      const newVersion: MatrizRiscoVersion = {
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
          riscos: [],
          justificativasGerais: '',
          observacoesComplementares: ''
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

  const handleConcluirEtapa = async () => {
    setIsLoading(true);
    try {
      const conclusaoData = {
        usuarioId: user?.id || 'user1',
        usuarioNome: user?.nome || 'Usuário Atual',
        observacao: observacaoConclusao.trim() || undefined,
        versaoId: currentVersion.id,
        dataConclusao: new Date().toISOString(),
        notificar: notificarPartes
      };

      await new Promise(resolve => setTimeout(resolve, 1000));

      setEtapaConcluida(conclusaoData);
      setShowConcluirModal(false);
      setObservacaoConclusao('');
      setNotificarPartes(true);

      onComplete({
        etapaId,
        processoId,
        conclusao: conclusaoData,
        versaoBase: currentVersion
      });

      toast({
        title: "Etapa concluída",
        description: "A etapa Elaboração da Matriz de Risco foi concluída com sucesso.",
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

  const salvarResponsaveis = useCallback((novosResponsaveis: any[]) => {
    setFormData(prev => ({
      ...prev,
      responsaveis: novosResponsaveis
    }));
  }, []);

  // Handlers para anexos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simular upload
      const newAnexo = {
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusConfig = (status: MatrizRiscoVersionStatus) => {
    switch (status) {
      case 'rascunho':
        return { label: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: <Shield className="w-3 h-3" /> };
      case 'finalizada':
        return { label: 'Finalizada', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3" /> };
      case 'enviada_para_aprovacao':
        return { label: 'Enviada para Aprovação', color: 'bg-blue-100 text-blue-800', icon: <Send className="w-3 h-3" /> };
      case 'aprovada':
        return { label: 'Aprovada', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="w-3 h-3" /> };
      case 'reprovada':
        return { label: 'Reprovada', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" /> };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-3 h-3" /> };
    }
  };

  const getSLABadge = (diasUteis: number, numeroVersao: number) => {
    const slaPadrao = numeroVersao === 1 ? 2 : 1;
    
    if (diasUteis <= slaPadrao) {
      return { label: 'Dentro do Prazo', color: 'bg-green-100 text-green-800' };
    } else if (diasUteis <= slaPadrao + 1) {
      return { label: 'Em Risco', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'Estourado', color: 'bg-red-100 text-red-800' };
    }
  };

  // Formata o número do ETP para o padrão "ETP 006/2025" para exibição
  const formatNumeroETP = (value: string): string => {
    if (!value) return '';
    const desired = /^ETP\s+\d{3}\/\d{4}$/i;
    if (desired.test(value)) {
      return value.replace(/\s+/, ' ').toUpperCase();
    }
    let match = /ETP[-_\s]?(\d{4})[-_\s]?(\d{1,4})/i.exec(value);
    if (match) {
      const year = match[1];
      const num = match[2].padStart(3, '0');
      return `ETP ${num}/${year}`;
    }
    match = /(?:ETP)?\s*(\d{1,4})\/(\d{4})/i.exec(value);
    if (match) {
      const num = match[1].padStart(3, '0');
      const year = match[2];
      return `ETP ${num}/${year}`;
    }
    const yearOnly = /(\d{4})/.exec(value);
    const lastNum = /(\d{1,4})(?!.*\d)/.exec(value);
    if (yearOnly && lastNum) {
      const year = yearOnly[1];
      const num = lastNum[1].padStart(3, '0');
      return `ETP ${num}/${year}`;
    }
    return value;
  };

  return (
    <div className="bg-white">
      {/* Container central ocupando toda a área */}
      <div className="w-full px-2">
        {/* Grid principal 12 colunas */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* ESQUERDA: Formulário da Matriz de Risco */}
          <section id="formulario-matriz-risco" className="col-span-12 lg:col-span-8 w-full">
            
            {/* Card do Formulário */}
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-indigo-100 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Formulário da Matriz de Risco
                </div>
              </header>
              <div className="p-4 md:p-6 space-y-0">
                {/* 1 - Número do ETP */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="numeroETP" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4" />
                    Número do ETP
                  </Label>
                  <Input
                    id="numeroETP"
                    value={formatNumeroETP(formData.numeroETP)}
                    readOnly
                    className="w-full bg-gray-50 border-gray-200 text-gray-600"
                  />
                </div>

                {/* 2 - Data da Elaboração */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="dataElaboracao" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Data da Elaboração
                  </Label>
                  <Input
                    id="dataElaboracao"
                    value={formatDateBR(formData.dataElaboracao)}
                    readOnly
                    className="w-full bg-gray-50 border-gray-200 text-gray-600"
                  />
                </div>

                {/* 3 - Objeto do ETP */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="objetoETP" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4" />
                    Objeto do ETP
                  </Label>
                  <Textarea
                    id="objetoETP"
                    value={formData.objetoETP}
                    onChange={(e) => setFormData({ ...formData, objetoETP: e.target.value })}
                    placeholder="Descreva o objeto do ETP..."
                    disabled
                    className="w-full min-h-[100px] resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  />
                </div>

                {/* 4 - Área/Setor Demandante */}
                <div className="w-full p-4 border-b border-gray-100">
                  <Label htmlFor="areaSetorDemandante" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4" />
                    Área/Setor Demandante
                  </Label>
                  <Input
                    id="areaSetorDemandante"
                    value={formData.areaSetorDemandante}
                    readOnly
                    className="w-full bg-gray-50 border-gray-200 text-gray-600"
                  />
                </div>

                {/* 5 - Responsáveis pela Elaboração */}
                <div className="w-full p-4 border-b border-gray-100">
                  <ResponsavelSelector
                    value={formData.responsaveis || []}
                    onChange={salvarResponsaveis}
                    disabled={!permissoes.podeEditar || currentVersion.status !== 'rascunho'}
                    canEdit={permissoes.podeEditar}
                    processoId={processoId}
                    className="w-full"
                    maxResponsaveis={5}
                  />
                </div>
                
                {/* Seções removidas conforme solicitado: Matriz de Riscos, Justificativas e Observações */}

                

              </div>
            </div>
          </section>

          {/* DIREITA: Gerenciamento (Versões/Anexos) */}
          <aside id="gerenciamento" className="col-span-12 lg:col-span-4 w-full flex flex-col">
            
            {/* Card com Abas */}
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white flex-1 flex flex-col">
              <header className="bg-purple-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Gerenciamento
                </div>
              </header>
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-none">
                    <TabsTrigger value="versoes">Versões</TabsTrigger>
                    <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  </TabsList>
                  
                  {/* Aba Versões */}
                  <TabsContent value="versoes" className="mt-0 p-4 flex-1 flex flex-col">
                    <div className="space-y-4 w-full flex-1 flex flex-col">
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
                            <Shield className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Ainda não há versões criadas</p>
                        </div>
                      ) : (
                        <div className="space-y-3 flex-1 overflow-y-auto w-full">
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
                                  <p><strong>Criado:</strong> {formatDateBR(version.criadoEm)}</p>
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
                        <div className="pt-4">
                          <div className="text-center">
                            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                              <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">Nenhum anexo enviado</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 w-full flex-shrink-0">
                          {anexos.map((anexo) => (
                            <div key={anexo.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <File className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{anexo.nome}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(anexo.tamanhoBytes)} • {formatDateBR(anexo.criadoEm)} • {anexo.autorNome}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-green-50">
                                  <Download className="w-3 h-3" />
                                </Button>
                                {permissoes.podeUploadAnexo && currentVersion.status === 'rascunho' && (
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
              </div>
            </div>
          </aside>

          {/* FULL: Comentários */}
          <section id="comentarios" className="col-span-12 w-full">
            <CommentsSection
              processoId={processoId}
              etapaId={etapaId}
              cardId="matriz-risco-form"
              title="Comentários"
            />
          </section>

          {/* FULL: Ações (rodapé não fixo) */}
          <section id="acoes" className="col-span-12 w-full mt-4 pb-2">
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
                        {currentVersion.autorNome || 'Sem responsável definido'}
                      </span>
                    </div>
                  </div>

                  {/* Lado direito - Botões de ação */}
                  <div className="flex items-center gap-2">
                    {/* Botão Salvar Versão */}
                    {permissoes.podeEditar && currentVersion.status === 'rascunho' && !etapaConcluida && (
                      <Button 
                        onClick={handleSaveVersion} 
                        variant="outline" 
                        disabled={isLoading}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Rascunho
                      </Button>
                    )}
                    
                    {/* Botão Enviar para Aprovação com tooltip */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button 
                              onClick={handleSendToApproval} 
                              variant="outline" 
                              disabled={!canSendToApproval() || isLoading || !permissoes.podeEditar || currentVersion.status !== 'rascunho' || !!etapaConcluida}
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Enviar para Aprovação
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {!canSendToApproval() && (
                          <TooltipContent>
                            <p>Preencha os campos obrigatórios</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>

                    {/* Botão Concluir Etapa com tooltip */}
                    {!etapaConcluida && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button 
                                onClick={() => setShowConcluirModal(true)} 
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
                              <p>É necessário enviar uma versão para aprovação antes de concluir a etapa.</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {!permissoes.podeEditar && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Info className="w-4 h-4" />
                        Somente visualização
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Informações de Status */}
                {(currentVersion.status === 'enviada_para_aprovacao' || etapaConcluida) && (
                  <div className="text-sm text-gray-500 mt-2">
                    {currentVersion.status === 'enviada_para_aprovacao' && (
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Enviado para aprovação em {formatDateBR(currentVersion.enviadoParaAprovacaoEm || '')}
                      </span>
                    )}
                    {etapaConcluida && (
                      <span className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Concluída em {formatDateBR(etapaConcluida.dataConclusao)} por {etapaConcluida.usuarioNome}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
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
                Concluir a etapa Elaboração da Matriz de Risco para o processo {processoId}?
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
