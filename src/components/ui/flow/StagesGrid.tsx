import React from 'react';
import StageCard from './StageCard';
import { ModelStage } from '@/types/flow';

interface StagesGridProps {
  etapas: ModelStage[];
  zoom?: number;
  editable?: boolean;
  onEdit?: (stageId: string) => void;
  onDelete?: (stageId: string) => void;
  onView?: (stageId: string) => void;
}

export default function StagesGrid({ 
  etapas, 
  zoom = 100, 
  editable = false,
  onEdit, 
  onDelete, 
  onView
}: StagesGridProps) {
  return (
    <div 
      id="grid-anchor" 
      className="scroll-mt-[calc(var(--safe-top)+var(--toolbar-h)+56px)] pt-2"
      style={{ '--card-scale': zoom / 100 } as React.CSSProperties}
    >
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 xl:gap-5"
        style={{ 
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top left'
        }}
      >
        {etapas.map((etapa) => (
          <div key={etapa.id} className="h-[220px]">
            <StageCard
              index={etapa.orderIndex}
              title={etapa.title}
              department={etapa.department || ''}
              days={etapa.days || 0}
              zoom={zoom}
              editable={editable}
              onViewDetails={() => onView?.(etapa.id)}
              onEdit={() => onEdit?.(etapa.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
