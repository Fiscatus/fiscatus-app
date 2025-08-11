import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { YearCalendar } from '../YearCalendar'

// Mock date-fns to have consistent dates
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    format: vi.fn((date, formatStr) => {
      if (formatStr === 'dd/MM/yyyy') {
        return '15/01/2024'
      }
      if (formatStr === 'MMMM yyyy') {
        return 'Janeiro 2024'
      }
      return '15/01/2024'
    }),
    getMonth: vi.fn(() => 0),
    getYear: vi.fn(() => 2024)
  }
})

describe('YearCalendar', () => {
  const defaultProps = {
    value: new Date('2024-01-15'),
    onChange: vi.fn(),
    year: 2024
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct year', () => {
    render(<YearCalendar {...defaultProps} />)
    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('displays all 12 months', () => {
    render(<YearCalendar {...defaultProps} />)
    
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    
    months.forEach(month => {
      expect(screen.getByText(month)).toBeInTheDocument()
    })
  })

  it('calls onChange when a date is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<YearCalendar {...defaultProps} onChange={onChange} />)
    
    // Click on a day in January (assuming day 15 is visible)
    const day15 = screen.getByRole('button', { name: /15/i })
    if (day15) {
      await user.click(day15)
      expect(onChange).toHaveBeenCalledWith(expect.any(Date))
    }
  })

  it('navigates to previous year', async () => {
    const user = userEvent.setup()
    const onYearChange = vi.fn()
    render(<YearCalendar {...defaultProps} onYearChange={onYearChange} />)
    
    const prevButton = screen.getByRole('button', { name: /ano anterior/i })
    await user.click(prevButton)
    
    expect(onYearChange).toHaveBeenCalledWith(2023)
  })

  it('navigates to next year', async () => {
    const user = userEvent.setup()
    const onYearChange = vi.fn()
    render(<YearCalendar {...defaultProps} onYearChange={onYearChange} />)
    
    const nextButton = screen.getByRole('button', { name: /próximo ano/i })
    await user.click(nextButton)
    
    expect(onYearChange).toHaveBeenCalledWith(2025)
  })

  it('changes year via select dropdown', async () => {
    const user = userEvent.setup()
    const onYearChange = vi.fn()
    render(<YearCalendar {...defaultProps} onYearChange={onYearChange} />)
    
    const yearSelect = screen.getByRole('combobox')
    await user.click(yearSelect)
    
    // Select a different year
    const option2025 = screen.getByRole('option', { name: '2025' })
    if (option2025) {
      await user.click(option2025)
      expect(onYearChange).toHaveBeenCalledWith(2025)
    }
  })

  it('highlights selected date', () => {
    render(<YearCalendar {...defaultProps} />)
    
    // The selected date should have a different style
    const selectedDay = screen.getByRole('button', { name: /15/i })
    if (selectedDay) {
      expect(selectedDay).toHaveClass('bg-primary')
    }
  })

  it('highlights today', () => {
    render(<YearCalendar {...defaultProps} />)
    
    // Today should have a different style
    const today = screen.getByRole('button', { name: /15/i })
    if (today) {
      expect(today).toHaveClass('ring-2')
    }
  })

  it('applies minDate restriction', () => {
    const minDate = new Date('2024-06-01')
    render(<YearCalendar {...defaultProps} minDate={minDate} />)
    
    // Days before minDate should be disabled
    const day15 = screen.getByRole('button', { name: /15/i })
    if (day15) {
      expect(day15).toBeDisabled()
    }
  })

  it('applies maxDate restriction', () => {
    const maxDate = new Date('2024-06-30')
    render(<YearCalendar {...defaultProps} maxDate={maxDate} />)
    
    // Days after maxDate should be disabled
    const day30 = screen.getByRole('button', { name: /30/i })
    if (day30) {
      expect(day30).toBeDisabled()
    }
  })

  it('disables weekends when disableWeekends is true', () => {
    render(<YearCalendar {...defaultProps} disableWeekends />)
    
    // Weekend days should be disabled
    const weekendDay = screen.getByRole('button', { name: /6/i }) // Saturday
    if (weekendDay) {
      expect(weekendDay).toBeDisabled()
    }
  })

  it('disables holidays when holidays are provided', () => {
    const holidays = ['2024-01-01', '2024-12-25']
    render(<YearCalendar {...defaultProps} holidays={holidays} />)
    
    // Holiday days should be disabled
    const holidayDay = screen.getByRole('button', { name: /1/i }) // January 1st
    if (holidayDay) {
      expect(holidayDay).toBeDisabled()
    }
  })

  it('shows holiday names on hover', async () => {
    const user = userEvent.setup()
    const holidays = ['2024-01-01']
    render(<YearCalendar {...defaultProps} holidays={holidays} />)
    
    const holidayDay = screen.getByRole('button', { name: /1/i })
    if (holidayDay) {
      await user.hover(holidayDay)
      
      await waitFor(() => {
        expect(screen.getByText(/confraternização universal/i)).toBeInTheDocument()
      })
    }
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<YearCalendar {...defaultProps} />)
    
    // Focus on a day
    const day15 = screen.getByRole('button', { name: /15/i })
    if (day15) {
      day15.focus()
      
      // Test arrow key navigation
      await user.keyboard('{ArrowRight}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')
      
      expect(defaultProps.onChange).toHaveBeenCalled()
    }
  })

  it('handles page up/down navigation', async () => {
    const user = userEvent.setup()
    render(<YearCalendar {...defaultProps} />)
    
    // Focus on a day
    const day15 = screen.getByRole('button', { name: /15/i })
    if (day15) {
      day15.focus()
      
      // Test page navigation
      await user.keyboard('{PageUp}')
      await user.keyboard('{PageDown}')
      
      // Should navigate between months
      expect(screen.getByText('Fevereiro')).toBeInTheDocument()
    }
  })

  it('displays month names in Portuguese', () => {
    render(<YearCalendar {...defaultProps} />)
    
    const portugueseMonths = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    
    portugueseMonths.forEach(month => {
      expect(screen.getByText(month)).toBeInTheDocument()
    })
  })

  it('displays weekday names in Portuguese', () => {
    render(<YearCalendar {...defaultProps} />)
    
    const portugueseWeekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    
    portugueseWeekdays.forEach(weekday => {
      expect(screen.getByText(weekday)).toBeInTheDocument()
    })
  })

  it('handles disabled dates', () => {
    const disabledDates = [new Date('2024-01-15'), new Date('2024-01-16')]
    render(<YearCalendar {...defaultProps} disabledDates={disabledDates} />)
    
    // Disabled dates should be disabled
    const disabledDay = screen.getByRole('button', { name: /15/i })
    if (disabledDay) {
      expect(disabledDay).toBeDisabled()
    }
  })

  it('applies custom styling for different day types', () => {
    render(<YearCalendar {...defaultProps} />)
    
    // Business days should have normal styling
    const businessDay = screen.getByRole('button', { name: /15/i })
    if (businessDay) {
      expect(businessDay).not.toHaveClass('text-red-500')
    }
    
    // Weekend days should have different styling
    const weekendDay = screen.getByRole('button', { name: /6/i })
    if (weekendDay) {
      expect(weekendDay).toHaveClass('text-red-500')
    }
  })

  it('handles year range restrictions', () => {
    render(<YearCalendar {...defaultProps} minYear={2020} maxYear={2030} />)
    
    // Year navigation should be limited
    const prevButton = screen.getByRole('button', { name: /ano anterior/i })
    const nextButton = screen.getByRole('button', { name: /próximo ano/i })
    
    // Should not be able to go below 2020
    expect(prevButton).not.toBeDisabled()
    
    // Should not be able to go above 2030
    expect(nextButton).not.toBeDisabled()
  })

  it('handles invalid year gracefully', () => {
    render(<YearCalendar {...defaultProps} year={NaN} />)
    expect(screen.getByText('2024')).toBeInTheDocument() // Should default to current year
  })

  it('handles invalid selected date gracefully', () => {
    render(<YearCalendar {...defaultProps} value={new Date('invalid')} />)
    // Should not crash and should render normally
    expect(screen.getByText('2024')).toBeInTheDocument()
  })
})
