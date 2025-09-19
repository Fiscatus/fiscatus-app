import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Plus, Info } from 'lucide-react';
import { StageTool } from '@/types/flow';
import { getToolMeta, canActivateTool, getAvailableTools } from '@/lib/stageTools';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface StageToolsPickerProps {
  tools: StageTool[];
  toolsOrder: StageTool[];
  onChangeTools: (newTools: StageTool[]) => void;
  onChangeOrder: (newOrder: StageTool[]) => void;
  className?: string;
  readOnly?: boolean;
}

interface ToolItemProps {
  tool: StageTool;
  isActive: boolean;
  isDisabled?: boolean;
  onToggle: (tool: StageTool) => void;
  onRemove?: (tool: StageTool) => void;
  isDragging?: boolean;
  readOnly?: boolean;
}

const ToolItem: React.FC<ToolItemProps> = ({ 
  tool, 
  isActive, 
  isDisabled = false, 
  onToggle, 
  onRemove,
  isDragging = false,
  readOnly = false
}) => {
  const meta = getToolMeta(tool);
  
  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
        ${isActive 
          ? 'bg-white border-slate-200 shadow-sm' 
          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
        }
        ${isDisabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:shadow-md'
        }
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
      onClick={() => !isDisabled && !readOnly && onToggle(tool)}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label={`${isActive ? 'Desativar' : 'Ativar'} ${meta.label}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isDisabled && !readOnly) {
          e.preventDefault();
          onToggle(tool);
        }
      }}
    >
      <div className={`p-2 rounded-md ${meta.color}`}>
        <meta.Icon className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-slate-900 truncate">
            {meta.label}
          </h4>
          {meta.dependsOn && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Depende de: {getToolMeta(meta.dependsOn).label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <p className="text-xs text-slate-600 mt-0.5">
          {meta.desc}
        </p>
      </div>

      {!readOnly && isActive && onRemove ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tool);
          }}
          className="p-1 rounded-full hover:bg-slate-200 transition-colors"
          aria-label={`Remover ${meta.label}`}
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      ) : !readOnly && !isActive && !isDisabled ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(tool);
          }}
          className="p-1 rounded-full hover:bg-slate-200 transition-colors"
          aria-label={`Adicionar ${meta.label}`}
        >
          <Plus className="w-4 h-4 text-slate-500" />
        </button>
      ) : null}
    </div>
  );
};

const SortableToolItem: React.FC<ToolItemProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.tool });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <ToolItem {...props} isDragging={isDragging} />
    </div>
  );
};

export const StageToolsPicker: React.FC<StageToolsPickerProps> = ({
  tools,
  toolsOrder,
  onChangeTools,
  onChangeOrder,
  className = '',
  readOnly = false
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Obter ferramentas disponíveis (todas menos as ativas)
  const availableTools = getAvailableTools(tools);
  
  // Ordenar ferramentas ativas baseado em toolsOrder
  const orderedActiveTools = toolsOrder.length > 0 
    ? toolsOrder.filter(tool => tools.includes(tool))
    : tools;

  const handleToggleTool = (tool: StageTool) => {
    if (tools.includes(tool)) {
      // Desativar ferramenta
      const newTools = tools.filter(t => t !== tool);
      const newOrder = toolsOrder.filter(t => t !== tool);
      
      // Se desativando signatures, também desativar doc_view
      if (tool === 'signatures') {
        const finalTools = newTools.filter(t => t !== 'doc_view');
        const finalOrder = newOrder.filter(t => t !== 'doc_view');
        onChangeTools(finalTools);
        onChangeOrder(finalOrder);
        
        // Mostrar toast se doc_view foi removido
        if (tools.includes('doc_view')) {
          toast({
            title: "Visualização desativada",
            description: "A visualização de documentos foi desativada porque depende de Assinaturas.",
          });
        }
      } else {
        onChangeTools(newTools);
        onChangeOrder(newOrder);
      }
    } else {
      // Ativar ferramenta
      if (canActivateTool(tool, tools)) {
        const newTools = [...tools, tool];
        const newOrder = [...toolsOrder, tool];
        onChangeTools(newTools);
        onChangeOrder(newOrder);
      }
    }
  };

  const handleRemoveTool = (tool: StageTool) => {
    handleToggleTool(tool);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const oldIndex = orderedActiveTools.indexOf(active.id as StageTool);
    const newIndex = orderedActiveTools.indexOf(over.id as StageTool);

    if (oldIndex !== newIndex) {
      const newOrder = arrayMove(orderedActiveTools, oldIndex, newIndex);
      onChangeOrder(newOrder);
      toast({
        title: "Ordem atualizada",
        description: "A ordem das ferramentas foi atualizada.",
      });
    }
  };

  const activeTool = activeId ? getToolMeta(activeId as StageTool) : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Legenda de dependências */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium mb-1">Dependências:</p>
            <p className="text-blue-700">
              <strong>Visualização</strong> só pode ser ativada quando <strong>Assinaturas</strong> estiver ativa.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna: Ferramentas Disponíveis */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span>Disponíveis</span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {availableTools.length}
            </span>
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableTools.map((tool) => {
              const isDisabled = !canActivateTool(tool, tools);
              return (
                <ToolItem
                  key={tool}
                  tool={tool}
                  isActive={false}
                  isDisabled={isDisabled}
                  onToggle={handleToggleTool}
                  readOnly={readOnly}
                />
              );
            })}
          </div>
        </div>

        {/* Coluna: Ferramentas Ativas */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span>Ativas</span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {orderedActiveTools.length}
            </span>
          </h3>

          <DndContext
            sensors={readOnly ? [] : sensors}
            collisionDetection={closestCenter}
            onDragStart={readOnly ? undefined : handleDragStart}
            onDragEnd={readOnly ? undefined : handleDragEnd}
          >
            <SortableContext
              items={orderedActiveTools}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {orderedActiveTools.map((tool) => (
                  <SortableToolItem
                    key={tool}
                    tool={tool}
                    isActive={true}
                    onRemove={handleRemoveTool}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeTool ? (
                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg opacity-90">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${activeTool.color}`}>
                      <activeTool.Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">
                        {activeTool.label}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {activeTool.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {orderedActiveTools.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-sm">Nenhuma ferramenta ativa</p>
              <p className="text-xs mt-1">Clique nas ferramentas disponíveis para ativá-las</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StageToolsPicker;
