import { getTodayISO, isToday, formatDateForDisplay } from '../today';
import { ORG_TZ } from '@/config/timezone';

describe('Sistema de Datas Atuais', () => {
  describe('getTodayISO', () => {
    it('deve retornar data de hoje no formato ISO', () => {
      const today = getTodayISO();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('deve retornar data no timezone correto', () => {
      const today = getTodayISO(ORG_TZ);
      const [year, month, day] = today.split('-');
      
      expect(year).toMatch(/^\d{4}$/);
      expect(month).toMatch(/^\d{2}$/);
      expect(day).toMatch(/^\d{2}$/);
      
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);
      
      expect(monthNum).toBeGreaterThanOrEqual(1);
      expect(monthNum).toBeLessThanOrEqual(12);
      expect(dayNum).toBeGreaterThanOrEqual(1);
      expect(dayNum).toBeLessThanOrEqual(31);
    });

    it('deve usar timezone padrão se não especificado', () => {
      const today1 = getTodayISO();
      const today2 = getTodayISO(ORG_TZ);
      expect(today1).toBe(today2);
    });
  });

  describe('isToday', () => {
    it('deve identificar se uma data é hoje', () => {
      const todayISO = getTodayISO();
      expect(isToday(todayISO)).toBe(true);
    });

    it('deve retornar false para datas diferentes de hoje', () => {
      expect(isToday('2024-01-01')).toBe(false);
      expect(isToday('2023-12-31')).toBe(false);
    });

    it('deve funcionar com objetos Date', () => {
      const today = new Date();
      const todayISO = today.toISOString().slice(0, 10);
      expect(isToday(today)).toBe(true);
    });
  });

  describe('formatDateForDisplay', () => {
    it('deve formatar data ISO para formato brasileiro', () => {
      expect(formatDateForDisplay('2024-12-20')).toBe('20/12/2024');
      expect(formatDateForDisplay('2024-01-01')).toBe('01/01/2024');
    });

    it('deve funcionar com objetos Date', () => {
      const date = new Date('2024-12-20');
      expect(formatDateForDisplay(date)).toBe('20/12/2024');
    });

    it('deve usar timezone correto', () => {
      const date = new Date('2024-12-20T00:00:00.000Z');
      const formatted = formatDateForDisplay(date, ORG_TZ);
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  describe('Integração com timezone', () => {
    it('deve manter consistência entre funções', () => {
      const todayISO = getTodayISO(ORG_TZ);
      const isTodayResult = isToday(todayISO, ORG_TZ);
      const formatted = formatDateForDisplay(todayISO, ORG_TZ);
      
      expect(isTodayResult).toBe(true);
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });
});
