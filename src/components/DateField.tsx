/**
 * Componente DateField integrado com react-hook-form e zod
 */

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { DatePicker, DatePickerProps } from '@/components/date/DatePicker';
import { isBusinessDay } from '@/lib/business-days/utils';
import { useBusinessConfig } from '@/lib/business-days/context';
import { parseISO } from 'date-fns';

export interface DateFieldProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  businessDaysOnly?: boolean;
  showOptionalToggle?: boolean;
  className?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  name,
  label,
  description,
  required = false,
  businessDaysOnly = true,
  showOptionalToggle = true,
  className,
  ...datePickerProps
}) => {
  const { control, formState: { errors } } = useFormContext();
  const businessConfig = useBusinessConfig();
  const error = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? 'Este campo é obrigatório' : false,
        validate: (value) => {
          if (!value) return true; // Campo não obrigatório
          
          const date = typeof value === 'string' ? parseISO(value) : value;
          
          if (businessDaysOnly && !isBusinessDay(date, businessConfig)) {
            return 'Selecione um dia útil';
          }
          
          return true;
        }
      }}
      render={({ field }) => (
        <DatePicker
          {...field}
          {...datePickerProps}
          label={label}
          description={description}
          required={required}
          businessDaysOnly={businessDaysOnly}
          showOptionalToggle={showOptionalToggle}
          className={className}
          error={!!error}
          errorMessage={error?.message as string}
        />
      )}
    />
  );
};

/**
 * Hook para criar validação zod para dias úteis
 */
export const createBusinessDayValidation = (businessConfig?: any) => {
  return (value: string) => {
    if (!value) return true;
    
    try {
      const date = parseISO(value);
      return isBusinessDay(date, businessConfig) || 'Selecione um dia útil';
    } catch {
      return 'Data inválida';
    }
  };
};

/**
 * Componente DateField com validação automática de dias úteis
 */
export const BusinessDateField: React.FC<DateFieldProps> = (props) => {
  return (
    <DateField
      {...props}
      businessDaysOnly={true}
      showOptionalToggle={true}
    />
  );
};
