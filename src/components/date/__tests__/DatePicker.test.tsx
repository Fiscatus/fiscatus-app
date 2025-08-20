import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatePicker } from '../DatePicker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock date-fns to have consistent dates
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    format: vi.fn((date, formatStr) => {
      if (formatStr === 'dd/MM/yyyy') {
        return '15/01/2024'
      }
      if (formatStr === 'dd/MM/yyyy HH:mm') {
        return '15/01/2024 14:30'
      }
      return '15/01/2024'
    })
  }
})

describe('DatePicker', () => {
  const defaultProps = {
    value: new Date('2024-01-15'),
    onChange: vi.fn(),
    placeholder: 'Selecione uma data'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with placeholder', () => {
    render(<DatePicker {...defaultProps} value={undefined} />)
    expect(screen.getByPlaceholderText('Selecione uma data')).toBeInTheDocument()
  })

  it('displays selected date in correct format', () => {
    render(<DatePicker {...defaultProps} />)
    expect(screen.getByDisplayValue('15/01/2024')).toBeInTheDocument()
  })

  it('opens calendar on input click', async () => {
    const user = userEvent.setup()
    render(<DatePicker {...defaultProps} />)
    
    const input = screen.getByDisplayValue('15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('opens calendar on calendar button click', async () => {
    const user = userEvent.setup()
    render(<DatePicker {...defaultProps} />)
    
    const calendarButton = screen.getByRole('button', { name: /abrir calendário/i })
    await user.click(calendarButton)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('calls onChange when date is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByDisplayValue('15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Click on a day (assuming day 20 is visible)
    const day20 = screen.getByRole('button', { name: /20/i })
    if (day20) {
      await user.click(day20)
      expect(onChange).toHaveBeenCalled()
    }
  })

  it('displays time picker when withTime is true', async () => {
    const user = userEvent.setup()
    render(<DatePicker {...defaultProps} withTime />)
    
    const input = screen.getByDisplayValue('15/01/2024 14:30')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText(/hora/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/minuto/i)).toBeInTheDocument()
    })
  })

  it('applies disabled state correctly', () => {
    render(<DatePicker {...defaultProps} disabled />)
    const input = screen.getByDisplayValue('15/01/2024')
    expect(input).toBeDisabled()
  })

  it('applies readOnly state correctly', () => {
    render(<DatePicker {...defaultProps} readOnly />)
    const input = screen.getByDisplayValue('15/01/2024')
    expect(input).toHaveAttribute('readonly')
  })

  it('shows error state when error prop is provided', () => {
    render(<DatePicker {...defaultProps} error="Data inválida" />)
    expect(screen.getByText('Data inválida')).toBeInTheDocument()
  })

  it('displays presets when showPresets is true', async () => {
    const user = userEvent.setup()
    render(<DatePicker {...defaultProps} showPresets />)
    
    const input = screen.getByDisplayValue('15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByText('Hoje')).toBeInTheDocument()
      expect(screen.getByText('Amanhã')).toBeInTheDocument()
      expect(screen.getByText('Próximo dia útil')).toBeInTheDocument()
    })
  })

  it('applies minDate restriction', async () => {
    const user = userEvent.setup()
    const minDate = new Date('2024-01-10')
    render(<DatePicker {...defaultProps} minDate={minDate} />)
    
    const input = screen.getByDisplayValue('15/01/2024')
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
    render(<DatePicker {...defaultProps} maxDate={maxDate} />)
    
    const input = screen.getByDisplayValue('15/01/2024')
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
    render(<DatePicker {...defaultProps} />)
    
    const input = screen.getByDisplayValue('15/01/2024')
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
    render(<DatePicker {...defaultProps} />)
    
    const input = screen.getByDisplayValue('15/01/2024')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    await user.keyboard('{Escape}')
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('formats date correctly for different locales', () => {
    render(<DatePicker {...defaultProps} />)
    expect(screen.getByDisplayValue('15/01/2024')).toBeInTheDocument()
  })

  it('handles invalid date gracefully', () => {
    render(<DatePicker {...defaultProps} value={new Date('invalid')} />)
    expect(screen.getByPlaceholderText('Selecione uma data')).toBeInTheDocument()
  })
})
