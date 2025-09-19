import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Building2, FileText, Settings, Shield, AlertCircle } from 'lucide-react';
import { ModelStage, StageTool, ToolConfig } from '@/types/flow';
import { useFlowStore } from '@/stores/flowStore';
import StageToolsPicker from './StageToolsPicker';
import { getToolMeta } from '@/lib/stageTools';

interface StageDetailsDrawerProps {
  stage: ModelStage | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ToolConfigFormProps {
  tool: StageTool;
  config: ToolConfig;
  onConfigChange: (partial: ToolConfig) => void;
}

const ToolConfigForm: React.FC<ToolConfigFormProps> = ({ tool, config, onConfigChange }) => {
  const meta = getToolMeta(tool);
  const toolConfig = config[tool] || {};

  const renderConfig = () => {
    switch (tool) {
      case 'management':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-versions">Permitir Versões</Label>
              <Switch
                id="allow-versions"
                checked={toolConfig.allowVersions ?? true}
                onCheckedChange={(checked) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, allowVersions: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-attachments">Permitir Anexos</Label>
              <Switch
                id="allow-attachments"
                checked={toolConfig.allowAttachments ?? true}
                onCheckedChange={(checked) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, allowAttachments: checked }
                  })
                }
              />
            </div>
          </div>
        );

      case 'main_form':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="schema-id">Schema do Formulário</Label>
              <Select
                value={toolConfig.schemaId || 'default-schema'}
                onValueChange={(value) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, schemaId: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um schema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default-schema">Schema Padrão</SelectItem>
                  <SelectItem value="dfd-schema">Schema DFD</SelectItem>
                  <SelectItem value="etp-schema">Schema ETP</SelectItem>
                  <SelectItem value="custom-schema">Schema Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="required-fields">Campos Obrigatórios</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {toolConfig.requiredFields?.map((field, index) => (
                  <Badge key={index} variant="secondary">
                    {field}
                    <button
                      onClick={() => {
                        const newFields = toolConfig.requiredFields?.filter((_, i) => i !== index) || [];
                        onConfigChange({
                          [tool]: { ...toolConfig, requiredFields: newFields }
                        });
                      }}
                      className="ml-1 text-xs hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newField = prompt('Nome do campo obrigatório:');
                    if (newField) {
                      const newFields = [...(toolConfig.requiredFields || []), newField];
                      onConfigChange({
                        [tool]: { ...toolConfig, requiredFields: newFields }
                      });
                    }
                  }}
                >
                  + Adicionar
                </Button>
              </div>
            </div>
          </div>
        );

      case 'stage_panel':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-sla">Mostrar SLA</Label>
              <Switch
                id="show-sla"
                checked={toolConfig.showSLA ?? true}
                onCheckedChange={(checked) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, showSLA: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-checklist">Mostrar Checklist</Label>
              <Switch
                id="show-checklist"
                checked={toolConfig.showChecklist ?? true}
                onCheckedChange={(checked) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, showChecklist: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-timeline">Mostrar Timeline</Label>
              <Switch
                id="show-timeline"
                checked={toolConfig.showTimeline ?? true}
                onCheckedChange={(checked) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, showTimeline: checked }
                  })
                }
              />
            </div>
          </div>
        );

      case 'stage_actions':
        return (
          <div className="space-y-4">
            <Label>Ações Disponíveis</Label>
            <div className="space-y-2">
              {['send', 'finish', 'generate_doc'].map((action) => (
                <div key={action} className="flex items-center justify-between">
                  <Label htmlFor={`action-${action}`} className="capitalize">
                    {action === 'send' ? 'Enviar' : 
                     action === 'finish' ? 'Concluir' : 
                     'Gerar Documento'}
                  </Label>
                  <Switch
                    id={`action-${action}`}
                    checked={toolConfig.actions?.includes(action as any) ?? true}
                    onCheckedChange={(checked) => {
                      const currentActions = toolConfig.actions || [];
                      const newActions = checked
                        ? [...currentActions, action as any]
                        : currentActions.filter(a => a !== action);
                      onConfigChange({
                        [tool]: { ...toolConfig, actions: newActions }
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'comments':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-mentions">Permitir @Menções</Label>
              <Switch
                id="allow-mentions"
                checked={toolConfig.allowMentions ?? true}
                onCheckedChange={(checked) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, allowMentions: checked }
                  })
                }
              />
            </div>
          </div>
        );

      case 'signatures':
        return (
          <div className="space-y-4">
            <div>
              <Label>Signatários</Label>
              <div className="space-y-2 mt-2">
                {toolConfig.signers?.map((signer, index) => (
                  <div key={signer.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{signer.name}</div>
                      {signer.role && (
                        <div className="text-xs text-slate-600">{signer.role}</div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newSigners = toolConfig.signers?.filter((_, i) => i !== index) || [];
                        onConfigChange({
                          [tool]: { ...toolConfig, signers: newSigners }
                        });
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const name = prompt('Nome do signatário:');
                    const role = prompt('Papel do signatário (opcional):');
                    if (name) {
                      const newSigner = {
                        id: Date.now().toString(),
                        name,
                        role: role || undefined
                      };
                      const newSigners = [...(toolConfig.signers || []), newSigner];
                      onConfigChange({
                        [tool]: { ...toolConfig, signers: newSigners }
                      });
                    }
                  }}
                >
                  + Adicionar Signatário
                </Button>
              </div>
            </div>
          </div>
        );

      case 'doc_view':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="preview-mode">Modo de Visualização</Label>
              <Select
                value={toolConfig.previewMode || 'modal'}
                onValueChange={(value: 'modal' | 'new_tab') =>
                  onConfigChange({
                    [tool]: { ...toolConfig, previewMode: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modal">Modal</SelectItem>
                  <SelectItem value="new_tab">Nova Aba</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-slate-500 italic">
            Nenhuma configuração disponível para esta ferramenta.
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-md ${meta.color}`}>
          <meta.Icon className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-medium">{meta.label}</h4>
          <p className="text-sm text-slate-600">{meta.desc}</p>
        </div>
      </div>
      <Separator />
      {renderConfig()}
    </div>
  );
};

export const StageDetailsDrawer: React.FC<StageDetailsDrawerProps> = ({
  stage,
  isOpen,
  onClose
}) => {
  const { updateStage, updateToolConfig } = useFlowStore();
  const [localStage, setLocalStage] = useState<ModelStage | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (stage) {
      setLocalStage({ ...stage });
      setHasChanges(false);
    }
  }, [stage]);

  const handleSave = () => {
    if (!localStage) return;

    // Atualizar etapa no store
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
    onClose();
  };

  const handleCancel = () => {
    if (stage) {
      setLocalStage({ ...stage });
    }
    setHasChanges(false);
    onClose();
  };

  const handleToolsChange = (newTools: StageTool[]) => {
    if (!localStage) return;
    setLocalStage({
      ...localStage,
      tools: newTools,
      toolsOrder: newTools // Manter sincronizado
    });
    setHasChanges(true);
  };

  const handleToolsOrderChange = (newOrder: StageTool[]) => {
    if (!localStage) return;
    setLocalStage({
      ...localStage,
      toolsOrder: newOrder
    });
    setHasChanges(true);
  };

  const handleToolConfigChange = (partial: ToolConfig) => {
    if (!localStage) return;
    setLocalStage({
      ...localStage,
      toolConfig: {
        ...localStage.toolConfig,
        ...partial
      }
    });
    setHasChanges(true);
  };

  if (!localStage) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Configuração da Etapa
          </SheetTitle>
          <SheetDescription>
            Configure as ferramentas e opções da etapa "{localStage.title}"
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Ferramentas
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Permissões
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título da Etapa</Label>
                  <Input
                    id="title"
                    value={localStage.title}
                    onChange={(e) => {
                      setLocalStage({ ...localStage, title: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="department">Setor</Label>
                  <Select
                    value={localStage.department || ''}
                    onValueChange={(value) => {
                      setLocalStage({ ...localStage, department: value });
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GSP - Gerência de Soluções e Projetos">
                        GSP - Gerência de Soluções e Projetos
                      </SelectItem>
                      <SelectItem value="GSL - Gerência de Suprimentos e Logística">
                        GSL - Gerência de Suprimentos e Logística
                      </SelectItem>
                      <SelectItem value="GRH - Gerência de Recursos Humanos">
                        GRH - Gerência de Recursos Humanos
                      </SelectItem>
                      <SelectItem value="GUE - Gerência de Urgência e Emergência">
                        GUE - Gerência de Urgência e Emergência
                      </SelectItem>
                      <SelectItem value="GLC - Gerência de Licitações e Contratos">
                        GLC - Gerência de Licitações e Contratos
                      </SelectItem>
                      <SelectItem value="GFC - Gerência Financeira e Contábil">
                        GFC - Gerência Financeira e Contábil
                      </SelectItem>
                      <SelectItem value="GTEC - Gerência de Tecnologia da Informação">
                        GTEC - Gerência de Tecnologia da Informação
                      </SelectItem>
                      <SelectItem value="GAP - Gerência de Administração e Patrimônio">
                        GAP - Gerência de Administração e Patrimônio
                      </SelectItem>
                      <SelectItem value="NAJ - Assessoria Jurídica">
                        NAJ - Assessoria Jurídica
                      </SelectItem>
                      <SelectItem value="GESP - Gerência de Especialidades">
                        GESP - Gerência de Especialidades
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="days">Dias Úteis</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    value={localStage.days || ''}
                    onChange={(e) => {
                      setLocalStage({ ...localStage, days: parseInt(e.target.value) || 0 });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={localStage.status}
                    onValueChange={(value: 'pending' | 'in_progress' | 'done') => {
                      setLocalStage({ ...localStage, status: value });
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="done">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="mt-6">
              <StageToolsPicker
                tools={localStage.tools}
                toolsOrder={localStage.toolsOrder}
                onChangeTools={handleToolsChange}
                onChangeOrder={handleToolsOrderChange}
              />
            </TabsContent>

            <TabsContent value="config" className="mt-6">
              <div className="space-y-6">
                {localStage.tools.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Nenhuma ferramenta ativa</p>
                    <p className="text-sm mt-1">Ative ferramentas na aba "Ferramentas" para configurá-las</p>
                  </div>
                ) : (
                  localStage.tools.map((tool) => (
                    <ToolConfigForm
                      key={tool}
                      tool={tool}
                      config={localStage.toolConfig || {}}
                      onConfigChange={handleToolConfigChange}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="mt-6">
              <div className="space-y-6">
                <div className="text-center py-8 text-slate-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">Permissões & Regras</p>
                  <p className="text-sm mt-1">Em desenvolvimento - funcionalidade futura</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-sm">Funcionalidades Planejadas:</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Campos obrigatórios por role</li>
                    <li>• Bloqueios condicionais</li>
                    <li>• Permissões por usuário/grupo</li>
                    <li>• Dependências entre etapas</li>
                    <li>• Validação de ordem de execução</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            Salvar Alterações
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default StageDetailsDrawer;
