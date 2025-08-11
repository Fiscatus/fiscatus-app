# Sistema de Dias Úteis

Sistema completo para manejo de datas baseado em dias úteis, com suporte a feriados brasileiros, feriados regionais e pontos facultativos.

## 🎯 Objetivo

Padronizar todo o manejo de datas do sistema para considerar exclusivamente dias úteis (segunda a sexta), respeitando:
- Fins de semana (sábado e domingo)
- Feriados nacionais brasileiros (fixos e móveis)
- Feriados regionais configuráveis (estaduais, municipais, organizacionais)
- Pontos facultativos (opcionais)

## 📁 Estrutura

```
src/lib/business-days/
├── holidays-br.ts          # Feriados brasileiros e cálculo de móveis
├── regional-config.ts      # Configuração regional e pontos facultativos
├── utils.ts               # APIs centrais para cálculos
├── context.tsx            # Contexto React e hooks
├── index.ts               # Exportações principais
└── __tests__/             # Testes unitários
    ├── utils.test.ts
    └── holidays-br.test.ts
```

## 🚀 Instalação e Configuração

### 1. Configurar o Provider

```tsx
// App.tsx
import { BusinessCalendarProvider } from '@/lib/business-days/context';

function App() {
  return (
    <BusinessCalendarProvider>
      {/* Sua aplicação */}
    </BusinessCalendarProvider>
  );
}
```

### 2. Carregar Feriados Regionais

```tsx
import { useBusinessConfigActions } from '@/lib/business-days/context';
import holidaysConfig from '@/config/holidays.org.json';

function App() {
  const { loadRegionalHolidays } = useBusinessConfigActions();
  
  useEffect(() => {
    loadRegionalHolidays(holidaysConfig);
  }, []);
}
```

## 📖 Uso

### APIs Principais

```tsx
import { 
  isBusinessDay, 
  addBusinessDays, 
  businessDaysDiff,
  nextBusinessDay,
  clampToBusinessDay 
} from '@/lib/business-days/utils';

// Verificar se é dia útil
const isUseful = isBusinessDay(new Date());

// Adicionar 5 dias úteis
const futureDate = addBusinessDays(new Date(), 5);

// Calcular diferença em dias úteis
const diff = businessDaysDiff(startDate, endDate);

// Próximo dia útil
const next = nextBusinessDay(new Date());

// Ajustar para dia útil mais próximo
const adjusted = clampToBusinessDay(new Date());
```

### Componentes React

```tsx
import { DatePicker } from '@/components/date/DatePicker';
import { BusinessDateField } from '@/components/DateField';

// DatePicker com dias úteis
<DatePicker
  businessDaysOnly={true}
  showOptionalToggle={true}
  value={date}
  onChange={setDate}
/>

// Campo de formulário com validação
<BusinessDateField
  name="dataInicio"
  label="Data de Início"
  required
/>
```

### Validação com Zod

```tsx
import { z } from 'zod';
import { isBusinessDay } from '@/lib/business-days/utils';

const schema = z.object({
  dataInicio: z.string().refine(
    (date) => isBusinessDay(new Date(date)),
    'Selecione um dia útil'
  ),
});
```

## 🎨 Funcionalidades

### Feriados Brasileiros

- **Feriados Fixos**: Ano Novo, Tiradentes, Dia do Trabalho, etc.
- **Feriados Móveis**: Páscoa, Carnaval, Sexta-feira Santa, Corpus Christi
- **Cálculo Automático**: Algoritmo de Meeus/Jones/Butcher para Páscoa

### Configuração Regional

```json
{
  "2025": [
    {
      "dateISO": "2025-02-24",
      "label": "Carnaval (ponto facultativo)",
      "scope": "org",
      "optional": true
    },
    {
      "dateISO": "2025-10-12",
      "label": "Padroeira Municipal",
      "scope": "city"
    }
  ]
}
```

### Presets Rápidos

- "Próximo dia útil"
- "+5 dias úteis"
- "+10 dias úteis"
- "+20 dias úteis"

### UI/UX

- **Tooltips**: Informações sobre tipo de dia
- **Badges**: Indicadores visuais de feriados
- **Toggle**: Opção para incluir/excluir pontos facultativos
- **Ajuste Automático**: Datas inválidas são ajustadas automaticamente

## 🔧 Configuração

### BusinessConfig

```tsx
interface BusinessConfig {
  timezone?: string;           // "America/Sao_Paulo"
  includeOptional?: boolean;   // Considerar pontos facultativos
  regional?: Record<number, RegionalHoliday[]>; // Feriados por ano
}
```

### Hooks Disponíveis

```tsx
// Hook principal
const { config, updateConfig, toggleOptionalHolidays } = useBusinessCalendar();

// Hook para configuração
const config = useBusinessConfig();

// Hook para ações
const { updateConfig, loadRegionalHolidays } = useBusinessConfigActions();
```

## 🧪 Testes

```bash
# Executar testes
npm test src/lib/business-days

# Executar testes específicos
npm test utils.test.ts
npm test holidays-br.test.ts
```

### Cobertura de Testes

- ✅ Cálculo de feriados móveis
- ✅ Adição/subtração de dias úteis
- ✅ Diferença entre datas
- ✅ Ajuste automático de datas
- ✅ Cache de performance
- ✅ Configuração regional

## 📊 Performance

- **Cache por Ano**: Feriados são calculados uma vez por ano
- **Cache de Resultados**: Cálculos de dias úteis são cacheados
- **Lazy Loading**: Configuração regional carregada sob demanda

## 🔄 Migração

### Substituir Cálculos Antigos

```tsx
// ❌ Antes
const futureDate = addDays(today, 7);

// ✅ Depois
const futureDate = addBusinessDays(today, 7);
```

### Atualizar Validações

```tsx
// ❌ Antes
z.string().refine(date => !isWeekend(new Date(date)))

// ✅ Depois
z.string().refine(date => isBusinessDay(new Date(date)))
```

### Migrar Presets

```tsx
// ❌ Antes
{ label: '+7 dias', getDate: () => addDays(new Date(), 7) }

// ✅ Depois
{ label: '+7 dias úteis', getDate: () => addBusinessDays(new Date(), 7) }
```

## 🎯 Benefícios

1. **Consistência**: Todos os cálculos de prazo seguem a mesma regra
2. **Precisão**: Considera feriados reais do Brasil
3. **Flexibilidade**: Suporte a feriados regionais e pontos facultativos
4. **Performance**: Cache otimizado para cálculos frequentes
5. **UX**: Interface intuitiva com tooltips e ajustes automáticos
6. **Manutenibilidade**: Código centralizado e bem testado

## 🔮 Roadmap

- [ ] Suporte a múltiplos fusos horários
- [ ] Integração com APIs de feriados
- [ ] Cache persistente (localStorage)
- [ ] Configuração via interface administrativa
- [ ] Exportação/importação de configurações
- [ ] Suporte a feriados internacionais

## 📝 Licença

Este sistema é parte do projeto Fiscatus e segue as mesmas diretrizes de licenciamento.
