/**
 * Configuração regional para feriados e pontos facultativos
 */

export type RegionalHoliday = {
  dateISO: string; // YYYY-MM-DD
  label: string;
  scope: "state" | "city" | "org";
  optional?: boolean; // true = ponto facultativo
};

export type BusinessConfig = {
  timezone?: string; // default "America/Sao_Paulo"
  includeOptional?: boolean; // considerar pontos facultativos
  regional?: Record<number, RegionalHoliday[]>; // por ano
};

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  timezone: "America/Sao_Paulo",
  includeOptional: false,
  regional: {}
};

/**
 * Exemplo de configuração regional para uma organização
 * Este arquivo pode ser carregado dinamicamente ou configurado via admin
 */
export const EXAMPLE_REGIONAL_CONFIG: Record<number, RegionalHoliday[]> = {
  2025: [
    {
      dateISO: "2025-02-24",
      label: "Carnaval (ponto facultativo)",
      scope: "org",
      optional: true
    },
    {
      dateISO: "2025-10-12",
      label: "Padroeira Municipal",
      scope: "city"
    },
    {
      dateISO: "2025-11-20",
      label: "Consciência Negra",
      scope: "state"
    }
  ],
  2024: [
    {
      dateISO: "2024-02-12",
      label: "Carnaval (ponto facultativo)",
      scope: "org",
      optional: true
    },
    {
      dateISO: "2024-10-12",
      label: "Padroeira Municipal",
      scope: "city"
    },
    {
      dateISO: "2024-11-20",
      label: "Consciência Negra",
      scope: "state"
    }
  ]
};

/**
 * Carrega configuração regional de um arquivo JSON
 */
export function loadRegionalConfig(configData: Record<number, RegionalHoliday[]>): BusinessConfig {
  return {
    ...DEFAULT_BUSINESS_CONFIG,
    regional: configData
  };
}

/**
 * Obtém feriados regionais para um ano específico
 */
export function getRegionalHolidays(year: number, config: BusinessConfig = DEFAULT_BUSINESS_CONFIG): RegionalHoliday[] {
  const yearHolidays = config.regional?.[year] || [];
  
  if (config.includeOptional) {
    return yearHolidays;
  }
  
  // Filtrar pontos facultativos se não estiverem incluídos
  return yearHolidays.filter(holiday => !holiday.optional);
}

/**
 * Verifica se uma data é um feriado regional
 */
export function isRegionalHoliday(date: Date, config: BusinessConfig = DEFAULT_BUSINESS_CONFIG): boolean {
  const dateStr = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  const regionalHolidays = getRegionalHolidays(year, config);
  
  return regionalHolidays.some(holiday => holiday.dateISO === dateStr);
}

/**
 * Obtém o nome do feriado regional para uma data específica
 */
export function getRegionalHolidayName(date: Date, config: BusinessConfig = DEFAULT_BUSINESS_CONFIG): string | null {
  const dateStr = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  const regionalHolidays = getRegionalHolidays(year, config);
  
  const holiday = regionalHolidays.find(h => h.dateISO === dateStr);
  return holiday ? holiday.label : null;
}

/**
 * Obtém o escopo do feriado regional
 */
export function getRegionalHolidayScope(date: Date, config: BusinessConfig = DEFAULT_BUSINESS_CONFIG): "state" | "city" | "org" | null {
  const dateStr = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  const regionalHolidays = getRegionalHolidays(year, config);
  
  const holiday = regionalHolidays.find(h => h.dateISO === dateStr);
  return holiday ? holiday.scope : null;
}

/**
 * Verifica se um feriado regional é opcional (ponto facultativo)
 */
export function isRegionalHolidayOptional(date: Date, config: BusinessConfig = DEFAULT_BUSINESS_CONFIG): boolean {
  const dateStr = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  const yearHolidays = config.regional?.[year] || [];
  
  const holiday = yearHolidays.find(h => h.dateISO === dateStr);
  return holiday?.optional || false;
}
