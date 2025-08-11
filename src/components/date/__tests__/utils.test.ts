import { describe, it, expect, vi } from 'vitest'
import {
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
  getMaxValidDate
} from '../utils'

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('formats date correctly with default format', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date)
      expect(result).toBe('15/01/2024')
    })

    it('formats date with time when withTime is true', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatDate(date, 'dd/MM/yyyy HH:mm')
      expect(result).toBe('15/01/2024 14:30')
    })

    it('handles invalid date', () => {
      const result = formatDate(new Date('invalid'))
      expect(result).toBe('')
    })
  })

  describe('parseDate', () => {
    it('parses valid date string', () => {
      const result = parseDate('15/01/2024')
      expect(result).toEqual(new Date('2024-01-15'))
    })

    it('parses date with time', () => {
      const result = parseDate('15/01/2024 14:30')
      expect(result).toEqual(new Date('2024-01-15T14:30:00'))
    })

    it('returns null for invalid date string', () => {
      const result = parseDate('invalid')
      expect(result).toBeNull()
    })
  })

  describe('toISOString', () => {
    it('converts date to ISO string', () => {
      const date = new Date('2024-01-15')
      const result = toISOString(date)
      expect(result).toBe('2024-01-15')
    })

    it('handles invalid date', () => {
      const result = toISOString(new Date('invalid'))
      expect(result).toBe('')
    })
  })

  describe('fromISOString', () => {
    it('converts ISO string to date', () => {
      const result = fromISOString('2024-01-15')
      expect(result).toEqual(new Date('2024-01-15'))
    })

    it('returns null for invalid ISO string', () => {
      const result = fromISOString('invalid')
      expect(result).toBeNull()
    })
  })

  describe('isValidDate', () => {
    it('returns true for valid date', () => {
      const result = isValidDate(new Date('2024-01-15'))
      expect(result).toBe(true)
    })

    it('returns false for invalid date', () => {
      const result = isValidDate(new Date('invalid'))
      expect(result).toBe(false)
    })
  })

  describe('getWeekdayName', () => {
    it('returns correct weekday name', () => {
      const date = new Date('2024-01-15') // Monday
      const result = getWeekdayName(date)
      expect(result).toBe('Segunda-feira')
    })
  })

  describe('getMonthName', () => {
    it('returns correct month name', () => {
      const date = new Date('2024-01-15')
      const result = getMonthName(date)
      expect(result).toBe('Janeiro')
    })
  })

  describe('getShortMonthName', () => {
    it('returns correct short month name', () => {
      const date = new Date('2024-01-15')
      const result = getShortMonthName(date)
      expect(result).toBe('Jan')
    })
  })

  describe('isToday', () => {
    it('returns true for today', () => {
      const today = new Date()
      const result = isToday(today)
      expect(result).toBe(true)
    })

    it('returns false for other dates', () => {
      const otherDate = new Date('2024-01-15')
      const result = isToday(otherDate)
      expect(result).toBe(false)
    })
  })

  describe('isWeekend', () => {
    it('returns true for Saturday', () => {
      const saturday = new Date('2024-01-06') // Saturday
      const result = isWeekend(saturday)
      expect(result).toBe(true)
    })

    it('returns true for Sunday', () => {
      const sunday = new Date('2024-01-07') // Sunday
      const result = isWeekend(sunday)
      expect(result).toBe(true)
    })

    it('returns false for weekdays', () => {
      const monday = new Date('2024-01-08') // Monday
      const result = isWeekend(monday)
      expect(result).toBe(false)
    })
  })

  describe('getDayType', () => {
    it('returns weekend for Saturday', () => {
      const saturday = new Date('2024-01-06')
      const result = getDayType(saturday)
      expect(result).toBe('weekend')
    })

    it('returns business for Monday', () => {
      const monday = new Date('2024-01-08')
      const result = getDayType(monday)
      expect(result).toBe('business')
    })
  })

  describe('getDayTypeDescription', () => {
    it('returns correct description for business day', () => {
      const monday = new Date('2024-01-08')
      const result = getDayTypeDescription(monday)
      expect(result).toBe('Dia útil')
    })

    it('returns correct description for weekend', () => {
      const saturday = new Date('2024-01-06')
      const result = getDayTypeDescription(saturday)
      expect(result).toBe('Fim de semana')
    })
  })

  describe('getDateTooltip', () => {
    it('returns correct tooltip for business day', () => {
      const monday = new Date('2024-01-08')
      const result = getDateTooltip(monday)
      expect(result).toContain('Seg, 08/01/2024')
      expect(result).toContain('Dia útil')
    })

    it('returns correct tooltip for weekend', () => {
      const saturday = new Date('2024-01-06')
      const result = getDateTooltip(saturday)
      expect(result).toContain('Sáb, 06/01/2024')
      expect(result).toContain('Fim de semana')
    })
  })

  describe('getDayClasses', () => {
    it('returns correct classes for selected date', () => {
      const date = new Date('2024-01-15')
      const result = getDayClasses(date, { selected: date })
      expect(result).toContain('bg-primary')
      expect(result).toContain('text-primary-foreground')
    })

    it('returns correct classes for today', () => {
      const today = new Date()
      const result = getDayClasses(today, {})
      expect(result).toContain('ring-2')
      expect(result).toContain('ring-primary')
    })

    it('returns correct classes for weekend', () => {
      const saturday = new Date('2024-01-06')
      const result = getDayClasses(saturday, {})
      expect(result).toContain('text-red-500')
    })

    it('returns correct classes for disabled date', () => {
      const date = new Date('2024-01-15')
      const result = getDayClasses(date, { disabled: [date] })
      expect(result).toContain('opacity-50')
      expect(result).toContain('cursor-not-allowed')
    })
  })

  describe('getWeekStart', () => {
    it('returns start of week', () => {
      const date = new Date('2024-01-15') // Monday
      const result = getWeekStart(date)
      expect(result.getDay()).toBe(1) // Monday
    })
  })

  describe('getWeekEnd', () => {
    it('returns end of week', () => {
      const date = new Date('2024-01-15') // Monday
      const result = getWeekEnd(date)
      expect(result.getDay()).toBe(0) // Sunday
    })
  })

  describe('getMonthStart', () => {
    it('returns start of month', () => {
      const date = new Date('2024-01-15')
      const result = getMonthStart(date)
      expect(result.getDate()).toBe(1)
      expect(result.getMonth()).toBe(0) // January
    })
  })

  describe('getMonthEnd', () => {
    it('returns end of month', () => {
      const date = new Date('2024-01-15')
      const result = getMonthEnd(date)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(31)
    })
  })

  describe('addMonths', () => {
    it('adds months correctly', () => {
      const date = new Date('2024-01-15')
      const result = addMonths(date, 2)
      expect(result.getMonth()).toBe(2) // March
      expect(result.getDate()).toBe(15)
    })
  })

  describe('subtractMonths', () => {
    it('subtracts months correctly', () => {
      const date = new Date('2024-03-15')
      const result = subtractMonths(date, 2)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(15)
    })
  })

  describe('addYears', () => {
    it('adds years correctly', () => {
      const date = new Date('2024-01-15')
      const result = addYears(date, 1)
      expect(result.getFullYear()).toBe(2025)
      expect(result.getDate()).toBe(15)
    })
  })

  describe('subtractYears', () => {
    it('subtracts years correctly', () => {
      const date = new Date('2024-01-15')
      const result = subtractYears(date, 1)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getDate()).toBe(15)
    })
  })

  describe('isSameMonth', () => {
    it('returns true for same month', () => {
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-01-20')
      const result = isSameMonth(date1, date2)
      expect(result).toBe(true)
    })

    it('returns false for different months', () => {
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-02-15')
      const result = isSameMonth(date1, date2)
      expect(result).toBe(false)
    })
  })

  describe('isSameYear', () => {
    it('returns true for same year', () => {
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-12-15')
      const result = isSameYear(date1, date2)
      expect(result).toBe(true)
    })

    it('returns false for different years', () => {
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2025-01-15')
      const result = isSameYear(date1, date2)
      expect(result).toBe(false)
    })
  })

  describe('getDaysDifference', () => {
    it('calculates days difference correctly', () => {
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-01-20')
      const result = getDaysDifference(date1, date2)
      expect(result).toBe(5)
    })
  })

  describe('getBusinessDaysDifference', () => {
    it('calculates business days difference correctly', () => {
      const date1 = new Date('2024-01-15') // Monday
      const date2 = new Date('2024-01-19') // Friday
      const result = getBusinessDaysDifference(date1, date2)
      expect(result).toBe(4) // 4 business days
    })
  })

  describe('isDateInRange', () => {
    it('returns true for date in range', () => {
      const date = new Date('2024-01-15')
      const range = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-20')
      }
      const result = isDateInRange(date, range)
      expect(result).toBe(true)
    })

    it('returns false for date outside range', () => {
      const date = new Date('2024-01-25')
      const range = {
        start: new Date('2024-01-10'),
        end: new Date('2024-01-20')
      }
      const result = isDateInRange(date, range)
      expect(result).toBe(false)
    })
  })

  describe('getMinValidDate', () => {
    it('returns minimum valid date', () => {
      const dates = [
        new Date('2024-01-15'),
        new Date('2024-01-10'),
        new Date('2024-01-20')
      ]
      const result = getMinValidDate(dates)
      expect(result).toEqual(new Date('2024-01-10'))
    })

    it('handles invalid dates', () => {
      const dates = [
        new Date('invalid'),
        new Date('2024-01-15'),
        new Date('invalid')
      ]
      const result = getMinValidDate(dates)
      expect(result).toEqual(new Date('2024-01-15'))
    })
  })

  describe('getMaxValidDate', () => {
    it('returns maximum valid date', () => {
      const dates = [
        new Date('2024-01-15'),
        new Date('2024-01-10'),
        new Date('2024-01-20')
      ]
      const result = getMaxValidDate(dates)
      expect(result).toEqual(new Date('2024-01-20'))
    })

    it('handles invalid dates', () => {
      const dates = [
        new Date('invalid'),
        new Date('2024-01-15'),
        new Date('invalid')
      ]
      const result = getMaxValidDate(dates)
      expect(result).toEqual(new Date('2024-01-15'))
    })
  })
})
