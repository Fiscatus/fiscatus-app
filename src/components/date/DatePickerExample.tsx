/**
 * Exemplo de uso dos componentes de data
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DatePicker, DateRangePicker, YearCalendar } from './index';

export const DatePickerExample: React.FC = () => {
  const [singleDate, setSingleDate] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [selectedYearDate, setSelectedYearDate] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Sistema de Seletores de Data</h1>
        <p className="text-muted-foreground mt-2">
          Exemplos de uso dos componentes padronizados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DatePicker */}
        <Card>
          <CardHeader>
            <CardTitle>DatePicker - Data Única</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DatePicker
              value={singleDate}
              onChange={setSingleDate}
              label="Data de início"
              placeholder="Selecione uma data"
              showPresets={true}
              withTime={false}
            />
            
            <Separator />
            
            <div className="text-sm">
              <strong>Data selecionada:</strong> {singleDate || 'Nenhuma'}
            </div>
          </CardContent>
        </Card>

        {/* DatePicker com Hora */}
        <Card>
          <CardHeader>
            <CardTitle>DatePicker - Com Hora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DatePicker
              value={singleDate}
              onChange={setSingleDate}
              label="Data e hora"
              placeholder="Selecione data e hora"
              withTime={true}
              defaultHour={9}
              defaultMinute={0}
            />
            
            <Separator />
            
            <div className="text-sm">
              <strong>Data selecionada:</strong> {singleDate || 'Nenhuma'}
            </div>
          </CardContent>
        </Card>

        {/* DateRangePicker */}
        <Card>
          <CardHeader>
            <CardTitle>DateRangePicker - Intervalo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              label="Período de execução"
              placeholder="Selecione um período"
              showPresets={true}
              showRangeStats={true}
            />
            
            <Separator />
            
            <div className="text-sm">
              <strong>Intervalo selecionado:</strong>
              {dateRange ? (
                <div>
                  <div>Início: {dateRange.start}</div>
                  <div>Fim: {dateRange.end}</div>
                </div>
              ) : (
                'Nenhum'
              )}
            </div>
          </CardContent>
        </Card>

        {/* DatePicker com Restrições */}
        <Card>
          <CardHeader>
            <CardTitle>DatePicker - Com Restrições</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DatePicker
              value={singleDate}
              onChange={setSingleDate}
              label="Apenas dias úteis"
              placeholder="Selecione um dia útil"
              businessDaysOnly={true}
              minDate={new Date()}
              maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // +1 ano
            />
            
            <Separator />
            
            <div className="text-sm">
              <strong>Data selecionada:</strong> {singleDate || 'Nenhuma'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* YearCalendar */}
      <Card>
        <CardHeader>
          <CardTitle>YearCalendar - Visualização Anual</CardTitle>
        </CardHeader>
        <CardContent>
          <YearCalendar
            year={currentYear}
            selectedDate={selectedYearDate}
            onDateSelect={setSelectedYearDate}
            onYearChange={setCurrentYear}
            showHolidays={true}
            showWeekends={true}
          />
          
          <Separator className="my-4" />
          
          <div className="text-sm">
            <strong>Data selecionada:</strong> {selectedYearDate || 'Nenhuma'}
          </div>
        </CardContent>
      </Card>

      {/* Informações */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>✅ Localização pt-BR completa</div>
          <div>✅ Feriados brasileiros automáticos</div>
          <div>✅ Presets rápidos</div>
          <div>✅ Suporte a dias úteis</div>
          <div>✅ Design responsivo</div>
          <div>✅ Integração com react-hook-form</div>
          <div>✅ Tipagem TypeScript completa</div>
        </CardContent>
      </Card>
    </div>
  );
};
