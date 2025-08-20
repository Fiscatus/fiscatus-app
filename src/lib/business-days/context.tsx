/**
 * Contexto React para configuração de dias úteis
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BusinessConfig, DEFAULT_BUSINESS_CONFIG, loadRegionalConfig } from './regional-config';

interface BusinessCalendarContextType {
  config: BusinessConfig;
  updateConfig: (newConfig: Partial<BusinessConfig>) => void;
  loadRegionalHolidays: (configData: Record<number, any[]>) => void;
  toggleOptionalHolidays: () => void;
  resetConfig: () => void;
}

const BusinessCalendarContext = createContext<BusinessCalendarContextType | undefined>(undefined);

interface BusinessCalendarProviderProps {
  children: ReactNode;
  initialConfig?: Partial<BusinessConfig>;
}

export function BusinessCalendarProvider({ 
  children, 
  initialConfig = {} 
}: BusinessCalendarProviderProps) {
  const [config, setConfig] = useState<BusinessConfig>({
    ...DEFAULT_BUSINESS_CONFIG,
    ...initialConfig
  });

  const updateConfig = useCallback((newConfig: Partial<BusinessConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  }, []);

  const loadRegionalHolidays = useCallback((configData: Record<number, any[]>) => {
    const newConfig = loadRegionalConfig(configData);
    setConfig(prev => ({
      ...prev,
      regional: newConfig.regional
    }));
  }, []);

  const toggleOptionalHolidays = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      includeOptional: !prev.includeOptional
    }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_BUSINESS_CONFIG);
  }, []);

  const value: BusinessCalendarContextType = {
    config,
    updateConfig,
    loadRegionalHolidays,
    toggleOptionalHolidays,
    resetConfig
  };

  return (
    <BusinessCalendarContext.Provider value={value}>
      {children}
    </BusinessCalendarContext.Provider>
  );
}

/**
 * Hook para usar o contexto de dias úteis
 */
export function useBusinessCalendar(): BusinessCalendarContextType {
  const context = useContext(BusinessCalendarContext);
  
  if (context === undefined) {
    throw new Error('useBusinessCalendar deve ser usado dentro de um BusinessCalendarProvider');
  }
  
  return context;
}

/**
 * Hook para obter apenas a configuração atual
 */
export function useBusinessConfig(): BusinessConfig {
  const { config } = useBusinessCalendar();
  return config;
}

/**
 * Hook para obter funções de atualização da configuração
 */
export function useBusinessConfigActions() {
  const { updateConfig, loadRegionalHolidays, toggleOptionalHolidays, resetConfig } = useBusinessCalendar();
  
  return {
    updateConfig,
    loadRegionalHolidays,
    toggleOptionalHolidays,
    resetConfig
  };
}
