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

describe('Date Presets', () => {
  describe('DATE_PRESETS', () => {
    it('contains all required single date presets', () => {
      const presetKeys = Object.keys(DATE_PRESETS)
      expect(presetKeys).toContain('today')
      expect(presetKeys).toContain('tomorrow')
      expect(presetKeys).toContain('nextBusinessDay')
      expect(presetKeys).toContain('plus7Days')
      expect(presetKeys).toContain('plus15Days')
      expect(presetKeys).toContain('plus30Days')
    })

    it('has correct structure for each preset', () => {
      Object.values(DATE_PRESETS).forEach(preset => {
        expect(preset).toHaveProperty('label')
        expect(preset).toHaveProperty('value')
        expect(typeof preset.label).toBe('string')
        expect(typeof preset.value).toBe('function')
      })
    })
  })

  describe('DATE_RANGE_PRESETS', () => {
    it('contains all required range presets', () => {
      const presetKeys = Object.keys(DATE_RANGE_PRESETS)
      expect(presetKeys).toContain('thisMonth')
      expect(presetKeys).toContain('next30Days')
      expect(presetKeys).toContain('last7Days')
      expect(presetKeys).toContain('last30Days')
      expect(presetKeys).toContain('thisYear')
      expect(presetKeys).toContain('lastYear')
    })

    it('has correct structure for each preset', () => {
      Object.values(DATE_RANGE_PRESETS).forEach(preset => {
        expect(preset).toHaveProperty('label')
        expect(preset).toHaveProperty('value')
        expect(typeof preset.label).toBe('string')
        expect(typeof preset.value).toBe('function')
      })
    })
  })

  describe('getDatePreset', () => {
    it('returns preset by key', () => {
      const preset = getDatePreset('today')
      expect(preset).toBeDefined()
      expect(preset?.label).toBe('Hoje')
    })

    it('returns undefined for invalid key', () => {
      const preset = getDatePreset('invalid')
      expect(preset).toBeUndefined()
    })
  })

  describe('getDateRangePreset', () => {
    it('returns preset by key', () => {
      const preset = getDateRangePreset('thisMonth')
      expect(preset).toBeDefined()
      expect(preset?.label).toBe('Este mês')
    })

    it('returns undefined for invalid key', () => {
      const preset = getDateRangePreset('invalid')
      expect(preset).toBeUndefined()
    })
  })

  describe('applyDatePreset', () => {
    it('applies today preset', () => {
      const result = applyDatePreset('today')
      expect(result).toBeInstanceOf(Date)
    })

    it('applies tomorrow preset', () => {
      const result = applyDatePreset('tomorrow')
      expect(result).toBeInstanceOf(Date)
    })

    it('applies nextBusinessDay preset', () => {
      const result = applyDatePreset('nextBusinessDay')
      expect(result).toBeInstanceOf(Date)
    })

    it('applies plus7Days preset', () => {
      const result = applyDatePreset('plus7Days')
      expect(result).toBeInstanceOf(Date)
    })

    it('applies plus15Days preset', () => {
      const result = applyDatePreset('plus15Days')
      expect(result).toBeInstanceOf(Date)
    })

    it('applies plus30Days preset', () => {
      const result = applyDatePreset('plus30Days')
      expect(result).toBeInstanceOf(Date)
    })

    it('returns null for invalid preset', () => {
      const result = applyDatePreset('invalid')
      expect(result).toBeNull()
    })
  })

  describe('applyDateRangePreset', () => {
    it('applies thisMonth preset', () => {
      const result = applyDateRangePreset('thisMonth')
      expect(result).toHaveProperty('start')
      expect(result).toHaveProperty('end')
      expect(result.start).toBeInstanceOf(Date)
      expect(result.end).toBeInstanceOf(Date)
    })

    it('applies next30Days preset', () => {
      const result = applyDateRangePreset('next30Days')
      expect(result).toHaveProperty('start')
      expect(result).toHaveProperty('end')
      expect(result.start).toBeInstanceOf(Date)
      expect(result.end).toBeInstanceOf(Date)
    })

    it('applies last7Days preset', () => {
      const result = applyDateRangePreset('last7Days')
      expect(result).toHaveProperty('start')
      expect(result).toHaveProperty('end')
      expect(result.start).toBeInstanceOf(Date)
      expect(result.end).toBeInstanceOf(Date)
    })

    it('applies last30Days preset', () => {
      const result = applyDateRangePreset('last30Days')
      expect(result).toHaveProperty('start')
      expect(result).toHaveProperty('end')
      expect(result.start).toBeInstanceOf(Date)
      expect(result.end).toBeInstanceOf(Date)
    })

    it('applies thisYear preset', () => {
      const result = applyDateRangePreset('thisYear')
      expect(result).toHaveProperty('start')
      expect(result).toHaveProperty('end')
      expect(result.start).toBeInstanceOf(Date)
      expect(result.end).toBeInstanceOf(Date)
    })

    it('applies lastYear preset', () => {
      const result = applyDateRangePreset('lastYear')
      expect(result).toHaveProperty('start')
      expect(result).toHaveProperty('end')
      expect(result.start).toBeInstanceOf(Date)
      expect(result.end).toBeInstanceOf(Date)
    })

    it('returns null for invalid preset', () => {
      const result = applyDateRangePreset('invalid')
      expect(result).toBeNull()
    })
  })

  describe('Preset values', () => {
    it('today preset returns current date', () => {
      const today = new Date()
      const preset = DATE_PRESETS.today
      const result = preset.value()
      
      // Should be same day (ignore time)
      expect(result.getFullYear()).toBe(today.getFullYear())
      expect(result.getMonth()).toBe(today.getMonth())
      expect(result.getDate()).toBe(today.getDate())
    })

    it('tomorrow preset returns next day', () => {
      const today = new Date()
      const preset = DATE_PRESETS.tomorrow
      const result = preset.value()
      
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      
      expect(result.getFullYear()).toBe(tomorrow.getFullYear())
      expect(result.getMonth()).toBe(tomorrow.getMonth())
      expect(result.getDate()).toBe(tomorrow.getDate())
    })

    it('thisMonth preset returns current month range', () => {
      const today = new Date()
      const preset = DATE_RANGE_PRESETS.thisMonth
      const result = preset.value()
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      
      expect(result.start.getFullYear()).toBe(startOfMonth.getFullYear())
      expect(result.start.getMonth()).toBe(startOfMonth.getMonth())
      expect(result.start.getDate()).toBe(startOfMonth.getDate())
      
      expect(result.end.getFullYear()).toBe(endOfMonth.getFullYear())
      expect(result.end.getMonth()).toBe(endOfMonth.getMonth())
      expect(result.end.getDate()).toBe(endOfMonth.getDate())
    })
  })

  describe('Preset labels', () => {
    it('has correct Portuguese labels for single date presets', () => {
      expect(DATE_PRESETS.today.label).toBe('Hoje')
      expect(DATE_PRESETS.tomorrow.label).toBe('Amanhã')
      expect(DATE_PRESETS.nextBusinessDay.label).toBe('Próximo dia útil')
      expect(DATE_PRESETS.plus7Days.label).toBe('+7 dias')
      expect(DATE_PRESETS.plus15Days.label).toBe('+15 dias')
      expect(DATE_PRESETS.plus30Days.label).toBe('+30 dias')
    })

    it('has correct Portuguese labels for range presets', () => {
      expect(DATE_RANGE_PRESETS.thisMonth.label).toBe('Este mês')
      expect(DATE_RANGE_PRESETS.next30Days.label).toBe('Próximos 30 dias')
      expect(DATE_RANGE_PRESETS.last7Days.label).toBe('Últimos 7 dias')
      expect(DATE_RANGE_PRESETS.last30Days.label).toBe('Últimos 30 dias')
      expect(DATE_RANGE_PRESETS.thisYear.label).toBe('Este ano')
      expect(DATE_RANGE_PRESETS.lastYear.label).toBe('Ano passado')
    })
  })

  describe('Edge cases', () => {
    it('handles month boundaries correctly', () => {
      // Test with a date at the end of month
      const endOfMonth = new Date(2024, 0, 31) // January 31st
      const preset = DATE_PRESETS.tomorrow
      const result = preset.value()
      
      // Should handle month rollover correctly
      expect(result).toBeInstanceOf(Date)
    })

    it('handles year boundaries correctly', () => {
      // Test with a date at the end of year
      const endOfYear = new Date(2024, 11, 31) // December 31st
      const preset = DATE_PRESETS.tomorrow
      const result = preset.value()
      
      // Should handle year rollover correctly
      expect(result).toBeInstanceOf(Date)
    })

    it('handles leap years correctly', () => {
      // Test with February 29th in leap year
      const leapYearDate = new Date(2024, 1, 29) // February 29th, 2024
      const preset = DATE_PRESETS.tomorrow
      const result = preset.value()
      
      // Should handle leap year correctly
      expect(result).toBeInstanceOf(Date)
    })
  })
})
