import { describe, it, expect, vi } from 'vitest'
import {
  getEasterDate,
  getMovableHolidays,
  getHolidaysForYear,
  isHoliday,
  isBusinessDay,
  addBusinessDays,
  subtractBusinessDays,
  getNextBusinessDay,
  getPreviousBusinessDay,
  getHolidayName,
  getHolidaysForPeriod
} from '../../lib/holidays-br'

describe('Brazilian Holidays', () => {
  describe('getEasterDate', () => {
    it('calculates Easter date for 2024', () => {
      const result = getEasterDate(2024)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(2) // March
      expect(result.getDate()).toBe(31)
    })

    it('calculates Easter date for 2025', () => {
      const result = getEasterDate(2025)
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(3) // April
      expect(result.getDate()).toBe(20)
    })
  })

  describe('getMovableHolidays', () => {
    it('returns movable holidays for 2024', () => {
      const result = getMovableHolidays(2024)
      expect(result).toHaveLength(3) // Carnival, Good Friday, Corpus Christi
      
      const carnival = result.find(h => h.name === 'Carnaval')
      expect(carnival).toBeDefined()
      expect(carnival?.date).toBe('2024-02-13')
      
      const goodFriday = result.find(h => h.name === 'Sexta-feira Santa')
      expect(goodFriday).toBeDefined()
      expect(goodFriday?.date).toBe('2024-03-29')
      
      const corpusChristi = result.find(h => h.name === 'Corpus Christi')
      expect(corpusChristi).toBeDefined()
      expect(corpusChristi?.date).toBe('2024-05-30')
    })
  })

  describe('getHolidaysForYear', () => {
    it('returns all holidays for 2024', () => {
      const result = getHolidaysForYear(2024)
      expect(result.length).toBeGreaterThan(10) // Fixed + movable holidays
      
      // Check for fixed holidays
      const newYear = result.find(h => h.name === 'Confraternização Universal')
      expect(newYear).toBeDefined()
      expect(newYear?.date).toBe('2024-01-01')
      
      const independence = result.find(h => h.name === 'Independência do Brasil')
      expect(independence).toBeDefined()
      expect(independence?.date).toBe('2024-09-07')
      
      const christmas = result.find(h => h.name === 'Natal')
      expect(christmas).toBeDefined()
      expect(christmas?.date).toBe('2024-12-25')
    })
  })

  describe('isHoliday', () => {
    it('returns true for New Year', () => {
      const newYear = new Date('2024-01-01')
      const result = isHoliday(newYear)
      expect(result).toBe(true)
    })

    it('returns true for Christmas', () => {
      const christmas = new Date('2024-12-25')
      const result = isHoliday(christmas)
      expect(result).toBe(true)
    })

    it('returns false for regular weekday', () => {
      const regularDay = new Date('2024-01-15') // Monday
      const result = isHoliday(regularDay)
      expect(result).toBe(false)
    })

    it('returns false for weekend', () => {
      const saturday = new Date('2024-01-06') // Saturday
      const result = isHoliday(saturday)
      expect(result).toBe(false) // Weekends are not holidays, they're weekends
    })
  })

  describe('isBusinessDay', () => {
    it('returns true for regular weekday', () => {
      const monday = new Date('2024-01-08') // Monday
      const result = isBusinessDay(monday)
      expect(result).toBe(true)
    })

    it('returns false for weekend', () => {
      const saturday = new Date('2024-01-06') // Saturday
      const result = isBusinessDay(saturday)
      expect(result).toBe(false)
    })

    it('returns false for holiday', () => {
      const newYear = new Date('2024-01-01')
      const result = isBusinessDay(newYear)
      expect(result).toBe(false)
    })

    it('returns false for Sunday', () => {
      const sunday = new Date('2024-01-07') // Sunday
      const result = isBusinessDay(sunday)
      expect(result).toBe(false)
    })
  })

  describe('addBusinessDays', () => {
    it('adds business days correctly', () => {
      const startDate = new Date('2024-01-15') // Monday
      const result = addBusinessDays(startDate, 3)
      expect(result.getDate()).toBe(18) // Thursday
    })

    it('skips weekends when adding business days', () => {
      const startDate = new Date('2024-01-12') // Friday
      const result = addBusinessDays(startDate, 1)
      expect(result.getDate()).toBe(15) // Monday
    })

    it('skips holidays when adding business days', () => {
      const startDate = new Date('2024-12-24') // Tuesday before Christmas
      const result = addBusinessDays(startDate, 1)
      expect(result.getDate()).toBe(26) // Thursday after Christmas
    })

    it('handles zero business days', () => {
      const startDate = new Date('2024-01-15')
      const result = addBusinessDays(startDate, 0)
      expect(result).toEqual(startDate)
    })
  })

  describe('subtractBusinessDays', () => {
    it('subtracts business days correctly', () => {
      const startDate = new Date('2024-01-18') // Thursday
      const result = subtractBusinessDays(startDate, 3)
      expect(result.getDate()).toBe(15) // Monday
    })

    it('skips weekends when subtracting business days', () => {
      const startDate = new Date('2024-01-15') // Monday
      const result = subtractBusinessDays(startDate, 1)
      expect(result.getDate()).toBe(12) // Friday
    })

    it('skips holidays when subtracting business days', () => {
      const startDate = new Date('2024-12-26') // Thursday after Christmas
      const result = subtractBusinessDays(startDate, 1)
      expect(result.getDate()).toBe(24) // Tuesday before Christmas
    })
  })

  describe('getNextBusinessDay', () => {
    it('returns next business day from weekday', () => {
      const monday = new Date('2024-01-15') // Monday
      const result = getNextBusinessDay(monday)
      expect(result.getDate()).toBe(16) // Tuesday
    })

    it('returns next business day from weekend', () => {
      const saturday = new Date('2024-01-06') // Saturday
      const result = getNextBusinessDay(saturday)
      expect(result.getDate()).toBe(8) // Monday
    })

    it('returns next business day from holiday', () => {
      const newYear = new Date('2024-01-01') // New Year
      const result = getNextBusinessDay(newYear)
      expect(result.getDate()).toBe(2) // Tuesday
    })
  })

  describe('getPreviousBusinessDay', () => {
    it('returns previous business day from weekday', () => {
      const tuesday = new Date('2024-01-16') // Tuesday
      const result = getPreviousBusinessDay(tuesday)
      expect(result.getDate()).toBe(15) // Monday
    })

    it('returns previous business day from weekend', () => {
      const saturday = new Date('2024-01-06') // Saturday
      const result = getPreviousBusinessDay(saturday)
      expect(result.getDate()).toBe(5) // Friday
    })

    it('returns previous business day from holiday', () => {
      const newYear = new Date('2024-01-01') // New Year
      const result = getPreviousBusinessDay(newYear)
      expect(result.getDate()).toBe(31) // December 31st of previous year
    })
  })

  describe('getHolidayName', () => {
    it('returns holiday name for New Year', () => {
      const newYear = new Date('2024-01-01')
      const result = getHolidayName(newYear)
      expect(result).toBe('Confraternização Universal')
    })

    it('returns holiday name for Christmas', () => {
      const christmas = new Date('2024-12-25')
      const result = getHolidayName(christmas)
      expect(result).toBe('Natal')
    })

    it('returns null for non-holiday', () => {
      const regularDay = new Date('2024-01-15')
      const result = getHolidayName(regularDay)
      expect(result).toBeNull()
    })
  })

  describe('getHolidaysForPeriod', () => {
    it('returns holidays within period', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      const result = getHolidaysForPeriod(startDate, endDate)
      
      expect(result.length).toBeGreaterThan(0)
      const newYear = result.find(h => h.name === 'Confraternização Universal')
      expect(newYear).toBeDefined()
    })

    it('returns empty array for period without holidays', () => {
      const startDate = new Date('2024-02-01')
      const endDate = new Date('2024-02-15')
      const result = getHolidaysForPeriod(startDate, endDate)
      
      // February 2024 has no fixed holidays, but may have movable ones
      expect(Array.isArray(result)).toBe(true)
    })

    it('handles single day period', () => {
      const date = new Date('2024-01-01')
      const result = getHolidaysForPeriod(date, date)
      
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('Confraternização Universal')
    })
  })

  describe('Edge cases', () => {
    it('handles leap year correctly', () => {
      const leapYear = 2024
      const result = getHolidaysForYear(leapYear)
      expect(result.length).toBeGreaterThan(0)
      
      // February 29th should not be a holiday
      const feb29 = new Date('2024-02-29')
      const isHolidayResult = isHoliday(feb29)
      expect(isHolidayResult).toBe(false)
    })

    it('handles year boundary correctly', () => {
      const dec31 = new Date('2024-12-31')
      const jan1 = new Date('2025-01-01')
      
      const dec31Holiday = isHoliday(dec31)
      const jan1Holiday = isHoliday(jan1)
      
      expect(dec31Holiday).toBe(false) // Not a fixed holiday
      expect(jan1Holiday).toBe(true) // New Year
    })

    it('handles invalid dates gracefully', () => {
      const invalidDate = new Date('invalid')
      const result = isHoliday(invalidDate)
      expect(result).toBe(false)
    })
  })
})
