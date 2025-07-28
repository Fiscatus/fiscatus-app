# Minhas Assinaturas - Fiscatus

## 📋 Visão Geral

A página "Minhas Assinaturas" foi criada para permitir que os usuários visualizem e gerenciem todos os documentos que precisam assinar, já assinaram ou que estão com prazo vencido.

## 🎯 Funcionalidades

### ✅ Implementadas

- **Visualização de documentos**: Lista todos os documentos atribuídos ao usuário
- **Filtros avançados**: Por status, prazo, tipo de documento e busca textual
- **Estatísticas rápidas**: Cards com contadores de pendentes, atrasados e assinados
- **Status visual**: Badges coloridos para diferentes status (pendente, assinado, atrasado)
- **Modal de visualização**: Preview do documento com lista de assinaturas
- **Responsividade**: Layout adaptável para desktop e mobile
- **Navegação integrada**: Botão na Topbar para acessar a página

### 🔧 Componentes Criados

1. **SignatureStatusBadge** (`src/components/SignatureStatusBadge.tsx`)
   - Exibe o status das assinaturas com cores e ícones apropriados
   - Status: Pendente (amarelo), Assinado (verde), Atrasado (vermelho)

2. **SignatureRow** (`src/components/SignatureRow.tsx`)
   - Linha da tabela com informações do documento
   - Botões de ação baseados no status

3. **FilterBar** (`src/components/FilterBar.tsx`)
   - Barra de filtros com busca e selects
   - Filtros: Status, Prazo, Tipo de documento

4. **SignatureModal** (`src/components/SignatureModal.tsx`)
   - Modal para visualizar documento completo
   - Preview do PDF (mock)
   - Lista de assinaturas
   - Botão de assinatura

5. **EmptyState** (`src/components/EmptyState.tsx`)
   - Estado vazio quando não há documentos
   - Mensagens personalizadas por tipo de filtro

6. **MinhasAssinaturas** (`src/pages/MinhasAssinaturas.tsx`)
   - Página principal com todos os componentes integrados

## 🎨 Design e UX

### Layout
- **Topbar institucional**: Mantida conforme padrão do sistema
- **Cabeçalho**: Título, subtítulo e badge de pendências
- **Estatísticas**: Cards com contadores visuais
- **Filtros**: Barra responsiva com busca e selects
- **Tabela**: Lista de documentos com scroll horizontal

### Cores e Status
- **Pendente**: Amarelo (`bg-yellow-100 text-yellow-700`)
- **Assinado**: Verde (`bg-green-100 text-green-700`)
- **Atrasado**: Vermelho (`bg-red-100 text-red-700`)

### Responsividade
- **Desktop**: Layout completo com sidebar
- **Tablet**: Filtros em grid 2x2
- **Mobile**: Filtros empilhados, tabela com scroll

## 📊 Dados Mockados

A página utiliza dados mockados para demonstração:

```typescript
const documentosMock = [
  {
    id: "1",
    numeroProcesso: "DFD 012/2025",
    nome: "Termo de Referência - Aquisição de Equipamentos Médicos",
    tipo: "DFD",
    prazo: "30/01/2025",
    status: "pendente",
  },
  // ... mais documentos
];
```

## 🚀 Como Usar

1. **Acesso**: Clique no botão "Minhas Assinaturas" na Topbar
2. **Navegação**: Use os filtros para encontrar documentos específicos
3. **Visualização**: Clique em "Visualizar e Assinar" para abrir o modal
4. **Assinatura**: No modal, clique em "Assinar Documento" (funcionalidade mock)

## 🔗 Rotas

- **URL**: `/assinaturas`
- **Componente**: `MinhasAssinaturas`
- **Navegação**: Integrada na Topbar

## 🛠️ Tecnologias Utilizadas

- **React + TypeScript**: Framework principal
- **TailwindCSS**: Estilização
- **shadcn/ui**: Componentes de UI
- **Lucide React**: Ícones
- **React Router**: Navegação

## 📱 Responsividade

### Breakpoints
- **Mobile**: `< 768px` - Layout empilhado
- **Tablet**: `768px - 1024px` - Grid 2x2 para filtros
- **Desktop**: `> 1024px` - Layout completo

### Componentes Responsivos
- **FilterBar**: Grid adaptativo
- **Tabela**: Scroll horizontal em telas pequenas
- **Modal**: Layout flexível para diferentes tamanhos

## 🎯 Próximos Passos

### Funcionalidades Futuras
- [ ] Integração com backend real
- [ ] Assinatura digital funcional
- [ ] Upload de documentos
- [ ] Notificações de prazo
- [ ] Histórico de assinaturas
- [ ] Exportação de relatórios

### Melhorias de UX
- [ ] Loading states
- [ ] Paginação
- [ ] Ordenação por colunas
- [ ] Filtros salvos
- [ ] Modo escuro

## 📝 Notas de Desenvolvimento

- Todos os componentes seguem o padrão do projeto
- Código TypeScript com tipagem completa
- Componentes reutilizáveis e modulares
- Estilo consistente com o design system existente
- Performance otimizada com `useMemo` para filtros

## 🔍 Testes

Para testar a funcionalidade:

1. Execute `npm run dev`
2. Acesse `http://localhost:8081`
3. Clique em "Minhas Assinaturas" na Topbar
4. Teste os filtros e modal de visualização

---

**Desenvolvido para o sistema Fiscatus** 🏛️ 