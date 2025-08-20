import { describe, it, expect, vi } from 'vitest'
import {
  DATE_PRESETS,
  DATE_RANGE_PRESETS,
  getDatePreset,
  getDateRangePreset,
  applyDatePreset,
  applyDateRangePreset
} from '../presets'

// Mock date-fns to have consistent dates
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    addDays: vi.fn((date, days) => {
      const result = new Date(date)
      result.setDate(result.getDate() + days)
      return result
    }),
    addBusinessDays: vi.fn((date, days) => {
      const result = new Date(date)
      result.setDate(result.getDate() + days)
      return result
    }),
    startOfMonth: vi.fn((date) => {
      const result = new Date(date)
      result.setDate(1)
      return result
    }),
    endOfMonth: vi.fn((date) => {
      const result = new Date(date)
      result.setMonth(result.getMonth() + 1, 0)
      return result
    }),
    subDays: vi.fn((date, days) => {
      const result = new Date(date)
      result.setDate(result.getDate() - days)
      return result
    })
  }
})

describe('Presets de Data', () => {
  describe('DATE_PRESETS', () => {
    it('não deve conter presets "Hoje" e "Amanhã"', () => {
      const labels = DATE_PRESETS.map(preset => preset.label);
      const values = DATE_PRESETS.map(preset => preset.value);
      
      expect(labels).not.toContain('Hoje');
      expect(labels).not.toContain('Amanhã');
      expect(values).not.toContain('today');
      expect(values).not.toContain('tomorrow');
    });

    it('deve conter presets úteis', () => {
      const labels = DATE_PRESETS.map(preset => preset.label);
      
      expect(labels).toContain('Próximo dia útil');
      expect(labels).toContain('+5 dias úteis');
      expect(labels).toContain('+10 dias úteis');
      expect(labels).toContain('+20 dias úteis');
    });
  });

  describe('DATE_RANGE_PRESETS', () => {
    it('não deve conter preset "Hoje"', () => {
      const labels = DATE_RANGE_PRESETS.map(preset => preset.label);
      const values = DATE_RANGE_PRESETS.map(preset => preset.value);
      
      expect(labels).not.toContain('Hoje');
      expect(values).not.toContain('today');
    });

    it('deve conter presets de intervalo úteis', () => {
      const labels = DATE_RANGE_PRESETS.map(preset => preset.label);
      
      expect(labels).toContain('Esta semana');
      expect(labels).toContain('Semana passada');
      expect(labels).toContain('Próximos 5 dias úteis');
      expect(labels).toContain('Este mês');
    });
  });
});
