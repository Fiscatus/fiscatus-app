/**
 * Feriados brasileiros e cálculo de feriados móveis
 */

export interface NationalHoliday {
  dateISO: string; // YYYY-MM-DD
  name: string;
  type: 'fixed' | 'movable';
}

// Feriados nacionais fixos
const FIXED_HOLIDAYS: Omit<NationalHoliday, 'dateISO'>[] = [
  { name: 'Confraternização Universal', type: 'fixed' },
  { name: 'Tiradentes', type: 'fixed' },
  { name: 'Dia do Trabalho', type: 'fixed' },
  { name: 'Independência do Brasil', type: 'fixed' },
  { name: 'Nossa Senhora Aparecida', type: 'fixed' },
  { name: 'Finados', type: 'fixed' },
  { name: 'Proclamação da República', type: 'fixed' },
  { name: 'Natal', type: 'fixed' },
];

// Datas dos feriados fixos (MM-DD)
const FIXED_DATES = [
  '01-01', // Confraternização Universal
  '04-21', // Tiradentes
  '05-01', // Dia do Trabalho
  '09-07', // Independência do Brasil
  '10-12', // Nossa Senhora Aparecida
  '11-02', // Finados
  '11-15', // Proclamação da República
  '12-25', // Natal
];

/**
 * Calcula a data da Páscoa usando o algoritmo de Meeus/Jones/Butcher
 */
export function getEasterDate(year: number): Date {
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
}

/**
 * Calcula feriados móveis baseados na Páscoa
 */
function getMovableHolidays(year: number): NationalHoliday[] {
  const easter = getEasterDate(year);
  const easterTime = easter.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      dateISO: new Date(easterTime - 47 * dayMs).toISOString().split('T')[0],
      name: 'Carnaval',
      type: 'movable'
    },
    {
      dateISO: new Date(easterTime - 2 * dayMs).toISOString().split('T')[0],
      name: 'Sexta-feira Santa',
      type: 'movable'
    },
    {
      dateISO: easter.toISOString().split('T')[0],
      name: 'Páscoa',
      type: 'movable'
    },
    {
      dateISO: new Date(easterTime + 60 * dayMs).toISOString().split('T')[0],
      name: 'Corpus Christi',
      type: 'movable'
    }
  ];
}

/**
 * Obtém todos os feriados nacionais para um ano específico
 */
export function getNationalHolidays(year: number): NationalHoliday[] {
  const fixedHolidays: NationalHoliday[] = FIXED_HOLIDAYS.map((holiday, index) => ({
    ...holiday,
    dateISO: `${year}-${FIXED_DATES[index]}`
  }));
  
  const movableHolidays = getMovableHolidays(year);
  
  return [...fixedHolidays, ...movableHolidays];
}

/**
 * Obtém o nome do feriado para uma data específica
 */
export function getHolidayName(date: Date): string | null {
  const dateStr = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  const holidays = getNationalHolidays(year);
  
  const holiday = holidays.find(h => h.dateISO === dateStr);
  return holiday ? holiday.name : null;
}

/**
 * Verifica se uma data é um feriado nacional
 */
export function isNationalHoliday(date: Date): boolean {
  return getHolidayName(date) !== null;
}

/**
 * Cache para feriados por ano (melhora performance)
 */
const holidayCache = new Map<number, NationalHoliday[]>();

/**
 * Obtém feriados nacionais com cache
 */
export function getCachedNationalHolidays(year: number): NationalHoliday[] {
  if (!holidayCache.has(year)) {
    holidayCache.set(year, getNationalHolidays(year));
  }
  return holidayCache.get(year)!;
}

/**
 * Limpa o cache de feriados (útil para testes)
 */
export function clearHolidayCache(): void {
  holidayCache.clear();
}
