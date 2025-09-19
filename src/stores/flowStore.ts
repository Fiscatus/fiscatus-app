import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FlowState, FlowActions, ModelStage, StageTool, ToolConfig, StageLayout } from '@/types/flow';

// Dados mockados iniciais baseados na página atual
const initialStages: Record<string, ModelStage[]> = {
  'modelo-fiscatus': [
    {
      id: 'stage-1',
      modelId: 'modelo-fiscatus',
      title: 'Elaboração do DFD',
      department: 'GSP - Gerência de Soluções e Projetos',
      days: 5,
      status: 'done',
      orderIndex: 1,
      tools: ['management', 'main_form', 'stage_panel', 'stage_actions', 'comments'],
      toolsOrder: ['management', 'main_form', 'stage_panel', 'stage_actions', 'comments'],
      toolConfig: {
        management: { allowVersions: true, allowAttachments: true },
        main_form: { schemaId: 'dfd-schema', requiredFields: ['objeto', 'justificativa'] },
        stage_panel: { showSLA: true, showChecklist: true, showTimeline: true },
        stage_actions: { actions: ['send', 'finish', 'generate_doc'] },
        comments: { allowMentions: true }
      }
    },
    {
      id: 'stage-2',
      modelId: 'modelo-fiscatus',
      title: 'Aprovação do DFD',
      department: 'GSL - Gerência de Suprimentos e Logística',
      days: 3,
      status: 'in_progress',
      orderIndex: 2,
      tools: ['management', 'stage_panel', 'comments', 'signatures'],
      toolsOrder: ['management', 'stage_panel', 'comments', 'signatures'],
      toolConfig: {
        management: { allowVersions: true, allowAttachments: true },
        stage_panel: { showSLA: true, showChecklist: true, showTimeline: true },
        comments: { allowMentions: true },
        signatures: { 
          signers: [
            { id: '1', name: 'João Silva', role: 'Gerente' },
            { id: '2', name: 'Maria Santos', role: 'Coordenador' }
          ]
        }
      }
    },
    {
      id: 'stage-3',
      modelId: 'modelo-fiscatus',
      title: 'Assinatura do DFD',
      department: 'GRH - Gerência de Recursos Humanos',
      days: 3,
      status: 'pending',
      orderIndex: 3,
      tools: ['management', 'signatures', 'doc_view', 'stage_panel'],
      toolsOrder: ['management', 'signatures', 'doc_view', 'stage_panel'],
      toolConfig: {
        management: { allowVersions: true, allowAttachments: true },
        signatures: { 
          signers: [
            { id: '3', name: 'Pedro Costa', role: 'Diretor' }
          ]
        },
        doc_view: { previewMode: 'modal' },
        stage_panel: { showSLA: true, showChecklist: true, showTimeline: true }
      }
    },
    {
      id: 'stage-4',
      modelId: 'modelo-fiscatus',
      title: 'Despacho do DFD',
      department: 'GUE - Gerência de Urgência e Emergência',
      days: 2,
      status: 'pending',
      orderIndex: 4,
      tools: ['management', 'stage_panel', 'stage_actions'],
      toolsOrder: ['management', 'stage_panel', 'stage_actions'],
      toolConfig: {
        management: { allowVersions: true, allowAttachments: true },
        stage_panel: { showSLA: true, showChecklist: true, showTimeline: true },
        stage_actions: { actions: ['send', 'finish'] }
      }
    }
  ]
};

const defaultTools: StageTool[] = ['management', 'main_form', 'stage_panel', 'stage_actions', 'comments'];
const defaultToolsOrder: StageTool[] = ['management', 'main_form', 'stage_panel', 'stage_actions', 'comments'];
const defaultToolConfig: ToolConfig = {
  management: { allowVersions: true, allowAttachments: true },
  main_form: { schemaId: 'default-schema', requiredFields: [] },
  stage_panel: { showSLA: true, showChecklist: true, showTimeline: true },
  stage_actions: { actions: ['send', 'finish', 'generate_doc'] },
  comments: { allowMentions: true }
};

export const useFlowStore = create<FlowState & FlowActions>()(
  persist(
    (set, get) => ({
      // Estado inicial
      stages: initialStages,
      activeModelId: 'modelo-fiscatus',
      defaultTools,
      defaultToolsOrder,
      defaultToolConfig,

      // Ações de gerenciamento de ferramentas
      enableTool: (stageId: string, tool: StageTool) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage) return;

        // Validação: doc_view só pode ser ativado se signatures estiver ativo
        if (tool === 'doc_view' && !stage.tools.includes('signatures')) {
          return; // Não permite ativar doc_view sem signatures
        }

        const newTools = [...stage.tools];
        if (!newTools.includes(tool)) {
          newTools.push(tool);
        }

        const newToolsOrder = [...stage.toolsOrder];
        if (!newToolsOrder.includes(tool)) {
          newToolsOrder.push(tool);
        }

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === stageId
                ? { ...s, tools: newTools, toolsOrder: newToolsOrder }
                : s
            )
          }
        });
      },

      disableTool: (stageId: string, tool: StageTool) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage) return;

        const newTools = stage.tools.filter(t => t !== tool);
        const newToolsOrder = stage.toolsOrder.filter(t => t !== tool);

        // Se desativando signatures, também desativar doc_view
        if (tool === 'signatures') {
          const finalTools = newTools.filter(t => t !== 'doc_view');
          const finalToolsOrder = newToolsOrder.filter(t => t !== 'doc_view');
          
          set({
            stages: {
              ...state.stages,
              [stage.modelId]: state.stages[stage.modelId].map(s =>
                s.id === stageId
                  ? { ...s, tools: finalTools, toolsOrder: finalToolsOrder }
                  : s
              )
            }
          });
        } else {
          set({
            stages: {
              ...state.stages,
              [stage.modelId]: state.stages[stage.modelId].map(s =>
                s.id === stageId
                  ? { ...s, tools: newTools, toolsOrder: newToolsOrder }
                  : s
              )
            }
          });
        }
      },

      reorderTools: (stageId: string, newOrder: StageTool[]) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage) return;

        // Garantir que newOrder seja um subconjunto de tools
        const validOrder = newOrder.filter(tool => stage.tools.includes(tool));

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === stageId
                ? { ...s, toolsOrder: validOrder }
                : s
            )
          }
        });
      },

      updateToolConfig: (stageId: string, partial: ToolConfig) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage) return;

        const newToolConfig = {
          ...stage.toolConfig,
          ...partial
        };

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === stageId
                ? { ...s, toolConfig: newToolConfig }
                : s
            )
          }
        });
      },

      // Ações de gerenciamento de etapas
      reorderStages: (modelId: string, newOrder: ModelStage[]) => {
        const state = get();
        set({
          stages: {
            ...state.stages,
            [modelId]: newOrder
          }
        });
      },

      updateStage: (stageId: string, updates: Partial<ModelStage>) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage) return;

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === stageId
                ? { ...s, ...updates }
                : s
            )
          }
        });
      },

      // Ações de gerenciamento de modelos
      setActiveModel: (modelId: string) => {
        set({ activeModelId: modelId });
      },

      setDefaultTools: (tools: StageTool[], order: StageTool[], config: ToolConfig) => {
        set({
          defaultTools: tools,
          defaultToolsOrder: order,
          defaultToolConfig: config
        });
      },

      // Ações de layout do designer
      setStageLayout: (stageId: string, layout: StageLayout) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage) return;

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === stageId
                ? { ...s, layout }
                : s
            )
          }
        });
      },

      moveToolToColumn: (stageId: string, tool: StageTool, column: 'left' | 'right' | 'stack', index?: number) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage || !stage.layout) return;

        const layout = { ...stage.layout };
        
        // Implementar lógica de movimentação entre colunas
        // TODO: Implementar completamente
        
        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === stageId
                ? { ...s, layout }
                : s
            )
          }
        });
      },

      // Utilitários
      getStage: (stageId: string) => {
        const state = get();
        for (const modelStages of Object.values(state.stages)) {
          const stage = modelStages.find(s => s.id === stageId);
          if (stage) return stage;
        }
        return undefined;
      },

      getStagesByModel: (modelId: string) => {
        const state = get();
        return state.stages[modelId] || [];
      }
    }),
    {
      name: 'flow-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        stages: state.stages,
        activeModelId: state.activeModelId,
        defaultTools: state.defaultTools,
        defaultToolsOrder: state.defaultToolsOrder,
        defaultToolConfig: state.defaultToolConfig
      }),
      onRehydrateStorage: () => (state) => {
        // Tratar hidratação com try/catch
        try {
          if (state) {
            console.log('Flow store rehydrated successfully');
          }
        } catch (error) {
          console.error('Error rehydrating flow store:', error);
        }
      }
    }
  )
);
