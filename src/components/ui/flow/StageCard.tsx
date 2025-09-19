import React from 'react';
import { Clock, Check, GripVertical, Eye, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StageCardProps {
  index: number;
  title: string;
  department: string;
  days: number;
  status: 'done' | 'in_progress' | 'pending';
  zoom?: number;
  editable?: boolean;
  onViewDetails?: () => void;
  onEdit?: () => void;
}

export default function StageCard({ 
  index, 
  title, 
  department, 
  days, 
  status, 
  zoom = 100,
  editable = false,
  onViewDetails,
  onEdit
}: StageCardProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'done':
        return {
          border: 'border-emerald-500',
          shadow: 'shadow-[0_0_0_2px_#A7F3D0]',
          statusBg: 'bg-emerald-100',
          statusText: 'text-emerald-600',
          statusIcon: <Check className="w-3 h-3" />
        };
      case 'in_progress':
        return {
          border: 'border-indigo-500',
          shadow: '',
          statusBg: 'bg-indigo-100',
          statusText: 'text-indigo-600',
          statusIcon: null
        };
      case 'pending':
        return {
          border: 'border-slate-200',
          shadow: '',
          statusBg: 'bg-slate-100',
          statusText: 'text-slate-600',
          statusIcon: <Clock className="w-3 h-3" />
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <article 
      className={`stage-card relative rounded-2xl border shadow-sm bg-white p-4 md:p-5 transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-200 h-[220px] flex flex-col justify-between ${styles.border} ${styles.shadow}`}
    >
      {/* Pinos decorativos */}
      <div className="absolute -top-2 left-3 w-3 h-3 rounded-full border bg-white opacity-80" aria-hidden="true" />
      <div className="absolute -top-2 right-3 w-3 h-3 rounded-full border bg-white opacity-80" aria-hidden="true" />
      
      {/* Handle placeholder para DnD futuro */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute top-2 right-2 opacity-60 hover:opacity-100 transition-opacity cursor-grab" aria-label="Arrastar para reordenar">
              <GripVertical className="w-4 h-4 text-slate-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Arrastar para reordenar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Badge numérico (círculo roxo) */}
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold absolute -left-2 -top-2">
        {index}
      </div>

      {/* Conteúdo centralizado */}
      <div className="flex flex-col items-center text-center space-y-2 flex-1 justify-center">
        {/* Título */}
        <h3 className="text-slate-900 font-semibold leading-tight line-clamp-2 text-sm">
          {title}
        </h3>
        
        {/* Pill de Setor */}
        <div className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs px-2 py-1">
          {department}
        </div>

        {/* Linha prazo com ícone Clock */}
        <div className="flex items-center gap-1 text-xs text-slate-700">
          <Clock className="w-3 h-3" />
          <span>{days} dias úteis</span>
        </div>

        {/* Chip de status */}
        <div className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-1 ${styles.statusBg} ${styles.statusText}`}>
          {status === 'done' && 'Concluído'}
          {status === 'in_progress' && 'Em Andamento'}
          {status === 'pending' && 'Pendente'}
          {styles.statusIcon && <span className="ml-1">{styles.statusIcon}</span>}
        </div>
      </div>


      {/* Rodapé centralizado */}
      <div className="flex justify-center gap-2">
        {editable && onEdit && (
          <Button 
            variant="outline" 
            size="sm"
            className="justify-center rounded-xl border-slate-200 text-xs h-7 px-3"
            onClick={onEdit}
          >
            <Edit3 className="w-3 h-3 mr-1" />
            Editar
          </Button>
        )}
        <Button 
          variant="secondary" 
          size="sm"
          className="justify-center rounded-xl border-slate-200 text-xs h-7 px-3"
          onClick={onViewDetails}
        >
          <Eye className="w-3 h-3 mr-1" />
          Ver Detalhes
        </Button>
      </div>

      {/* Marcas de status no canto superior direito */}
      {status === 'done' && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-emerald-500" />
        </div>
      )}
      
      {status === 'in_progress' && (
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
      )}
      
      {status === 'pending' && (
        <div className="absolute -top-1 -right-1">
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
      )}
    </article>
  );
}