export type StageTool = "management" | "main_form" | "stage_panel" | "stage_actions" | "comments" | "signatures" | "doc_view";

export type LayoutMode = "stack" | "50-50" | "60-40" | "40-60";

// Tipos para gerenciamento de balões (chips)
export type BalloonArea =
  | "main_form.requiredFields"   // chips dos campos obrigatórios (Formulário)
  | "stage_panel.checklist"      // itens do checklist (Painel)
  | "stage_actions.catalog"      // catálogo de ações exibidas como chips/botões
  | "management.tags";           // opcional (tags do bloco Gerenciamento)

export type BalloonItem = {
  id: string;              // uuid
  label: string;           // NOME DO BALÃO (o que o usuário quer editar)
  icon?: string;           // lucide icon name opcional
  color?: string;          // "slate" | "indigo" | "emerald" | ... (tailwind key)
  meta?: Record<string, any>; // extra leve (ex.: actionType para stage_actions)
};

export interface VersionItem { 
  id: string; 
  label: string; 
  createdAt: number; 
  author: string; 
}

export interface AttachmentItem { 
  id: string; 
  name: string; 
  sizeKB: number; 
  updatedAt: number; 
}

export interface CommentItem { 
  id: string; 
  author: string; 
  role?: string; 
  text: string; 
  createdAt: number; 
  mentions?: string[]; 
}

export interface ChecklistItem { 
  id: string; 
  label: string; 
  checked: boolean; 
}

export interface Signer { 
  id: string; 
  name: string; 
  role?: string; 
  status: "pending" | "signed" | "rejected"; 
}

export interface ToolConfig {
  management?: { 
    allowVersions?: boolean; 
    allowAttachments?: boolean; 
    versions?: VersionItem[];
    attachments?: AttachmentItem[];
    tags?: BalloonItem[]; // catálogo de tags
  };
  main_form?: { 
    schemaId?: string; 
    requiredFields?: string[]; 
    values?: Record<string, any>; 
    requiredFieldsCatalog?: BalloonItem[]; // catálogo de campos obrigatórios
  };
  stage_panel?: { 
    showSLA?: boolean; 
    startDate?: string; 
    dueDate?: string; 
    checklist: ChecklistItem[]; 
    progress?: number; 
    checklistCatalog?: BalloonItem[]; // catálogo de itens do checklist
  };
  stage_actions?: { 
    actions: ("send"|"finish"|"generate_doc")[]; 
    actionsCatalog?: BalloonItem[]; // catálogo de ações personalizáveis
  };
  comments?: { 
    allowMentions?: boolean; 
    list: CommentItem[]; 
  };
  signatures?: { 
    signers: Signer[]; 
  };
  doc_view?: { 
    previewMode: "modal" | "new_tab"; 
    fileName?: string; 
    sizeMB?: number; 
  };
}

export interface StageLayout {
  mode: LayoutMode;
  density: "cozy" | "compact";
  showGuides: boolean;
  scale: number; // 0.90..1.15
  columnOf?: Record<StageTool, "left"|"right">; // p/ modos 2 colunas
  orderStack?: StageTool[];        // para "stack"
  orderLeft?: StageTool[];         // para 2 colunas
  orderRight?: StageTool[];
}

export interface ModelStage {
  id: string;
  modelId: string;
  title: string;
  department?: string;
  days?: number;
  orderIndex: number;
  tools: StageTool[];
  toolsOrder: StageTool[]; // fallback simples
  toolConfig: ToolConfig;
  layout: StageLayout;
}

export interface FlowState {
  stages: Record<string, ModelStage[]>; // por modelId
  activeModelId: string | null;
  defaultTools: StageTool[];
  defaultToolsOrder: StageTool[];
  defaultToolConfig: ToolConfig;
}

export interface FlowActions {
  // Gerenciamento de etapas
  getStage: (id: string) => ModelStage | undefined;
  updateStage: (id: string, patch: Partial<ModelStage>) => void;

  // Ferramentas (ativar/desativar/ordenar)
  enableTool: (id: string, tool: StageTool) => void;
  disableTool: (id: string, tool: StageTool) => void;
  reorderTools: (id: string, order: StageTool[]) => void;

  // Layout e DnD interno entre colunas
  setLayout: (id: string, patch: Partial<StageLayout>) => void;
  moveToolInLayout: (stageId: string, tool: StageTool, dest: "left"|"right"|"stack", index: number) => void;

  // Conteúdos editáveis de cada ferramenta
  addVersion: (id: string, v: VersionItem) => void;
  removeVersion: (id: string, versionId: string) => void;
  addAttachment: (id: string, a: AttachmentItem) => void;
  removeAttachment: (id: string, attachmentId: string) => void;
  setFormValue: (id: string, key: string, value: any) => void;
  toggleChecklistItem: (id: string, itemId: string) => void;
  reorderChecklist: (id: string, newOrder: string[]) => void;
  setSLA: (id: string, startDate?: string, dueDate?: string) => void;
  setProgress: (id: string, pct: number) => void;
  addComment: (id: string, c: CommentItem) => void;
  deleteComment: (id: string, commentId: string) => void;
  addSigner: (id: string, s: Signer) => void;
  updateSigner: (id: string, signerId: string, patch: Partial<Signer>) => void;
  removeSigner: (id: string, signerId: string) => void;

  // Gerenciamento de balões (chips)
  addBalloon: (stageId: string, area: BalloonArea, item: Omit<BalloonItem,"id"> & { id?: string }) => void;
  renameBalloon: (stageId: string, area: BalloonArea, itemId: string, newLabel: string) => void;
  removeBalloon: (stageId: string, area: BalloonArea, itemId: string) => void;
  reorderBalloons: (stageId: string, area: BalloonArea, newOrderIds: string[]) => void;
  setBalloonIcon: (stageId: string, area: BalloonArea, itemId: string, icon?: string) => void;
  setBalloonColor: (stageId: string, area: BalloonArea, itemId: string, color?: string) => void;

  // Regras
  enforceDeps: (id: string) => void; // doc_view depende de signatures
  
  // Utilitários
  getStagesByModel: (modelId: string) => ModelStage[];
  setActiveModel: (modelId: string) => void;
}
