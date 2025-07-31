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
  Clock,
  Search,
  Info,
  Send
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import { useDFD, DFDData, DFDVersion, DFDVersionStatus, DFDAnnex } from '@/hooks/useDFD';

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
  const { podeEditarFluxo } = usePermissoes();
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
  
  const [analiseTecnica, setAnaliseTecnica] = useState('');
  const [devolucaoJustificativa, setDevolucaoJustificativa] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showDevolucaoDialog, setShowDevolucaoDialog] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DFDVersion | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar se é usuário da GSP
  const isGSPUser = () => {
    return user?.gerencia === 'Gerência de Soluções e Projetos';
  };

  // Verificar se pode aprovar (apenas GSP)
  const canApproveUser = () => {
    return user?.gerencia === 'Gerência de Soluções e Projetos' && dfdData.status === 'enviado_analise';
  };

  // Verificar se pode devolver (apenas GSP)
  const canDevolverUser = () => {
    return user?.gerencia === 'Gerência de Soluções e Projetos' && dfdData.status === 'enviado_analise';
  };

  // Verificar se pode editar (apenas GSP)
  const canEditCurrentVersion = () => {
    return user?.gerencia === 'Gerência de Soluções e Projetos' && dfdData.status === 'enviado_analise';
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!analiseTecnica.trim()) {
      errors.push('Análise Técnica da GSP é obrigatória');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleAprovar = () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    aprovarVersao(user?.nome || 'Usuário');
    onComplete(dfdData);
    
    toast({
      title: "DFD Aprovado",
      description: "O DFD foi aprovado e o próximo card foi liberado."
    });
  };

  const handleDevolver = () => {
    if (!devolucaoJustificativa.trim()) {
      toast({
        title: "Erro",
        description: "A justificativa da devolução é obrigatória.",
        variant: "destructive"
      });
      return;
    }

    devolverParaCorrecao(devolucaoJustificativa, user?.nome || 'Usuário');
    onSave(dfdData);
    setShowDevolucaoDialog(false);
    setDevolucaoJustificativa('');
    
    toast({
      title: "DFD Devolvido",
      description: "O DFD foi devolvido para correção."
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

  // Obter versão final para análise
  const finalVersion = dfdData.versions.find(v => v.isFinal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header Moderno */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Search className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aprovação do DFD</h1>
              <p className="text-gray-600">Análise e Aprovação do Documento de Formalização da Demanda</p>
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

        {/* Layout Principal - Grid Responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna Principal - Dados e Análise */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card dos Dados do DFD (Modo Leitura) */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  Dados do DFD
                  {finalVersion && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      V{finalVersion.version}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {finalVersion ? (
                  <>
                    {/* Campos Principais */}
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Objetivo da Contratação
                        </Label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-800">{finalVersion.objetivoContratacao}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Justificativa da Demanda
                        </Label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-800">{finalVersion.justificativaDemanda}</p>
                        </div>
                      </div>
                    </div>

                    {/* Campos Secundários */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Gerência Demandante
                        </Label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-800">{finalVersion.unidadeDemandante}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Data de Elaboração
                        </Label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-800">{formatDate(finalVersion.dataElaboracao)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Responsável pela Elaboração
                        </Label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-800">{finalVersion.responsavelElaboracao}</p>
                        </div>
                      </div>
                    </div>

                    {/* Informações da Versão */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Criado por {finalVersion.createdBy}</span>
                        <span>{formatDate(finalVersion.createdAt)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Nenhuma versão final encontrada</p>
                    <p className="text-sm text-gray-400 mt-1">Aguarde o envio de uma versão para análise</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card da Análise Técnica da GSP */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Search className="w-5 h-5 text-green-600" />
                  </div>
                  Análise Técnica da GSP
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div>
                  <Label htmlFor="analise" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Análise Técnica da GSP *
                  </Label>
                  <Textarea
                    id="analise"
                    value={analiseTecnica}
                    onChange={(e) => setAnaliseTecnica(e.target.value)}
                    placeholder="Descreva a análise técnica do DFD..."
                    disabled={!canEditCurrentVersion()}
                    className="min-h-[120px] mt-2 resize-none border-gray-200 focus:border-green-300 focus:ring-green-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card do Histórico de Ações da GSP */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <History className="w-5 h-5 text-purple-600" />
                  </div>
                  Histórico de Ações da GSP
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {dfdData.versions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <History className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Nenhuma ação registrada</p>
                    <p className="text-sm text-gray-400 mt-1">As ações da GSP aparecerão aqui</p>
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
                    {/* Botão Devolver para Correção - Apenas para GSP */}
                    {canDevolverUser() && (
                      <Button 
                        onClick={() => setShowDevolucaoDialog(true)}
                        variant="outline" 
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Devolver para Correção
                      </Button>
                    )}
                  </div>
                  
                  {/* Botão Aprovar DFD - Apenas para GSP */}
                  {canApproveUser() && (
                    <Button 
                      onClick={handleAprovar}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Aprovar DFD
                    </Button>
                  )}
                </div>
                
                {/* Informações sobre permissões */}
                <div className="mt-4 text-xs text-gray-500">
                  {!isGSPUser() && (
                    <p>🔒 Esta etapa é restrita à Gerência de Soluções e Projetos</p>
                  )}
                  {isGSPUser() && dfdData.status === 'enviado_analise' && (
                    <p>✅ Você pode aprovar ou devolver este DFD</p>
                  )}
                  {dfdData.status === 'aprovado' && (
                    <p>✅ DFD já foi aprovado</p>
                  )}
                  {dfdData.status === 'devolvido' && (
                    <p>🔄 DFD foi devolvido para correção</p>
                  )}
                  {isGSPUser() && dfdData.status !== 'enviado_analise' && (
                    <p>⏳ Aguardando envio para análise</p>
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
                  placeholder="Adicione observações internas sobre a análise..."
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

      {/* Dialog de Devolução */}
      <Dialog open={showDevolucaoDialog} onOpenChange={setShowDevolucaoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Devolver para Correção
            </DialogTitle>
            <DialogDescription>
              Informe o motivo da devolução. Esta justificativa será exibida para o elaborador.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="justificativa" className="text-sm font-medium">
                Justificativa da Devolução *
              </Label>
              <Textarea
                id="justificativa"
                value={devolucaoJustificativa}
                onChange={(e) => setDevolucaoJustificativa(e.target.value)}
                placeholder="Descreva os motivos da devolução..."
                className="min-h-[120px] mt-2 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDevolucaoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDevolver} className="bg-red-600 hover:bg-red-700">
              <XCircle className="w-4 h-4 mr-2" />
              Devolver
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