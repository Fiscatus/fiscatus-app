# Navegação Tubelight - Documentação

## Visão Geral

O componente de navegação Tubelight oferece uma experiência de navegação moderna com efeitos de luz e animações suaves usando Framer Motion. Foram criadas duas versões do componente para diferentes casos de uso.

## Componentes Disponíveis

### 1. NavBar (tubelight-navbar.tsx)
Componente principal com ícones e texto, ideal para navegação principal.

### 2. CompactNavBar (compact-navbar.tsx)
Versão compacta que pode ser usada com ou sem texto, ideal para navegação secundária ou em espaços limitados.

## Instalação

As dependências necessárias já estão instaladas no projeto:
- `framer-motion` - Para animações
- `lucide-react` - Para ícones
- `react-router-dom` - Para navegação

## Uso Básico

### NavBar Padrão

```tsx
import { Home, FileText, Users, PenTool, Network } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

const navItems = [
  { 
    name: 'Planejamento da Contratação', 
    url: '/planejamento-da-contratacao', 
    icon: Home 
  },
  { 
    name: 'Meus Processos', 
    url: '/processos', 
    icon: FileText 
  },
  // ... mais itens
]

function MyComponent() {
  return <NavBar items={navItems} />
}
```

### CompactNavBar

```tsx
import { CompactNavBar } from "@/components/ui/compact-navbar"

// Versão compacta (apenas ícones)
<CompactNavBar items={navItems} variant="compact" />

// Versão com texto
<CompactNavBar items={navItems} variant="default" />
```

## Props

### NavBar Props
- `items: NavItem[]` - Array de itens de navegação
- `className?: string` - Classes CSS adicionais

### CompactNavBar Props
- `items: NavItem[]` - Array de itens de navegação
- `className?: string` - Classes CSS adicionais
- `variant?: 'default' | 'compact'` - Tipo de exibição

### NavItem Interface
```tsx
interface NavItem {
  name: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}
```

## Características

### Efeitos Visuais
- **Efeito Tubelight**: Luz animada no item ativo
- **Hover Effects**: Escala suave no hover
- **Tap Animation**: Feedback visual ao clicar
- **Smooth Transitions**: Transições suaves entre estados

### Responsividade
- Design responsivo que se adapta a diferentes tamanhos de tela
- Versão compacta para espaços limitados

### Acessibilidade
- Navegação por teclado
- Estados visuais claros
- Texto descritivo para leitores de tela

## Exemplos de Integração

### 1. Navegação Principal
```tsx
// Em uma página principal
<div className="container mx-auto px-4 py-8">
  <NavBar items={mainNavItems} />
</div>
```

### 2. Navegação Secundária
```tsx
// Em uma barra lateral ou header
<CompactNavBar items={secondaryNavItems} variant="compact" />
```

### 3. Navegação Rápida
```tsx
// Componente QuickNavigation já criado
import { QuickNavigation } from "@/components/QuickNavigation"

function Dashboard() {
  return (
    <div>
      <QuickNavigation />
      {/* resto do conteúdo */}
    </div>
  )
}
```

## Demonstração

Para ver o componente em ação, acesse:
```
http://localhost:3000/tubelight-demo
```

## Personalização

### Cores
O componente usa as variáveis CSS do tema:
- `--primary` - Cor principal
- `--background` - Cor de fundo
- `--border` - Cor das bordas
- `--muted-foreground` - Cor do texto secundário

### Animações
As animações podem ser personalizadas modificando as props do Framer Motion no componente.

## Melhores Práticas

1. **Use ícones consistentes**: Mantenha um padrão visual
2. **Textos curtos**: Para melhor legibilidade
3. **URLs válidas**: Certifique-se de que as rotas existem
4. **Teste responsividade**: Verifique em diferentes tamanhos de tela

## Troubleshooting

### Problema: Componente não renderiza
- Verifique se todas as dependências estão instaladas
- Confirme se as rotas estão definidas no App.tsx

### Problema: Animações não funcionam
- Verifique se o Framer Motion está instalado
- Confirme se não há conflitos de CSS

### Problema: Ícones não aparecem
- Verifique se o Lucide React está instalado
- Confirme se os ícones estão sendo importados corretamente 