/**
 * Feriados brasileiros e utilitários para dias úteis
 */

export interface Holiday {
  date: string; // ISO string (YYYY-MM-DD)
  name: string;
  type: 'national' | 'state' | 'municipal';
}

// Feriados nacionais fixos
const FIXED_HOLIDAYS: Holiday[] = [
  { date: '01-01', name: 'Confraternização Universal', type: 'national' },
  { date: '04-21', name: 'Tiradentes', type: 'national' },
  { date: '05-01', name: 'Dia do Trabalho', type: 'national' },
  { date: '09-07', name: 'Independência do Brasil', type: 'national' },
  { date: '10-12', name: 'Nossa Senhora Aparecida', type: 'national' },
  { date: '11-02', name: 'Finados', type: 'national' },
  { date: '11-15', name: 'Proclamação da República', type: 'national' },
  { date: '12-25', name: 'Natal', type: 'national' },
];

// Feriados móveis (calculados dinamicamente)
const getEasterDate = (year: number): Date => {
  // Algoritmo de Meeus/Jones/Butcher para calcular a Páscoa
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
};

const getMovableHolidays = (year: number): Holiday[] => {
  const easter = getEasterDate(year);
  const easterTime = easter.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      date: new Date(easterTime - 47 * dayMs).toISOString().split('T')[0],
      name: 'Carnaval',
      type: 'national'
    },
    {
      date: new Date(easterTime - 2 * dayMs).toISOString().split('T')[0],
      name: 'Sexta-feira Santa',
      type: 'national'
    },
    {
      date: easter.toISOString().split('T')[0],
      name: 'Páscoa',
      type: 'national'
    },
    {
      date: new Date(easterTime + 60 * dayMs).toISOString().split('T')[0],
      name: 'Corpus Christi',
      type: 'national'
    }
  ];
};

/**
 * Obtém todos os feriados para um ano específico
 */
export const getHolidaysForYear = (year: number): Holiday[] => {
  const fixedHolidays = FIXED_HOLIDAYS.map(holiday => ({
    ...holiday,
    date: `${year}-${holiday.date}`
  }));
  
  const movableHolidays = getMovableHolidays(year);
  
  return [...fixedHolidays, ...movableHolidays];
};

/**
 * Verifica se uma data é um feriado
 */
export const isHoliday = (date: Date, holidays: string[] = []): boolean => {
  const dateStr = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  const yearHolidays = getHolidaysForYear(year);
  
  return yearHolidays.some(holiday => holiday.date === dateStr) ||
         holidays.includes(dateStr);
};

/**
 * Verifica se uma data é um dia útil (não é fim de semana nem feriado)
 */
export const isBusinessDay = (date: Date, holidays: string[] = []): boolean => {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Domingo = 0, Sábado = 6
  
  return !isWeekend && !isHoliday(date, holidays);
};

/**
 * Adiciona n dias úteis a uma data
 */
export const addBusinessDays = (date: Date, n: number, holidays: string[] = []): Date => {
  const result = new Date(date);
  let daysAdded = 0;
  
  while (daysAdded < n) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result, holidays)) {
      daysAdded++;
    }
  }
  
  return result;
};

/**
 * Subtrai n dias úteis de uma data
 */
export const subtractBusinessDays = (date: Date, n: number, holidays: string[] = []): Date => {
  const result = new Date(date);
  let daysSubtracted = 0;
  
  while (daysSubtracted < n) {
    result.setDate(result.getDate() - 1);
    if (isBusinessDay(result, holidays)) {
      daysSubtracted++;
    }
  }
  
  return result;
};

/**
 * Calcula o próximo dia útil
 */
export const getNextBusinessDay = (date: Date, holidays: string[] = []): Date => {
  const result = new Date(date);
  
  do {
    result.setDate(result.getDate() + 1);
  } while (!isBusinessDay(result, holidays));
  
  return result;
};

/**
 * Calcula o dia útil anterior
 */
export const getPreviousBusinessDay = (date: Date, holidays: string[] = []): Date => {
  const result = new Date(date);
  
  do {
    result.setDate(result.getDate() - 1);
  } while (!isBusinessDay(result, holidays));
  
  return result;
};

/**
 * Obtém o nome do feriado para uma data específica
 */
export const getHolidayName = (date: Date, holidays: string[] = []): string | null => {
  const dateStr = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  const yearHolidays = getHolidaysForYear(year);
  
  const holiday = yearHolidays.find(h => h.date === dateStr);
  if (holiday) return holiday.name;
  
  return null;
};

/**
 * Obtém todos os feriados para um período
 */
export const getHolidaysForPeriod = (startDate: Date, endDate: Date): Holiday[] => {
  const holidays: Holiday[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const year = current.getFullYear();
    const yearHolidays = getHolidaysForYear(year);
    
    holidays.push(...yearHolidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= startDate && holidayDate <= endDate;
    }));
    
    current.setFullYear(current.getFullYear() + 1);
  }
  
  return holidays;
};
