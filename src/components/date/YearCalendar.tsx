/**
 * Componente YearCalendar para visualização anual
 */

import React, { useState, useCallback, useMemo } from 'react';
import './calendar-fill.css';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  formatDate, 
  toISOString, 
  fromISOString,
  addYears,
  subtractYears,
  isToday,
  isDateInRange,
  getMonthName,
  getShortMonthName
} from './utils';
import { 
  isBusinessDay, 
  isHoliday, 
  getHolidayName 
} from '@/lib/holidays-br';

export interface YearCalendarProps {
  /** Ano selecionado */
  year?: number;
  /** Data selecionada (opcional) */
  selectedDate?: string | Date | null;
  /** Callback quando uma data é selecionada */
  onDateSelect?: (date: string | null) => void;
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
  /** Se deve mostrar feriados */
  showHolidays?: boolean;
  /** Se deve mostrar fins de semana */
  showWeekends?: boolean;
  /** Se deve mostrar tooltips */
  showTooltips?: boolean;
  /** Se deve mostrar navegação por ano */
  showYearNavigation?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Classes CSS para o card */
  cardClassName?: string;
  /** Callback quando o ano muda */
  onYearChange?: (year: number) => void;
}

export const YearCalendar: React.FC<YearCalendarProps> = ({
  year: propYear,
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  disabledDates = [],
  disableWeekends = false,
  disableHolidays = false,
  businessDaysOnly = false,
  holidays = [],
  showHolidays = true,
  showWeekends = true,
  showTooltips = true,
  showYearNavigation = true,
  className,
  cardClassName,
  onYearChange,
}) => {
  // Estado interno
  const [currentYear, setCurrentYear] = useState<number>(
    propYear || new Date().getFullYear()
  );
  const [selectedDateState, setSelectedDateState] = useState<Date | null>(
    selectedDate ? (typeof selectedDate === 'string' ? fromISOString(selectedDate) : selectedDate) : null
  );

  // Atualiza o estado quando as props mudam
  React.useEffect(() => {
    if (propYear) {
      setCurrentYear(propYear);
    }
  }, [propYear]);

  React.useEffect(() => {
    const newDate = selectedDate ? (typeof selectedDate === 'string' ? fromISOString(selectedDate) : selectedDate) : null;
    setSelectedDateState(newDate);
  }, [selectedDate]);

  // Anos disponíveis para navegação
  const availableYears = useMemo(() => {
    const currentYearNow = new Date().getFullYear();
    const years = [];
    for (let i = currentYearNow - 10; i <= currentYearNow + 10; i++) {
      years.push(i);
    }
    return years;
  }, []);

  // Função para navegar para o ano anterior
  const goToPreviousYear = useCallback(() => {
    const newYear = currentYear - 1;
    setCurrentYear(newYear);
    onYearChange?.(newYear);
  }, [currentYear, onYearChange]);

  // Função para navegar para o próximo ano
  const goToNextYear = useCallback(() => {
    const newYear = currentYear + 1;
    setCurrentYear(newYear);
    onYearChange?.(newYear);
  }, [currentYear, onYearChange]);

  // Função para navegar para um ano específico
  const goToYear = useCallback((year: number) => {
    setCurrentYear(year);
    onYearChange?.(year);
  }, [onYearChange]);

  // Função para selecionar uma data
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDateState(date);
      const isoString = toISOString(date);
      onDateSelect?.(isoString);
    } else {
      setSelectedDateState(null);
      onDateSelect?.(null);
    }
  }, [onDateSelect]);

  // Configuração base do DayPicker
  const baseDayPickerProps = useMemo(() => ({
    locale: ptBR,
    weekStartsOn: 1, // Segunda-feira
    showOutsideDays: true,
    fixedWeeks: true,
    className: 'p-3',
    classNames: {
      months: 'flex flex-col space-y-4',
      month: 'space-y-3',
      caption: 'flex justify-center pt-1 relative items-center',
      caption_label: 'text-sm font-medium',
      nav: 'space-x-1 flex items-center',
      nav_button: cn(
        'h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100',
        'focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1'
      ),
      nav_button_previous: 'absolute left-1',
      nav_button_next: 'absolute right-1',
      table: 'w-full border-collapse space-y-2',
      head_row: 'flex',
      head_cell: 'text-muted-foreground rounded-md w-8 h-8 font-medium text-xs flex items-center justify-center',
      row: 'flex w-full mt-2',
      cell: 'h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
      day: cn(
        'h-8 w-8 p-0 font-normal aria-selected:opacity-100 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
      ),
      day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary focus:text-primary-foreground',
      day_today: 'bg-accent text-accent-foreground ring-2 ring-primary font-bold',
      day_outside: 'day-outside text-muted-foreground opacity-30 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
      day_disabled: 'text-muted-foreground opacity-30 cursor-not-allowed',
      day_hidden: 'invisible',
    },
    modifiers: {
      disabled: (date: Date) => {
        // Verificar se é do ano atual
        if (date.getFullYear() !== currentYear) {
          return true;
        }
        
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
      holiday: (date: Date) => showHolidays && isHoliday(date, holidays),
      weekend: (date: Date) => showWeekends && (date.getDay() === 0 || date.getDay() === 6),
      today: (date: Date) => isToday(date),
      selected: (date: Date) => selectedDateState && date.toDateString() === selectedDateState.toDateString(),
    },
    modifiersStyles: {
      holiday: { color: 'hsl(var(--destructive))', fontWeight: 'bold' },
      weekend: { color: 'hsl(var(--muted-foreground) / 0.6)' },
      today: { fontWeight: 'bold' },
      selected: { fontWeight: 'bold' },
    },
  }), [
    currentYear,
    selectedDateState,
    minDate,
    maxDate,
    disabledDates,
    disableWeekends,
    disableHolidays,
    businessDaysOnly,
    holidays,
    showHolidays,
    showWeekends,
  ]);

  // Gera os meses do ano
  const months = useMemo(() => {
    const monthComponents = [];
    
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(currentYear, month, 1);
      
      monthComponents.push(
        <Card key={month} className={cn('min-w-[280px] min-h-[320px]', cardClassName)}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-center text-gray-900">
              {getShortMonthName(monthDate)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <DayPicker
              {...baseDayPickerProps}
              mode="single"
              selected={selectedDateState}
              onSelect={handleDateSelect}
              month={monthDate}
              showOutsideDays
              fixedWeeks
              className="p-2"
              classNames={{
                ...baseDayPickerProps.classNames,
                caption: 'hidden',
                nav: 'hidden',
                table: 'w-full border-collapse space-y-2',
                head_row: 'flex justify-between',
                head_cell: 'text-muted-foreground rounded-md w-9 h-9 font-medium text-xs flex items-center justify-center',
                row: 'flex w-full mt-2 justify-between',
                cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: cn(
                  'h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
                ),
              }}
            />
          </CardContent>
        </Card>
      );
    }
    
    return monthComponents;
  }, [currentYear, selectedDateState, baseDayPickerProps, handleDateSelect, cardClassName]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Navegação do ano */}
      {showYearNavigation && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousYear}
            disabled={minDate && currentYear - 1 < minDate.getFullYear()}
            className="h-10 px-4"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <Select
              value={currentYear.toString()}
              onValueChange={(value) => goToYear(parseInt(value))}
            >
              <SelectTrigger className="w-32 h-10">
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
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextYear}
            disabled={maxDate && currentYear + 1 > maxDate.getFullYear()}
            className="h-10 px-4"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Grade de meses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months}
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary rounded"></div>
          <span className="font-medium">Selecionado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-accent ring-2 ring-primary rounded"></div>
          <span className="font-medium">Hoje</span>
        </div>
        {showHolidays && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 text-destructive font-bold text-lg">●</div>
            <span className="font-medium">Feriado</span>
          </div>
        )}
        {showWeekends && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 text-muted-foreground/60 text-lg">●</div>
            <span className="font-medium">Fim de semana</span>
          </div>
        )}
      </div>
    </div>
  );
};
