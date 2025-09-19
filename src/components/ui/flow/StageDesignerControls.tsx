import React from 'react';
import { Button } from '@/components/ui/button';
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

interface StageDesignerControlsProps {
  stage: ModelStage;
  layout: {
    mode: LayoutMode;
    density: DensityMode;
    showGuides: boolean;
    scale: number;
  };
  isFullscreen: boolean;
  hasChanges: boolean;
  onLayoutChange: (layout: Partial<StageDesignerControlsProps['layout']>) => void;
  onFullscreenToggle: () => void;
  onRevert: () => void;
  onSave: () => void;
}

export default function StageDesignerControls({
  stage,
  layout,
  isFullscreen,
  hasChanges,
  onLayoutChange,
  onFullscreenToggle,
  onRevert,
  onSave
}: StageDesignerControlsProps) {
  
  const handleZoomIn = () => {
    const newScale = Math.min(layout.scale + 0.1, 2.0);
    onLayoutChange({ scale: newScale });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(layout.scale - 0.1, 0.5);
    onLayoutChange({ scale: newScale });
  };

  return (
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
        <Label htmlFor="show-guides" className="text-sm text-slate-600">
          Guias:
        </Label>
        <Switch
          id="show-guides"
          checked={layout.showGuides}
          onCheckedChange={(checked) => onLayoutChange({ showGuides: checked })}
        />
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={layout.scale <= 0.5}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm text-slate-600 min-w-[3rem] text-center">
          {Math.round(layout.scale * 100)}%
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={layout.scale >= 2.0}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Maximizar */}
      <Button
        variant="outline"
        size="sm"
        onClick={onFullscreenToggle}
        title={isFullscreen ? "Sair do modo tela cheia" : "Modo tela cheia"}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </Button>
    </div>
  );
}
