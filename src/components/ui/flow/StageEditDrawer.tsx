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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Building2, FileText, Settings, Shield, AlertCircle, Save, X } from 'lucide-react';
import { ModelStage, StageTool, ToolConfig } from '@/types/flow';
import { useFlowStore } from '@/stores/flowStore';
import StageToolsPicker from './StageToolsPicker';
import { getToolMeta } from '@/lib/stageTools';
import { useToast } from '@/hooks/use-toast';

interface StageEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageId: string | null;
}

interface ToolConfigFormProps {
  tool: StageTool;
  config: ToolConfig;
  onConfigChange: (partial: ToolConfig) => void;
  isDisabled?: boolean;
}

const ToolConfigForm: React.FC<ToolConfigFormProps> = ({ 
  tool, 
  config, 
  onConfigChange, 
  isDisabled = false 
}) => {
  const meta = getToolMeta(tool);
  const toolConfig = config[tool] || {};

  const renderConfig = () => {
    switch (tool) {
      case 'management':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-versions">Versões</Label>
              <Switch
                id="allow-versions"
                checked={toolConfig.allowVersions ?? true}
                onCheckedChange={(checked) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, allowVersions: checked }
                  })
                }
                disabled={isDisabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-attachments">Anexos</Label>
              <Switch
                id="allow-attachments"
                checked={toolConfig.allowAttachments ?? true}
                onCheckedChange={(checked) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, allowAttachments: checked }
                  })
                }
                disabled={isDisabled}
              />
            </div>
          </div>
        );

      case 'main_form':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="schema-id">Modelo de Formulário</Label>
              <Select
                value={toolConfig.schemaId || 'default-schema'}
                onValueChange={(value) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, schemaId: value }
                  })
                }
                disabled={isDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default-schema">Modelo Padrão</SelectItem>
                  <SelectItem value="dfd-schema">Modelo DFD</SelectItem>
                  <SelectItem value="etp-schema">Modelo ETP</SelectItem>
                  <SelectItem value="custom-schema">Modelo Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="required-fields">Campos Obrigatórios</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {toolConfig.requiredFields?.map((field, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {field}
                    <button
                      onClick={() => {
                        if (isDisabled) return;
                        const newFields = toolConfig.requiredFields?.filter((_, i) => i !== index) || [];
                        onConfigChange({
                          [tool]: { ...toolConfig, requiredFields: newFields }
                        });
                      }}
                      className="ml-1 text-xs hover:text-red-600 disabled:opacity-50"
                      disabled={isDisabled}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (isDisabled) return;
                    const newField = prompt('Nome do campo obrigatório:');
                    if (newField) {
                      const newFields = [...(toolConfig.requiredFields || []), newField];
                      onConfigChange({
                        [tool]: { ...toolConfig, requiredFields: newFields }
                      });
                    }
                  }}
                  disabled={isDisabled}
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
              <Label htmlFor="show-sla">Exibir SLA (Status & Prazo)</Label>
              <Switch
                id="show-sla"
                checked={toolConfig.showSLA ?? true}
                onCheckedChange={(checked) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, showSLA: checked }
                  })
                }
                disabled={isDisabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-checklist">Exibir Checklist</Label>
              <Switch
                id="show-checklist"
                checked={toolConfig.showChecklist ?? true}
                onCheckedChange={(checked) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, showChecklist: checked }
                  })
                }
                disabled={isDisabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-timeline">Exibir Timeline</Label>
              <Switch
                id="show-timeline"
                checked={toolConfig.showTimeline ?? true}
                onCheckedChange={(checked) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, showTimeline: checked }
                  })
                }
                disabled={isDisabled}
              />
            </div>
          </div>
        );

      case 'stage_actions':
        return (
          <div className="space-y-4">
            <Label>Ações Disponíveis</Label>
            <div className="space-y-2">
              {[
                { key: 'send', label: 'Enviar para análise' },
                { key: 'finish', label: 'Concluir etapa' },
                { key: 'generate_doc', label: 'Gerar documento' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`action-${key}`}>{label}</Label>
                  <Switch
                    id={`action-${key}`}
                    checked={toolConfig.actions?.includes(key as any) ?? true}
                    onCheckedChange={(checked) => {
                      if (isDisabled) return;
                      const currentActions = toolConfig.actions || [];
                      const newActions = checked
                        ? [...currentActions, key as any]
                        : currentActions.filter(a => a !== key);
                      onConfigChange({
                        [tool]: { ...toolConfig, actions: newActions }
                      });
                    }}
                    disabled={isDisabled}
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
              <Label htmlFor="allow-mentions">Permitir @menções</Label>
              <Switch
                id="allow-mentions"
                checked={toolConfig.allowMentions ?? true}
                onCheckedChange={(checked) =>
                  onConfigChange({
                    [tool]: { ...toolConfig, allowMentions: checked }
                  })
                }
                disabled={isDisabled}
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
                        if (isDisabled) return;
                        const newSigners = toolConfig.signers?.filter((_, i) => i !== index) || [];
                        onConfigChange({
                          [tool]: { ...toolConfig, signers: newSigners }
                        });
                      }}
                      disabled={isDisabled}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (isDisabled) return;
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
                  disabled={isDisabled}
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
                disabled={isDisabled}
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
            {isDisabled && (
              <div className="text-sm text-slate-500 italic">
                Ative "Assinaturas" para configurar a visualização de documentos.
              </div>
            )}
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

export const StageEditDrawer: React.FC<StageEditDrawerProps> = ({
  open,
  onOpenChange,
  stageId
}) => {
  const { getStage, updateStage, updateToolConfig } = useFlowStore();
  const { toast } = useToast();
  const [localStage, setLocalStage] = useState<ModelStage | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (stageId && open) {
      const stage = getStage(stageId);
      if (stage) {
        setLocalStage({ ...stage });
        setHasChanges(false);
      }
    }
  }, [stageId, open, getStage]);

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
    toast({
      title: "Etapa atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (stageId) {
      const stage = getStage(stageId);
      if (stage) {
        setLocalStage({ ...stage });
      }
    }
    setHasChanges(false);
    onOpenChange(false);
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
    toast({
      title: "Ordem atualizada",
      description: "A ordem das ferramentas foi atualizada.",
    });
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

  const getStatusBadge = () => {
    switch (localStage.status) {
      case 'done':
        return <Badge className="bg-emerald-100 text-emerald-700">Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-indigo-100 text-indigo-700">Em Andamento</Badge>;
      case 'pending':
        return <Badge className="bg-slate-100 text-slate-700">Pendente</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Editar Etapa
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <span>{localStage.title}</span>
            {getStatusBadge()}
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
                      isDisabled={tool === 'doc_view' && !localStage.tools.includes('signatures')}
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
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default StageEditDrawer;
