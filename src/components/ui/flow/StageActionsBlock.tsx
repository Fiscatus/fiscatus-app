import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Send, 
  CheckCircle, 
  FileText,
  Play,
  Settings
} from 'lucide-react';
import { ModelStage } from '@/types/flow';
import { useFlowStore } from '@/stores/flowStore';
import BalloonManager from './BalloonManager';
import BalloonEditor from './BalloonEditor';
import BalloonChip from './BalloonChip';

interface StageActionsBlockProps {
  stage: ModelStage;
  density: 'cozy' | 'compact';
}

const availableActions = [
  { key: 'send', label: 'Enviar', icon: Send, description: 'Enviar para próxima etapa' },
  { key: 'finish', label: 'Finalizar', icon: CheckCircle, description: 'Marcar como concluído' },
  { key: 'generate_doc', label: 'Gerar Documento', icon: FileText, description: 'Gerar documento final' }
];

export default function StageActionsBlock({ stage, density }: StageActionsBlockProps) {
  const { updateToolConfig } = useFlowStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const stageActions = stage.toolConfig.stage_actions;
  const actions = stageActions?.actions || [];
  const actionsCatalog = stageActions?.actionsCatalog || [];
  
  const handleActionToggle = (actionKey: string) => {
    const newActions = actions.includes(actionKey as any)
      ? actions.filter(a => a !== actionKey)
      : [...actions, actionKey as any];
    
    updateToolConfig(stage.id, {
      stage_actions: {
        actions: newActions
      }
    });
  };
  
  const isCompact = density === 'compact';
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600 mb-3">
        Ações disponíveis para esta etapa
      </div>
      
      {/* Seção de catálogo de ações */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-900">Catálogo de ações</h4>
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
          {actionsCatalog.map((item) => (
            <BalloonChip key={item.id} item={item} />
          ))}
        </div>
        
        {actionsCatalog.length === 0 && (
          <p className="text-xs text-slate-500">Nenhuma ação no catálogo</p>
        )}
      </div>
      
      {/* Seleção de ações */}
      <div className="space-y-3">
        {availableActions.map((action) => {
          const isSelected = actions.includes(action.key as any);
          const Icon = action.icon;
          
          return (
            <div key={action.key} className="flex items-center gap-3">
              <input
                type="checkbox"
                id={action.key}
                checked={isSelected}
                onChange={() => handleActionToggle(action.key)}
                className="rounded"
              />
              <Label htmlFor={action.key} className="flex items-center gap-2 cursor-pointer">
                <Icon className="w-4 h-4 text-slate-600" />
                <div>
                  <span className="text-sm font-medium">{action.label}</span>
                  {!isCompact && (
                    <p className="text-xs text-slate-500">{action.description}</p>
                  )}
                </div>
              </Label>
            </div>
          );
        })}
      </div>
      
      {/* Preview dos botões */}
      {actions.length > 0 && (
        <div className="pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 mb-2">Preview dos botões:</div>
          <div className="flex flex-wrap gap-2">
            {actions.map((actionKey) => {
              const action = availableActions.find(a => a.key === actionKey);
              if (!action) return null;
              
              const Icon = action.icon;
              
              return (
                <Button
                  key={actionKey}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  disabled
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Resumo */}
      <div className="pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Ações selecionadas:</span>
          <span>{actions.length} / {availableActions.length}</span>
        </div>
      </div>
      
      {/* Editor de balões */}
      <BalloonEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        stageId={stage.id}
        area="stage_actions.catalog"
        title="Catálogo de ações"
        description="Gerencie as ações disponíveis para esta etapa"
        items={actionsCatalog}
        allowIcon={true}
        allowColor={true}
      />
    </div>
  );
}
