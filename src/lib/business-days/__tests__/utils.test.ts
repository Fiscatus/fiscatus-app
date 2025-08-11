/**
 * Testes para utilitários de dias úteis
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isWeekend,
  isHoliday,
  isBusinessDay,
  nextBusinessDay,
  prevBusinessDay,
  addBusinessDays,
  businessDaysDiff,
  clampToBusinessDay,
  getDayType,
  clearAllCaches
} from '../utils';
import { DEFAULT_BUSINESS_CONFIG } from '../regional-config';

describe('Business Days Utils', () => {
  beforeEach(() => {
    clearAllCaches();
  });

  describe('isWeekend', () => {
    it('deve identificar sábado como fim de semana', () => {
      const saturday = new Date(2024, 0, 6); // Sábado, 6 de janeiro de 2024
      expect(isWeekend(saturday)).toBe(true);
    });

    it('deve identificar domingo como fim de semana', () => {
      const sunday = new Date(2024, 0, 7); // Domingo, 7 de janeiro de 2024
      expect(isWeekend(sunday)).toBe(true);
    });

    it('deve identificar segunda-feira como dia útil', () => {
      const monday = new Date(2024, 0, 8); // Segunda-feira, 8 de janeiro de 2024
      expect(isWeekend(monday)).toBe(false);
    });
  });

  describe('isHoliday', () => {
    it('deve identificar feriado nacional', () => {
      const newYear = new Date('2024-01-01'); // Ano Novo
      expect(isHoliday(newYear)).toBe(true);
    });

    it('deve identificar dia comum como não feriado', () => {
      const regularDay = new Date(2024, 0, 8); // Segunda-feira comum
      expect(isHoliday(regularDay)).toBe(false);
    });
  });

  describe('isBusinessDay', () => {
    it('deve identificar dia útil', () => {
      const monday = new Date(2024, 0, 8); // Segunda-feira
      expect(isBusinessDay(monday)).toBe(true);
    });

    it('deve identificar fim de semana como não útil', () => {
      const saturday = new Date(2024, 0, 6); // Sábado
      expect(isBusinessDay(saturday)).toBe(false);
    });

    it('deve identificar feriado como não útil', () => {
      const newYear = new Date('2024-01-01'); // Ano Novo
      expect(isBusinessDay(newYear)).toBe(false);
    });
  });

  describe('nextBusinessDay', () => {
    it('deve retornar próxima segunda-feira se hoje for sexta', () => {
      const friday = new Date(2024, 0, 5); // Sexta-feira, 5 de janeiro de 2024
      const nextBusiness = nextBusinessDay(friday);
      expect(nextBusiness.getDay()).toBe(1); // Segunda-feira
    });

    it('deve retornar próxima segunda-feira se hoje for sábado', () => {
      const saturday = new Date(2024, 0, 6); // Sábado
      const nextBusiness = nextBusinessDay(saturday);
      expect(nextBusiness.getDay()).toBe(1); // Segunda-feira
    });
  });

  describe('prevBusinessDay', () => {
    it('deve retornar sexta-feira anterior se hoje for segunda', () => {
      const monday = new Date(2024, 0, 8); // Segunda-feira
      const prevBusiness = prevBusinessDay(monday);
      expect(prevBusiness.getDay()).toBe(5); // Sexta-feira
    });
  });

  describe('addBusinessDays', () => {
    it('deve adicionar 5 dias úteis', () => {
      const startDate = new Date(2024, 0, 8); // Segunda-feira
      const result = addBusinessDays(startDate, 5);
      
      // Deve ser segunda-feira da próxima semana
      expect(result.getDay()).toBe(1);
      expect(result.getDate()).toBe(15); // 8 + 5 dias úteis = 15
    });

    it('deve adicionar 1 dia útil pulando fim de semana', () => {
      const friday = new Date(2024, 0, 5); // Sexta-feira
      const result = addBusinessDays(friday, 1);
      
      // Deve ser segunda-feira
      expect(result.getDay()).toBe(1);
      expect(result.getDate()).toBe(8);
    });

    it('deve subtrair dias úteis', () => {
      const monday = new Date(2024, 0, 8); // Segunda-feira
      const result = addBusinessDays(monday, -1);
      
      // Deve ser sexta-feira anterior
      expect(result.getDay()).toBe(5);
      expect(result.getDate()).toBe(5);
    });
  });

  describe('businessDaysDiff', () => {
    it('deve calcular diferença de 5 dias úteis', () => {
      const start = new Date(2024, 0, 8); // Segunda-feira
      const end = new Date(2024, 0, 15); // Segunda-feira da próxima semana
      const diff = businessDaysDiff(start, end);
      expect(diff).toBe(6); // 8, 9, 10, 11, 12, 15 (excluindo fim de semana)
    });

    it('deve calcular diferença considerando feriados', () => {
      const start = new Date('2024-01-01'); // Ano Novo (feriado)
      const end = new Date(2024, 0, 8); // Segunda-feira
      const diff = businessDaysDiff(start, end);
      expect(diff).toBe(5); // 2, 3, 4, 5, 8 (excluindo feriado e fins de semana)
    });
  });

  describe('clampToBusinessDay', () => {
    it('deve ajustar sábado para próxima segunda-feira', () => {
      const saturday = new Date(2024, 0, 6); // Sábado
      const result = clampToBusinessDay(saturday);
      expect(result.getDay()).toBe(1); // Segunda-feira
    });

    it('deve ajustar feriado para próximo dia útil', () => {
      const newYear = new Date('2024-01-01'); // Ano Novo
      const result = clampToBusinessDay(newYear);
      expect(result.getDay()).toBe(1); // Segunda-feira
    });

    it('deve manter dia útil inalterado', () => {
      const monday = new Date(2024, 0, 8); // Segunda-feira
      const result = clampToBusinessDay(monday);
      expect(result.getTime()).toBe(monday.getTime());
    });
  });

  describe('getDayType', () => {
    it('deve identificar dia útil', () => {
      const monday = new Date(2024, 0, 8); // Segunda-feira
      const dayType = getDayType(monday);
      expect(dayType.type).toBe('business');
      expect(dayType.description).toBe('Dia útil');
    });

    it('deve identificar fim de semana', () => {
      const saturday = new Date(2024, 0, 6); // Sábado
      const dayType = getDayType(saturday);
      expect(dayType.type).toBe('weekend');
      expect(dayType.description).toBe('Sábado');
    });

    it('deve identificar feriado', () => {
      const newYear = new Date('2024-01-01'); // Ano Novo
      const dayType = getDayType(newYear);
      expect(dayType.type).toBe('holiday');
      expect(dayType.description).toContain('Feriado Nacional');
    });
  });
});
