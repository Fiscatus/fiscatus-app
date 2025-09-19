import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Save, 
  Grid3X3, 
  Layers, 
  Eye,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { ModelStage, LayoutMode, DensityMode } from '@/types/flow';

interface StageDesignerHeaderProps {
  stage: ModelStage;
  layout: {
    mode: LayoutMode;
    density: DensityMode;
    showGuides: boolean;
    scale: number;
  };
  isFullscreen: boolean;
  hasChanges: boolean;
  onLayoutChange: (layout: Partial<StageDesignerHeaderProps['layout']>) => void;
  onFullscreenToggle: () => void;
  onRevert: () => void;
  onSave: () => void;
}

export default function StageDesignerHeader({
  stage,
  layout,
  isFullscreen,
  hasChanges,
  onLayoutChange,
  onFullscreenToggle,
  onRevert,
  onSave
}: StageDesignerHeaderProps) {
  const getStatusBadge = (status: ModelStage['status']) => {
    switch (status) {
      case 'done':
        return <Badge className="bg-emerald-100 text-emerald-700">Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-indigo-100 text-indigo-700">Em Andamento</Badge>;
      case 'pending':
        return <Badge className="bg-slate-100 text-slate-700">Pendente</Badge>;
    }
  };

  const handleScaleChange = (delta: number) => {
    const newScale = Math.max(0.9, Math.min(1.15, layout.scale + delta));
    onLayoutChange({ scale: newScale });
  };

  return (
    <header className="sticky top-0 h-14 bg-white/95 backdrop-blur border-b px-4 md:px-6 flex items-center justify-between z-10">
      {/* Esquerda: Título e status */}
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold">
          Ver Detalhes · {stage.title}
        </h2>
      </div>

      {/* Centro: Controles do designer */}
      <div className="flex items-center gap-4">
        {/* Layout presets */}
        <div className="flex items-center gap-2">
          <Label htmlFor="layout-mode" className="text-sm text-slate-600">
            Layout:
          </Label>
          <Select
            value={layout.mode}
            onValueChange={(value: LayoutMode) => onLayoutChange({ mode: value })}
          >
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stack">Empilhado</SelectItem>
              <SelectItem value="50-50">50/50</SelectItem>
              <SelectItem value="60-40">60/40</SelectItem>
              <SelectItem value="40-60">40/60</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Densidade */}
        <div className="flex items-center gap-2">
          <Label htmlFor="density" className="text-sm text-slate-600">
            Densidade:
          </Label>
          <Select
            value={layout.density}
            onValueChange={(value: DensityMode) => onLayoutChange({ density: value })}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cozy">Cozy</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Molduras */}
        <div className="flex items-center gap-2">
          <Switch
            id="show-guides"
            checked={layout.showGuides}
            onCheckedChange={(checked) => onLayoutChange({ showGuides: checked })}
          />
          <Label htmlFor="show-guides" className="text-sm text-slate-600">
            Molduras
          </Label>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleScaleChange(-0.05)}
            disabled={layout.scale <= 0.9}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600 min-w-[3rem] text-center">
            {Math.round(layout.scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleScaleChange(0.05)}
            disabled={layout.scale >= 1.15}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Direita: Ações */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onFullscreenToggle}
          aria-label={isFullscreen ? "Voltar para split-view" : "Maximizar card"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={onRevert}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reverter
        </Button>
        <Button size="sm" onClick={onSave} disabled={!hasChanges}>
          <Save className="h-4 w-4 mr-1" />
          Salvar
        </Button>
      </div>
    </header>
  );
}
