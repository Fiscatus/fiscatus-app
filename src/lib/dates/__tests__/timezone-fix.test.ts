import { getTodayISO } from '../today';
import { fromISOString, toISOString } from '@/components/date/utils';

describe('Correção de Timezone', () => {
  it('deve retornar a data de hoje correta', () => {
    const todayISO = getTodayISO();
    const today = new Date();
    const expectedISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    expect(todayISO).toBe(expectedISO);
  });

  it('deve converter string ISO para Date preservando a data local', () => {
    const testDate = '2024-12-20';
    const date = fromISOString(testDate);
    
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(11); // Dezembro (0-indexed)
    expect(date?.getDate()).toBe(20);
  });

  it('deve converter Date para string ISO preservando a data local', () => {
    const testDate = new Date(2024, 11, 20, 12, 0, 0, 0); // 20/12/2024
    const isoString = toISOString(testDate);
    
    expect(isoString).toBe('2024-12-20');
  });

  it('deve manter consistência entre conversões', () => {
    const originalISO = '2024-12-20';
    const date = fromISOString(originalISO);
    const convertedISO = toISOString(date);
    
    expect(convertedISO).toBe(originalISO);
  });

  it('deve lidar com datas em diferentes horários do dia', () => {
    // Testar com diferentes horários para a mesma data
    const testDate1 = new Date(2024, 11, 20, 0, 0, 0, 0); // Meia-noite
    const testDate2 = new Date(2024, 11, 20, 23, 59, 59, 999); // Final do dia
    
    const iso1 = toISOString(testDate1);
    const iso2 = toISOString(testDate2);
    
    expect(iso1).toBe('2024-12-20');
    expect(iso2).toBe('2024-12-20');
  });
});
