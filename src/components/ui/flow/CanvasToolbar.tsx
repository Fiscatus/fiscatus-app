import React, { useState } from 'react';
import { Plus, AlignCenter, RotateCcw, GitBranch, Grid3X3, List, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CanvasToolbarProps {
  totalEtapas: number;
  totalDias: number;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onZoomChange: (zoom: number) => void;
}

export default function CanvasToolbar({ 
  totalEtapas, 
  totalDias, 
  onViewModeChange, 
  onZoomChange
}: CanvasToolbarProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [zoom, setZoom] = useState([100]);

  const handleAdicionarCard = () => {
    // Toast: "Em breve"
    console.log('Adicionar card - Em breve');
  };

  const handleAlinhar = () => {
    // Toast: "Em breve"
    console.log('Alinhar - Em breve');
  };

  const handleResetarNumeracao = () => {
    // Toast: "Em breve"
    console.log('Resetar numeração - Em breve');
  };

  const handleMostrarDependencias = () => {
    // Toast: "Em breve"
    console.log('Mostrar dependências - Em breve');
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    onViewModeChange(mode);
  };

  const handleZoomChange = (value: number[]) => {
    setZoom(value);
    onZoomChange(value[0]);
  };


  return (
    <div className="fixed top-[var(--safe-top)] left-0 right-0 z-20 bg-white/95 backdrop-blur border-b shadow-[0_1px_0_0_rgba(15,23,42,.06)]">
      <div className="h-[var(--toolbar-h)] px-[var(--gutter)] flex items-center justify-between gap-2">
        {/* Botões à esquerda */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAdicionarCard}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Card
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicionar nova etapa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAlinhar}
                  className="h-8"
                >
                  <AlignCenter className="w-4 h-4 mr-1" />
                  Alinhar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Alinhar cards na grade</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetarNumeracao}
                  className="h-8"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Resetar numeração
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reconta os números sem alterar a ordem</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMostrarDependencias}
                  className="h-8"
                >
                  <GitBranch className="w-4 h-4 mr-1" />
                  Mostrar dependências
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exibe ligações entre etapas relacionadas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Direita: View mode + Zoom */}
        <div className="flex items-center gap-2">

          {/* View mode toggle */}
          <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange}>
            <ToggleGroupItem value="grid" className="h-8 w-8 p-0" aria-label="Visualização em grade">
              <Grid3X3 className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" className="h-8 w-8 p-0" aria-label="Visualização em lista">
              <List className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Zoom slider */}
          <div className="flex items-center gap-2">
            <ZoomOut className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <Slider
              value={zoom}
              onValueChange={handleZoomChange}
              max={110}
              min={90}
              step={5}
              className="w-20"
              aria-label="Zoom dos cards"
            />
            <ZoomIn className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span className="text-xs text-slate-600 w-8" aria-label={`Zoom atual: ${zoom[0]}%`}>
              {zoom[0]}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
