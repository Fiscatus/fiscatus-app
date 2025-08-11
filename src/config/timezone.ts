// Configuração de timezone da organização
export const ORG_TZ = "America/Sao_Paulo";

// Configurações de locale para formatação de datas
export const LOCALE_CONFIG = {
  timezone: ORG_TZ,
  locale: "pt-BR",
  dateFormat: "dd/MM/yyyy",
  isoFormat: "yyyy-MM-dd"
} as const;

// Função helper para obter configurações de timezone
export function getTimezoneConfig() {
  return {
    timezone: ORG_TZ,
    locale: LOCALE_CONFIG.locale,
    dateFormat: LOCALE_CONFIG.dateFormat,
    isoFormat: LOCALE_CONFIG.isoFormat
  };
}
