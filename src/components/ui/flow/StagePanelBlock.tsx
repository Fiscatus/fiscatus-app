import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  X, 
  GripVertical,
  Calendar,
  CheckSquare,
  Settings
} from 'lucide-react';
import { ModelStage, ChecklistItem } from '@/types/flow';
import { useFlowStore } from '@/stores/flowStore';
import { cn } from '@/lib/utils';
import BalloonManager from './BalloonManager';
import BalloonEditor from './BalloonEditor';
import BalloonChip from './BalloonChip';

interface StagePanelBlockProps {
  stage: ModelStage;
  density: 'cozy' | 'compact';
}

export default function StagePanelBlock({ stage, density }: StagePanelBlockProps) {
  const { 
    setProgress, 
    setSLA, 
    toggleChecklistItem, 
    reorderChecklist,
    updateToolConfig 
  } = useFlowStore();
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const stagePanel = stage.toolConfig.stage_panel;
  const checklist = stagePanel?.checklist || [];
  const checklistCatalog = stagePanel?.checklistCatalog || [];
  const progress = stagePanel?.progress || 0;
  const startDate = stagePanel?.startDate || '';
  const dueDate = stagePanel?.dueDate || '';
  
  const handleAddChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: `chk${Date.now()}`,
      label: 'Nova tarefa',
      checked: false
    };
    
    const newChecklist = [...checklist, newItem];
    updateToolConfig(stage.id, {
      stage_panel: {
        ...stagePanel,
        checklist: newChecklist
      }
    });
  };
  
  const handleRemoveChecklistItem = (itemId: string) => {
    const newChecklist = checklist.filter(item => item.id !== itemId);
    updateToolConfig(stage.id, {
      stage_panel: {
        ...stagePanel,
        checklist: newChecklist
      }
    });
  };
  
  const handleChecklistItemChange = (itemId: string, newLabel: string) => {
    const newChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, label: newLabel } : item
    );
    updateToolConfig(stage.id, {
      stage_panel: {
        ...stagePanel,
        checklist: newChecklist
      }
    });
  };
  
  const isCompact = density === 'compact';
  
  return (
    <div className="space-y-4">
      {/* Barra de Progresso */}
      <div>
        <Label htmlFor="progress" className="text-sm font-medium">
          Progresso: {progress}%
        </Label>
        <div className="mt-2">
          <input
            id="progress"
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(stage.id, parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      
      {/* SLA - Datas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="startDate" className="text-sm font-medium">
            Data Início
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setSLA(stage.id, e.target.value, dueDate)}
            className={isCompact ? "h-8" : "h-9"}
          />
        </div>
        <div>
          <Label htmlFor="dueDate" className="text-sm font-medium">
            Data Vencimento
          </Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setSLA(stage.id, startDate, e.target.value)}
            className={isCompact ? "h-8" : "h-9"}
          />
        </div>
      </div>
      
      {/* Seção de catálogo de checklist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-900">Catálogo de tarefas</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditorOpen(true)}
            className="h-6 w-6 p-0"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Exibição dos chips */}
        <div className="flex flex-wrap gap-2">
          {checklistCatalog.map((item) => (
            <BalloonChip key={item.id} item={item} />
          ))}
        </div>
        
        {checklistCatalog.length === 0 && (
          <p className="text-xs text-slate-500">Nenhuma tarefa no catálogo</p>
        )}
      </div>
      
      {/* Checklist */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Checklist</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddChecklistItem}
            className="h-7 px-2 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar
          </Button>
        </div>
        
        {checklist.length > 0 ? (
          <div className="space-y-2">
            {checklist.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 bg-slate-50 rounded border"
              >
                <div className="p-1 hover:bg-slate-200 rounded cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-3 h-3 text-slate-400" />
                </div>
                
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleChecklistItem(stage.id, item.id)}
                  className="rounded"
                />
                
                <Input
                  value={item.label}
                  onChange={(e) => handleChecklistItemChange(item.id, e.target.value)}
                  className={cn(
                    "flex-1 border-0 bg-transparent p-0 h-auto",
                    item.checked && "line-through text-slate-500"
                  )}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveChecklistItem(item.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-slate-500">
            Nenhuma tarefa adicionada
          </div>
        )}
      </div>
      
      {/* Resumo */}
      <div className="pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Tarefas concluídas:</span>
          <span>
            {checklist.filter(c => c.checked).length} / {checklist.length}
          </span>
        </div>
      </div>
      
      {/* Editor de balões */}
      <BalloonEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        stageId={stage.id}
        area="stage_panel.checklist"
        title="Catálogo de tarefas"
        description="Gerencie as tarefas disponíveis no checklist"
        items={checklistCatalog}
        allowIcon={true}
        allowColor={true}
      />
    </div>
  );
}
