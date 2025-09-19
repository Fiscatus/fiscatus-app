import React, { useState, useEffect } from 'react';
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
import { Clock, Check } from 'lucide-react';
import { ModelStage, StageTool, LayoutMode, DensityMode } from '@/types/flow';
import { getToolMeta } from '@/lib/stageTools';
import { cn } from '@/lib/utils';
import ToolBlock from './ToolBlock';
import ManagementBlock from './ManagementBlock';
import MainFormBlock from './MainFormBlock';
import StagePanelBlock from './StagePanelBlock';
import StageActionsBlock from './StageActionsBlock';
import CommentsBlock from './CommentsBlock';
import SignaturesBlock from './SignaturesBlock';
import DocViewBlock from './DocViewBlock';

interface StageCardDesignerProps {
  stage: ModelStage;
  layout: {
    mode: LayoutMode;
    density: DensityMode;
    showGuides: boolean;
    scale: number;
    columnOf?: Record<StageTool, 'left' | 'right'>;
    orderLeft?: StageTool[];
    orderRight?: StageTool[];
    orderStack?: StageTool[];
  };
  onLayoutChange: (layout: Partial<StageCardDesignerProps['layout']>) => void;
  onToolRemove: (tool: StageTool) => void;
  onToolConfigure: (tool: StageTool) => void;
  className?: string;
}

interface SortableToolBlockProps {
  tool: StageTool;
  stage: ModelStage;
  density: DensityMode;
  onRemove: () => void;
  onConfigure: () => void;
  isDragging?: boolean;
}

const SortableToolBlock: React.FC<SortableToolBlockProps> = ({ 
  tool, 
  stage,
  density, 
  onRemove, 
  onConfigure, 
  isDragging = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: tool });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderToolContent = () => {
    switch (tool) {
      case 'management':
        return <ManagementBlock stage={stage} density={density} />;
      case 'main_form':
        return <MainFormBlock stage={stage} density={density} />;
      case 'stage_panel':
        return <StagePanelBlock stage={stage} density={density} />;
      case 'stage_actions':
        return <StageActionsBlock stage={stage} density={density} />;
      case 'comments':
        return <CommentsBlock stage={stage} density={density} />;
      case 'signatures':
        return <SignaturesBlock stage={stage} density={density} />;
      case 'doc_view':
        return <DocViewBlock stage={stage} density={density} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <ToolBlock
        tool={tool}
        stage={stage}
        density={density}
        onRemove={onRemove}
        onConfigure={onConfigure}
        isDragging={isDragging || isSortableDragging}
      >
        {renderToolContent()}
      </ToolBlock>
    </div>
  );
};

export default function StageCardDesigner({
  stage,
  layout,
  onLayoutChange,
  onToolRemove,
  onToolConfigure,
  className = ''
}: StageCardDesignerProps) {
  const [activeTool, setActiveTool] = useState<StageTool | null>(null);
  
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

  // Aplicar escala via CSS custom property
  useEffect(() => {
    document.documentElement.style.setProperty('--card-scale', layout.scale.toString());
  }, [layout.scale]);

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

  // Organizar ferramentas por coluna
  const getToolsByColumn = () => {
    if (layout.mode === 'stack') {
      return {
        stack: layout.orderStack || stage.tools
      };
    }

    const leftTools = layout.orderLeft || [];
    const rightTools = layout.orderRight || [];
    
    return { left: leftTools, right: rightTools };
  };

  const toolsByColumn = getToolsByColumn();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTool(event.active.id as StageTool);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeTool = active.id as StageTool;
    const overTool = over.id as StageTool;
    
    if (activeTool === overTool) return;

    // Lógica para reorganizar dentro da mesma coluna ou mover entre colunas
    // Implementar conforme necessário
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTool(null);
    
    if (!over) return;

    const activeTool = active.id as StageTool;
    const overTool = over.id as StageTool;
    
    if (activeTool === overTool) return;

    // Reorganizar ferramentas
    if (layout.mode === 'stack') {
      const stackTools = toolsByColumn.stack;
      const oldIndex = stackTools.indexOf(activeTool);
      const newIndex = stackTools.indexOf(overTool);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(stackTools, oldIndex, newIndex);
        onLayoutChange({ orderStack: newOrder });
      }
    } else {
      // Lógica para reorganizar entre colunas
      // Implementar conforme necessário
    }
  };


  const renderColumn = (tools: StageTool[], columnId: string) => {
    if (tools.length === 0) {
      return (
        <div 
          className={`
            min-h-[200px] border-2 border-dashed border-slate-300 rounded-lg 
            flex items-center justify-center text-slate-500
            ${layout.showGuides ? 'bg-slate-50' : 'bg-transparent'}
          `}
        >
          <span className="text-sm">Arraste ferramentas aqui</span>
        </div>
      );
    }

    return (
      <SortableContext items={tools} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {tools.map((tool) => (
            <SortableToolBlock
              key={tool}
              tool={tool}
              stage={stage}
              density={layout.density}
              onRemove={() => onToolRemove(tool)}
              onConfigure={() => onToolConfigure(tool)}
            />
          ))}
        </div>
      </SortableContext>
    );
  };

  return (
    <div className={cn("h-full w-full", className)} style={{ ['--card-scale' as any]: `${layout.scale ?? 1}` }}>
      {/* área do card */}
      <article
        className={cn(
          "stage-card",
          "relative w-full h-auto",
          "rounded-2xl border shadow-sm bg-white",
          "p-6 md:p-8",
          layout.showGuides && "[outline:1px_solid_theme(colors.slate.200)]",
          "origin-top scale-[var(--card-scale)]",
          styles.border,
          styles.shadow
        )}
      >
            {/* Pinos decorativos */}
            <div className="absolute -top-2 left-4 w-3 h-3 rounded-full border bg-white opacity-80" aria-hidden="true" />
            <div className="absolute -top-2 right-4 w-3 h-3 rounded-full border bg-white opacity-80" aria-hidden="true" />
            
            {/* Badge numérico */}
            <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold absolute -left-3 -top-3">
              {stage.orderIndex}
            </div>

            {/* Cabeçalho do card (simplificado) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Pill de Setor */}
                  <div className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-sm px-3 py-1">
                    {stage.department}
                  </div>

                  {/* Linha prazo com ícone Clock */}
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Clock className="w-4 h-4" />
                    <span>{stage.days} dias úteis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TOOLBAR DO DESIGNER (flutuante, dentro do card) — opcional */}
            {/* <DesignerInlineToolbar stageId={stage.id} /> */}

            {/* GRID INTERNO DOS BLOCOS (100% da largura do card) */}
            <div
              className={cn(
                "mt-4",
                layout.mode === "stack" && "grid grid-cols-1 gap-4",
                layout.mode === "50-50" && "grid grid-cols-2 gap-4",
                layout.mode === "60-40" && "grid grid-cols-[3fr_2fr] gap-4",
                layout.mode === "40-60" && "grid grid-cols-[2fr_3fr] gap-4"
              )}
            >
              {/* Coluna(s) recebe(m) blocos com DnD */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                {layout.mode === 'stack' ? (
                  <div>
                    {renderColumn(toolsByColumn.stack, 'stack')}
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="text-xs text-slate-500 mb-2 font-medium">Coluna Esquerda</div>
                      {renderColumn(toolsByColumn.left, 'left')}
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-2 font-medium">Coluna Direita</div>
                      {renderColumn(toolsByColumn.right, 'right')}
                    </div>
                  </>
                )}

                <DragOverlay>
                  {activeTool ? (
                    <ToolBlock
                      tool={activeTool}
                      density={layout.density}
                      isDragging={true}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
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
    </div>
  );
}
