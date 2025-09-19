import React from 'react';
import StageCard from './StageCard';

interface Etapa {
  index: number;
  title: string;
  department: string;
  days: number;
  status: 'done' | 'in_progress' | 'pending';
}

interface StagesGridProps {
  etapas: Etapa[];
  zoom?: number;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
  onView?: (index: number) => void;
}

export default function StagesGrid({ etapas, zoom = 100, onEdit, onDelete, onView }: StagesGridProps) {
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
          <div key={etapa.index} className="h-[220px]">
            <StageCard
              index={etapa.index}
              title={etapa.title}
              department={etapa.department}
              days={etapa.days}
              status={etapa.status}
              zoom={zoom}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
