/**
 * Componente DatePicker padronizado com localização pt-BR
 */

import React, { useState, useCallback, useMemo } from 'react';
import './calendar-fill.css';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  formatDate, 
  parseDate, 
  toISOString, 
  fromISOString,
  getDayClasses,
  getDateTooltip,
  getMonthName,
  addMonths,
  subtractMonths,
  isToday,
  isDateInRange,
  getMinValidDate,
  getMaxValidDate
} from './utils';
import { 
  isBusinessDay, 
  isHoliday, 
  getHolidayName 
} from '@/lib/holidays-br';
import { 
  DATE_PRESETS, 
  applyDatePreset 
} from './presets';

export interface DatePickerProps {
  /** Data selecionada (string ISO ou Date) */
  value?: string | Date | null;
  /** Callback quando a data muda */
  onChange?: (date: string | null) => void;
  /** Data mínima permitida */
  minDate?: Date | null;
  /** Data máxima permitida */
  maxDate?: Date | null;
  /** Datas desabilitadas */
  disabledDates?: Date[];
  /** Desabilitar fins de semana */
  disableWeekends?: boolean;
  /** Desabilitar feriados */
  disableHolidays?: boolean;
  /** Permitir apenas dias úteis */
  businessDaysOnly?: boolean;
  /** Feriados adicionais (array de strings ISO) */
  holidays?: string[];
  /** Mês padrão para exibição */
  defaultMonth?: Date;
  /** Ano padrão para exibição */
  defaultYear?: number;
  /** Mostrar seletor de hora */
  withTime?: boolean;
  /** Hora padrão (0-23) */
  defaultHour?: number;
  /** Minuto padrão (0-59) */
  defaultMinute?: number;
  /** Placeholder do input */
  placeholder?: string;
  /** Label do campo */
  label?: string;
  /** Descrição do campo */
  description?: string;
  /** Se o campo é obrigatório */
  required?: boolean;
  /** Se o campo está desabilitado */
  disabled?: boolean;
  /** Se o campo está em estado de erro */
  error?: boolean;
  /** Mensagem de erro */
  errorMessage?: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Classes CSS para o input */
  inputClassName?: string;
  /** Classes CSS para o popover */
  popoverClassName?: string;
  /** Se deve mostrar presets rápidos */
  showPresets?: boolean;
  /** Se deve mostrar feriados */
  showHolidays?: boolean;
  /** Se deve mostrar tooltips */
  showTooltips?: boolean;
  /** Se deve mostrar navegação por ano */
  showYearNavigation?: boolean;
  /** Se deve mostrar navegação por mês */
  showMonthNavigation?: boolean;
  /** Se deve mostrar o calendário em modo anual */
  annualView?: boolean;
  /** Callback quando o popover abre/fecha */
  onOpenChange?: (open: boolean) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  disableWeekends = false,
  disableHolidays = false,
  businessDaysOnly = false,
  holidays = [],
  defaultMonth,
  defaultYear,
  withTime = false,
  defaultHour = 9,
  defaultMinute = 0,
  placeholder = 'Selecione uma data',
  label,
  description,
  required = false,
  disabled = false,
  error = false,
  errorMessage,
  className,
  inputClassName,
  popoverClassName,
  showPresets = true,
  showHolidays = true,
  showTooltips = true,
  showYearNavigation = true,
  showMonthNavigation = true,
  annualView = false,
  onOpenChange,
}) => {
  // Estado interno
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? (typeof value === 'string' ? fromISOString(value) : value) : null
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(
    defaultMonth || selectedDate || new Date()
  );
  const [time, setTime] = useState<{ hour: number; minute: number }>({
    hour: defaultHour,
    minute: defaultMinute,
  });

  // Atualiza o estado quando o valor externo muda
  React.useEffect(() => {
    const newDate = value ? (typeof value === 'string' ? fromISOString(value) : value) : null;
    setSelectedDate(newDate);
    if (newDate) {
      setCurrentMonth(newDate);
    }
  }, [value]);

  // Configuração do react-day-picker
  const dayPickerProps = useMemo(() => ({
    mode: 'single' as const,
    selected: selectedDate,
    onSelect: (date: Date | undefined) => {
      if (date) {
        const newDate = new Date(date);
        if (withTime) {
          newDate.setHours(time.hour, time.minute, 0, 0);
        }
        setSelectedDate(newDate);
      }
    },
    month: currentMonth,
    onMonthChange: setCurrentMonth,
    locale: ptBR,
    weekStartsOn: 1 as const, // Segunda-feira
    showOutsideDays: false, // Mostrar apenas datas do mês atual
    fixedWeeks: true,
    className: 'p-0',
    classNames: {
      months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full h-full',
      month: 'space-y-4 w-full h-full',
      caption: 'flex justify-center pt-3 relative items-center w-full text-center',
      caption_label: 'text-sm font-medium text-center',
      nav: 'space-x-1 flex items-center',
      nav_button: cn(
        'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
      ),
      nav_button_previous: 'absolute left-1',
      nav_button_next: 'absolute right-1',
      table: 'w-full h-full border-collapse space-y-1',
      head_row: 'flex w-full',
      head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem] flex-1 text-center',
      row: 'flex w-full mt-2',
      cell: 'h-full w-full text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex-1',
      day: cn(
        'h-full w-full p-0 font-normal aria-selected:opacity-100',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
      ),
      day_range_end: 'day-range-end',
      day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary focus:text-primary-foreground',
      day_today: 'bg-accent text-accent-foreground',
      day_outside: 'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
      day_disabled: 'text-muted-foreground opacity-50',
      day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
      day_hidden: 'invisible',
    },
    modifiers: {
      disabled: (date: Date) => {
        // Datas desabilitadas
        if (disabledDates.some(d => d.toDateString() === date.toDateString())) {
          return true;
        }
        
        // Verificar limites
        if (!isDateInRange(date, minDate, maxDate)) {
          return true;
        }
        
        // Fins de semana
        if (disableWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
          return true;
        }
        
        // Feriados
        if (disableHolidays && isHoliday(date, holidays)) {
          return true;
        }
        
        // Apenas dias úteis
        if (businessDaysOnly && !isBusinessDay(date, holidays)) {
          return true;
        }
        
        return false;
      },
      holiday: (date: Date) => isHoliday(date, holidays),
      weekend: (date: Date) => date.getDay() === 0 || date.getDay() === 6,
    },
    modifiersStyles: {
      holiday: { color: 'hsl(var(--destructive))', fontWeight: 'bold' },
      weekend: { color: 'hsl(var(--muted-foreground) / 0.6)' },
    },
  }), [
    selectedDate,
    currentMonth,
    time,
    withTime,
    minDate,
    maxDate,
    disabledDates,
    disableWeekends,
    disableHolidays,
    businessDaysOnly,
    holidays,
  ]);

  // Função para aplicar preset
  const handlePresetSelect = useCallback((presetValue: string) => {
    const presetDate = applyDatePreset(presetValue);
    if (presetDate) {
      const newDate = new Date(presetDate);
      if (withTime) {
        newDate.setHours(time.hour, time.minute, 0, 0);
      }
      setSelectedDate(newDate);
      setCurrentMonth(newDate);
    }
  }, [withTime, time]);

  // Função para confirmar seleção
  const handleConfirm = useCallback(() => {
    if (selectedDate) {
      const isoString = toISOString(selectedDate);
      onChange?.(isoString);
    } else {
      onChange?.(null);
    }
    setOpen(false);
  }, [selectedDate, onChange]);

  // Função para limpar seleção
  const handleClear = useCallback(() => {
    setSelectedDate(null);
    onChange?.(null);
  }, [onChange]);

  // Função para navegar para o mês atual
  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    if (!selectedDate) {
      setSelectedDate(today);
    }
  }, [selectedDate]);

  // Função para navegar para o ano
  const goToYear = useCallback((year: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(year);
    setCurrentMonth(newMonth);
  }, [currentMonth]);

  // Função para navegar para o mês
  const goToMonth = useCallback((month: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(month);
    setCurrentMonth(newMonth);
  }, [currentMonth]);

  // Valor de exibição
  const displayValue = useMemo(() => {
    if (!selectedDate) return '';
    
    if (withTime) {
      return formatDate(selectedDate, 'dd/MM/yyyy HH:mm');
    }
    
    return formatDate(selectedDate);
  }, [selectedDate, withTime]);

  // Anos disponíveis para navegação
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  }, []);

  // Meses disponíveis
  const months = useMemo(() => [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ], []);

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <Popover open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        onOpenChange?.(newOpen);
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
              error && 'border-destructive',
              inputClassName
            )}
            disabled={disabled}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {displayValue || placeholder}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className={cn('p-0 w-[min(95vw,520px)] md:w-[520px] max-w-[95vw] h-[min(80vh,580px)] max-h-[80vh] overflow-hidden', popoverClassName)} 
          align="start"
          avoidCollisions
          collisionPadding={16}
          sideOffset={8}
        >
          <div className="grid grid-rows-[auto_auto_1fr_auto] h-full">
            {/* Navegação (ano/mês/setas) */}
            {showMonthNavigation && (
              <div className="px-3 pt-3 pb-4 flex flex-wrap items-center gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subtractMonths(currentMonth, 1))}
                  disabled={minDate && subtractMonths(currentMonth, 1) < minDate}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-2">
                  {showYearNavigation && (
                    <Select
                      value={currentMonth.getFullYear().toString()}
                      onValueChange={(value) => goToYear(parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Select
                    value={currentMonth.getMonth().toString()}
                    onValueChange={(value) => goToMonth(parseInt(value))}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  disabled={maxDate && addMonths(currentMonth, 1) > maxDate}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Barra Rápido (rolagem horizontal no mobile) */}
            {showPresets && (
              <div className="px-3 pb-3 border-b overflow-x-auto">
                <div className="flex gap-3 min-w-max">
                  {DATE_PRESETS.slice(0, 6).map((preset) => (
                    <Badge
                      key={preset.value}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent text-xs whitespace-nowrap"
                      onClick={() => handlePresetSelect(preset.value)}
                    >
                      {preset.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Grade do calendário – preenche tudo */}
            <div className="px-3 pb-2 h-full overflow-hidden">
              <div className="calendar-fill h-full">
                <TooltipProvider>
                  <DayPicker {...dayPickerProps} />
                </TooltipProvider>
              </div>
            </div>

            {/* Rodapé */}
            <div className="px-3 py-2 border-t flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                >
                  Hoje
                </Button>
                {selectedDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                  >
                    Limpar
                  </Button>
                )}
              </div>
              
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={!selectedDate}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
};
