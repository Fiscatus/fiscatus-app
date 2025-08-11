/**
 * Sistema de seletores de data padronizado
 * 
 * Componentes principais:
 * - DatePicker: Seletor de data única
 * - DateRangePicker: Seletor de intervalo de datas
 * - YearCalendar: Visualização anual com grade 3x4
 * 
 * Utilitários:
 * - presets: Presets de datas rápidas
 * - utils: Funções de formatação e manipulação
 * - holidays-br: Feriados brasileiros e dias úteis
 */

// Componentes principais
export { DatePicker } from './DatePicker';
export { DateRangePicker } from './DateRangePicker';
export { YearCalendar } from './YearCalendar';

// Tipos
export type { DatePickerProps } from './DatePicker';
export type { DateRangePickerProps } from './DateRangePicker';
export type { YearCalendarProps } from './YearCalendar';

// Presets
export {
  DATE_PRESETS,
  DATE_RANGE_PRESETS,
  applyDatePreset,
  applyDateRangePreset,
  getDatePreset,
  getDateRangePreset,
} from './presets';

export type {
  DatePreset,
  DateRangePreset,
} from './presets';

// Utilitários
export {
  formatDate,
  parseDate,
  toISOString,
  fromISOString,
  isValidDate,
  getWeekdayName,
  getMonthName,
  getShortMonthName,
  isToday,
  isWeekend,
  getDayType,
  getDayTypeDescription,
  getDateTooltip,
  getDayClasses,
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  addMonths,
  subtractMonths,
  addYears,
  subtractYears,
  isSameMonth,
  isSameYear,
  getDaysDifference,
  getBusinessDaysDifference,
  isDateInRange,
  getMinValidDate,
  getMaxValidDate,
  LOCALE_CONFIG,
  DATE_FORMATS,
} from './utils';

// Feriados brasileiros
export {
  getHolidaysForYear,
  isHoliday,
  isBusinessDay,
  addBusinessDays,
  subtractBusinessDays,
  getNextBusinessDay,
  getPreviousBusinessDay,
  getHolidayName,
  getHolidaysForPeriod,
} from '@/lib/holidays-br';

export type { Holiday } from '@/lib/holidays-br';
