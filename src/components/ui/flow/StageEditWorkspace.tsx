import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ModelStage, StageTool, ToolConfig, LayoutMode, DensityMode, StageLayout } from '@/types/flow';
import { useFlowStore } from '@/stores/flowStore';
import { useToast } from '@/hooks/use-toast';
import StageDesignerControls from './StageDesignerControls';
import StageCardDesigner from './StageCardDesigner';
import StageEditTabs from './StageEditTabs';

interface StageEditWorkspaceProps {
  stage: ModelStage | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'details' | 'edit';
}

export default function StageEditWorkspace({ 
  stage, 
  isOpen, 
  onClose, 
  mode = 'edit' 
}: StageEditWorkspaceProps) {
  const { 
    updateStage, 
    enableTool, 
    disableTool, 
    reorderTools, 
    updateToolConfig,
    setLayout,
    moveToolInLayout,
    enforceDeps
  } = useFlowStore();
  const { toast } = useToast();
  
  // Estado local para mudanças não salvas
  const [localStage, setLocalStage] = useState<ModelStage | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Estado do layout do designer
  const [designerLayout, setDesignerLayout] = useState<StageLayout>(() => {
    const saved = localStorage.getItem(`stage.layout.${stage?.id}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      mode: 'stack' as LayoutMode,
      density: 'cozy' as DensityMode,
      showGuides: false,
      scale: 1.0,
      orderStack: stage?.tools || []
    };
  });

  // Sincronizar estado local com stage prop
  useEffect(() => {
    if (stage && isOpen) {
      setLocalStage({ ...stage });
      setHasChanges(false);
      
      // Carregar layout salvo ou usar padrão
      const saved = localStorage.getItem(`stage.layout.${stage.id}`);
      if (saved) {
        setDesignerLayout(JSON.parse(saved));
      } else {
        setDesignerLayout({
          mode: 'stack',
          density: 'cozy',
          showGuides: false,
          scale: 1.0,
          orderStack: stage.tools
        });
      }
    }
  }, [stage, isOpen]);

  // Salvar layout no localStorage
  useEffect(() => {
    if (localStage && designerLayout) {
      localStorage.setItem(`stage.layout.${localStage.id}`, JSON.stringify(designerLayout));
    }
  }, [designerLayout, localStage]);


  // Scroll para o topo do preview quando abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        document.getElementById('stage-preview-pane')?.scrollTo({ top: 0, behavior: 'instant' });
      }, 100);
    }
  }, [isOpen]);

  // Hotkeys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc = fechar
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
      
      // Ctrl/Cmd+S = salvar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      // Cmd/Ctrl+← / → = alternar tabs (implementar depois)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        // TODO: Implementar alternância de tabs
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasChanges]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      const confirmed = window.confirm('Você tem alterações não salvas. Deseja realmente fechar?');
      if (!confirmed) return;
    }
    onClose();
  }, [hasChanges, onClose]);

  const handleSave = useCallback(() => {
    if (!localStage) return;

    updateStage(localStage.id, {
      title: localStage.title,
      department: localStage.department,
      days: localStage.days,
      status: localStage.status,
      tools: localStage.tools,
      toolsOrder: localStage.toolsOrder,
      toolConfig: localStage.toolConfig
    });

    setHasChanges(false);
    toast({
      title: "Etapa salva",
      description: "As alterações foram salvas com sucesso.",
    });
  }, [localStage, updateStage, toast]);

  const handleRevert = useCallback(() => {
    if (stage) {
      setLocalStage({ ...stage });
      setHasChanges(false);
      toast({
        title: "Alterações revertidas",
        description: "O estado original foi restaurado.",
      });
    }
  }, [stage, toast]);

  const handleStageChange = useCallback((patch: Partial<ModelStage>) => {
    if (!localStage) return;
    const updatedStage = { ...localStage, ...patch };
    setLocalStage(updatedStage);
    updateStage(localStage.id, patch); // Sincronizar com o store
    setHasChanges(true);
  }, [localStage, updateStage]);

  const handleToolEnable = useCallback((tool: StageTool) => {
    if (!localStage) return;
    enableTool(localStage.id, tool);
    enforceDeps(localStage.id); // Aplicar regras de dependência
    setHasChanges(true);
  }, [localStage, enableTool, enforceDeps]);

  const handleToolDisable = useCallback((tool: StageTool) => {
    if (!localStage) return;
    disableTool(localStage.id, tool);
    setHasChanges(true);
  }, [localStage, disableTool]);

  const handleToolsReorder = useCallback((order: StageTool[]) => {
    if (!localStage) return;
    reorderTools(localStage.id, order);
    setHasChanges(true);
  }, [localStage, reorderTools]);

  const handleToolConfigUpdate = useCallback((config: ToolConfig) => {
    if (!localStage) return;
    updateToolConfig(localStage.id, config);
    setHasChanges(true);
  }, [localStage, updateToolConfig]);

  const getStatusLabel = (status: ModelStage['status']) => {
    switch (status) {
      case 'done': return 'Concluído';
      case 'in_progress': return 'Em Andamento';
      case 'pending': return 'Pendente';
    }
  };

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

  const handleLayoutChange = useCallback((layoutPatch: Partial<StageLayout>) => {
    if (!localStage) return;
    setLayout(localStage.id, layoutPatch);
    setDesignerLayout(prev => ({ ...prev, ...layoutPatch }));
    setHasChanges(true);
  }, [localStage, setLayout]);

  const handleToolRemove = useCallback((tool: StageTool) => {
    if (!localStage) return;
    disableTool(localStage.id, tool);
    enforceDeps(localStage.id); // Aplicar regras de dependência
    setHasChanges(true);
  }, [localStage, disableTool, enforceDeps]);

  const handleToolConfigure = useCallback((tool: StageTool) => {
    // TODO: Implementar foco na aba de configurações
    console.log('Configurar ferramenta:', tool);
  }, []);

  if (!isOpen || !localStage) return null;

  return (
    <div
      className="
        fixed inset-0 z-[60]
        grid
        grid-rows-[56px,1fr]
        grid-cols-1 md:grid-cols-2
        md:[grid-template-columns:50%_50%]
        bg-slate-50
      "
    >
      {/* HEADER STICKY (span nas 2 colunas) */}
      <header className="col-span-2 bg-white/95 backdrop-blur border-b">
        <div className="h-[56px] px-4 lg:px-6 flex items-center justify-between gap-2">
          {/* à esquerda: título + status */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">
              {localStage.title}
            </h1>
            {getStatusBadge(localStage.status)}
          </div>
          
          {/* ao centro: layout/densidade/molduras/zoom */}
          <div className="flex items-center gap-2">
            <StageDesignerControls
              stage={localStage}
              layout={designerLayout}
              isFullscreen={isFullscreen}
              hasChanges={hasChanges}
              onLayoutChange={handleLayoutChange}
              onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
              onRevert={handleRevert}
              onSave={handleSave}
            />
          </div>
          
          {/* à direita: maximizar, reverter, salvar */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevert}
              disabled={!hasChanges}
            >
              Reverter
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Salvar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* PANE ESQUERDO: PREVIEW */}
      <section
        id="preview-pane"
        className="
          row-start-2 col-start-1
          h-full w-full
          overflow-auto
          px-4 lg:px-6 py-4
          bg-slate-50
        "
      >
        {/* Card expandido deve usar toda a largura do PANE, sem max-width */}
        <StageCardDesigner
          stage={localStage}
          layout={designerLayout}
          onLayoutChange={handleLayoutChange}
          onToolRemove={handleToolRemove}
          onToolConfigure={handleToolConfigure}
          className="h-full w-full"
        />
      </section>

      {/* PANE DIREITO: CONFIG */}
      <aside
        id="config-pane"
        className="
          row-start-2 col-start-2
          h-full w-full
          overflow-auto
          border-l bg-white
        "
      >
        <StageEditTabs
          stage={localStage}
          onPatch={handleStageChange}
          onEnableTool={handleToolEnable}
          onDisableTool={handleToolDisable}
          onReorderTools={handleToolsReorder}
          onUpdateToolConfig={handleToolConfigUpdate}
          readOnly={mode === 'details'}
        />
      </aside>
    </div>
  );
}
