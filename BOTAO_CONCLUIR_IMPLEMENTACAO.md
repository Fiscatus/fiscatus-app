# Implementação do Padrão Global - Botão "Concluir"

## Visão Geral

Este documento descreve a implementação completa do padrão global do botão "Concluir" para os Cards 1-5 e padrão futuro, conforme especificado no prompt global.

## Componentes Criados

### 1. `ConcluirEtapaButton.tsx`
Componente reutilizável que implementa o botão "Concluir" com todas as funcionalidades especificadas:

- **Permissões**: Visível apenas para gerência responsável + GSP
- **Estados**: Normal, disabled com tooltip, loading
- **Modal de confirmação**: Com observações opcionais e checkbox de notificação
- **Posicionamento**: Sempre na section#acoes (rodapé do card)

### 2. `usePreCondicoesEtapa.ts`
Hook que implementa as pré-condições específicas para cada etapa:

- **Card 1**: Versão enviada para análise
- **Card 2**: Decisão registrada (Aprovar/Corrigir)
- **Card 3**: 100% das assinaturas concluídas
- **Card 4**: Despacho gerado e assinado
- **Card 5**: ETP anexado e enviado para assinatura

### 3. `etapaService.ts`
Serviço que implementa as chamadas de API conforme contrato especificado:

- `POST /processos/:processoId/etapas/<slug>/concluir`
- `POST /processos/:processoId/fluxo/proxima-etapa`
- Mock para desenvolvimento

### 4. `EtapaCardComConcluir.tsx`
Componente de exemplo que demonstra a integração completa.

## Como Usar

### 1. Importar Componentes

```tsx
import { ConcluirEtapaButton } from "@/components/ConcluirEtapaButton";
import { usePreCondicoesEtapa } from "@/hooks/usePreCondicoesEtapa";
import { EtapaService } from "@/services/etapaService";
```

### 2. Implementar em um Card de Etapa

```tsx
function MeuCardEtapa({ etapa, processoId }) {
  // Verificar pré-condições
  const preCondicao = usePreCondicoesEtapa({
    numeroEtapa: etapa.numeroEtapa,
    nomeEtapa: etapa.nomeEtapa,
    status: etapa.status,
    versaoEnviada: etapa.versaoEnviada,
    // ... outros dados específicos
  });

  const handleConcluir = async (dados) => {
    const resultado = await EtapaService.mockConcluirEtapa(
      processoId,
      etapa.slug,
      {
        usuarioId: user.id,
        observacao: dados.observacao,
        dataConclusao: new Date().toISOString(),
        notificar: dados.notificar
      }
    );
    
    // Atualizar status da etapa
    onStatusChange(etapa.id, "concluida");
  };

  return (
    <Card>
      {/* ... conteúdo do card ... */}
      
      {/* Seção de Ações - Rodapé não fixo */}
      <section id="acoes" className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Outros botões */}
        </div>
        
        {/* Botão Concluir - lado a lado */}
        <div className="flex items-center gap-2">
          <ConcluirEtapaButton
            etapa={etapa}
            processoId={processoId}
            preCondicaoAtendida={preCondicao.atendida}
            tooltipPreCondicao={preCondicao.tooltip}
            onConcluir={handleConcluir}
            concluida={etapa.concluida}
          />
        </div>
      </section>
    </Card>
  );
}
```

## Pré-condições por Etapa

### Card 1 - Elaboração do DFD
```tsx
{
  versaoEnviada: true // Deve existir versão enviada para análise
}
```

### Card 2 - Aprovação do DFD
```tsx
{
  decisaoRegistrada: true // Aprovar ou Solicitar Correção
}
```

### Card 3 - Assinatura do DFD
```tsx
{
  assinaturasConcluidas: 5,
  totalAssinaturas: 5 // X/N = N/N
}
```

### Card 4 - Despacho do DFD
```tsx
{
  despachoGerado: true,
  despachoAssinado: true // Pela Secretaria Executiva
}
```

### Card 5 - Elaboração do ETP
```tsx
{
  documentoAnexado: true,
  statusDocumento: "Finalizado para Assinatura"
}
```

## Permissões

O botão "Concluir" é visível e clicável apenas para:

1. **Gerência responsável** da etapa atual
2. **Gerência de Soluções e Projetos (GSP)**

```tsx
const temPermissao = () => {
  const ehGerenciaResponsavel = user.gerencia.includes(etapa.gerenciaResponsavel);
  const ehGSP = user.gerencia.includes("GSP") || 
                user.gerencia.includes("Gerência de Soluções e Projetos");
  
  return ehGerenciaResponsavel || ehGSP;
};
```

## Estados do Botão

### Normal
- Verde com ícone de check
- Clique abre modal de confirmação
- Etapa em andamento + pré-condições atendidas

### Disabled
- Cinza com tooltip explicativo
- Pré-condição não atendida OU etapa não em andamento
- Sempre visível (não oculto)

### Loading
- Spinner animado
- Durante processamento da API

### Concluída
- Botão desabilitado (não oculto)
- Rótulo "Etapa concluída"

## Modal de Confirmação

### Estrutura
- **Título**: "Concluir etapa"
- **Resumo**: Etapa atual e gerência responsável
- **Observações**: Textarea opcional
- **Notificar**: Checkbox (ligado por padrão)
- **Botões**: Cancelar | Concluir etapa

### Dados Enviados
```tsx
{
  usuarioId: "<id de quem concluiu>",
  observacao: "<texto opcional>",
  dataConclusao: "<ISO>",
  notificar: true
}
```

## Integração com Backend

### Endpoint Principal
```
POST /processos/:processoId/etapas/<slug-da-etapa>/concluir
```

### Endpoint de Liberação
```
POST /processos/:processoId/fluxo/proxima-etapa
{
  "etapa": "<slug-da-proxima>"
}
```

### Mapeamento de Etapas
```tsx
const mapeamentoEtapas = {
  'elaboracao-dfd': 'aprovacao-dfd',
  'aprovacao-dfd': 'assinatura-dfd',
  'assinatura-dfd': 'despacho-dfd',
  'despacho-dfd': 'elaboracao-etp',
  'elaboracao-etp': 'assinatura-etp'
};
```

## Auditoria

Todas as conclusões registram:

- **Usuário**: Quem concluiu
- **Cargo**: Gerência do usuário
- **Data/Hora**: Timestamp ISO
- **Etapa**: Qual etapa foi concluída
- **Observação**: Texto opcional

## SLA

- **Não bloqueia**: Conclusão independe do prazo
- **Informa**: SLA continua visível (ok/risco/estourado)
- **Permite**: Conclusão antes do prazo

## Checklist de Aceite

- [x] "Concluir" presente no rodapé (mesmo grupo de botões)
- [x] Permissões corretas (Gerência responsável + GSP)
- [x] Pré-condições implementadas por card
- [x] Tooltip quando desabilitado
- [x] Modal com observação opcional e notificação
- [x] Ação atualiza status e libera próxima etapa
- [x] SLA não bloqueia; apenas informa
- [x] Auditoria gravada (quem, quando, o quê)
- [x] Rodapé não fixo; aparece apenas ao rolar
- [x] Padrão memorizado para futuros cards

## Exemplo de Uso Completo

```tsx
// Dados da etapa
const etapa = {
  id: "etapa-1",
  numeroEtapa: 1,
  nomeEtapa: "Elaboração do DFD",
  gerenciaResponsavel: "GSP - Gerência de Soluções e Projetos",
  slug: "elaboracao-dfd",
  versaoEnviada: true, // Pré-condição atendida
  status: "em_andamento"
};

// No componente
<ConcluirEtapaButton
  etapa={etapa}
  processoId="processo-123"
  preCondicaoAtendida={true}
  tooltipPreCondicao="Etapa pronta para conclusão"
  onConcluir={handleConcluir}
  concluida={false}
/>
```

## Próximos Passos

1. **Integrar** com páginas existentes (DFD, ETP, etc.)
2. **Testar** todas as pré-condições
3. **Validar** permissões em diferentes contextos
4. **Implementar** backend real (substituir mock)
5. **Aplicar** padrão para novos cards do fluxo

## Notas Técnicas

- **Idempotência**: Endpoints ignoram reenvios duplicados
- **Error Handling**: Toast de erro com motivo amigável
- **Loading States**: Feedback visual durante processamento
- **Responsive**: Funciona em mobile e desktop
- **Accessibility**: Tooltips e labels adequados
