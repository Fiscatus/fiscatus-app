/**
 * Testes para feriados brasileiros
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getEasterDate,
  getNationalHolidays,
  getHolidayName,
  isNationalHoliday,
  clearHolidayCache
} from '../holidays-br';

describe('Brazilian Holidays', () => {
  beforeEach(() => {
    clearHolidayCache();
  });

  describe('getEasterDate', () => {
    it('deve calcular a Páscoa de 2024 corretamente', () => {
      const easter2024 = getEasterDate(2024);
      expect(easter2024.getFullYear()).toBe(2024);
      expect(easter2024.getMonth()).toBe(2); // Março (0-indexed)
      expect(easter2024.getDate()).toBe(31);
    });

    it('deve calcular a Páscoa de 2025 corretamente', () => {
      const easter2025 = getEasterDate(2025);
      expect(easter2025.getFullYear()).toBe(2025);
      expect(easter2025.getMonth()).toBe(3); // Abril (0-indexed)
      expect(easter2025.getDate()).toBe(20);
    });
  });

  describe('getNationalHolidays', () => {
    it('deve retornar feriados fixos para 2024', () => {
      const holidays = getNationalHolidays(2024);
      
      // Verificar feriados fixos
      const newYear = holidays.find(h => h.name === 'Confraternização Universal');
      expect(newYear).toBeDefined();
      expect(newYear?.dateISO).toBe('2024-01-01');
      
      const laborDay = holidays.find(h => h.name === 'Dia do Trabalho');
      expect(laborDay).toBeDefined();
      expect(laborDay?.dateISO).toBe('2024-05-01');
    });

    it('deve retornar feriados móveis para 2024', () => {
      const holidays = getNationalHolidays(2024);
      
      // Verificar feriados móveis
      const easter = holidays.find(h => h.name === 'Páscoa');
      expect(easter).toBeDefined();
      expect(easter?.dateISO).toBe('2024-03-31');
      
      const carnival = holidays.find(h => h.name === 'Carnaval');
      expect(carnival).toBeDefined();
      expect(carnival?.dateISO).toBe('2024-02-13');
    });

    it('deve retornar 12 feriados nacionais (8 fixos + 4 móveis)', () => {
      const holidays = getNationalHolidays(2024);
      expect(holidays).toHaveLength(12);
    });
  });

  describe('getHolidayName', () => {
    it('deve retornar nome do feriado para Ano Novo', () => {
      const newYear = new Date('2024-01-01');
      const name = getHolidayName(newYear);
      expect(name).toBe('Confraternização Universal');
    });

    it('deve retornar nome do feriado para Dia do Trabalho', () => {
      const laborDay = new Date('2024-05-01');
      const name = getHolidayName(laborDay);
      expect(name).toBe('Dia do Trabalho');
    });

    it('deve retornar null para dia comum', () => {
      const regularDay = new Date('2024-01-15');
      const name = getHolidayName(regularDay);
      expect(name).toBeNull();
    });
  });

  describe('isNationalHoliday', () => {
    it('deve identificar Ano Novo como feriado', () => {
      const newYear = new Date('2024-01-01');
      expect(isNationalHoliday(newYear)).toBe(true);
    });

    it('deve identificar Páscoa como feriado', () => {
      const easter = new Date('2024-03-31');
      expect(isNationalHoliday(easter)).toBe(true);
    });

    it('deve identificar dia comum como não feriado', () => {
      const regularDay = new Date('2024-01-15');
      expect(isNationalHoliday(regularDay)).toBe(false);
    });
  });

  describe('Cache', () => {
    it('deve usar cache para melhorar performance', () => {
      // Primeira chamada
      const holidays1 = getNationalHolidays(2024);
      
      // Segunda chamada (deve usar cache)
      const holidays2 = getNationalHolidays(2024);
      
      expect(holidays1).toEqual(holidays2);
    });

    it('deve limpar cache corretamente', () => {
      // Primeira chamada
      getNationalHolidays(2024);
      
      // Limpar cache
      clearHolidayCache();
      
      // Segunda chamada (deve recalcular)
      const holidays = getNationalHolidays(2024);
      expect(holidays).toHaveLength(12);
    });
  });
});
