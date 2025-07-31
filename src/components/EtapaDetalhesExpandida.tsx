import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  PenTool
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';

interface Etapa {
  id: number;
  nome: string;
  nomeCompleto: string;
  status: 'pendente' | 'andamento' | 'concluido' | 'atrasado';
  prazoPrevisao: string;
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
}

interface EtapaDetalhesExpandidaProps {
  etapa: Etapa;
  onConcluirEtapa?: (etapa: Etapa) => void;
  onEditarEtapa?: (etapa: Etapa) => void;
  onExcluirEtapa?: (etapa: Etapa) => void;
  onSubstituirDocumento?: (etapa: Etapa) => void;
  onVisualizarDocumento?: (etapa: Etapa) => void;
  onBaixarDocumento?: (etapa: Etapa) => void;
  onAdicionarMembro?: (etapa: Etapa, membro: any) => void;
  onRemoverMembro?: (etapa: Etapa, membroId: string) => void;
  onSalvarObservacao?: (etapa: Etapa, observacao: string) => void;
}

export default function EtapaDetalhesExpandida({
  etapa,
  onConcluirEtapa,
  onEditarEtapa,
  onExcluirEtapa,
  onSubstituirDocumento,
  onVisualizarDocumento,
  onBaixarDocumento,
  onAdicionarMembro,
  onRemoverMembro,
  onSalvarObservacao
}: EtapaDetalhesExpandidaProps) {
  const { user } = useUser();
  const { podeEditarFluxo } = usePermissoes();
  const [novaObservacao, setNovaObservacao] = useState('');
  const [editandoResponsavel, setEditandoResponsavel] = useState(false);

  const canManageEtapa = () => {
    // Gerências pai podem gerenciar qualquer etapa
    if (podeEditarFluxo()) {
      return true;
    }
    // Outras gerências só podem gerenciar etapas da própria gerência em andamento
    return etapa.status === 'andamento' && user?.gerencia === etapa.gerencia;
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
          color: 'text-green-600'
        };
      case 'andamento':
        return {
          badge: <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <PlayCircle className="w-3 h-3 mr-1" />
            Em Andamento
          </Badge>,
          icon: <PlayCircle className="w-5 h-5 text-yellow-500" />,
          color: 'text-yellow-600'
        };
      case 'atrasado':
        return {
          badge: <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Atrasado
          </Badge>,
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          color: 'text-red-600'
        };
      case 'pendente':
        return {
          badge: <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>,
          icon: <Clock className="w-5 h-5 text-gray-500" />,
          color: 'text-gray-600'
        };
      default:
        return {
          badge: <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>,
          icon: <Clock className="w-5 h-5 text-gray-500" />,
          color: 'text-gray-600'
        };
    }
  };

  const getPrazoStatus = () => {
    if (etapa.status === 'concluido') {
      return {
        status: 'Cumprido',
        color: 'text-green-600',
        icon: <CheckCircle className="w-4 h-4 text-green-600" />
      };
    } else if (etapa.status === 'atrasado') {
      return {
        status: 'Em Atraso',
        color: 'text-red-600',
        icon: <AlertTriangle className="w-4 h-4 text-red-600" />
      };
    } else {
      return {
        status: 'No Prazo',
        color: 'text-blue-600',
        icon: <Clock className="w-4 h-4 text-blue-600" />
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

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full border-t border-gray-200 bg-gray-50/50"
    >
      <div className="w-full px-4 py-6">
        {/* Grid Principal - 4 Colunas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-none mb-6">
          
          {/* 1. Responsável */}
          <Card className="bg-white shadow-sm border-gray-200 w-full h-full min-h-[200px] overflow-visible">
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
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{etapa.responsavel}</p>
                      <p className="text-xs text-gray-600">{etapa.cargo}</p>
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
                <div className="text-center py-4">
                  <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Responsável ainda não definido.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Cronograma */}
          <Card className="bg-white shadow-sm border-gray-200 w-full h-full min-h-[200px] overflow-visible">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-full overflow-visible">
              <div className="space-y-4">
                {etapa.dataInicio && (
                  <div>
                    <p className="text-xs text-gray-500">Data de Início</p>
                    <p className="text-sm font-medium text-gray-900">{etapa.dataInicio}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                      <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Prazo Previsto
                  </p>
                  <p className="text-sm font-medium text-gray-900 mb-2">{etapa.prazoPrevisao}</p>
                  {statusConfig.badge}
                </div>
                
                {etapa.dataConclusao && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Data de Conclusão</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-green-600">{etapa.dataConclusao}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    {prazoStatus.icon}
                    <p className="text-xs text-gray-500">Status do Prazo</p>
                  </div>
                  <p className={`text-sm font-medium ${prazoStatus.color}`}>
                    {prazoStatus.status}
                  </p>
                </div>

                {etapa.diasUteis && (
                  <div>
                    <p className="text-xs text-gray-500">Total de Dias Úteis</p>
                    <p className="text-sm font-medium text-gray-900">{etapa.diasUteis} dias</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. Gerenciamento da Etapa */}
          <Card className="bg-white shadow-sm border-gray-200 w-full h-full min-h-[200px] overflow-visible">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                Gerenciamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-full overflow-visible">
              {canManageEtapa() ? (
                <div className="space-y-4">
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Sua Gerência
                  </Badge>
                  
                  {etapa.documento && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Documento Principal</p>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <p className="text-sm font-medium text-gray-900">{etapa.documento}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onVisualizarDocumento?.(etapa)}
                          className="text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Visualizar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onBaixarDocumento?.(etapa)}
                          className="text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onEditarEtapa?.(etapa)}
                      className="w-full text-xs bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Editar Dados
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => onSubstituirDocumento?.(etapa)}
                      className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Substituir Documento
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => onConcluirEtapa?.(etapa)}
                      className="w-full text-xs bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Concluir Etapa
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onExcluirEtapa?.(etapa)}
                      className="w-full text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                  
                  <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    Você tem permissão para gerenciar esta etapa.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  {etapa.status === 'concluido' ? (
                    <div>
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Etapa finalizada</p>
                    </div>
                  ) : (
                    <div>
                      <XCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Somente membros da gerência responsável podem editar.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Equipe */}
          <Card className="bg-white shadow-sm border-gray-200 w-full h-full min-h-[200px] overflow-visible">
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
                <div className="text-center py-4">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum membro adicional</p>
                  {canManageEtapa() && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAdicionarMembro?.(etapa, {})}
                      className="mt-2 text-xs bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
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

        {/* Seção de Observações */}
        <Card className="bg-white shadow-sm border-gray-200 w-full mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {etapa.observacoes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{etapa.observacoes}</p>
                <p className="text-xs text-gray-500 mt-2">Observação da gerência</p>
              </div>
            )}
            
            {canManageEtapa() && (
              <div className="space-y-3">
                <Textarea
                  placeholder="Adicionar nova observação..."
                  value={novaObservacao}
                  onChange={(e) => setNovaObservacao(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button
                  size="sm"
                  onClick={handleSalvarObservacao}
                  disabled={!novaObservacao.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Salvar Observação
                </Button>
              </div>
            )}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  etapa.status === 'concluido' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {statusConfig.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p className="text-xs text-gray-600">{statusConfig.badge.props.children[1]}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  prazoStatus.status === 'Cumprido' ? 'bg-green-100' : 
                  prazoStatus.status === 'Em Atraso' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {prazoStatus.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Prazo</p>
                  <p className={`text-xs ${prazoStatus.color}`}>{prazoStatus.status}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Equipe</p>
                  <p className="text-xs text-gray-600">
                    {etapa.envolvidos?.length || 0} membro(s)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
} 