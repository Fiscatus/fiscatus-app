import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Clock
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import { useDFD, DFDData, DFDVersion, DFDVersionStatus, DFDAnnex } from '@/hooks/useDFD';

interface DFDFormSectionProps {
  processoId: string;
  etapaId: number;
  onComplete: (data: DFDData) => void;
  onSave: (data: DFDData) => void;
  initialData?: DFDData;
  canEdit?: boolean;
}

export default function DFDFormSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true
}: DFDFormSectionProps) {
  const { user } = useUser();
  const { podeEditarCard } = usePermissoes();
  const { toast } = useToast();
  const { 
    dfdData, 
    createInitialVersion, 
    addVersion, 
    enviarParaAnalise,
    devolverParaCorrecao,
    aprovarVersao,
    addAnnex, 
    removeAnnex, 
    updateObservations, 
    getLatestEditableVersion,
    canCreateNewVersion,
    canEdit: canEditDFD,
    canSendToAnalysis,
    canApprove,
    canDevolver
  } = useDFD(processoId);
  
  const [formData, setFormData] = useState({
    objetivoContratacao: '',
    justificativaDemanda: '',
    gerenciaDemandante: '',
    dataElaboracao: new Date().toISOString().split('T')[0],
    responsavelElaboracao: user?.nome || ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DFDVersion | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar se usuário pode editar - usar nova lógica de permissões
  const canUserEdit = () => {
    // Para o DFD (etapa 1), a gerência responsável é GSP
    // Nota: gerenciaCriadora seria passada como parâmetro em implementação real
    return podeEditarCard('GSP - Gerência de Soluções e Projetos', 1);
  };

  // Verificar se pode editar baseado no status
  const canEditCurrentVersion = () => {
    if (!canUserEdit()) return false;
    return canEditDFD();
  };

  // Verificar se é usuário da GSP
  const isGSPUser = () => {
    return user?.gerencia === 'Gerência de Soluções e Projetos';
  };

  // Verificar se pode enviar para análise
  const canSendToAnalysisUser = () => {
    return canSendToAnalysis() && canUserEdit();
  };

  // Verificar se pode aprovar (apenas usuários com permissão para DFD)
  const canApproveUser = () => {
    return canApprove(user?.gerencia || '') && podeEditarCard('GSP - Gerência de Soluções e Projetos', 1);
  };

  // Verificar se pode devolver (apenas usuários com permissão para DFD)
  const canDevolverUser = () => {
    return canDevolver(user?.gerencia || '') && podeEditarCard('GSP - Gerência de Soluções e Projetos', 1);
  };

  useEffect(() => {
    const latestVersion = getLatestEditableVersion();
    if (latestVersion && (dfdData.status === 'devolvido' || dfdData.versions.length === 0)) {
      setFormData({
        objetivoContratacao: latestVersion.objetivoContratacao,
        justificativaDemanda: latestVersion.justificativaDemanda,
        gerenciaDemandante: latestVersion.unidadeDemandante,
        dataElaboracao: latestVersion.dataElaboracao,
        responsavelElaboracao: latestVersion.responsavelElaboracao
      });
    }
  }, [dfdData.currentVersion, dfdData.status]);

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.objetivoContratacao.trim()) {
      errors.push('Objetivo da Contratação é obrigatório');
    }
    if (!formData.justificativaDemanda.trim()) {
      errors.push('Justificativa da Demanda é obrigatória');
    }
    if (!formData.gerenciaDemandante.trim()) {
      errors.push('Gerência Demandante é obrigatória');
    }
    if (!formData.dataElaboracao) {
      errors.push('Data de Elaboração é obrigatória');
    }
    if (!formData.responsavelElaboracao.trim()) {
      errors.push('Responsável pela Elaboração é obrigatório');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSaveVersion = () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const versionData = {
      content: formData.objetivoContratacao + '\n\n' + formData.justificativaDemanda,
      objetivoContratacao: formData.objetivoContratacao,
      justificativaDemanda: formData.justificativaDemanda,
      unidadeDemandante: formData.gerenciaDemandante,
      dataElaboracao: formData.dataElaboracao,
      responsavelElaboracao: formData.responsavelElaboracao
    };

    const newVersion = addVersion(versionData);
    onSave(dfdData);
    
    toast({
      title: "Versão Salva",
      description: `Versão ${newVersion.version} do DFD foi salva com sucesso.`
    });
  };

  const handleEnviarParaAnalise = () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (dfdData.versions.length === 0) {
      // Criar versão inicial (V1)
      const versionData = {
        content: formData.objetivoContratacao + '\n\n' + formData.justificativaDemanda,
        objetivoContratacao: formData.objetivoContratacao,
        justificativaDemanda: formData.justificativaDemanda,
        unidadeDemandante: formData.gerenciaDemandante,
        dataElaboracao: formData.dataElaboracao,
        responsavelElaboracao: formData.responsavelElaboracao
      };

      createInitialVersion(versionData);
    }

    enviarParaAnalise(user?.nome || 'Usuário');
    onSave(dfdData);
    
    toast({
      title: "DFD Enviado para Análise",
      description: "O DFD foi enviado para análise da Gerência de Soluções e Projetos."
    });
  };

  const handleAprovar = () => {
    aprovarVersao(user?.nome || 'Usuário');
    onComplete(dfdData);
    
    toast({
      title: "DFD Aprovado",
      description: "O DFD foi aprovado e o próximo card foi liberado."
    });
  };

  const handleViewVersion = (version: DFDVersion) => {
    setSelectedVersion(version);
    setShowVersionModal(true);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadDialog(true);
    }
  };

  const confirmFileUpload = () => {
    if (selectedFile) {
      const annex: DFDAnnex = {
        id: `annex_${Date.now()}`,
        name: selectedFile.name,
        url: URL.createObjectURL(selectedFile),
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.nome || 'Usuário',
        size: `${(selectedFile.size / 1024).toFixed(1)} KB`
      };
      
      addAnnex(annex);
      onSave(dfdData);
      
      toast({
        title: "Anexo Adicionado",
        description: `${selectedFile.name} foi anexado com sucesso.`
      });
    }
    
    setShowUploadDialog(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAnnex = (annexId: string) => {
    removeAnnex(annexId);
    onSave(dfdData);
    
    toast({
      title: "Anexo Removido",
      description: "Anexo foi removido com sucesso."
    });
  };

  const handleObservationChange = (observations: string) => {
    updateObservations(observations);
    onSave(dfdData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Moderno */}
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
            {!canUserEdit() && (
              <Badge variant="outline" className="px-3 py-1">
                <Lock className="w-4 h-4 mr-2" />
                Somente Visualização
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Alertas de Validação */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-semibold text-red-800">Campos obrigatórios não preenchidos:</p>
                <ul className="list-disc list-inside text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Justificativa de Devolução */}
        {dfdData.status === 'devolvido' && dfdData.devolucaoJustificativa && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold text-orange-800">Devolvido para Correção</p>
                <p className="text-orange-700">{dfdData.devolucaoJustificativa}</p>
                <p className="text-xs text-orange-600">
                  Devolvido por {dfdData.devolucaoPor} em {formatDate(dfdData.devolucaoData || '')}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Layout Principal - Grid Responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna Principal - Formulário */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card do Formulário */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  Dados do DFD
                  {dfdData.status === 'devolvido' && (
                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                      Nova Versão
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Campos Principais */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="objetivo" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Objetivo da Contratação *
                    </Label>
                    <Textarea
                      id="objetivo"
                      value={formData.objetivoContratacao}
                      onChange={(e) => setFormData({...formData, objetivoContratacao: e.target.value})}
                      placeholder="Descreva o objetivo da contratação..."
                      disabled={!canEditCurrentVersion()}
                      className="min-h-[100px] mt-2 resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="justificativa" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Justificativa da Demanda *
                    </Label>
                    <Textarea
                      id="justificativa"
                      value={formData.justificativaDemanda}
                      onChange={(e) => setFormData({...formData, justificativaDemanda: e.target.value})}
                      placeholder="Justifique a necessidade da demanda..."
                      disabled={!canEditCurrentVersion()}
                      className="min-h-[100px] mt-2 resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                    />
                  </div>
                </div>

                {/* Campos Secundários */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="gerencia" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Gerência Demandante *
                    </Label>
                    <Input
                      id="gerencia"
                      value={formData.gerenciaDemandante}
                      onChange={(e) => setFormData({...formData, gerenciaDemandante: e.target.value})}
                      placeholder="Nome da gerência"
                      disabled={!canEditCurrentVersion()}
                      className="mt-2 border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="data" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data de Elaboração *
                    </Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.dataElaboracao}
                      onChange={(e) => setFormData({...formData, dataElaboracao: e.target.value})}
                      disabled={!canEditCurrentVersion()}
                      className="mt-2 border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="responsavel" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Responsável pela Elaboração *
                    </Label>
                    <Input
                      id="responsavel"
                      value={formData.responsavelElaboracao}
                      onChange={(e) => setFormData({...formData, responsavelElaboracao: e.target.value})}
                      placeholder="Nome do responsável"
                      disabled={!canEditCurrentVersion()}
                      className="mt-2 border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card do Histórico de Versões */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <History className="w-5 h-5 text-purple-600" />
                  </div>
                  Histórico de Versões
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {dfdData.versions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Nenhuma versão salva ainda</p>
                    <p className="text-sm text-gray-400 mt-1">As versões aparecerão aqui após serem salvas</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {dfdData.versions.map((version) => {
                      const statusConfig = getStatusConfig(version.status);
                      return (
                        <div key={version.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge variant={version.isFinal ? "default" : "outline"} className="text-xs font-medium">
                                V{version.version}
                                {version.isFinal && <CheckCircle className="w-3 h-3 ml-1" />}
                              </Badge>
                              <Badge className={`text-xs font-medium ${statusConfig.color}`}>
                                {statusConfig.icon}
                                <span className="ml-1">{statusConfig.label}</span>
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(version.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 font-medium">
                                {version.createdBy}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewVersion(version)}
                                className="h-7 w-7 p-0 hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-700 space-y-1">
                            <p className="truncate"><strong>Objetivo:</strong> {version.objetivoContratacao}</p>
                            <p className="truncate"><strong>Gerência:</strong> {version.unidadeDemandante}</p>
                            {version.devolucaoJustificativa && (
                              <p className="truncate text-red-600"><strong>Devolução:</strong> {version.devolucaoJustificativa}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botões de Ação - Integrados ao Layout */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  Ações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    {/* Botão Salvar Versão - Apenas para elaboradores */}
                    {canEditCurrentVersion() && (
                      <Button onClick={handleSaveVersion} variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Versão
                      </Button>
                    )}
                    
                    {/* Botão Enviar para Análise - Apenas para elaboradores */}
                    {canSendToAnalysisUser() && (
                      <Button onClick={handleEnviarParaAnalise} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                        <Upload className="w-4 h-4 mr-2" />
                        Enviar para Análise
                      </Button>
                    )}
                  </div>
                  
                  {/* Botão Concluir - Apenas para GSP */}
                  {canApproveUser() && (
                    <Button onClick={handleAprovar} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 shadow-lg">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Concluir Elaboração do DFD
                    </Button>
                  )}
                </div>
                
                {/* Informações sobre permissões */}
                <div className="mt-4 text-xs text-gray-500">
                  {!isGSPUser() && dfdData.status === 'enviado_analise' && (
                    <p>⏳ Aguardando análise da Gerência de Soluções e Projetos</p>
                  )}
                  {isGSPUser() && dfdData.status === 'enviado_analise' && (
                    <p>✅ Você pode aprovar ou devolver este DFD</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Anexos e Observações */}
          <div className="space-y-6">
            
            {/* Card de Anexos */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Upload className="w-5 h-5 text-green-600" />
                  </div>
                  Anexos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {canEditCurrentVersion() && (
                  <div className="mb-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Anexo
                    </Button>
                  </div>
                )}

                {dfdData.annexes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Nenhum anexo adicionado</p>
                    <p className="text-sm text-gray-400 mt-1">Adicione arquivos complementares</p>
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
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-blue-50">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-green-50">
                            <Download className="w-3 h-3" />
                          </Button>
                          {canEditCurrentVersion() && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAnnex(annex.id)}
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
              </CardContent>
            </Card>

            {/* Card de Observações */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  Observações Internas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={dfdData.observations}
                  onChange={(e) => handleObservationChange(e.target.value)}
                  placeholder="Adicione observações internas sobre o DFD..."
                  disabled={!canEditCurrentVersion()}
                  className="min-h-[120px] resize-none border-gray-200 focus:border-orange-300 focus:ring-orange-300"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog de Upload */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Confirmar Upload
            </DialogTitle>
            <DialogDescription>
              Deseja anexar "{selectedFile?.name}" ao DFD?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button onClick={confirmFileUpload} className="bg-green-600 hover:bg-green-700">
              Confirmar
            </Button>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização de Versão */}
      <Dialog open={showVersionModal} onOpenChange={setShowVersionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Versão {selectedVersion?.version} do DFD
            </DialogTitle>
            <DialogDescription>
              Criada em {selectedVersion && formatDate(selectedVersion.createdAt)} por {selectedVersion?.createdBy}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVersion && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Objetivo da Contratação</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                  {selectedVersion.objetivoContratacao}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-gray-700">Justificativa da Demanda</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                  {selectedVersion.justificativaDemanda}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Gerência Demandante</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                    {selectedVersion.unidadeDemandante}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Responsável pela Elaboração</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                    {selectedVersion.responsavelElaboracao}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-gray-700">Data de Elaboração</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                  {selectedVersion.dataElaboracao}
                </div>
              </div>
              
              {selectedVersion.isFinal && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Versão Final</span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowVersionModal(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 