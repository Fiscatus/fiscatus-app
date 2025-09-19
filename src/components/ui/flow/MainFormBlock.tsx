import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ModelStage } from '@/types/flow';
import { useFlowStore } from '@/stores/flowStore';
import BalloonManager from './BalloonManager';

interface MainFormBlockProps {
  stage: ModelStage;
  density: 'cozy' | 'compact';
}

// Mock schema de campos padrão
const defaultFields = [
  { key: 'objeto', label: 'Objeto', type: 'text', required: true },
  { key: 'justificativa', label: 'Justificativa', type: 'textarea', required: true },
  { key: 'valor_estimado', label: 'Valor Estimado', type: 'text', required: false },
  { key: 'prazo_execucao', label: 'Prazo de Execução', type: 'text', required: false },
  { key: 'observacoes', label: 'Observações', type: 'textarea', required: false }
];

export default function MainFormBlock({ stage, density }: MainFormBlockProps) {
  const { setFormValue } = useFlowStore();
  
  const mainForm = stage.toolConfig.main_form;
  const values = mainForm?.values || {};
  const requiredFields = mainForm?.requiredFields || [];
  const requiredFieldsCatalog = mainForm?.requiredFieldsCatalog || [];
  
  const handleFieldChange = (key: string, value: string) => {
    setFormValue(stage.id, key, value);
  };
  
  const isCompact = density === 'compact';
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600 mb-3">
        Formulário principal da etapa
      </div>
      
      {/* Gerenciador de campos obrigatórios */}
      <BalloonManager
        stageId={stage.id}
        area="main_form.requiredFields"
        items={requiredFieldsCatalog}
        title="Campos obrigatórios"
        placeholderAdd="Adicionar campo obrigatório..."
        allowIcon={true}
        allowColor={true}
        allowReorder={true}
      />
      
      <div className="space-y-3">
        {defaultFields.map((field) => {
          const isRequired = requiredFields.includes(field.key);
          const value = values[field.key] || '';
          
          return (
            <div key={field.key}>
              <Label htmlFor={field.key} className="text-sm font-medium">
                {field.label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.key}
                  value={value}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Digite ${field.label.toLowerCase()}...`}
                  className={isCompact ? "h-16" : "h-20"}
                  rows={isCompact ? 2 : 3}
                />
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  value={value}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Digite ${field.label.toLowerCase()}...`}
                  className={isCompact ? "h-8" : "h-9"}
                />
              )}
              
              {isRequired && !value && (
                <p className="text-xs text-red-500 mt-1">
                  Este campo é obrigatório
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Resumo dos campos preenchidos */}
      <div className="pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Campos preenchidos:</span>
          <span>
            {Object.values(values).filter(v => v && v.toString().trim()).length} / {defaultFields.length}
          </span>
        </div>
      </div>
    </div>
  );
}
