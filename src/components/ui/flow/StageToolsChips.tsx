import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
import { X } from 'lucide-react';
import { StageTool } from '@/types/flow';
import { getToolMeta } from '@/lib/stageTools';

interface StageToolsChipsProps {
  tools: StageTool[];
  toolsOrder: StageTool[];
  editable?: boolean;
  onReorder?: (newOrder: StageTool[]) => void;
  onRemove?: (tool: StageTool) => void;
  className?: string;
}

interface SortableChipProps {
  tool: StageTool;
  editable?: boolean;
  onRemove?: (tool: StageTool) => void;
}

const SortableChip: React.FC<SortableChipProps> = ({ tool, editable, onRemove }) => {
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
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
        ${meta.color}
        ${isDragging ? 'opacity-50 shadow-lg' : 'shadow-sm'}
        ${editable ? 'cursor-grab active:cursor-grabbing' : ''}
        transition-all duration-200 hover:shadow-md
      `}
      {...attributes}
      {...(editable ? listeners : {})}
      role="listitem"
      aria-label={`Ferramenta: ${meta.label}`}
    >
      <meta.Icon className="w-3 h-3" />
      <span>{meta.label}</span>
      {editable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tool);
          }}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
          aria-label={`Remover ${meta.label}`}
          title={`Remover ${meta.label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export const StageToolsChips: React.FC<StageToolsChipsProps> = ({
  tools,
  toolsOrder,
  editable = false,
  onReorder,
  onRemove,
  className = ''
}) => {
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

  // Ordenar ferramentas baseado em toolsOrder, com fallback para tools
  const orderedTools = toolsOrder.length > 0 
    ? toolsOrder.filter(tool => tools.includes(tool))
    : tools;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !onReorder) return;

    const oldIndex = orderedTools.indexOf(active.id as StageTool);
    const newIndex = orderedTools.indexOf(over.id as StageTool);

    if (oldIndex !== newIndex) {
      const newOrder = arrayMove(orderedTools, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  if (tools.length === 0) {
    return (
      <div className={`text-xs text-slate-500 italic ${className}`}>
        Nenhuma ferramenta ativa
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedTools}
          strategy={horizontalListSortingStrategy}
        >
          <div 
            className="flex flex-wrap gap-1.5"
            role="list"
            aria-label="Ferramentas ativas do card"
          >
            {orderedTools.map((tool) => (
              <SortableChip
                key={tool}
                tool={tool}
                editable={editable}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default StageToolsChips;
