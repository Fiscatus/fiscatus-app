import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Check, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ModelStage, StageTool } from '@/types/flow';
import { getToolMeta } from '@/lib/stageTools';

interface StageCardExpandedProps {
  stage: ModelStage;
  editable?: boolean;
  onChange?: (patch: Partial<ModelStage>) => void;
  onReorderTools?: (order: StageTool[]) => void;
}

interface SortableToolChipProps {
  tool: StageTool;
  onRemove?: () => void;
}

const SortableToolChip: React.FC<SortableToolChipProps> = ({ tool, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tool });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const meta = getToolMeta(tool);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium
        ${meta.color} ${isDragging ? 'opacity-50' : ''}
        transition-all hover:shadow-sm
      `}
      {...attributes}
    >
      <div 
        className="cursor-grab active:cursor-grabbing" 
        {...listeners}
      >
        <GripVertical className="w-3 h-3" />
      </div>
      <meta.Icon className="w-4 h-4" />
      <span>{meta.label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:text-red-600 transition-colors"
          aria-label={`Remover ${meta.label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default function StageCardExpanded({ 
  stage, 
  editable = false, 
  onChange, 
  onReorderTools 
}: StageCardExpandedProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(stage.title);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getStatusStyles = () => {
    switch (stage.status) {
      case 'done':
        return {
          border: 'border-emerald-500',
          shadow: 'shadow-[0_0_0_2px_#A7F3D0]',
          statusBg: 'bg-emerald-100',
          statusText: 'text-emerald-600',
          statusIcon: <Check className="w-4 h-4" />
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
          statusIcon: <Clock className="w-4 h-4" />
        };
    }
  };

  const styles = getStatusStyles();

  const handleTitleSave = () => {
    if (tempTitle.trim() && tempTitle !== stage.title) {
      onChange?.({ title: tempTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(stage.title);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleToolRemove = (toolToRemove: StageTool) => {
    const newTools = stage.tools.filter(tool => tool !== toolToRemove);
    const newToolsOrder = stage.toolsOrder.filter(tool => tool !== toolToRemove);
    
    onChange?.({
      tools: newTools,
      toolsOrder: newToolsOrder
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = stage.toolsOrder.indexOf(active.id as StageTool);
      const newIndex = stage.toolsOrder.indexOf(over.id as StageTool);
      
      const newOrder = arrayMove(stage.toolsOrder, oldIndex, newIndex);
      onReorderTools?.(newOrder);
    }
  };

  return (
    <article 
      className={`
        relative rounded-2xl border shadow-sm bg-white p-6 transition-all
        ${styles.border} ${styles.shadow} scale-[1.03]
        min-h-[184px] flex flex-col
      `}
    >
      {/* Pinos decorativos */}
      <div className="absolute -top-2 left-4 w-3 h-3 rounded-full border bg-white opacity-80" aria-hidden="true" />
      <div className="absolute -top-2 right-4 w-3 h-3 rounded-full border bg-white opacity-80" aria-hidden="true" />
      
      {/* Badge numérico (círculo roxo) */}
      <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold absolute -left-3 -top-3">
        {stage.orderIndex}
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col space-y-4 flex-1">
        {/* Título editável */}
        <div className="text-center">
          {isEditingTitle ? (
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyDown}
              className="text-center font-semibold text-lg border-indigo-200 focus:border-indigo-500"
              autoFocus
            />
          ) : (
            <h3 
              className="text-slate-900 font-semibold text-lg leading-tight cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => editable && setIsEditingTitle(true)}
            >
              {stage.title}
            </h3>
          )}
        </div>
        
        {/* Informações da etapa */}
        <div className="flex flex-col items-center space-y-3">
          {/* Pill de Setor */}
          <div className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-sm px-3 py-1">
            {stage.department}
          </div>

          {/* Linha prazo com ícone Clock */}
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Clock className="w-4 h-4" />
            <span>{stage.days} dias úteis</span>
          </div>

          {/* Chip de status */}
          <div className={`inline-flex items-center rounded-full text-sm font-medium px-3 py-1 ${styles.statusBg} ${styles.statusText}`}>
            {stage.status === 'done' && 'Concluído'}
            {stage.status === 'in_progress' && 'Em Andamento'}
            {stage.status === 'pending' && 'Pendente'}
            {styles.statusIcon && <span className="ml-2">{styles.statusIcon}</span>}
          </div>
        </div>

        {/* Chips de ferramentas ordenáveis */}
        {stage.tools.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700 text-center">Ferramentas Ativas</h4>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={stage.toolsOrder}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex flex-wrap gap-2 justify-center">
                  {stage.toolsOrder.map((tool) => (
                    <SortableToolChip
                      key={tool}
                      tool={tool}
                      onRemove={editable ? () => handleToolRemove(tool) : undefined}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* Marcas de status no canto superior direito */}
      {stage.status === 'done' && (
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-emerald-500" />
        </div>
      )}
      
      {stage.status === 'in_progress' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
      )}
      
      {stage.status === 'pending' && (
        <div className="absolute -top-1 -right-1">
          <Clock className="w-5 h-5 text-slate-400" />
        </div>
      )}
    </article>
  );
}
