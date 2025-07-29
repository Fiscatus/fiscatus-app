import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  FileText, 
  Edit3, 
  Trash2, 
  CheckCircle,
  Download,
  Eye,
  AlertTriangle,
  Clock,
  User,
  Shield,
  FileUp
} from "lucide-react";

interface EtapaActionsProps {
  etapa: {
    id: number;
    nome: string;
    nomeCompleto: string;
    status: string;
    gerencia: string;
    documento?: string;
    documentoUrl?: string;
    enviadoPor?: string;
    dataEnvio?: string;
    podeExecutar?: boolean;
  };
  onAdicionarDocumento: () => void;
  onExcluirDocumento: () => void;
  onEditarDados: () => void;
  onConcluirEtapa: () => void;
  onVisualizarDocumento: () => void;
  onBaixarDocumento: () => void;
}

export default function EtapaActions({
  etapa,
  onAdicionarDocumento,
  onExcluirDocumento,
  onEditarDados,
  onConcluirEtapa,
  onVisualizarDocumento,
  onBaixarDocumento
}: EtapaActionsProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleExcluirDocumento = () => {
    if (showConfirmDelete) {
      onExcluirDocumento();
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
      // Auto-cancel after 5 seconds
      setTimeout(() => setShowConfirmDelete(false), 5000);
    }
  };

  const handleConcluirEtapa = () => {
    if (showConfirmComplete) {
      onConcluirEtapa();
      setShowConfirmComplete(false);
    } else {
      setShowConfirmComplete(true);
      // Auto-cancel after 5 seconds
      setTimeout(() => setShowConfirmComplete(false), 5000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onAdicionarDocumento();
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      em_andamento: { color: "bg-blue-600 text-white", label: "Em Andamento" },
      concluido: { color: "bg-green-600 text-white", label: "Concluído" },
      atrasado: { color: "bg-red-600 text-white", label: "Atrasado" },
      pendente: { color: "bg-gray-500 text-white", label: "Pendente" }
    };
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  const statusConfig = getStatusConfig(etapa.status);

  // Se o usuário não pode executar, mostrar interface simplificada
  if (!etapa.podeExecutar) {
    return (
      <motion.div 
        className="bg-muted/40 border border-gray-200 rounded-xl p-6 shadow-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Cabeçalho */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-gray-500" />
            <h3 className="text-lg font-bold text-gray-700">Ações da Etapa</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-gray-600 border-gray-300">
              <Shield className="w-3 h-3 mr-1" />
              Acesso Restrito
            </Badge>
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Mensagem de Restrição */}
        <div className="text-center py-8">
          <div className="text-gray-500">
            {etapa.status === "pendente" ? (
              <div>
                <p className="text-sm font-medium mb-2">Etapa ainda não iniciada</p>
                <p className="text-xs">Aguardando etapas anteriores</p>
              </div>
            ) : etapa.status === "concluido" ? (
              <div>
                <p className="text-sm font-medium mb-2">Etapa já concluída</p>
                <p className="text-xs">Sem ações disponíveis</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium mb-2">Esta etapa não está disponível para sua gerência</p>
                <p className="text-xs">Responsável: {etapa.gerencia}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">Ações da Etapa</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
            <Shield className="w-3 h-3 mr-1" />
            Sua Gerência
          </Badge>
          <Badge className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* Seção de Documento Principal */}
      {etapa.documento ? (
        <motion.div 
          className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">{etapa.documento}</h4>
              {etapa.enviadoPor && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>Enviado por <strong>{etapa.enviadoPor}</strong> em {etapa.dataEnvio}</span>
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação do Documento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={onVisualizarDocumento}
              className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 transition-all"
            >
              <Eye className="w-4 h-4" />
              Visualizar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onBaixarDocumento}
              className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 transition-all"
            >
              <Download className="w-4 h-4" />
              Baixar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onEditarDados}
              className="flex items-center gap-2 hover:bg-yellow-50 border-yellow-300 text-yellow-700 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Editar Dados
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExcluirDocumento}
              className={`flex items-center gap-2 transition-all ${
                showConfirmDelete 
                  ? 'bg-red-600 text-white hover:bg-red-700 border-red-600' 
                  : 'hover:bg-red-50 text-red-700 border-red-300'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {showConfirmDelete ? 'Confirmar' : 'Excluir'}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 mb-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-3 bg-gray-50 rounded-full w-fit mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Nenhum documento anexado</h4>
          <p className="text-sm text-gray-600">
            Adicione o documento necessário para esta etapa
          </p>
        </motion.div>
      )}

      {/* Upload e Substituição de Documento */}
      <motion.div 
        className={`bg-white rounded-xl border-2 border-dashed p-5 mb-6 transition-all ${
          isDragging 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 hover:border-green-300'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <FileUp className="w-5 h-5 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900">
            {etapa.documento ? 'Substituir Documento' : 'Adicionar Documento'}
          </h4>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            {etapa.documento 
              ? 'Arraste um novo arquivo aqui ou clique no botão abaixo para substituir o documento atual'
              : 'Arraste um arquivo aqui ou clique no botão abaixo para adicionar o documento'
            }
          </p>
          
          <Button
            onClick={onAdicionarDocumento}
            className={`px-6 py-2 ${
              etapa.documento 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-green-600 hover:bg-green-700'
            } transition-all`}
          >
            <Upload className="w-4 h-4 mr-2" />
            {etapa.documento ? 'Substituir Documento' : 'Selecionar Arquivo'}
          </Button>
          
          {etapa.documento && (
            <p className="text-xs text-orange-600 mt-2 font-medium">
              ⚠️ Substituirá o documento atual
            </p>
          )}
        </div>
      </motion.div>

      {/* Botão de Editar Dados da Etapa */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={onEditarDados}
          variant="outline"
          className="w-full flex items-center gap-3 px-6 py-3 hover:bg-yellow-50 border-yellow-300 text-yellow-700 transition-all"
        >
          <Edit3 className="w-5 h-5" />
          <span className="font-medium">Editar Dados da Etapa</span>
        </Button>
      </motion.div>

      {/* Botão de Conclusão da Etapa */}
      {etapa.documento && (
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleConcluirEtapa}
            className={`w-full flex items-center gap-3 px-6 py-4 text-lg font-semibold rounded-xl transition-all ${
              showConfirmComplete
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <CheckCircle className="w-6 h-6" />
            {showConfirmComplete ? 'Confirmar Conclusão da Etapa' : 'Concluir Etapa'}
          </Button>
          
          {showConfirmComplete && (
            <motion.div 
              className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-sm text-blue-700 text-center font-medium">
                ⚠️ Clique novamente para confirmar. A etapa será marcada como concluída.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Mensagem de Permissão */}
      <motion.div 
        className="pt-4 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Você tem permissão para gerenciar esta etapa</span>
        </div>
      </motion.div>
    </div>
  );
} 