// Campos de data que devem ser preenchidos automaticamente com a data de hoje
export const CURRENT_DATE_FIELDS = [
  "dataCriacao", 
  "dataRegistro", 
  "dataDocumento",
  "dataInicio",
  "dataEntrada",
  "dataSolicitacao",
  "dataRequerimento"
] as const;

// Campos de data que são sempre hoje e não editáveis
export const READONLY_TODAY_FIELDS = [
  "dataCriacao"
] as const;

// Campos de data que são hoje por padrão mas editáveis
export const EDITABLE_TODAY_FIELDS = [
  "dataRegistro", 
  "dataDocumento",
  "dataInicio",
  "dataEntrada",
  "dataSolicitacao",
  "dataRequerimento"
] as const;

// Tipo para campos de data atual
export type CurrentDateField = typeof CURRENT_DATE_FIELDS[number];
export type ReadonlyTodayField = typeof READONLY_TODAY_FIELDS[number];
export type EditableTodayField = typeof EDITABLE_TODAY_FIELDS[number];

// Função para verificar se um campo é de data atual
export function isCurrentDateField(fieldName: string): fieldName is CurrentDateField {
  return CURRENT_DATE_FIELDS.includes(fieldName as CurrentDateField);
}

// Função para verificar se um campo é somente leitura
export function isReadonlyTodayField(fieldName: string): fieldName is ReadonlyTodayField {
  return READONLY_TODAY_FIELDS.includes(fieldName as ReadonlyTodayField);
}

// Função para verificar se um campo é editável mas com default hoje
export function isEditableTodayField(fieldName: string): fieldName is EditableTodayField {
  return EDITABLE_TODAY_FIELDS.includes(fieldName as EditableTodayField);
}
