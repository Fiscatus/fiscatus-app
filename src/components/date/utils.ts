/**
 * Utilitários para formatação de datas e localização pt-BR
 */

import { format, parse, isValid, isDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { isBusinessDay, isHoliday, getHolidayName } from '@/lib/holidays-br';

// Configuração de localização pt-BR
export const LOCALE_CONFIG = {
  locale: ptBR,
  weekStartsOn: 1, // Segunda-feira
};

// Formatos de data
export const DATE_FORMATS = {
  display: 'dd/MM/yyyy',
  displayWithTime: 'dd/MM/yyyy HH:mm',
  iso: 'yyyy-MM-dd',
  isoWithTime: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  monthYear: 'MMMM yyyy',
  dayMonth: 'dd/MM',
  weekday: 'EEEE',
  weekdayShort: 'EEE',
} as const;

/**
 * Formata uma data para exibição em pt-BR
 */
export const formatDate = (
  date: Date | string | null | undefined,
  formatStr: string = DATE_FORMATS.display
): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatStr, LOCALE_CONFIG);
};

/**
 * Converte uma string de data para objeto Date
 */
export const parseDate = (
  dateString: string,
  formatStr: string = DATE_FORMATS.display
): Date | null => {
  if (!dateString) return null;
  
  try {
    const parsed = parse(dateString, formatStr, new Date(), LOCALE_CONFIG);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Converte uma data para string ISO (YYYY-MM-DD)
 */
export const toISOString = (date: Date | null | undefined): string => {
  if (!date || !isValid(date)) return '';
  return format(date, DATE_FORMATS.iso);
};

/**
 * Converte uma string ISO para objeto Date
 */
export const fromISOString = (isoString: string): Date | null => {
  if (!isoString) return null;
  
  try {
    const date = new Date(isoString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

/**
 * Verifica se uma data é válida
 */
export const isValidDate = (date: any): date is Date => {
  return isDate(date) && isValid(date);
};

/**
 * Obtém o nome do dia da semana em português
 */
export const getWeekdayName = (date: Date, short: boolean = false): string => {
  return format(date, short ? DATE_FORMATS.weekdayShort : DATE_FORMATS.weekday, LOCALE_CONFIG);
};

/**
 * Obtém o nome do mês em português
 */
export const getMonthName = (date: Date): string => {
  return format(date, 'MMMM', LOCALE_CONFIG);
};

/**
 * Obtém o nome do mês abreviado em português
 */
export const getShortMonthName = (date: Date): string => {
  return format(date, 'MMM', LOCALE_CONFIG);
};

/**
 * Verifica se uma data é hoje
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Verifica se uma data é fim de semana
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Domingo = 0, Sábado = 6
};

/**
 * Obtém o tipo de dia (útil, fim de semana, feriado)
 */
export const getDayType = (date: Date, holidays: string[] = []): 'business' | 'weekend' | 'holiday' => {
  if (isHoliday(date, holidays)) return 'holiday';
  if (isWeekend(date)) return 'weekend';
  return 'business';
};

/**
 * Obtém a descrição do tipo de dia
 */
export const getDayTypeDescription = (date: Date, holidays: string[] = []): string => {
  const dayType = getDayType(date, holidays);
  
  switch (dayType) {
    case 'business':
      return 'Dia útil';
    case 'weekend':
      return 'Fim de semana';
    case 'holiday':
      const holidayName = getHolidayName(date, holidays);
      return holidayName || 'Feriado';
    default:
      return '';
  }
};

/**
 * Obtém tooltip para uma data
 */
export const getDateTooltip = (date: Date, holidays: string[] = []): string => {
  const formattedDate = formatDate(date, DATE_FORMATS.display);
  const weekday = getWeekdayName(date, true);
  const dayType = getDayTypeDescription(date, holidays);
  
  return `${weekday}, ${formattedDate} — ${dayType}`;
};

/**
 * Obtém classes CSS para estilização de dias
 */
export const getDayClasses = (
  date: Date,
  isSelected: boolean = false,
  isInRange: boolean = false,
  isRangeStart: boolean = false,
  isRangeEnd: boolean = false,
  holidays: string[] = []
): string => {
  const classes: string[] = [];
  
  // Base classes
  classes.push(
    'relative flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
    'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none'
  );
  
  // Today
  if (isToday(date)) {
    classes.push('ring-2 ring-primary ring-offset-2');
  }
  
  // Selected
  if (isSelected) {
    classes.push('bg-primary text-primary-foreground hover:bg-primary/90');
  }
  
  // Range
  if (isInRange && !isSelected) {
    classes.push('bg-primary/20 text-primary-foreground');
  }
  
  if (isRangeStart) {
    classes.push('rounded-r-none');
  }
  
  if (isRangeEnd) {
    classes.push('rounded-l-none');
  }
  
  // Day type
  const dayType = getDayType(date, holidays);
  switch (dayType) {
    case 'weekend':
      classes.push('text-muted-foreground/60');
      break;
    case 'holiday':
      classes.push('text-red-500 font-medium');
      break;
  }
  
  return classes.join(' ');
};

/**
 * Obtém o primeiro dia da semana (segunda-feira)
 */
export const getWeekStart = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para segunda-feira
  return new Date(date.setDate(diff));
};

/**
 * Obtém o último dia da semana (domingo)
 */
export const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

/**
 * Obtém o primeiro dia do mês
 */
export const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Obtém o último dia do mês
 */
export const getMonthEnd = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Adiciona meses a uma data
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Subtrai meses de uma data
 */
export const subtractMonths = (date: Date, months: number): Date => {
  return addMonths(date, -months);
};

/**
 * Adiciona anos a uma data
 */
export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

/**
 * Subtrai anos de uma data
 */
export const subtractYears = (date: Date, years: number): Date => {
  return addYears(date, -years);
};

/**
 * Verifica se duas datas são do mesmo mês
 */
export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Verifica se duas datas são do mesmo ano
 */
export const isSameYear = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear();
};

/**
 * Obtém a diferença em dias entre duas datas
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const timeDiff = date2.getTime() - date1.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Obtém a diferença em dias úteis entre duas datas
 */
export const getBusinessDaysDifference = (date1: Date, date2: Date, holidays: string[] = []): number => {
  let count = 0;
  const start = new Date(Math.min(date1.getTime(), date2.getTime()));
  const end = new Date(Math.max(date1.getTime(), date2.getTime()));
  
  const current = new Date(start);
  while (current <= end) {
    if (isBusinessDay(current, holidays)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

/**
 * Valida se uma data está dentro de um intervalo
 */
export const isDateInRange = (
  date: Date,
  minDate?: Date | null,
  maxDate?: Date | null
): boolean => {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
};

/**
 * Obtém a data mínima válida (hoje ou minDate, o que for maior)
 */
export const getMinValidDate = (minDate?: Date | null): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!minDate) return today;
  
  const min = new Date(minDate);
  min.setHours(0, 0, 0, 0);
  
  return min > today ? min : today;
};

/**
 * Obtém a data máxima válida
 */
export const getMaxValidDate = (maxDate?: Date | null): Date | null => {
  if (!maxDate) return null;
  
  const max = new Date(maxDate);
  max.setHours(23, 59, 59, 999);
  return max;
};
