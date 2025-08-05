import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  User, 
  Calendar, 
  FileText, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Download, 
  Eye, 
  Users, 
  Building2,
  Clock,
  AlertTriangle,
  PlayCircle,
  XCircle,
  Save,
  Upload,
  Plus,
  Minus,
  MessageSquare,
  History,
  Star,
  Shield,
  PenTool,
  X,
  CalendarDays,
  FileUp,
  AlertCircle,
  ChevronRight,
  Clock4,
  CheckCircle2,
  Timer,
  UserCheck,
  FileCheck,
  MessageCircle,
  CalendarCheck,
  CalendarX,
  MoreVertical,
  Settings,
  Send
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';

interface Etapa {
  id: number;
  nome: string;
  nomeCompleto: string;
  status: 'pendente' | 'andamento' | 'concluido' | 'atrasado';
  prazoPrevisao: string;
  prazoAnterior?: string;
  alteradoPor?: string;
  dataAlteracao?: string;
  dataConclusao?: string;
  documento?: string;
  documentoUrl?: string;
  enviadoPor?: string;
  dataEnvio?: string;
  prazoCumprido?: boolean;
  responsavel: string;
  cargo: string;
  gerencia: string;
  dataInicio?: string;
  observacoes?: string;
  envolvidos?: Array<{
    nome: string;
    cargo: string;
    papel: string;
    gerencia: string;
  }>;
  diasUteis?: number;
  diasConsumidos?: number;
  documentos?: Array<{ nome: string; url: string; enviadoPor?: string; dataEnvio?: string; }>;
}

interface MembroEquipe {
  nome: string;
  cargo: string;
  papel: string;
  gerencia: string;
}

interface EtapaDetalhesModalProps {
  etapa: Etapa | null;
  isOpen: boolean;
  onClose: () => void;
  onConcluirEtapa?: (etapa: Etapa) => void;
  onEditarEtapa?: (etapa: Etapa) => void;
  onExcluirEtapa?: (etapa: Etapa) => void;
  onSubstituirDocumento?: (etapa: Etapa) => void;
  onVisualizarDocumento?: (etapa: Etapa) => void;
  onBaixarDocumento?: (etapa: Etapa) => void;
  onAdicionarMembro?: (etapa: Etapa, membro: any) => void;
  onRemoverMembro?: (etapa: Etapa, membroId: string) => void;
  onSalvarObservacao?: (etapa: Etapa, observacao: string) => void;
  gerenciaCriadora?: string; // Gerência que criou o processo
}

export default function EtapaDetalhesModal({
  etapa,
  isOpen,
  onClose,
  onConcluirEtapa,
  onEditarEtapa,
  onExcluirEtapa,
  onSubstituirDocumento,
  onVisualizarDocumento,
  onBaixarDocumento,
  onAdicionarMembro,
  onRemoverMembro,
  onSalvarObservacao,
  gerenciaCriadora
}: EtapaDetalhesModalProps) {
  const { user } = useUser();
  const [novaObservacao, setNovaObservacao] = useState('');
  const [editandoResponsavel, setEditandoResponsavel] = useState(false);
  const [showUploadInput, setShowUploadInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConcluirConfirm, setShowConcluirConfirm] = useState(false);
  const [showEnviarAnaliseConfirm, setShowEnviarAnaliseConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrazoModal, setShowPrazoModal] = useState(false);
  const [documentMenuOpen, setDocumentMenuOpen] = useState(false);
  const documentMenuRef = useRef<HTMLDivElement>(null);
  
  // Estados para edição
  const [editResponsavel, setEditResponsavel] = useState('');
  const [editCargo, setEditCargo] = useState('');
  const [editGerencia, setEditGerencia] = useState('');
  const [editPrazo, setEditPrazo] = useState('');
  const [editMembros, setEditMembros] = useState<MembroEquipe[]>([]);
  const [novoMembro, setNovoMembro] = useState<MembroEquipe>({
    nome: '',
    cargo: '',
    papel: '',
    gerencia: ''
  });

  const { podeEditarCard } = usePermissoes();

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (documentMenuRef.current && !documentMenuRef.current.contains(event.target as Node)) {
        setDocumentMenuOpen(false);
      }
    };

    if (documentMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [documentMenuOpen]);

  if (!etapa) return null;

  const canManageEtapa = () => {
    return podeEditarCard(etapa.gerencia, etapa.id, gerenciaCriadora);
  };

  const isGerencia = () => {
    return user?.cargo?.toLowerCase().includes('gerente') || 
           user?.cargo?.toLowerCase().includes('diretor') ||
           user?.cargo?.toLowerCase().includes('coordenador');
  };

  const getStatusConfig = () => {
    switch (etapa.status) {
      case 'concluido':
        return {
          badge: <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Concluído
          </Badge>,
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'andamento':
        return {
          badge: <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <PlayCircle className="w-3 h-3 mr-1" />
            Em Andamento
          </Badge>,
          icon: <PlayCircle className="w-5 h-5 text-yellow-500" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'atrasado':
        return {
          badge: <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Atrasado
          </Badge>,
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'pendente':
        return {
          badge: <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>,
          icon: <Clock className="w-5 h-5 text-gray-500" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          badge: <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>,
          icon: <Clock className="w-5 h-5 text-gray-500" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const getPrazoStatus = () => {
    if (etapa.status === 'concluido') {
      return {
        status: 'Cumprido',
        color: 'text-green-600',
        icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else if (etapa.status === 'atrasado') {
      return {
        status: 'Vencido',
        color: 'text-red-600',
        icon: <CalendarX className="w-4 h-4 text-red-600" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else {
      return {
        status: 'No Prazo',
        color: 'text-blue-600',
        icon: <Clock4 className="w-4 h-4 text-blue-600" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }
  };

  const statusConfig = getStatusConfig();
  const prazoStatus = getPrazoStatus();

  const handleSalvarObservacao = () => {
    if (novaObservacao.trim()) {
      onSalvarObservacao?.(etapa, novaObservacao);
      setNovaObservacao('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadInput(false);
      // Aqui você pode implementar a lógica de upload
      console.log('Arquivo selecionado:', file.name);
    }
  };

  const handleDeleteDocument = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDocument = () => {
    onExcluirEtapa?.(etapa);
    setShowDeleteConfirm(false);
  };

  const cancelDeleteDocument = () => {
    setShowDeleteConfirm(false);
  };

  const handleConcluirEtapa = () => {
    setShowConcluirConfirm(true);
  };

  const confirmConcluirEtapa = () => {
    onConcluirEtapa?.(etapa);
    setShowConcluirConfirm(false);
  };

  const cancelConcluirEtapa = () => {
    setShowConcluirConfirm(false);
  };

  const handleEnviarAnalise = () => {
    setShowEnviarAnaliseConfirm(true);
  };

  const confirmEnviarAnalise = () => {
    console.log('Enviando para análise:', etapa.id);
    // Aqui seria implementada a lógica real de envio para análise
    setShowEnviarAnaliseConfirm(false);
  };

  const cancelEnviarAnalise = () => {
    setShowEnviarAnaliseConfirm(false);
  };

  const handleEditarDados = () => {
    if (etapa) {
      setEditResponsavel(etapa.responsavel);
      setEditCargo(etapa.cargo);
      setEditGerencia(etapa.gerencia);
      setEditPrazo(etapa.prazoPrevisao);
      setEditMembros(etapa.envolvidos || []);
      setShowEditModal(true);
    }
  };

  const handleEditarPrazo = () => {
    if (etapa) {
      setEditPrazo(etapa.prazoPrevisao);
      setShowPrazoModal(true);
    }
  };

  const handleSalvarEdicao = () => {
    if (etapa) {
      const etapaAtualizada = {
        ...etapa,
        responsavel: editResponsavel,
        cargo: editCargo,
        gerencia: editGerencia,
        envolvidos: editMembros
      };
      onEditarEtapa?.(etapaAtualizada);
      setShowEditModal(false);
    }
  };

  const handleSalvarPrazo = () => {
    if (etapa && user) {
      const etapaAtualizada = {
        ...etapa,
        prazoAnterior: etapa.prazoPrevisao,
        prazoPrevisao: editPrazo,
        alteradoPor: `${user.nome} (${user.cargo})`,
        dataAlteracao: new Date().toLocaleDateString('pt-BR')
      };
      onEditarEtapa?.(etapaAtualizada);
      setShowPrazoModal(false);
    }
  };

  const handleAdicionarMembro = () => {
    if (novoMembro.nome && novoMembro.cargo && novoMembro.papel && novoMembro.gerencia) {
      setEditMembros([...editMembros, novoMembro]);
      setNovoMembro({ nome: '', cargo: '', papel: '', gerencia: '' });
    }
  };

  const handleRemoverMembro = (index: number) => {
    setEditMembros(editMembros.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setNovaObservacao('');
    setEditandoResponsavel(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto w-full h-full p-6"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Fixo */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}>
                    {statusConfig.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Etapa {etapa.id}: {etapa.nomeCompleto}
                    </h2>
                    <p className="text-lg text-gray-600 mt-1">{etapa.nome}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {statusConfig.badge}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-10 h-10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {/* Grid Principal - 4 Colunas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mb-8">
                
                {/* 1. Responsável */}
                <Card className="bg-white shadow-sm border-gray-200 w-full h-full min-h-[250px] overflow-visible">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-500" />
                      Responsável
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 h-full overflow-visible">
                    {etapa.responsavel ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-base font-medium text-gray-900">{etapa.responsavel}</p>
                            <p className="text-sm text-gray-600">{etapa.cargo}</p>
                          </div>
                        </div>
                        
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          <Building2 className="w-3 h-3 mr-1" />
                          {etapa.gerencia}
                        </Badge>

                        {canManageEtapa() && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditandoResponsavel(!editandoResponsavel)}
                            className="w-full text-xs"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Editar Responsável
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Responsável ainda não definido.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2. Cronograma */}
                <Card className="bg-white shadow-sm border-gray-200 w-full h-full min-h-[250px] overflow-visible">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-500" />
                      Cronograma
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 h-full overflow-visible">
                    <div className="space-y-4">
                      {etapa.dataInicio && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <CalendarDays className="w-4 h-4 text-gray-500" />
                            <p className="text-xs text-gray-500">Data de Início</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{etapa.dataInicio}</p>
                        </div>
                      )}
                      
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Timer className="w-4 h-4 text-blue-500" />
                          <p className="text-xs text-gray-500">Prazo Previsto</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-2">{etapa.prazoPrevisao}</p>
                        {etapa.diasUteis && (
                          <p className="text-xs text-blue-600">{etapa.diasUteis} dias úteis</p>
                        )}
                        {etapa.prazoAnterior && etapa.alteradoPor && (
                          <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                            <p className="text-xs text-orange-700">
                              <strong>Alterado:</strong> {etapa.alteradoPor}
                            </p>
                            <p className="text-xs text-orange-600">
                              <strong>Data:</strong> {etapa.dataAlteracao}
                            </p>
                            <p className="text-xs text-orange-600">
                              <strong>Prazo anterior:</strong> {etapa.prazoAnterior}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {etapa.dataConclusao && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <CalendarCheck className="w-4 h-4 text-green-500" />
                            <p className="text-xs text-gray-500">Data de Conclusão</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <p className="text-sm font-medium text-green-600">{etapa.dataConclusao}</p>
                          </div>
                        </div>
                      )}

                      <div className={`p-3 rounded-lg border ${prazoStatus.bgColor} ${prazoStatus.borderColor}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {prazoStatus.icon}
                          <p className="text-xs text-gray-500">Status do Prazo</p>
                        </div>
                        <p className={`text-sm font-medium ${prazoStatus.color}`}>
                          {prazoStatus.status}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>



                {/* 4. Equipe */}
                <Card className="bg-white shadow-sm border-gray-200 w-full h-full min-h-[250px] overflow-visible">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      Equipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 h-full overflow-visible">
                    {etapa.envolvidos && etapa.envolvidos.length > 0 ? (
                      <div className="space-y-3">
                        {etapa.envolvidos.map((pessoa, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{pessoa.nome}</p>
                                <p className="text-xs text-gray-600">{pessoa.cargo}</p>
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 mt-1">
                                  {pessoa.papel}
                                </Badge>
                              </div>
                              {canManageEtapa() && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onRemoverMembro?.(etapa, index.toString())}
                                  className="text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {canManageEtapa() && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAdicionarMembro?.(etapa, {})}
                            className="w-full text-xs bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Adicionar Membro
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Nenhum membro adicional</p>
                        {canManageEtapa() && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAdicionarMembro?.(etapa, {})}
                            className="mt-3 text-xs bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Adicionar Membro
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Seção de Gerenciamento - Horizontal */}
              <Card className="bg-white shadow-sm border-gray-200 w-full mb-8">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    Gerenciamento da Etapa
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {canManageEtapa() ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Sua Gerência
                        </Badge>
                        <p className="text-sm text-gray-600">Você tem permissão para gerenciar esta etapa.</p>
                      </div>
                      
                      {/* Seção de Upload de Documento */}
                      <div className="border rounded-xl p-6 bg-green-50 space-y-6 shadow-sm">
                        <h3 className="font-semibold text-green-700 text-base">Ações Disponíveis da Sua Gerência</h3>
                        
                        {/* Upload de Arquivo */}
                        <div className="space-y-4">
                          {!showUploadInput ? (
                            <Button 
                              size="sm" 
                              onClick={() => setShowUploadInput(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded w-full"
                            >
                              <FileUp className="w-4 h-4 mr-2" />
                              Adicionar arquivo
                            </Button>
                          ) : (
                            <div className="space-y-3">
                              <input 
                                type="file" 
                                onChange={handleFileUpload}
                                className="w-full border rounded px-3 py-2 text-sm"
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                              />
                              <div className="flex gap-3">
                                <Button 
                                  size="sm" 
                                  onClick={() => setShowUploadInput(false)}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 flex-1"
                                >
                                  Cancelar
                                </Button>
                                {selectedFile && (
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 flex-1"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Enviar
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Botões de Ação */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleEnviarAnalise}
                            className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium px-4 py-3 rounded w-full"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar para Análise
                          </Button>
                          {etapa.status === 'andamento' ? (
                            <Button 
                              size="sm" 
                              onClick={handleConcluirEtapa}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded w-full"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Concluir Etapa
                            </Button>
                          ) : (
                            <div className="bg-gray-100 rounded px-4 py-3 flex items-center justify-center">
                              <p className="text-sm text-gray-500">Etapa Finalizada</p>
                            </div>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleDeleteDocument}
                            className="bg-red-100 hover:bg-red-200 text-red-700 font-medium px-4 py-3 rounded w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Documento
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Shield className="w-8 h-8 text-red-400 mb-3" />
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                        <h4 className="text-sm font-semibold text-red-800 mb-2">Acesso Restrito</h4>
                        <p className="text-sm text-red-700 leading-relaxed">
                          Você não possui permissão para editar esta etapa. A edição está restrita à gerência responsável ou aos administradores do sistema.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Modal de Confirmação de Exclusão */}
                  {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Exclusão</h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Tem certeza que deseja excluir o documento desta etapa? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                          <Button 
                            size="sm" 
                            onClick={cancelDeleteDocument}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={confirmDeleteDocument}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal de Confirmação de Conclusão */}
                  {showConcluirConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Conclusão da Etapa</h3>
                        <div className="space-y-3 mb-6">
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-800">Resumo da Etapa</p>
                            <p className="text-xs text-green-600 mt-1">
                              <strong>Etapa:</strong> {etapa.nomeCompleto}
                            </p>
                            <p className="text-xs text-green-600">
                              <strong>Responsável:</strong> {etapa.responsavel}
                            </p>
                            <p className="text-xs text-green-600">
                              <strong>Prazo:</strong> {etapa.prazoPrevisao}
                            </p>
                            {etapa.documento && (
                              <p className="text-xs text-green-600">
                                <strong>Documento:</strong> {etapa.documento}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Ao concluir esta etapa, ela será finalizada e não poderá mais ser editada. 
                            A próxima etapa do processo será desbloqueada automaticamente.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            size="sm" 
                            onClick={cancelConcluirEtapa}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={confirmConcluirEtapa}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Concluir Etapa
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal de Confirmação de Envio para Análise */}
                  {showEnviarAnaliseConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enviar para Análise</h3>
                        <div className="space-y-3 mb-6">
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-sm font-medium text-purple-800">Destinos da Análise</p>
                            <ul className="text-xs text-purple-600 mt-2 space-y-1">
                              <li>• <strong>Assinatura:</strong> Aprovação formal</li>
                              <li>• <strong>Revisão:</strong> Verificação técnica</li>
                              <li>• <strong>Avaliação:</strong> Outras gerências (Jurídico, Diretoria)</li>
                            </ul>
                          </div>
                          <p className="text-sm text-gray-600">
                            Esta etapa será encaminhada para análise e validação. 
                            O processo continuará após a aprovação de todos os responsáveis.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            size="sm" 
                            onClick={cancelEnviarAnalise}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={confirmEnviarAnalise}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar para Análise
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Todos Documentos */}
              {(etapa.documentos && etapa.documentos.length > 0) || etapa.documento || etapa.status === 'concluido' ? (
                <Card className="bg-white shadow-sm border-gray-200 w-full mb-8">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      Todos Documentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {/* Lista de documentos (novo formato) */}
                    {etapa.documentos && etapa.documentos.length > 0 && (
                      etapa.documentos.map((doc, idx) => (
                        <div key={doc.url || doc.nome || idx} className="relative">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-indigo-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{doc.nome}</p>
                                {doc.enviadoPor && (
                                  <p className="text-xs text-gray-500">Enviado por: {doc.enviadoPor}</p>
                                )}
                                {doc.dataEnvio && (
                                  <p className="text-xs text-gray-500">Data: {doc.dataEnvio}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => onVisualizarDocumento?.({ ...etapa, documento: doc.nome, documentoUrl: doc.url })} className="text-gray-500 hover:text-indigo-600"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => onBaixarDocumento?.({ ...etapa, documento: doc.nome, documentoUrl: doc.url })} className="text-gray-500 hover:text-indigo-600"><Download className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {/* Compatibilidade com documento único antigo */}
                    {(!etapa.documentos || etapa.documentos.length === 0) && etapa.documento && (
                      <div className="relative">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-indigo-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{etapa.documento}</p>
                              {etapa.enviadoPor && (
                                <p className="text-xs text-gray-500">Enviado por: {etapa.enviadoPor}</p>
                              )}
                              {etapa.dataEnvio && (
                                <p className="text-xs text-gray-500">Data: {etapa.dataEnvio}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => onVisualizarDocumento?.(etapa)} className="text-gray-500 hover:text-indigo-600"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => onBaixarDocumento?.(etapa)} className="text-gray-500 hover:text-indigo-600"><Download className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Estado vazio */}
                    {(!etapa.documentos || etapa.documentos.length === 0) && !etapa.documento && etapa.status === 'concluido' && (
                      <div className="relative">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <FileCheck className="w-8 h-8 text-green-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Documento da Etapa Concluída</p>
                              <p className="text-xs text-green-600">Documento anexado à etapa finalizada</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              {/* Comentários e Observações */}
              <Card className="bg-white shadow-sm border-gray-200 w-full mb-8">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-amber-500" />
                    Comentários e Observações
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <section className="mt-4">
                    <h3 className="text-lg font-semibold mb-4">Comentários e Observações</h3>
                    <div className="space-y-2 mt-2">
                      {/* Comentários Existentes */}
                      {etapa.observacoes && (
                        <div className="border-l-4 border-blue-400 bg-blue-50 px-3 py-2 rounded-md">
                          <p className="text-sm">
                            <strong>Gerência Responsável</strong> - {new Date().toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">{etapa.observacoes}</p>
                        </div>
                      )}
                      
                      {/* Comentário de Exemplo */}
                      <div className="border-l-4 border-green-400 bg-green-50 px-3 py-2 rounded-md">
                        <p className="text-sm">
                          <strong>Yasmin Pissolati Mattos Bretz</strong> - {new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          Documento enviado para análise técnica. Aguardando aprovação.
                        </p>
                      </div>
                      
                      {/* Campo para Adicionar Comentário */}
                      {canManageEtapa() ? (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <PenTool className="w-4 h-4 text-blue-500" />
                            <p className="text-sm font-medium text-gray-700">Adicionar Comentário</p>
                          </div>
                          <Textarea
                            placeholder="Escreva um comentário..."
                            value={novaObservacao}
                            onChange={(e) => setNovaObservacao(e.target.value)}
                            className="w-full border rounded-md p-2 text-sm min-h-[80px] resize-none"
                          />
                          <Button
                            size="sm"
                            onClick={handleSalvarObservacao}
                            disabled={!novaObservacao.trim()}
                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Salvar Comentário
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                          <div className="flex items-center gap-2 mb-3">
                            <PenTool className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-500">Comentários (Somente Visualização)</p>
                          </div>
                          <Textarea
                            placeholder="Você não possui permissão para adicionar comentários..."
                            value=""
                            disabled
                            className="w-full border rounded-md p-2 text-sm min-h-[80px] resize-none bg-gray-100 text-gray-500"
                          />
                          <Button
                            size="sm"
                            disabled
                            className="mt-2 bg-gray-300 text-gray-500 px-3 py-1 rounded text-sm cursor-not-allowed"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Adicionar Comentário (Bloqueado)
                          </Button>
                        </div>
                      )}
                    </div>
                  </section>
                </CardContent>
              </Card>

              {/* Resumo da Execução */}
              <Card className="bg-white shadow-sm border-gray-200 w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-500" />
                    Resumo da Execução
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bgColor}`}>
                        {statusConfig.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Status</p>
                        <p className="text-xs text-gray-600">{statusConfig.badge.props.children[1]}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${prazoStatus.bgColor}`}>
                        {prazoStatus.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Prazo</p>
                        <p className={`text-xs ${prazoStatus.color}`}>{prazoStatus.status}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Equipe</p>
                        <p className="text-xs text-gray-600">
                          {etapa.envolvidos?.length || 0} membro(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FileCheck className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Documento</p>
                        <p className="text-xs text-gray-600">
                          {etapa.documento ? 'Enviado' : 'Pendente'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Linha do Tempo */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700">Linha do Tempo</p>
                </div>
                <div className="flex items-center gap-4">
                  {etapa.dataInicio && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Início: {etapa.dataInicio}</span>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Prazo: {etapa.prazoPrevisao}</span>
                  </div>
                  {etapa.dataConclusao && (
                    <>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Conclusão: {etapa.dataConclusao}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Modal de Edição de Dados */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Editar Responsável e Equipe</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Responsável */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Responsável</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Nome</label>
                    <input
                      type="text"
                      value={editResponsavel}
                      onChange={(e) => setEditResponsavel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Cargo</label>
                    <input
                      type="text"
                      value={editCargo}
                      onChange={(e) => setEditCargo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Cargo"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Gerência</label>
                    <input
                      type="text"
                      value={editGerencia}
                      onChange={(e) => setEditGerencia(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Gerência"
                    />
                  </div>
                </div>
              </div>

              {/* Equipe */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Equipe</h4>
                <div className="space-y-4">
                  {editMembros.map((membro, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Membro {index + 1}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoverMembro(index)}
                          className="text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={membro.nome}
                          onChange={(e) => {
                            const novosMembros = [...editMembros];
                            novosMembros[index].nome = e.target.value;
                            setEditMembros(novosMembros);
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                          placeholder="Nome"
                        />
                        <input
                          type="text"
                          value={membro.cargo}
                          onChange={(e) => {
                            const novosMembros = [...editMembros];
                            novosMembros[index].cargo = e.target.value;
                            setEditMembros(novosMembros);
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                          placeholder="Cargo"
                        />
                        <input
                          type="text"
                          value={membro.papel}
                          onChange={(e) => {
                            const novosMembros = [...editMembros];
                            novosMembros[index].papel = e.target.value;
                            setEditMembros(novosMembros);
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                          placeholder="Papel"
                        />
                        <input
                          type="text"
                          value={membro.gerencia}
                          onChange={(e) => {
                            const novosMembros = [...editMembros];
                            novosMembros[index].gerencia = e.target.value;
                            setEditMembros(novosMembros);
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                          placeholder="Gerência"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Adicionar Novo Membro */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="text-sm font-medium text-blue-800 mb-3">Adicionar Novo Membro</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                      <input
                        type="text"
                        value={novoMembro.nome}
                        onChange={(e) => setNovoMembro({...novoMembro, nome: e.target.value})}
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="Nome"
                      />
                      <input
                        type="text"
                        value={novoMembro.cargo}
                        onChange={(e) => setNovoMembro({...novoMembro, cargo: e.target.value})}
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="Cargo"
                      />
                      <input
                        type="text"
                        value={novoMembro.papel}
                        onChange={(e) => setNovoMembro({...novoMembro, papel: e.target.value})}
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="Papel"
                      />
                      <input
                        type="text"
                        value={novoMembro.gerencia}
                        onChange={(e) => setNovoMembro({...novoMembro, gerencia: e.target.value})}
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="Gerência"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleAdicionarMembro}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar Membro
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                size="sm"
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSalvarEdicao}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Prazo */}
      {showPrazoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Alterar Prazo</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrazoModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800 mb-2">Informações da Alteração</p>
                <p className="text-xs text-orange-700">
                  <strong>Responsável:</strong> {user?.nome} ({user?.cargo})
                </p>
                <p className="text-xs text-orange-700">
                  <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
                </p>
                <p className="text-xs text-orange-700">
                  <strong>Prazo atual:</strong> {etapa?.prazoPrevisao}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Novo Prazo</label>
                <input
                  type="text"
                  value={editPrazo}
                  onChange={(e) => setEditPrazo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Ex: 15/02/2025"
                />
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700">
                  <strong>⚠️ Importante:</strong> Esta alteração será registrada no histórico da etapa.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                size="sm"
                onClick={() => setShowPrazoModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSalvarPrazo}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Prazo
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )}
</AnimatePresence>
  );
} 