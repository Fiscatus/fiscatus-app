import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Settings, 
  X, 
  Plus,
  FileText,
  Users,
  MessageSquare,
  CheckSquare,
  Play,
  Eye
} from 'lucide-react';
import { StageTool, ModelStage } from '@/types/flow';
import { getToolMeta } from '@/lib/stageTools';
import { cn } from '@/lib/utils';

interface ToolBlockProps {
  tool: StageTool;
  stage: ModelStage;
  density: 'cozy' | 'compact';
  isDragging?: boolean;
  onRemove?: () => void;
  onConfigure?: () => void;
  children?: React.ReactNode;
}

const toolIcons = {
  management: FileText,
  main_form: FileText,
  stage_panel: CheckSquare,
  stage_actions: Play,
  comments: MessageSquare,
  signatures: Users,
  doc_view: Eye
};

export default function ToolBlock({
  tool,
  stage,
  density,
  isDragging = false,
  onRemove,
  onConfigure,
  children
}: ToolBlockProps) {
  const meta = getToolMeta(tool);
  const Icon = toolIcons[tool];
  
  const isCompact = density === 'compact';
  
  return (
    <div
      className={cn(
        "group relative bg-white border border-slate-200 rounded-lg transition-all",
        isDragging && "opacity-50 shadow-lg",
        isCompact ? "p-3" : "p-4"
      )}
    >
      {/* Header do bloco */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 rounded">
            <Icon className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h4 className={cn("font-medium text-slate-900", isCompact ? "text-sm" : "text-base")}>
              {meta.title}
            </h4>
            {!isCompact && (
              <p className="text-xs text-slate-500">{meta.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Handle para drag */}
          <div className="p-1 hover:bg-slate-100 rounded cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-slate-400" />
          </div>
          
          {/* Botão configurar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfigure}
            className="h-7 w-7 p-0"
          >
            <Settings className="w-3.5 h-3.5" />
          </Button>
          
          {/* Botão remover */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Conteúdo do bloco */}
      <div className="space-y-3">
        {children}
      </div>

      {/* Badges de status/contadores */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        {tool === 'management' && (
          <>
            {stage.toolConfig.management?.versions?.length ? (
              <Badge variant="secondary" className="text-xs">
                {stage.toolConfig.management.versions.length} versões
              </Badge>
            ) : null}
            {stage.toolConfig.management?.attachments?.length ? (
              <Badge variant="secondary" className="text-xs">
                {stage.toolConfig.management.attachments.length} anexos
              </Badge>
            ) : null}
          </>
        )}
        
        {tool === 'comments' && stage.toolConfig.comments?.list?.length ? (
          <Badge variant="secondary" className="text-xs">
            {stage.toolConfig.comments.list.length} comentários
          </Badge>
        ) : null}
        
        {tool === 'signatures' && stage.toolConfig.signatures?.signers?.length ? (
          <Badge variant="secondary" className="text-xs">
            {stage.toolConfig.signatures.signers.length} signatários
          </Badge>
        ) : null}
        
        {tool === 'stage_panel' && stage.toolConfig.stage_panel?.checklist?.length ? (
          <Badge variant="secondary" className="text-xs">
            {stage.toolConfig.stage_panel.checklist.filter(c => c.checked).length}/{stage.toolConfig.stage_panel.checklist.length} concluído
          </Badge>
        ) : null}
      </div>
    </div>
  );
}