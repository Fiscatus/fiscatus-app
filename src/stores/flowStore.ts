import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  FlowState, 
  FlowActions, 
  ModelStage, 
  StageTool, 
  ToolConfig, 
  StageLayout,
  VersionItem,
  AttachmentItem,
  CommentItem,
  ChecklistItem,
  Signer,
  BalloonArea,
  BalloonItem
} from '@/types/flow';

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
        management: { 
          allowVersions: true, 
          allowAttachments: true,
          versions: [
            { id: 'v1', label: 'v1.0', createdAt: Date.now() - 86400000, author: 'João Silva' },
            { id: 'v2', label: 'v1.1', createdAt: Date.now() - 43200000, author: 'Maria Santos' }
          ],
          attachments: [
            { id: 'att1', name: 'documento-base.pdf', sizeKB: 1024, updatedAt: Date.now() - 3600000 }
          ]
        },
        main_form: { 
          schemaId: 'dfd-schema', 
          requiredFields: ['objeto', 'justificativa'],
          values: {
            objeto: 'Contratação de serviços de TI',
            justificativa: 'Necessidade de modernização dos sistemas'
          },
          requiredFieldsCatalog: [
            { id: 'req1', label: 'Objeto', icon: 'FileText', color: 'indigo' },
            { id: 'req2', label: 'Justificativa', icon: 'AlertCircle', color: 'emerald' }
          ]
        },
        stage_panel: { 
          showSLA: true, 
          startDate: '2024-01-15',
          dueDate: '2024-01-20',
          checklist: [
            { id: 'chk1', label: 'Revisar documentação', checked: true },
            { id: 'chk2', label: 'Validar orçamento', checked: false },
            { id: 'chk3', label: 'Aprovar cronograma', checked: true }
          ],
          checklistCatalog: [
            { id: 'cat1', label: 'Revisar documentação', icon: 'FileText', color: 'slate' },
            { id: 'cat2', label: 'Validar orçamento', icon: 'CheckCircle', color: 'emerald' },
            { id: 'cat3', label: 'Aprovar cronograma', icon: 'Calendar', color: 'indigo' }
          ],
          progress: 75
        },
        stage_actions: { 
          actions: ['send', 'finish', 'generate_doc'],
          actionsCatalog: [
            { id: 'act1', label: 'Enviar para análise', icon: 'Send', color: 'indigo', meta: { actionType: 'send' } },
            { id: 'act2', label: 'Finalizar processo', icon: 'CheckCircle', color: 'emerald', meta: { actionType: 'finish' } },
            { id: 'act3', label: 'Gerar documento', icon: 'FileText', color: 'amber', meta: { actionType: 'generate_doc' } }
          ]
        },
        comments: { 
          allowMentions: true,
          list: [
            { id: 'c1', author: 'Ana Costa', role: 'Analista', text: 'Documento revisado e aprovado', createdAt: Date.now() - 7200000 },
            { id: 'c2', author: 'Carlos Lima', role: 'Gerente', text: 'Aguardando aprovação final', createdAt: Date.now() - 3600000 }
          ]
        }
      },
      layout: {
        mode: 'stack',
        density: 'cozy',
        showGuides: false,
        scale: 1.0,
        orderStack: ['management', 'main_form', 'stage_panel', 'stage_actions', 'comments']
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
        management: { 
          allowVersions: true, 
          allowAttachments: true,
          versions: [],
          attachments: []
        },
        stage_panel: { 
          showSLA: true, 
          startDate: '2024-01-20',
          dueDate: '2024-01-23',
          checklist: [
            { id: 'chk4', label: 'Analisar proposta', checked: true },
            { id: 'chk5', label: 'Verificar conformidade', checked: false }
          ],
          progress: 50
        },
        comments: { 
          allowMentions: true,
          list: []
        },
        signatures: { 
          signers: [
            { id: '1', name: 'João Silva', role: 'Gerente', status: 'signed' },
            { id: '2', name: 'Maria Santos', role: 'Coordenador', status: 'pending' }
          ]
        }
      },
      layout: {
        mode: '50-50',
        density: 'cozy',
        showGuides: false,
        scale: 1.0,
        orderLeft: ['management', 'stage_panel'],
        orderRight: ['comments', 'signatures']
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
        management: { 
          allowVersions: true, 
          allowAttachments: true,
          versions: [],
          attachments: []
        },
        signatures: { 
          signers: [
            { id: '3', name: 'Pedro Costa', role: 'Diretor', status: 'pending' }
          ]
        },
        doc_view: { 
          previewMode: 'modal',
          fileName: 'DFD_Final.pdf',
          sizeMB: 2.5
        },
        stage_panel: { 
          showSLA: true, 
          startDate: '2024-01-23',
          dueDate: '2024-01-26',
          checklist: [
            { id: 'chk6', label: 'Assinar documento', checked: false }
          ],
          progress: 0
        }
      },
      layout: {
        mode: 'stack',
        density: 'cozy',
        showGuides: false,
        scale: 1.0,
        orderStack: ['management', 'signatures', 'doc_view', 'stage_panel']
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
        management: { 
          allowVersions: true, 
          allowAttachments: true,
          versions: [],
          attachments: []
        },
        stage_panel: { 
          showSLA: true, 
          startDate: '2024-01-26',
          dueDate: '2024-01-28',
          checklist: [
            { id: 'chk7', label: 'Finalizar processo', checked: false }
          ],
          progress: 0
        },
        stage_actions: { actions: ['send', 'finish'] }
      },
      layout: {
        mode: 'stack',
        density: 'cozy',
        showGuides: false,
        scale: 1.0,
        orderStack: ['management', 'stage_panel', 'stage_actions']
      }
    }
  ]
};

const defaultTools: StageTool[] = ['management', 'main_form', 'stage_panel', 'stage_actions', 'comments'];
const defaultToolsOrder: StageTool[] = ['management', 'main_form', 'stage_panel', 'stage_actions', 'comments'];
const defaultToolConfig: ToolConfig = {
  management: { 
    allowVersions: true, 
    allowAttachments: true,
    versions: [],
    attachments: []
  },
  main_form: { 
    schemaId: 'default-schema', 
    requiredFields: [],
    values: {}
  },
  stage_panel: { 
    showSLA: true, 
    startDate: undefined,
    dueDate: undefined,
    checklist: [],
    progress: 0
  },
  stage_actions: { actions: ['send', 'finish', 'generate_doc'] },
  comments: { 
    allowMentions: true,
    list: []
  },
  signatures: {
    signers: []
  },
  doc_view: {
    previewMode: 'modal',
    fileName: undefined,
    sizeMB: undefined
  }
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

      // Layout e DnD interno entre colunas
      setLayout: (id: string, patch: Partial<StageLayout>) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage) return;

        const newLayout = { ...stage.layout, ...patch };

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { ...s, layout: newLayout }
                : s
            )
          }
        });
      },

      moveToolInLayout: (stageId: string, tool: StageTool, dest: "left"|"right"|"stack", index: number) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage || !stage.layout) return;

        const layout = { ...stage.layout };
        
        // Remover tool de todas as posições
        if (layout.orderStack) {
          layout.orderStack = layout.orderStack.filter(t => t !== tool);
        }
        if (layout.orderLeft) {
          layout.orderLeft = layout.orderLeft.filter(t => t !== tool);
        }
        if (layout.orderRight) {
          layout.orderRight = layout.orderRight.filter(t => t !== tool);
        }

        // Adicionar na nova posição
        if (dest === 'stack') {
          layout.orderStack = layout.orderStack || [];
          layout.orderStack.splice(index, 0, tool);
        } else if (dest === 'left') {
          layout.orderLeft = layout.orderLeft || [];
          layout.orderLeft.splice(index, 0, tool);
        } else if (dest === 'right') {
          layout.orderRight = layout.orderRight || [];
          layout.orderRight.splice(index, 0, tool);
        }

        // Atualizar columnOf
        if (layout.columnOf) {
          layout.columnOf[tool] = dest === 'stack' ? 'left' : dest;
        }

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

      // Conteúdos editáveis de cada ferramenta
      addVersion: (id: string, v: VersionItem) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.management) return;

        const versions = stage.toolConfig.management.versions || [];
        const newVersions = [...versions, v];

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      management: {
                        ...s.toolConfig.management,
                        versions: newVersions
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      removeVersion: (id: string, versionId: string) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.management) return;

        const versions = stage.toolConfig.management.versions || [];
        const newVersions = versions.filter(v => v.id !== versionId);

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      management: {
                        ...s.toolConfig.management,
                        versions: newVersions
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      addAttachment: (id: string, a: AttachmentItem) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.management) return;

        const attachments = stage.toolConfig.management.attachments || [];
        const newAttachments = [...attachments, a];

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      management: {
                        ...s.toolConfig.management,
                        attachments: newAttachments
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      removeAttachment: (id: string, attachmentId: string) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.management) return;

        const attachments = stage.toolConfig.management.attachments || [];
        const newAttachments = attachments.filter(a => a.id !== attachmentId);

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      management: {
                        ...s.toolConfig.management,
                        attachments: newAttachments
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      setFormValue: (id: string, key: string, value: any) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.main_form) return;

        const values = stage.toolConfig.main_form.values || {};
        const newValues = { ...values, [key]: value };

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      main_form: {
                        ...s.toolConfig.main_form,
                        values: newValues
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      toggleChecklistItem: (id: string, itemId: string) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.stage_panel) return;

        const checklist = stage.toolConfig.stage_panel.checklist || [];
        const newChecklist = checklist.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        );

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      stage_panel: {
                        ...s.toolConfig.stage_panel,
                        checklist: newChecklist
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      reorderChecklist: (id: string, newOrder: string[]) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.stage_panel) return;

        const checklist = stage.toolConfig.stage_panel.checklist || [];
        const reorderedChecklist = newOrder
          .map(id => checklist.find(item => item.id === id))
          .filter(Boolean) as ChecklistItem[];

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      stage_panel: {
                        ...s.toolConfig.stage_panel,
                        checklist: reorderedChecklist
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      setSLA: (id: string, startDate?: string, dueDate?: string) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.stage_panel) return;

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      stage_panel: {
                        ...s.toolConfig.stage_panel,
                        startDate,
                        dueDate
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      setProgress: (id: string, pct: number) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.stage_panel) return;

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      stage_panel: {
                        ...s.toolConfig.stage_panel,
                        progress: pct
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      addComment: (id: string, c: CommentItem) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.comments) return;

        const list = stage.toolConfig.comments.list || [];
        const newList = [...list, c];

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      comments: {
                        ...s.toolConfig.comments,
                        list: newList
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      deleteComment: (id: string, commentId: string) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.comments) return;

        const list = stage.toolConfig.comments.list || [];
        const newList = list.filter(c => c.id !== commentId);

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      comments: {
                        ...s.toolConfig.comments,
                        list: newList
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      addSigner: (id: string, s: Signer) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.signatures) return;

        const signers = stage.toolConfig.signatures.signers || [];
        const newSigners = [...signers, s];

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      signatures: {
                        ...s.toolConfig.signatures,
                        signers: newSigners
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      updateSigner: (id: string, signerId: string, patch: Partial<Signer>) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.signatures) return;

        const signers = stage.toolConfig.signatures.signers || [];
        const newSigners = signers.map(s => 
          s.id === signerId ? { ...s, ...patch } : s
        );

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      signatures: {
                        ...s.toolConfig.signatures,
                        signers: newSigners
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      removeSigner: (id: string, signerId: string) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage || !stage.toolConfig.signatures) return;

        const signers = stage.toolConfig.signatures.signers || [];
        const newSigners = signers.filter(s => s.id !== signerId);

        set({
          stages: {
            ...state.stages,
            [stage.modelId]: state.stages[stage.modelId].map(s =>
              s.id === id
                ? { 
                    ...s, 
                    toolConfig: {
                      ...s.toolConfig,
                      signatures: {
                        ...s.toolConfig.signatures,
                        signers: newSigners
                      }
                    }
                  }
                : s
            )
          }
        });
      },

      // Regras
      enforceDeps: (id: string) => {
        const state = get();
        const stage = state.getStage(id);
        if (!stage) return;

        // doc_view só pode existir se signatures estiver ativa
        if (!stage.tools.includes('signatures') && stage.tools.includes('doc_view')) {
          const newTools = stage.tools.filter(t => t !== 'doc_view');
          const newToolsOrder = stage.toolsOrder.filter(t => t !== 'doc_view');
          
          // Remover de todas as ordens de layout
          const layout = { ...stage.layout };
          if (layout.orderStack) {
            layout.orderStack = layout.orderStack.filter(t => t !== 'doc_view');
          }
          if (layout.orderLeft) {
            layout.orderLeft = layout.orderLeft.filter(t => t !== 'doc_view');
          }
          if (layout.orderRight) {
            layout.orderRight = layout.orderRight.filter(t => t !== 'doc_view');
          }

          set({
            stages: {
              ...state.stages,
              [stage.modelId]: state.stages[stage.modelId].map(s =>
                s.id === id
                  ? { ...s, tools: newTools, toolsOrder: newToolsOrder, layout }
                  : s
              )
            }
          });
        }
      },

      // Gerenciamento de balões (chips)
      addBalloon: (stageId: string, area: BalloonArea, item: Omit<BalloonItem,"id"> & { id?: string }) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage) return;

        const newItem: BalloonItem = {
          ...item,
          id: item.id || crypto.randomUUID()
        };

        const newToolConfig = { ...stage.toolConfig };

        switch (area) {
          case "main_form.requiredFields":
            if (!newToolConfig.main_form) newToolConfig.main_form = {};
            newToolConfig.main_form.requiredFieldsCatalog = [
              ...(newToolConfig.main_form.requiredFieldsCatalog || []),
              newItem
            ];
            break;
          case "stage_panel.checklist":
            if (!newToolConfig.stage_panel) newToolConfig.stage_panel = { checklist: [] };
            newToolConfig.stage_panel.checklistCatalog = [
              ...(newToolConfig.stage_panel.checklistCatalog || []),
              newItem
            ];
            break;
          case "stage_actions.catalog":
            if (!newToolConfig.stage_actions) newToolConfig.stage_actions = { actions: [] };
            newToolConfig.stage_actions.actionsCatalog = [
              ...(newToolConfig.stage_actions.actionsCatalog || []),
              newItem
            ];
            break;
          case "management.tags":
            if (!newToolConfig.management) newToolConfig.management = {};
            newToolConfig.management.tags = [
              ...(newToolConfig.management.tags || []),
              newItem
            ];
            break;
        }

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

      renameBalloon: (stageId: string, area: BalloonArea, itemId: string, newLabel: string) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage) return;

        const newToolConfig = { ...stage.toolConfig };

        switch (area) {
          case "main_form.requiredFields":
            if (newToolConfig.main_form?.requiredFieldsCatalog) {
              newToolConfig.main_form.requiredFieldsCatalog = 
                newToolConfig.main_form.requiredFieldsCatalog.map(item =>
                  item.id === itemId ? { ...item, label: newLabel } : item
                );
            }
            break;
          case "stage_panel.checklist":
            if (newToolConfig.stage_panel?.checklistCatalog) {
              newToolConfig.stage_panel.checklistCatalog = 
                newToolConfig.stage_panel.checklistCatalog.map(item =>
                  item.id === itemId ? { ...item, label: newLabel } : item
                );
            }
            break;
          case "stage_actions.catalog":
            if (newToolConfig.stage_actions?.actionsCatalog) {
              newToolConfig.stage_actions.actionsCatalog = 
                newToolConfig.stage_actions.actionsCatalog.map(item =>
                  item.id === itemId ? { ...item, label: newLabel } : item
                );
            }
            break;
          case "management.tags":
            if (newToolConfig.management?.tags) {
              newToolConfig.management.tags = 
                newToolConfig.management.tags.map(item =>
                  item.id === itemId ? { ...item, label: newLabel } : item
                );
            }
            break;
        }

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

      removeBalloon: (stageId: string, area: BalloonArea, itemId: string) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage) return;

        const newToolConfig = { ...stage.toolConfig };

        switch (area) {
          case "main_form.requiredFields":
            if (newToolConfig.main_form?.requiredFieldsCatalog) {
              newToolConfig.main_form.requiredFieldsCatalog = 
                newToolConfig.main_form.requiredFieldsCatalog.filter(item => item.id !== itemId);
            }
            break;
          case "stage_panel.checklist":
            if (newToolConfig.stage_panel?.checklistCatalog) {
              newToolConfig.stage_panel.checklistCatalog = 
                newToolConfig.stage_panel.checklistCatalog.filter(item => item.id !== itemId);
            }
            break;
          case "stage_actions.catalog":
            if (newToolConfig.stage_actions?.actionsCatalog) {
              newToolConfig.stage_actions.actionsCatalog = 
                newToolConfig.stage_actions.actionsCatalog.filter(item => item.id !== itemId);
            }
            break;
          case "management.tags":
            if (newToolConfig.management?.tags) {
              newToolConfig.management.tags = 
                newToolConfig.management.tags.filter(item => item.id !== itemId);
            }
            break;
        }

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

      reorderBalloons: (stageId: string, area: BalloonArea, newOrderIds: string[]) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage) return;

        const newToolConfig = { ...stage.toolConfig };

        switch (area) {
          case "main_form.requiredFields":
            if (newToolConfig.main_form?.requiredFieldsCatalog) {
              const catalog = newToolConfig.main_form.requiredFieldsCatalog;
              newToolConfig.main_form.requiredFieldsCatalog = newOrderIds
                .map(id => catalog.find(item => item.id === id))
                .filter(Boolean) as BalloonItem[];
            }
            break;
          case "stage_panel.checklist":
            if (newToolConfig.stage_panel?.checklistCatalog) {
              const catalog = newToolConfig.stage_panel.checklistCatalog;
              newToolConfig.stage_panel.checklistCatalog = newOrderIds
                .map(id => catalog.find(item => item.id === id))
                .filter(Boolean) as BalloonItem[];
            }
            break;
          case "stage_actions.catalog":
            if (newToolConfig.stage_actions?.actionsCatalog) {
              const catalog = newToolConfig.stage_actions.actionsCatalog;
              newToolConfig.stage_actions.actionsCatalog = newOrderIds
                .map(id => catalog.find(item => item.id === id))
                .filter(Boolean) as BalloonItem[];
            }
            break;
          case "management.tags":
            if (newToolConfig.management?.tags) {
              const catalog = newToolConfig.management.tags;
              newToolConfig.management.tags = newOrderIds
                .map(id => catalog.find(item => item.id === id))
                .filter(Boolean) as BalloonItem[];
            }
            break;
        }

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

      setBalloonIcon: (stageId: string, area: BalloonArea, itemId: string, icon?: string) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage) return;

        const newToolConfig = { ...stage.toolConfig };

        switch (area) {
          case "main_form.requiredFields":
            if (newToolConfig.main_form?.requiredFieldsCatalog) {
              newToolConfig.main_form.requiredFieldsCatalog = 
                newToolConfig.main_form.requiredFieldsCatalog.map(item =>
                  item.id === itemId ? { ...item, icon } : item
                );
            }
            break;
          case "stage_panel.checklist":
            if (newToolConfig.stage_panel?.checklistCatalog) {
              newToolConfig.stage_panel.checklistCatalog = 
                newToolConfig.stage_panel.checklistCatalog.map(item =>
                  item.id === itemId ? { ...item, icon } : item
                );
            }
            break;
          case "stage_actions.catalog":
            if (newToolConfig.stage_actions?.actionsCatalog) {
              newToolConfig.stage_actions.actionsCatalog = 
                newToolConfig.stage_actions.actionsCatalog.map(item =>
                  item.id === itemId ? { ...item, icon } : item
                );
            }
            break;
          case "management.tags":
            if (newToolConfig.management?.tags) {
              newToolConfig.management.tags = 
                newToolConfig.management.tags.map(item =>
                  item.id === itemId ? { ...item, icon } : item
                );
            }
            break;
        }

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

      setBalloonColor: (stageId: string, area: BalloonArea, itemId: string, color?: string) => {
        const state = get();
        const stage = state.getStage(stageId);
        if (!stage) return;

        const newToolConfig = { ...stage.toolConfig };

        switch (area) {
          case "main_form.requiredFields":
            if (newToolConfig.main_form?.requiredFieldsCatalog) {
              newToolConfig.main_form.requiredFieldsCatalog = 
                newToolConfig.main_form.requiredFieldsCatalog.map(item =>
                  item.id === itemId ? { ...item, color } : item
                );
            }
            break;
          case "stage_panel.checklist":
            if (newToolConfig.stage_panel?.checklistCatalog) {
              newToolConfig.stage_panel.checklistCatalog = 
                newToolConfig.stage_panel.checklistCatalog.map(item =>
                  item.id === itemId ? { ...item, color } : item
                );
            }
            break;
          case "stage_actions.catalog":
            if (newToolConfig.stage_actions?.actionsCatalog) {
              newToolConfig.stage_actions.actionsCatalog = 
                newToolConfig.stage_actions.actionsCatalog.map(item =>
                  item.id === itemId ? { ...item, color } : item
                );
            }
            break;
          case "management.tags":
            if (newToolConfig.management?.tags) {
              newToolConfig.management.tags = 
                newToolConfig.management.tags.map(item =>
                  item.id === itemId ? { ...item, color } : item
                );
            }
            break;
        }

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
