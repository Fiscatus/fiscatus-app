export type StageStatus = "pending" | "in_progress" | "done";

export type StageTool =
  | "management"
  | "main_form"
  | "stage_panel"
  | "stage_actions"
  | "comments"
  | "signatures"
  | "doc_view";

export type LayoutMode = 'stack' | '50-50' | '60-40' | '40-60';
export type DensityMode = 'cozy' | 'compact';

export interface StageLayout {
  mode: LayoutMode;
  columnOf?: Record<StageTool, 'left' | 'right'>;
  orderLeft?: StageTool[];
  orderRight?: StageTool[];
  orderStack?: StageTool[];
  density: DensityMode;
  showGuides: boolean;
  scale: number; // 0.9..1.15
}

export interface ToolConfig {
  management?: { 
    allowVersions?: boolean; 
    allowAttachments?: boolean; 
  };
  main_form?: { 
    schemaId?: string; 
    requiredFields?: string[]; 
  };
  stage_panel?: { 
    showSLA?: boolean; 
    showChecklist?: boolean; 
    showTimeline?: boolean; 
  };
  stage_actions?: { 
    actions?: ("send" | "finish" | "generate_doc")[]; 
  };
  comments?: { 
    allowMentions?: boolean; 
  };
  signatures?: { 
    signers?: { id: string; name: string; role?: string }[]; 
  };
  doc_view?: { 
    previewMode?: "modal" | "new_tab"; 
  };
}

export interface ModelStage {
  id: string;
  modelId: string;
  title: string;
  department?: string;
  days?: number;
  status: StageStatus;
  orderIndex: number;
  tools: StageTool[];        // ferramentas ativas
  toolsOrder: StageTool[];   // ordem visual dos chips
  toolConfig?: ToolConfig;   // configurações por ferramenta
  layout?: StageLayout;      // layout do designer
}

export interface FlowState {
  stages: Record<string, ModelStage[]>; // por modelId
  activeModelId: string | null;
  defaultTools: StageTool[];
  defaultToolsOrder: StageTool[];
  defaultToolConfig: ToolConfig;
}

export interface FlowActions {
  // Gerenciamento de ferramentas
  enableTool: (stageId: string, tool: StageTool) => void;
  disableTool: (stageId: string, tool: StageTool) => void;
  reorderTools: (stageId: string, newOrder: StageTool[]) => void;
  updateToolConfig: (stageId: string, partial: ToolConfig) => void;
  
  // Gerenciamento de etapas
  reorderStages: (modelId: string, newOrder: ModelStage[]) => void;
  updateStage: (stageId: string, updates: Partial<ModelStage>) => void;
  
  // Gerenciamento de layout do designer
  setStageLayout: (stageId: string, layout: StageLayout) => void;
  moveToolToColumn: (stageId: string, tool: StageTool, column: 'left' | 'right' | 'stack', index?: number) => void;
  
  // Gerenciamento de modelos
  setActiveModel: (modelId: string) => void;
  setDefaultTools: (tools: StageTool[], order: StageTool[], config: ToolConfig) => void;
  
  // Utilitários
  getStage: (stageId: string) => ModelStage | undefined;
  getStagesByModel: (modelId: string) => ModelStage[];
}
