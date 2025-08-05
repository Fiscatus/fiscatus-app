import React from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  XCircle, 
  Edit3, 
  Trash2, 
  GripVertical,
  FileText,
  PenTool,
  Users,
  Search,
  Shield,
  DollarSign,
  Scale,
  Upload,
  User,
  Calendar,
  Building2,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getBordaEtapa } from '@/lib/utils';

interface Etapa {
  id: number;
  nome: string;
  nomeCompleto: string;
  status: 'pendente' | 'andamento' | 'concluido' | 'atrasado';
  prazoPrevisao: string;
  gerencia: string;
  responsavel: string;
  cargo: string;
  dataInicio?: string;
  tipoIcone?: string;
}

interface EtapaCardEditavelProps {
  etapa: Etapa;
  onEdit: (etapa: Etapa) => void;
  onDelete: (etapaId: number) => void;
  canDelete: boolean;
}

const iconMap: { [key: string]: React.ReactNode } = {
  FileText: <FileText className="w-6 h-6" />,
  PenTool: <PenTool className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Search: <Search className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
  DollarSign: <DollarSign className="w-6 h-6" />,
  Scale: <Scale className="w-6 h-6" />,
  Upload: <Upload className="w-6 h-6" />,
  User: <User className="w-6 h-6" />,
  Calendar: <Calendar className="w-6 h-6" />,
  Building2: <Building2 className="w-6 h-6" />,
  CheckCircle: <CheckCircle className="w-6 h-6" />,
  Clock: <Clock className="w-6 h-6" />,
  Settings: <Settings className="w-6 h-6" />
};

export default function EtapaCardEditavel({
  etapa,
  onEdit,
  onDelete,
  canDelete
}: EtapaCardEditavelProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: etapa.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'concluido':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="w-4 h-4 text-green-600" />
        };
      case 'andamento':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: <PlayCircle className="w-4 h-4 text-blue-600" />
        };
      case 'atrasado':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <XCircle className="w-4 h-4 text-red-600" />
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: <Clock className="w-4 h-4 text-gray-600" />
        };
    }
  };

  const statusConfig = getStatusConfig(etapa.status);
  const etapaIcon = iconMap[etapa.tipoIcone || 'FileText'] || <FileText className="w-6 h-6" />;

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir a etapa "${etapa.nome}"? Esta ação é irreversível.`)) {
      onDelete(etapa.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex-shrink-0 md:flex-shrink ${isDragging ? 'opacity-50' : ''}`}
    >
      <motion.div
        className={`border-2 rounded-xl transition-all duration-300 ${statusConfig.bgColor} hover:shadow-md bg-white relative w-full group ${getBordaEtapa(etapa.status, etapa.dataInicio, etapa.prazoPrevisao)}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1 bg-gray-100 rounded hover:bg-gray-200">
                  <GripVertical className="w-4 h-4 text-gray-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Arrastar para reordenar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-white hover:bg-blue-50 border border-gray-200"
                  onClick={() => onEdit(etapa)}
                >
                  <Edit3 className="w-4 h-4 text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar etapa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {canDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-white hover:bg-red-50 border border-gray-200"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Excluir etapa</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Indicador de Status */}
        {etapa.status === 'concluido' && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}

        {etapa.status === 'pendente' && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center shadow-lg">
            <Clock className="w-4 h-4 text-gray-500" />
          </div>
        )}

        {etapa.status === 'andamento' && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <PlayCircle className="w-4 h-4 text-white" />
          </div>
        )}

        {etapa.status === 'atrasado' && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <XCircle className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Header do Card */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            {/* Número da Etapa */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              etapa.status === 'concluido' 
                ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
              {etapa.id}
            </div>
            
            {/* Status Icon */}
            <div className="flex items-center gap-1">
              {statusConfig.icon}
            </div>
          </div>

          {/* Ícone Temático */}
          <div className="flex justify-center mb-3 text-gray-600">
            {etapaIcon}
          </div>

          {/* Nome da Etapa */}
          <h3 className={`font-semibold text-center text-sm mb-2 leading-tight ${
            etapa.status === 'concluido' ? 'text-green-800 font-bold' : 'text-gray-900'
          }`}>
            {etapa.nome}
          </h3>

          {/* Gerência Responsável */}
          <p className="text-xs text-gray-600 text-center mb-2 truncate">
            {etapa.gerencia}
          </p>

          {/* Prazo */}
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              {etapa.prazoPrevisao}
            </Badge>
          </div>

          {/* Responsável */}
          {etapa.responsavel && (
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500 truncate">
                {etapa.responsavel}
              </p>
            </div>
          )}
        </div>

        {/* Overlay para indicar modo de edição */}
        <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-xl opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity" />
      </motion.div>
    </div>
  );
} 