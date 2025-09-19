import { 
  Settings2, 
  SquarePen, 
  LayoutPanelTop, 
  Rocket, 
  MessageSquareText, 
  FileSignature, 
  Eye 
} from "lucide-react";
import { StageTool } from "@/types/flow";

export const TOOL_META: Record<StageTool, {
  label: string;
  Icon: any;
  desc: string;
  dependsOn?: StageTool;
  color?: string;
}> = {
  management: {
    label: "Gerenciamento",
    Icon: Settings2,
    desc: "Versões e anexos oficiais",
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  main_form: {
    label: "Formulário",
    Icon: SquarePen,
    desc: "Campos estruturados",
    color: "bg-green-50 text-green-700 border-green-200"
  },
  stage_panel: {
    label: "Painel da Etapa",
    Icon: LayoutPanelTop,
    desc: "Status, prazo, checklist e timeline",
    color: "bg-purple-50 text-purple-700 border-purple-200"
  },
  stage_actions: {
    label: "Ações da Etapa",
    Icon: Rocket,
    desc: "Enviar, concluir, gerar documento",
    color: "bg-orange-50 text-orange-700 border-orange-200"
  },
  comments: {
    label: "Comentários",
    Icon: MessageSquareText,
    desc: "Troca de mensagens e @menções",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200"
  },
  signatures: {
    label: "Assinaturas",
    Icon: FileSignature,
    desc: "Fluxo de assinaturas digitais",
    color: "bg-red-50 text-red-700 border-red-200"
  },
  doc_view: {
    label: "Visualização",
    Icon: Eye,
    desc: "Prévia do documento",
    dependsOn: "signatures",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200"
  }
};

// Função utilitária para obter metadados de uma ferramenta
export const getToolMeta = (tool: StageTool) => {
  return TOOL_META[tool];
};

// Função para verificar se uma ferramenta pode ser ativada
export const canActivateTool = (tool: StageTool, activeTools: StageTool[]): boolean => {
  const meta = getToolMeta(tool);
  
  if (meta.dependsOn) {
    return activeTools.includes(meta.dependsOn);
  }
  
  return true;
};

// Função para obter ferramentas disponíveis (todas menos as ativas)
export const getAvailableTools = (activeTools: StageTool[]): StageTool[] => {
  return Object.keys(TOOL_META) as StageTool[];
};

// Função para obter ferramentas ativas ordenadas
export const getOrderedActiveTools = (activeTools: StageTool[], toolsOrder: StageTool[]): StageTool[] => {
  // Retorna as ferramentas ativas na ordem especificada por toolsOrder
  return toolsOrder.filter(tool => activeTools.includes(tool));
};

// Função para validar ordem de ferramentas
export const validateToolsOrder = (tools: StageTool[], toolsOrder: StageTool[]): StageTool[] => {
  // Garante que toolsOrder seja um subconjunto de tools
  return toolsOrder.filter(tool => tools.includes(tool));
};
