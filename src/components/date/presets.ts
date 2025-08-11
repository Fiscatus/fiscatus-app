/**
 * Presets de datas rápidas para seletores
 */

import { addBusinessDays, getNextBusinessDay } from '@/lib/holidays-br';

export interface DatePreset {
  label: string;
  value: string;
  getDate: () => Date;
  description?: string;
}

export interface DateRangePreset {
  label: string;
  value: string;
  getRange: () => { start: Date; end: Date };
  description?: string;
}

// Presets para data única
export const DATE_PRESETS: DatePreset[] = [
  {
    label: 'Hoje',
    value: 'today',
    getDate: () => new Date(),
    description: 'Data atual'
  },
  {
    label: 'Amanhã',
    value: 'tomorrow',
    getDate: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    },
    description: 'Próximo dia'
  },
  {
    label: 'Próximo dia útil',
    value: 'next-business-day',
    getDate: () => getNextBusinessDay(new Date()),
    description: 'Próximo dia útil (excluindo fins de semana e feriados)'
  },
  {
    label: '+7 dias',
    value: 'plus-7-days',
    getDate: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
    description: '7 dias a partir de hoje'
  },
  {
    label: '+15 dias',
    value: 'plus-15-days',
    getDate: () => {
      const date = new Date();
      date.setDate(date.getDate() + 15);
      return date;
    },
    description: '15 dias a partir de hoje'
  },
  {
    label: '+30 dias',
    value: 'plus-30-days',
    getDate: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    },
    description: '30 dias a partir de hoje'
  },
  {
    label: '+7 dias úteis',
    value: 'plus-7-business-days',
    getDate: () => addBusinessDays(new Date(), 7),
    description: '7 dias úteis a partir de hoje'
  },
  {
    label: '+15 dias úteis',
    value: 'plus-15-business-days',
    getDate: () => addBusinessDays(new Date(), 15),
    description: '15 dias úteis a partir de hoje'
  },
  {
    label: '+30 dias úteis',
    value: 'plus-30-business-days',
    getDate: () => addBusinessDays(new Date(), 30),
    description: '30 dias úteis a partir de hoje'
  }
];

// Presets para intervalo de datas
export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    label: 'Hoje',
    value: 'today',
    getRange: () => {
      const today = new Date();
      return { start: today, end: today };
    },
    description: 'Apenas hoje'
  },
  {
    label: 'Este mês',
    value: 'this-month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start, end };
    },
    description: 'Do primeiro ao último dia do mês atual'
  },
  {
    label: 'Mês passado',
    value: 'last-month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start, end };
    },
    description: 'Do primeiro ao último dia do mês anterior'
  },
  {
    label: 'Esta semana',
    value: 'this-week',
    getRange: () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek + 1); // Segunda-feira
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Domingo
      return { start, end };
    },
    description: 'De segunda a domingo da semana atual'
  },
  {
    label: 'Semana passada',
    value: 'last-week',
    getRange: () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek - 6); // Segunda-feira da semana passada
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Domingo da semana passada
      return { start, end };
    },
    description: 'De segunda a domingo da semana anterior'
  },
  {
    label: 'Próximos 7 dias',
    value: 'next-7-days',
    getRange: () => {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 6);
      return { start, end };
    },
    description: 'De hoje até 7 dias à frente'
  },
  {
    label: 'Próximos 15 dias',
    value: 'next-15-days',
    getRange: () => {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 14);
      return { start, end };
    },
    description: 'De hoje até 15 dias à frente'
  },
  {
    label: 'Próximos 30 dias',
    value: 'next-30-days',
    getRange: () => {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 29);
      return { start, end };
    },
    description: 'De hoje até 30 dias à frente'
  },
  {
    label: 'Este ano',
    value: 'this-year',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { start, end };
    },
    description: 'Do primeiro ao último dia do ano atual'
  },
  {
    label: 'Ano passado',
    value: 'last-year',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31);
      return { start, end };
    },
    description: 'Do primeiro ao último dia do ano anterior'
  }
];

/**
 * Obtém um preset de data única pelo valor
 */
export const getDatePreset = (value: string): DatePreset | undefined => {
  return DATE_PRESETS.find(preset => preset.value === value);
};

/**
 * Obtém um preset de intervalo pelo valor
 */
export const getDateRangePreset = (value: string): DateRangePreset | undefined => {
  return DATE_RANGE_PRESETS.find(preset => preset.value === value);
};

/**
 * Aplica um preset de data única
 */
export const applyDatePreset = (value: string): Date | null => {
  const preset = getDatePreset(value);
  return preset ? preset.getDate() : null;
};

/**
 * Aplica um preset de intervalo
 */
export const applyDateRangePreset = (value: string): { start: Date; end: Date } | null => {
  const preset = getDateRangePreset(value);
  return preset ? preset.getRange() : null;
};
