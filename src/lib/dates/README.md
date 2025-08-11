# Sistema de Datas Atuais - Fiscatus

Este sistema padroniza o comportamento de campos de data atual em todo o aplicativo Fiscatus, garantindo que datas sejam preenchidas automaticamente com a data de hoje no fuso da organização.

## 🎯 Objetivo

- **Data de Criação**: Sempre hoje, não editável
- **Campos "atuais"**: Hoje por padrão, editáveis mas revertem para hoje se limpos
- **Timezone seguro**: Usa "America/Sao_Paulo" para evitar problemas de horário de verão
- **Validação robusta**: Garante integridade dos dados

## 📁 Estrutura de Arquivos

```
src/lib/dates/
├── today.ts              # Utilitários principais
├── constants.ts          # Constantes e tipos
└── README.md            # Esta documentação

src/config/
└── timezone.ts          # Configuração de timezone

src/components/date/
├── DatePicker.tsx       # Componente principal (atualizado)
├── CurrentDateField.tsx # Componente helper
└── NovoProcessoForm.tsx # Exemplo de uso
```

## 🚀 Como Usar

### 1. Utilitário Principal

```typescript
import { getTodayISO } from '@/lib/dates/today';
import { ORG_TZ } from '@/config/timezone';

// Obter data de hoje em ISO
const todayISO = getTodayISO(ORG_TZ); // "2024-12-20"

// Verificar se uma data é hoje
const isToday = isToday("2024-12-20", ORG_TZ); // true

// Formatar para exibição
const displayDate = formatDateForDisplay("2024-12-20"); // "20/12/2024"
```

### 2. Constantes de Campos

```typescript
import { 
  CURRENT_DATE_FIELDS,
  READONLY_TODAY_FIELDS,
  EDITABLE_TODAY_FIELDS,
  isCurrentDateField,
  isReadonlyTodayField
} from '@/lib/dates/constants';

// Verificar tipo de campo
isCurrentDateField("dataCriacao"); // true
isReadonlyTodayField("dataCriacao"); // true
```

### 3. DatePicker Atualizado

```typescript
import { DatePicker } from '@/components/date/DatePicker';

// Campo com default hoje
<DatePicker
  value={formData.dataDocumento}
  onChange={(date) => setFormData({...formData, dataDocumento: date})}
  defaultToToday={true}
  timezone={ORG_TZ}
/>

// Campo somente leitura
<DatePicker
  value={formData.dataCriacao}
  onChange={(date) => setFormData({...formData, dataCriacao: date})}
  defaultToToday={true}
  readOnly={true}
  timezone={ORG_TZ}
/>
```

### 4. Componente Helper

```typescript
import { CurrentDateField } from '@/components/date/CurrentDateField';

// Aplica automaticamente as configurações corretas baseadas no nome do campo
<CurrentDateField
  name="dataCriacao"
  control={form.control}
  label="Data de Criação *"
  description="Data automática de criação"
  required
/>
```

### 5. Hook Helper para Defaults

```typescript
import { useCurrentDateDefaults } from '@/components/date/CurrentDateField';

const form = useForm({
  defaultValues: {
    ...useCurrentDateDefaults(),
    titulo: "",
    descricao: "",
  }
});
```

### 6. Validação com Zod

```typescript
import { z } from 'zod';
import { getTodayISO } from '@/lib/dates/today';

const schema = z.object({
  dataCriacao: z.string().refine(
    (v) => v === getTodayISO(ORG_TZ), 
    "Data de Criação deve ser a data de hoje"
  ),
  dataDocumento: z.string().min(1, "Data do documento é obrigatória"),
});
```

## 📋 Campos Padronizados

### Campos Somente Leitura (Sempre Hoje)
- `dataCriacao` - Data de criação do processo

### Campos Editáveis (Hoje por Padrão)
- `dataRegistro` - Data de registro
- `dataDocumento` - Data do documento
- `dataInicio` - Data de início
- `dataEntrada` - Data de entrada
- `dataSolicitacao` - Data de solicitação
- `dataRequerimento` - Data de requerimento

## 🔧 Configuração

### Timezone da Organização

```typescript
// src/config/timezone.ts
export const ORG_TZ = "America/Sao_Paulo";

export const LOCALE_CONFIG = {
  timezone: ORG_TZ,
  locale: "pt-BR",
  dateFormat: "dd/MM/yyyy",
  isoFormat: "yyyy-MM-dd"
} as const;
```

### Adicionar Novos Campos

Para adicionar um novo campo de data atual:

1. **Adicionar à lista de constantes**:
```typescript
// src/lib/dates/constants.ts
export const CURRENT_DATE_FIELDS = [
  "dataCriacao", 
  "dataRegistro", 
  "dataDocumento",
  "dataInicio",
  "dataEntrada",
  "dataSolicitacao",
  "dataRequerimento",
  "novoCampoData" // ← Adicionar aqui
] as const;
```

2. **Classificar o campo**:
```typescript
// Se for somente leitura
export const READONLY_TODAY_FIELDS = [
  "dataCriacao",
  "novoCampoData" // ← Adicionar aqui
] as const;

// Se for editável
export const EDITABLE_TODAY_FIELDS = [
  "dataRegistro", 
  "dataDocumento",
  // ... outros campos
  "novoCampoData" // ← Adicionar aqui
] as const;
```

## ✅ Critérios de Aceite

### ✅ Funcionalidades Implementadas

- [x] **Data de Criação**: Sempre hoje, não editável
- [x] **Campos editáveis**: Hoje por padrão, revertem para hoje se limpos
- [x] **Timezone seguro**: "America/Sao_Paulo" sem problemas de horário de verão
- [x] **Validação Zod**: Garante integridade dos dados
- [x] **Componente helper**: Facilita implementação
- [x] **Hook helper**: Para defaults automáticos
- [x] **Documentação completa**: Guia de uso

### ✅ Comportamentos Esperados

1. **Ao abrir "Novo Processo"**:
   - "Data de Criação" aparece como hoje e não pode ser alterada
   - Outros campos "atuais" vêm como hoje e são editáveis

2. **Ao limpar um campo "atual"**:
   - Campo volta automaticamente para hoje

3. **Ao editar processo existente**:
   - Não força datas para hoje (somente na criação)

4. **Timezone**:
   - Calcula corretamente no fuso "America/Sao_Paulo"
   - Sem erros de horário de verão

## 🧪 Testes

```typescript
// Exemplo de teste
import { getTodayISO, isToday } from '@/lib/dates/today';

describe('Sistema de Datas Atuais', () => {
  it('deve retornar data de hoje no formato ISO', () => {
    const today = getTodayISO();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('deve identificar se uma data é hoje', () => {
    const todayISO = getTodayISO();
    expect(isToday(todayISO)).toBe(true);
  });
});
```

## 🔄 Migração

Para migrar formulários existentes:

1. **Substituir DatePicker simples**:
```typescript
// Antes
<DatePicker value={data} onChange={setData} />

// Depois
<CurrentDateField name="dataCriacao" control={form.control} />
```

2. **Adicionar defaults**:
```typescript
// Antes
defaultValues: { titulo: "", descricao: "" }

// Depois
defaultValues: { 
  ...useCurrentDateDefaults(),
  titulo: "", 
  descricao: "" 
}
```

3. **Adicionar validação**:
```typescript
// Antes
dataCriacao: z.string()

// Depois
dataCriacao: z.string().refine(
  (v) => v === getTodayISO(ORG_TZ), 
  "Data de Criação deve ser a data de hoje"
)
```

## 🎉 Resultado

O sistema agora garante consistência total nos campos de data atual, melhorando a experiência do usuário e reduzindo erros de entrada de dados.
