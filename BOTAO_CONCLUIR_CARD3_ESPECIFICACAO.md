# ✅ IMPLEMENTAÇÃO CONCLUÍDA - Botão "Concluir" Card 3 (Especificação)

## 🎯 Checklist de Implementação

### 1. ✅ Estrutura do Container
- **section#acoes** criada no final do card, após seção de comentários
- **div.flex.w-full.items-center.justify-end.gap-3** implementada
- **Rodapé não fixo** - aparece ao rolar
- **Nenhum container duplicado** - usa o mesmo grupo dos demais botões

### 2. ✅ Botão "Concluir" Implementado
- **ID**: `btn-concluir-card3`
- **data-testid**: `btn-concluir-card3`
- **Classes CSS**: `inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`
- **Posição**: Lado a lado com os demais botões no rodapé
- **Visível**: Ao renderizar o card (quando tem permissão)

### 3. ✅ Permissões de Exibição
- **Renderizado apenas para**:
  - Gerência responsável da etapa (SE - Secretaria Executiva)
  - Gerência de Soluções e Projetos (GSP)
- **Não renderizado** para demais gerências

### 4. ✅ Habilitação (enable/disable)
- **Desabilitado** quando N/N assinaturas não foram atingidas
- **Habilitado** quando `assinaturasConcluidas === totalAssinantes`
- **Cálculo**: `const podeConcluir = totalAssinantes > 0 && assinaturasConcluidas === totalAssinantes;`

### 5. ✅ Ação ao Clicar
- **Modal de confirmação** com título "Concluir etapa – Assinatura do DFD"
- **Textarea opcional** "Observações"
- **Endpoint chamado**: `POST /processos/:processoId/etapas/assinatura-dfd/concluir`
- **Body**: `{ observacao?, notificar: true }`

### 6. ✅ Estados de Sucesso
- **Status do card** atualizado para "Concluído"
- **Próximo card** liberado (Despacho do DFD)
- **Toast**: "Etapa concluída. Próxima etapa liberada."
- **Botão** fica desabilitado com rótulo "Concluído"

### 7. ✅ Estados de Erro
- **Toast amigável** em caso de erro
- **Botão mantido habilitado** para nova tentativa

### 8. ✅ Estados de UI
- **Loading** durante chamada (spinner + "Concluindo...")
- **Tooltip** quando desabilitado: "Aguarde todas as assinaturas para concluir."

## 📋 Código Implementado

### Estrutura HTML
```html
<section id="acoes" className="col-span-12 w-full mt-6">
  <div className="flex w-full items-center justify-end gap-3">
    <!-- Botão Concluir -->
    <Button
      id="btn-concluir-card3"
      data-testid="btn-concluir-card3"
      className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Concluir
    </Button>
  </div>
</section>
```

### Lógica de Permissões
```typescript
const podeConcluir = () => {
  if (!user) return false;
  
  // Gerência responsável da etapa (SE - Secretaria Executiva)
  const ehGerenciaResponsavel = user.gerencia?.includes('SE') || user.gerencia?.includes('Secretaria Executiva');
  
  // Gerência de Soluções e Projetos (GSP)
  const ehGSP = user.gerencia?.includes('GSP') || user.gerencia?.includes('Gerência de Soluções e Projetos');
  
  return ehGerenciaResponsavel || ehGSP;
};
```

### Lógica de Habilitação
```typescript
const todasAssinaturasConcluidas = cardData.assinantes.every(assinante => assinante.status === 'ASSINADO');
const podeConcluir = totalAssinantes > 0 && assinaturasConcluidas === totalAssinantes;
```

### Endpoint de Conclusão
```typescript
const response = await fetch(`/processos/${processoId}/etapas/assinatura-dfd/concluir`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    observacao: observacaoConclusao.trim() || undefined,
    notificar: notificarPartes
  })
});
```

## ✅ Checklist Final

- [x] **section#acoes** com **div.flex...gap-3** criada no final
- [x] **Botão Concluir** visível no rodapé, lado a lado com os demais
- [x] **Permissões**: Gerência responsável e GSP veem o botão
- [x] **Habilitação** amarrada a N/N assinaturas
- [x] **Clique → modal → POST concluir → status concluído → avança card → toast**
- [x] **Sem rodapé fixo**; aparece ao rolar; nenhum container duplicado
- [x] **Tooltip** quando desabilitado
- [x] **Loading** durante processamento
- [x] **Estados de erro** tratados adequadamente

## 🎉 Implementação 100% Conforme Especificação

O botão "Concluir" no Card 3 – Assinatura do DFD foi implementado seguindo exatamente todas as especificações solicitadas, incluindo estrutura HTML, permissões, estados de UI e integração com o fluxo do sistema.
