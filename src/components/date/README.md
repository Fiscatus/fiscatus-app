# Sistema de Seletores de Data

Sistema padronizado de seletores de data com localização pt-BR, feriados brasileiros, presets rápidos e design moderno usando Tailwind CSS e shadcn/ui.

## 🚀 Características

- ✅ **Localização pt-BR completa** - Meses, dias da semana e formatação brasileira
- ✅ **Feriados brasileiros** - Feriados nacionais fixos e móveis calculados automaticamente
- ✅ **Dias úteis** - Suporte a dias úteis com feriados e fins de semana
- ✅ **Presets rápidos** - Seleções comuns como "Hoje", "Amanhã", "Este mês", etc.
- ✅ **Design moderno** - Interface limpa com Tailwind CSS e shadcn/ui
- ✅ **Acessibilidade** - Navegação por teclado e atributos ARIA
- ✅ **Responsivo** - Adaptação para mobile e desktop
- ✅ **Formulários** - Integração com react-hook-form e zod
- ✅ **Tipagem completa** - TypeScript com tipos exportados

## 📦 Componentes

### DatePicker
Seletor de data única com suporte a hora opcional.

```tsx
import { DatePicker } from '@/components/date';

<DatePicker
  value="2024-01-15"
  onChange={(date) => console.log(date)}
  placeholder="Selecione uma data"
  label="Data de início"
  withTime={true}
  showPresets={true}
  holidays={['2024-12-25']}
/>
```

### DateRangePicker
Seletor de intervalo de datas com estatísticas.

```tsx
import { DateRangePicker } from '@/components/date';

<DateRangePicker
  value={{ start: '2024-01-01', end: '2024-01-31' }}
  onChange={(range) => console.log(range)}
  placeholder="Selecione um período"
  label="Período de execução"
  showRangeStats={true}
  businessDaysOnly={true}
/>
```

### YearCalendar
Visualização anual com grade 3x4 de meses.

```tsx
import { YearCalendar } from '@/components/date';

<YearCalendar
  year={2024}
  selectedDate="2024-06-15"
  onDateSelect={(date) => console.log(date)}
  showHolidays={true}
  showWeekends={true}
/>
```

## 🛠️ Utilitários

### Formatação de Datas

```tsx
import { formatDate, parseDate, toISOString } from '@/components/date';

// Formatar para exibição
formatDate(new Date(), 'dd/MM/yyyy'); // "15/01/2024"

// Converter string para Date
parseDate('15/01/2024'); // Date object

// Converter para ISO
toISOString(new Date()); // "2024-01-15"
```

### Feriados e Dias Úteis

```tsx
import { 
  isHoliday, 
  isBusinessDay, 
  addBusinessDays,
  getHolidaysForYear 
} from '@/components/date';

// Verificar se é feriado
isHoliday(new Date('2024-01-01')); // true

// Verificar se é dia útil
isBusinessDay(new Date('2024-01-02')); // true

// Adicionar dias úteis
addBusinessDays(new Date(), 5); // +5 dias úteis

// Obter feriados do ano
getHolidaysForYear(2024);
```

### Presets Rápidos

```tsx
import { 
  DATE_PRESETS, 
  DATE_RANGE_PRESETS,
  applyDatePreset 
} from '@/components/date';

// Aplicar preset
const today = applyDatePreset('today');

// Listar presets disponíveis
console.log(DATE_PRESETS.map(p => p.label));
// ["Hoje", "Amanhã", "Próximo dia útil", "+7 dias", ...]
```

## 🎨 Props Comuns

### DatePicker & DateRangePicker

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `value` | `string \| Date \| null` | - | Data/intervalo selecionado |
| `onChange` | `function` | - | Callback quando muda |
| `minDate` | `Date \| null` | - | Data mínima permitida |
| `maxDate` | `Date \| null` | - | Data máxima permitida |
| `disabledDates` | `Date[]` | `[]` | Datas desabilitadas |
| `disableWeekends` | `boolean` | `false` | Desabilitar fins de semana |
| `disableHolidays` | `boolean` | `false` | Desabilitar feriados |
| `businessDaysOnly` | `boolean` | `false` | Apenas dias úteis |
| `holidays` | `string[]` | `[]` | Feriados adicionais |
| `placeholder` | `string` | - | Placeholder do input |
| `label` | `string` | - | Label do campo |
| `required` | `boolean` | `false` | Campo obrigatório |
| `disabled` | `boolean` | `false` | Campo desabilitado |
| `error` | `boolean` | `false` | Estado de erro |
| `errorMessage` | `string` | - | Mensagem de erro |

### DatePicker Específico

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `withTime` | `boolean` | `false` | Mostrar seletor de hora |
| `defaultHour` | `number` | `9` | Hora padrão |
| `defaultMinute` | `number` | `0` | Minuto padrão |

### DateRangePicker Específico

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `showRangeStats` | `boolean` | `true` | Mostrar estatísticas |

### YearCalendar Específico

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `year` | `number` | Ano atual | Ano para exibição |
| `selectedDate` | `string \| Date \| null` | - | Data selecionada |
| `onDateSelect` | `function` | - | Callback de seleção |
| `showHolidays` | `boolean` | `true` | Mostrar feriados |
| `showWeekends` | `boolean` | `true` | Mostrar fins de semana |

## 🔧 Integração com Formulários

### React Hook Form + Zod

```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DatePicker } from '@/components/date';

const schema = z.object({
  startDate: z.string().min(1, 'Data é obrigatória'),
  endDate: z.string().min(1, 'Data é obrigatória'),
});

const MyForm = () => {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="startDate"
        control={control}
        render={({ field, fieldState }) => (
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            label="Data de início"
            error={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      
      <Controller
        name="endDate"
        control={control}
        render={({ field, fieldState }) => (
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            label="Data de fim"
            error={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </form>
  );
};
```

## 📱 Responsividade

Os componentes são totalmente responsivos:

- **Mobile (< 640px)**: Layout vertical, calendários empilhados
- **Tablet (640px - 1024px)**: Grid 2x6 para YearCalendar
- **Desktop (> 1024px)**: Grid 3x4 para YearCalendar, 2 meses lado a lado para DateRangePicker

## 🎯 Presets Disponíveis

### DatePicker
- Hoje
- Amanhã
- Próximo dia útil
- +7 dias
- +15 dias
- +30 dias
- +7 dias úteis
- +15 dias úteis
- +30 dias úteis

### DateRangePicker
- Hoje
- Este mês
- Mês passado
- Esta semana
- Semana passada
- Próximos 7 dias
- Próximos 15 dias
- Próximos 30 dias
- Este ano
- Ano passado

## 🏗️ Estrutura de Arquivos

```
src/components/date/
├── index.ts              # Exportações principais
├── DatePicker.tsx        # Seletor de data única
├── DateRangePicker.tsx   # Seletor de intervalo
├── YearCalendar.tsx      # Visualização anual
├── presets.ts           # Presets rápidos
├── utils.ts             # Utilitários de formatação
└── README.md            # Esta documentação

src/lib/
└── holidays-br.ts       # Feriados brasileiros
```

## 🔄 Migração

Para migrar de outros seletores de data:

1. **Substituir imports**:
```tsx
// Antes
import { Input } from '@/components/ui/input';

// Depois
import { DatePicker } from '@/components/date';
```

2. **Substituir componentes**:
```tsx
// Antes
<Input type="date" value={date} onChange={handleChange} />

// Depois
<DatePicker value={date} onChange={handleChange} />
```

3. **Ajustar tipos** (se necessário):
```tsx
// Os componentes retornam strings ISO (YYYY-MM-DD)
// Compatível com a maioria dos schemas Zod existentes
```

## 🧪 Testes

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker } from '@/components/date';

test('DatePicker renders correctly', () => {
  render(<DatePicker label="Test Date" />);
  expect(screen.getByText('Test Date')).toBeInTheDocument();
});

test('DatePicker opens calendar on click', () => {
  render(<DatePicker />);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

## 🎨 Customização

### Temas
Os componentes usam as variáveis CSS do tema do shadcn/ui:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
}
```

### Classes CSS
Você pode customizar usando as props `className`, `inputClassName` e `popoverClassName`.

## 🐛 Solução de Problemas

### Erro de importação
```tsx
// Certifique-se de que o path está correto
import { DatePicker } from '@/components/date';
```

### Feriados não aparecem
```tsx
// Verifique se os feriados estão no formato ISO
holidays={['2024-12-25', '2024-01-01']}
```

### Formato de data incorreto
```tsx
// Os componentes sempre retornam ISO (YYYY-MM-DD)
// Para exibição, use formatDate()
formatDate('2024-01-15'); // "15/01/2024"
```

## 📄 Licença

Este sistema de seletores de data é parte do projeto Fiscatus e segue as mesmas diretrizes de licenciamento.
