import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { DatePicker } from './DatePicker';
import { getTodayISO } from '@/lib/dates/today';
import { ORG_TZ } from '@/config/timezone';
import { 
  isCurrentDateField, 
  isReadonlyTodayField, 
  isEditableTodayField 
} from '@/lib/dates/constants';

interface CurrentDateFieldProps<T extends FieldValues> {
  /** Nome do campo no formulário */
  name: Path<T>;
  /** Controle do react-hook-form */
  control: Control<T>;
  /** Label do campo */
  label?: string;
  /** Descrição do campo */
  description?: string;
  /** Se o campo é obrigatório */
  required?: boolean;
  /** Se o campo está em estado de erro */
  error?: boolean;
  /** Mensagem de erro */
  errorMessage?: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Timezone personalizado (opcional) */
  timezone?: string;
  /** Se deve mostrar presets rápidos */
  showPresets?: boolean;
  /** Se deve mostrar feriados */
  showHolidays?: boolean;
  /** Se deve mostrar tooltips */
  showTooltips?: boolean;
}

/**
 * Componente helper para campos de data atual que aplica automaticamente
 * as configurações corretas baseadas no nome do campo
 */
export function CurrentDateField<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required = false,
  error = false,
  errorMessage,
  className,
  timezone = ORG_TZ,
  showPresets = true,
  showHolidays = true,
  showTooltips = true,
}: CurrentDateFieldProps<T>) {
  
  // Verificar o tipo do campo baseado no nome
  const fieldName = name as string;
  const isReadonly = isReadonlyTodayField(fieldName);
  const isEditable = isEditableTodayField(fieldName);
  const isCurrent = isCurrentDateField(fieldName);
  
  // Obter data de hoje em ISO
  const todayISO = getTodayISO(timezone);
  
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <DatePicker
          value={field.value}
          onChange={(date) => field.onChange(date)}
          label={label}
          description={description}
          required={required}
          error={error}
          errorMessage={errorMessage}
          className={className}
          timezone={timezone}
          defaultToToday={isCurrent}
          readOnly={isReadonly}
          disabled={isReadonly}
          showPresets={showPresets}
          showHolidays={showHolidays}
          showTooltips={showTooltips}
          // Para campos somente leitura, desabilitar interações
          showMonthNavigation={!isReadonly}
          showYearNavigation={!isReadonly}
          showOptionalToggle={!isReadonly}
        />
      )}
    />
  );
}

/**
 * Hook helper para obter valores padrão para campos de data atual
 */
export function useCurrentDateDefaults<T extends Record<string, any>>(
  timezone: string = ORG_TZ
): Partial<T> {
  const todayISO = getTodayISO(timezone);
  
  const defaults: Partial<T> = {};
  
  // Preencher todos os campos de data atual com hoje
  const currentDateFields = [
    "dataCriacao", 
    "dataRegistro", 
    "dataDocumento",
    "dataInicio",
    "dataEntrada",
    "dataSolicitacao",
    "dataRequerimento"
  ] as const;
  
  currentDateFields.forEach(field => {
    if (field in defaults) {
      (defaults as any)[field] = todayISO;
    }
  });
  
  return defaults;
}

/**
 * Função helper para validar campos de data atual
 */
export function validateCurrentDateField(
  value: string | null | undefined,
  fieldName: string,
  timezone: string = ORG_TZ
): string | true {
  if (!isCurrentDateField(fieldName)) {
    return true; // Não é um campo de data atual
  }
  
  if (!value) {
    return "Campo obrigatório";
  }
  
  const todayISO = getTodayISO(timezone);
  
  // Para campos somente leitura, deve ser sempre hoje
  if (isReadonlyTodayField(fieldName)) {
    if (value !== todayISO) {
      return "Data deve ser a data de hoje";
    }
  }
  
  // Para campos editáveis, deve ser uma data válida
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return "Data inválida";
  }
  
  return true;
}
