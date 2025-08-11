/**
 * Exemplo de uso do DatePicker com sistema de dias úteis
 */

import React, { useState } from 'react';
import { DatePicker } from './DatePicker';
import { getTodayISO } from '@/lib/dates/today';
import { ORG_TZ } from '@/config/timezone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DatePickerExample() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const todayISO = getTodayISO(ORG_TZ);

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Correção de Timezone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Data de hoje: <strong>{todayISO}</strong>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Clique em uma data no calendário e verifique se a data selecionada é a mesma que você clicou.
            </p>
          </div>

          <DatePicker
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date || '');
              console.log('Data selecionada:', date);
            }}
            label="Selecione uma data"
            description="Teste de correção de timezone"
            defaultToToday={false}
            timezone={ORG_TZ}
          />

          {selectedDate && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Data selecionada:</strong> {selectedDate}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Se esta data corresponde exatamente à data que você clicou, a correção funcionou!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
