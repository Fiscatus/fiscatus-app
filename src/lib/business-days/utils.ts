/**
 * APIs centrais para cálculos de dias úteis
 * Todas as funções são puras e incluem cache por ano para performance
 */

import { 
  isNationalHoliday, 
  getCachedNationalHolidays,
  clearHolidayCache as clearNationalHolidayCache 
} from './holidays-br';
import { 
  isRegionalHoliday, 
  getRegionalHolidays,
  BusinessConfig, 
  DEFAULT_BUSINESS_CONFIG 
} from './regional-config';

// Cache para resultados de cálculos por ano
const businessDayCache = new Map<string, boolean>();
const holidayCache = new Map<string, boolean>();

/**
 * Limpa todos os caches (útil para testes)
 */
export function clearAllCaches(): void {
  businessDayCache.clear();
  holidayCache.clear();
  clearNationalHolidayCache();
}

/**
 * Verifica se uma data é fim de semana
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Domingo = 0, Sábado = 6
}

/**
 * Verifica se uma data é um feriado (nacional ou regional)
 */
export function isHoliday(date: Date, cfg: BusinessConfig = DEFAULT_BUSINESS_CONFIG): boolean {
  const dateStr = date.toISOString().split('T')[0];
  const cacheKey = `holiday_${dateStr}_${cfg.includeOptional ? 'opt' : 'noopt'}`;
  
  if (holidayCache.has(cacheKey)) {
    return holidayCache.get(cacheKey)!;
  }
  
  const isHolidayResult = isNationalHoliday(date) || isRegionalHoliday(date, cfg);
  holidayCache.set(cacheKey, isHolidayResult);
  
  return isHolidayResult;
}

/**
 * Verifica se uma data é um dia útil
 */
export function isBusinessDay(date: Date, cfg: BusinessConfig = DEFAULT_BUSINESS_CONFIG): boolean {
  const dateStr = date.toISOString().split('T')[0];
  const cacheKey = `business_${dateStr}_${cfg.includeOptional ? 'opt' : 'noopt'}`;
  
  if (businessDayCache.has(cacheKey)) {
    return businessDayCache.get(cacheKey)!;
  }
  
  const isBusinessResult = !isWeekend(date) && !isHoliday(date, cfg);
  businessDayCache.set(cacheKey, isBusinessResult);
  
  return isBusinessResult;
}

/**
 * Obtém o próximo dia útil
 */
export function nextBusinessDay(date: Date, cfg: BusinessConfig = DEFAULT_BUSINESS_CONFIG): Date {
  const result = new Date(date);
  
  do {
    result.setDate(result.getDate() + 1);
  } while (!isBusinessDay(result, cfg));
  
  return result;
}

/**
 * Obtém o dia útil anterior
 */
export function prevBusinessDay(date: Date, cfg: BusinessConfig = DEFAULT_BUSINESS_CONFIG): Date {
  const result = new Date(date);
  
  do {
    result.setDate(result.getDate() - 1);
  } while (!isBusinessDay(result, cfg));
  
  return result;
}

/**
 * Adiciona n dias úteis a uma data
 */
export function addBusinessDays(date: Date, n: number, cfg: BusinessConfig = DEFAULT_BUSINESS_CONFIG): Date {
  if (n === 0) return new Date(date);
  
  const result = new Date(date);
  let daysAdded = 0;
  
  if (n > 0) {
    // Adicionar dias
    while (daysAdded < n) {
      result.setDate(result.getDate() + 1);
      if (isBusinessDay(result, cfg)) {
        daysAdded++;
      }
    }
  } else {
    // Subtrair dias
    while (daysAdded < Math.abs(n)) {
      result.setDate(result.getDate() - 1);
      if (isBusinessDay(result, cfg)) {
        daysAdded++;
      }
    }
  }
  
  return result;
}

/**
 * Calcula a diferença em dias úteis entre duas datas
 */
export function businessDaysDiff(start: Date, end: Date, cfg: BusinessConfig = DEFAULT_BUSINESS_CONFIG): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // Normalizar para meio-dia para evitar problemas de DST
  startDate.setHours(12, 0, 0, 0);
  endDate.setHours(12, 0, 0, 0);
  
  let count = 0;
  const current = new Date(startDate);
  
  // Se as datas são iguais, retornar 0
  if (startDate.getTime() === endDate.getTime()) {
    return isBusinessDay(startDate, cfg) ? 1 : 0;
  }
  
  // Determinar direção
  const step = endDate > startDate ? 1 : -1;
  
  // Contar dias úteis
  while (step > 0 ? current <= endDate : current >= endDate) {
    if (isBusinessDay(current, cfg)) {
      count++;
    }
    current.setDate(current.getDate() + step);
  }
  
  return count;
}

/**
 * Ajusta uma data para o dia útil mais próximo
 */
export function clampToBusinessDay(
  date: Date, 
  cfg: BusinessConfig = DEFAULT_BUSINESS_CONFIG, 
  direction: "next" | "prev" = "next"
): Date {
  if (isBusinessDay(date, cfg)) {
    return new Date(date);
  }
  
  if (direction === "next") {
    return nextBusinessDay(date, cfg);
  } else {
    return prevBusinessDay(date, cfg);
  }
}

/**
 * Obtém o tipo de dia e descrição
 */
export function getDayType(date: Date, cfg: BusinessConfig = DEFAULT_BUSINESS_CONFIG): {
  type: 'business' | 'weekend' | 'holiday';
  description: string;
  isOptional?: boolean;
} {
  if (isWeekend(date)) {
    return {
      type: 'weekend',
      description: date.getDay() === 0 ? 'Domingo' : 'Sábado'
    };
  }
  
  if (isHoliday(date, cfg)) {
    // Verificar se é feriado nacional
    const nationalHoliday = getCachedNationalHolidays(date.getFullYear())
      .find(h => h.dateISO === date.toISOString().split('T')[0]);
    
    if (nationalHoliday) {
      return {
        type: 'holiday',
        description: `Feriado Nacional: ${nationalHoliday.name}`
      };
    }
    
    // Verificar se é feriado regional
    const regionalHolidays = getRegionalHolidays(date.getFullYear(), cfg);
    const regionalHoliday = regionalHolidays.find(h => h.dateISO === date.toISOString().split('T')[0]);
    
    if (regionalHoliday) {
      const scopeMap = {
        'state': 'Estadual',
        'city': 'Municipal',
        'org': 'Organizacional'
      };
      
      return {
        type: 'holiday',
        description: `Feriado ${scopeMap[regionalHoliday.scope]}: ${regionalHoliday.label}`,
        isOptional: regionalHoliday.optional
      };
    }
  }
  
  return {
    type: 'business',
    description: 'Dia útil'
  };
}

/**
 * Obtém tooltip para uma data
 */
export function getDateTooltip(date: Date, cfg: BusinessConfig = DEFAULT_BUSINESS_CONFIG): string {
  const dayType = getDayType(date, cfg);
  const dateStr = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  if (dayType.isOptional) {
    return `${dateStr} — ${dayType.description} (Ponto Facultativo)`;
  }
  
  return `${dateStr} — ${dayType.description}`;
}

/**
 * Obtém todas as datas de feriados para um período
 */
export function getHolidaysForPeriod(
  startDate: Date, 
  endDate: Date, 
  cfg: BusinessConfig = DEFAULT_BUSINESS_CONFIG
): Array<{ date: Date; type: 'national' | 'regional'; name: string; optional?: boolean }> {
  const holidays: Array<{ date: Date; type: 'national' | 'regional'; name: string; optional?: boolean }> = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (isHoliday(current, cfg)) {
      // Verificar feriado nacional
      const nationalHoliday = getCachedNationalHolidays(current.getFullYear())
        .find(h => h.dateISO === current.toISOString().split('T')[0]);
      
      if (nationalHoliday) {
        holidays.push({
          date: new Date(current),
          type: 'national',
          name: nationalHoliday.name
        });
      } else {
        // Verificar feriado regional
        const regionalHolidays = getRegionalHolidays(current.getFullYear(), cfg);
        const regionalHoliday = regionalHolidays.find(h => h.dateISO === current.toISOString().split('T')[0]);
        
        if (regionalHoliday) {
          holidays.push({
            date: new Date(current),
            type: 'regional',
            name: regionalHoliday.label,
            optional: regionalHoliday.optional
          });
        }
      }
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return holidays;
}

/**
 * Obtém estatísticas de dias úteis para um período
 */
export function getBusinessDaysStats(
  startDate: Date, 
  endDate: Date, 
  cfg: BusinessConfig = DEFAULT_BUSINESS_CONFIG
): {
  totalDays: number;
  businessDays: number;
  weekends: number;
  holidays: number;
  optionalHolidays: number;
} {
  let totalDays = 0;
  let businessDays = 0;
  let weekends = 0;
  let holidays = 0;
  let optionalHolidays = 0;
  
  const current = new Date(startDate);
  
  while (current <= endDate) {
    totalDays++;
    
    if (isWeekend(current)) {
      weekends++;
    } else if (isHoliday(current, cfg)) {
      holidays++;
      
      // Verificar se é opcional
      const regionalHolidays = getRegionalHolidays(current.getFullYear(), cfg);
      const regionalHoliday = regionalHolidays.find(h => h.dateISO === current.toISOString().split('T')[0]);
      if (regionalHoliday?.optional) {
        optionalHolidays++;
      }
    } else {
      businessDays++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return {
    totalDays,
    businessDays,
    weekends,
    holidays,
    optionalHolidays
  };
}
