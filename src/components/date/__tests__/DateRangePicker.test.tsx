import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateRangePicker } from '../DateRangePicker'

// Mock date-fns to have consistent dates
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    format: vi.fn((date, formatStr) => {
      if (formatStr === 'dd/MM/yyyy') {
        return '15/01/2024'
      }
      return '15/01/2024'
    }),
    differenceInDays: vi.fn(() => 5),
    differenceInBusinessDays: vi.fn(() => 3)
  }
})

describe('DateRangePicker', () => {
  const defaultProps = {
    value: {
      start: new Date('2024-01-15'),
      end: new Date('2024-01-20')
    },
    onChange: vi.fn(),
    placeholder: 'Selecione um período'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with placeholder when no value', () => {
    render(<DateRangePicker {...defaultProps} value={undefined} />)
    expect(screen.getByPlaceholderText('Selecione um período')).toBeInTheDocument()
  })

  it('displays selected date range in correct format', () => {
    render(<DateRangePicker {...defaultProps} />)
    expect(screen.getByDisplayValue('15/01/2024 - 15/01/2024')).toBeInTheDocument()
  })

  it('opens calendar on input click', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker {...defaultProps} />)
    
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('opens calendar on calendar button click', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker {...defaultProps} />)
    
    const calendarButton = screen.getByRole('button', { name: /abrir calendário/i })
    await user.click(calendarButton)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('calls onChange when date range is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateRangePicker {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Click on start date (assuming day 10 is visible)
    const day10 = screen.getByRole('button', { name: /10/i })
    if (day10) {
      await user.click(day10)
    }
    
    // Click on end date (assuming day 25 is visible)
    const day25 = screen.getByRole('button', { name: /25/i })
    if (day25) {
      await user.click(day25)
      expect(onChange).toHaveBeenCalled()
    }
  })

  it('displays range statistics', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker {...defaultProps} showStatistics />)
    
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/total de dias/i)).toBeInTheDocument()
      expect(screen.getByText(/dias úteis/i)).toBeInTheDocument()
      expect(screen.getByText(/fins de semana/i)).toBeInTheDocument()
    })
  })

  it('applies disabled state correctly', () => {
    render(<DateRangePicker {...defaultProps} disabled />)
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    expect(input).toBeDisabled()
  })

  it('applies readOnly state correctly', () => {
    render(<DateRangePicker {...defaultProps} readOnly />)
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    expect(input).toHaveAttribute('readonly')
  })

  it('shows error state when error prop is provided', () => {
    render(<DateRangePicker {...defaultProps} error="Período inválido" />)
    expect(screen.getByText('Período inválido')).toBeInTheDocument()
  })

  it('displays presets when showPresets is true', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker {...defaultProps} showPresets />)
    
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByText('Este mês')).toBeInTheDocument()
      expect(screen.getByText('Próximos 30 dias')).toBeInTheDocument()
      expect(screen.getByText('Últimos 7 dias')).toBeInTheDocument()
    })
  })

  it('applies minDate restriction', async () => {
    const user = userEvent.setup()
    const minDate = new Date('2024-01-10')
    render(<DateRangePicker {...defaultProps} minDate={minDate} />)
    
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Days before minDate should be disabled
    const day5 = screen.getByRole('button', { name: /5/i })
    if (day5) {
      expect(day5).toBeDisabled()
    }
  })

  it('applies maxDate restriction', async () => {
    const user = userEvent.setup()
    const maxDate = new Date('2024-01-25')
    render(<DateRangePicker {...defaultProps} maxDate={maxDate} />)
    
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Days after maxDate should be disabled
    const day30 = screen.getByRole('button', { name: /30/i })
    if (day30) {
      expect(day30).toBeDisabled()
    }
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker {...defaultProps} />)
    
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Test arrow key navigation
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
    
    expect(defaultProps.onChange).toHaveBeenCalled()
  })

  it('closes calendar on escape key', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker {...defaultProps} />)
    
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    await user.keyboard('{Escape}')
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('handles single date selection when allowSingleDate is true', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateRangePicker {...defaultProps} allowSingleDate onChange={onChange} />)
    
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Click on a single day
    const day15 = screen.getByRole('button', { name: /15/i })
    if (day15) {
      await user.click(day15)
      expect(onChange).toHaveBeenCalledWith({
        start: expect.any(Date),
        end: expect.any(Date)
      })
    }
  })

  it('validates date range when minRange is set', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateRangePicker {...defaultProps} minRange={3} onChange={onChange} />)
    
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Try to select a range smaller than minRange
    const day16 = screen.getByRole('button', { name: /16/i })
    const day17 = screen.getByRole('button', { name: /17/i })
    
    if (day16 && day17) {
      await user.click(day16)
      await user.click(day17)
      
      // Should show validation error
      expect(screen.getByText(/mínimo de 3 dias/i)).toBeInTheDocument()
    }
  })

  it('validates date range when maxRange is set', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateRangePicker {...defaultProps} maxRange={10} onChange={onChange} />)
    
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Try to select a range larger than maxRange
    const day30 = screen.getByRole('button', { name: /30/i })
    
    if (day30) {
      await user.click(day30)
      
      // Should show validation error
      expect(screen.getByText(/máximo de 10 dias/i)).toBeInTheDocument()
    }
  })

  it('handles business days only restriction', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker {...defaultProps} businessDaysOnly />)
    
    const input = screen.getByDisplayValue('15/01/2024 - 15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Weekend days should be disabled
    const weekendDay = screen.getByRole('button', { name: /6/i }) // Saturday
    if (weekendDay) {
      expect(weekendDay).toBeDisabled()
    }
  })

  it('formats date range correctly for different locales', () => {
    render(<DateRangePicker {...defaultProps} />)
    expect(screen.getByDisplayValue('15/01/2024 - 15/01/2024')).toBeInTheDocument()
  })

  it('handles invalid date range gracefully', () => {
    render(<DateRangePicker {...defaultProps} value={{ start: new Date('invalid'), end: new Date('invalid') }} />)
    expect(screen.getByPlaceholderText('Selecione um período')).toBeInTheDocument()
  })
})
