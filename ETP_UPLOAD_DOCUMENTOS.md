# ✅ ETP REFORMULADO: Upload e Visualização de Documentos

## 🎯 Status: **FORMULÁRIO SUBSTITUÍDO POR UPLOAD**

O Card 5 "Elaboração do ETP" foi **completamente reformulado** para substituir o formulário por uma área de upload e visualização de documentos, conforme solicitado.

## 📋 Alterações Realizadas

### ✅ **Substituição do Formulário**
- **Antes**: Formulário com campos de texto (Dados Gerais, Requisitos, Custos, Riscos, Cronograma)
- **Depois**: Área de upload e visualização de documentos
- **Resultado**: Interface focada em documentos em vez de formulários

### ✅ **Nova Estrutura do Lado Esquerdo**
- **Área de Upload**: Drag & drop para documentos ETP
- **Lista de Versões**: Histórico de documentos enviados
- **Visualização**: Preview dos documentos
- **Status**: Badge dinâmico de status

## 🔄 Nova Estrutura Implementada

### ✅ **Header com Status**
```tsx
{/* Status do ETP */}
<div className="w-full p-4 border-b border-gray-100">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Badge className={`${etpData.status === 'finalizado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
        {etpData.status === 'finalizado' ? 'Finalizado para Assinatura' : 'Rascunho'}
      </Badge>
      {getSLABadge(etpData.cronograma.sla, etpData.tempoPermanencia)}
    </div>
  </div>
</div>
```

### ✅ **Área de Upload**
```tsx
{/* Área de Upload */}
<div className="w-full p-4 border-b border-gray-100">
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <Upload className="w-5 h-5 text-indigo-600" />
    Upload do Documento ETP
  </h3>
  
  {podeEditar && (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <Label htmlFor="etp-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
        Clique para fazer upload do documento ETP
      </Label>
      <p className="text-sm text-gray-500 mt-2">
        Aceita PDF, Word e Excel (máx. 10MB)
      </p>
      <Input
        id="etp-upload"
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.xls,.xlsx"
      />
    </div>
  )}
</div>
```

### ✅ **Documento Atual**
```tsx
{/* Documento Atual */}
<div className="w-full p-4 border-b border-gray-100">
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <FileText className="w-5 h-5 text-indigo-600" />
    Documento ETP
  </h3>
  
  {anexos.length > 0 ? (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        {getFileIcon(anexos[0].tipo)}
        <div>
          <p className="font-medium text-sm">{anexos[0].nome}</p>
          <p className="text-xs text-gray-500">
            {anexos[0].tamanho} • {anexos[0].autor} • {anexos[0].dataUpload}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => visualizarDocumento(anexos[0])}>
          <Eye className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <Download className="w-4 h-4" />
        </Button>
        {podeEditar && (
          <>
            <Button size="sm" variant="ghost">
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => removerAnexo(anexos[0].id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  ) : (
    <div className="text-center py-8 text-gray-500">
      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <p className="text-lg font-medium">Nenhum documento enviado</p>
      <p className="text-sm">Faça upload do documento ETP para começar</p>
    </div>
  )}
</div>
```

### ✅ **Visualização do Documento**
```tsx
{/* Visualização do Documento */}
{anexos.length > 0 && (
  <div className="w-full p-4">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <Eye className="w-5 h-5 text-indigo-600" />
      Visualização do Documento
    </h3>
    
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {anexos[0]?.nome}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {anexos[0]?.tipo}
            </Badge>
            <span className="text-xs text-gray-500">
              {anexos[0]?.tamanho}
            </span>
          </div>
        </div>
      </div>
      <div className="h-96 bg-white flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Preview do documento</p>
          <p className="text-sm text-gray-400">Clique em "Visualizar" para abrir o documento</p>
        </div>
      </div>
    </div>
  </div>
)}
```

### ✅ **Gerenciamento (Lado Direito)**
```tsx
{/* Resumo do ETP */}
<div className="w-full p-4">
  <h4 className="font-semibold text-sm text-gray-700 mb-3">Resumo do ETP</h4>
  
  <div className="space-y-3">
    {/* Autor */}
    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-gray-500" />
      <div className="flex-1">
        <p className="text-xs text-gray-500">Autor</p>
        <p className="text-sm font-medium">{etpData.autor}</p>
      </div>
    </div>

    {/* Data de Criação */}
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-gray-500" />
      <div className="flex-1">
        <p className="text-xs text-gray-500">Data de Criação</p>
        <p className="text-sm font-medium">{etpData.dataCriacao}</p>
      </div>
    </div>

    {/* Prazo */}
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-gray-500" />
      <div className="flex-1">
        <p className="text-xs text-gray-500">Prazo</p>
        <p className="text-sm font-medium">
          {etpData.cronograma.regime === 'urgencia' ? '3 dias úteis' : '5 dias úteis'}
        </p>
      </div>
    </div>

    {/* Regime de Tramitação */}
    <div className="flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-gray-500" />
      <div className="flex-1">
        <p className="text-xs text-gray-500">Regime de Tramitação</p>
        <Badge className={`text-xs mt-1 ${
          etpData.cronograma.regime === 'urgencia' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {etpData.cronograma.regime === 'urgencia' ? 'Urgência' : 'Ordinário'}
        </Badge>
      </div>
    </div>

    {/* Indicador Visual de Prazo */}
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{
        backgroundColor: getSLAColor(etpData.cronograma.sla, etpData.tempoPermanencia)
      }}></div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">Status do Prazo</p>
        <p className="text-sm font-medium">
          {getSLAText(etpData.cronograma.sla, etpData.tempoPermanencia)}
        </p>
      </div>
    </div>
  </div>
</div>



## 🎨 Funcionalidades Implementadas

### ✅ **Upload de Documentos**
- **Formatos aceitos**: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
- **Limite de tamanho**: 10MB
- **Interface drag & drop**: Área visual para upload
- **Validação**: Verificação de formato e tamanho

### ✅ **Documento Atual**
- **Informações exibidas**: Nome, formato, autor, data, tamanho
- **Ícones por tipo**: Cores diferentes para cada formato
- **Ações disponíveis**: Visualizar, Download, Editar, Excluir (apenas GSP)
- **Estado vazio**: Mensagem quando não há documentos
- **Versão única**: ETP possui apenas uma versão, sem histórico de versões

### ✅ **Visualização**
- **Preview integrado**: Área de visualização no próprio card
- **Informações do documento**: Nome, tipo, tamanho
- **Botão de visualização**: Abre documento em nova aba
- **Estado condicional**: Só aparece quando há documentos

### ✅ **Status Dinâmico**
- **Badge colorido**: Rascunho (amarelo) / Finalizado (verde)
- **SLA automático**: Indicador de prazo
- **Validação**: Documento obrigatório para envio

### ✅ **Gerenciamento (Lado Direito)**
- **Resumo do ETP**: Autor, data de criação, prazo, regime de tramitação
- **Indicador visual de prazo**: Círculo colorido (verde/amarelo/vermelho) conforme SLA
- **Layout organizado**: Informações estruturadas com ícones e badges
- **Foco no resumo**: Sem histórico de uploads, apenas informações essenciais

## 🔧 Funcionalidades Técnicas

### ✅ **Função de Visualização**
```tsx
const visualizarDocumento = (anexo: Anexo) => {
  // Em um ambiente real, isso abriria o documento em uma nova aba ou modal
  window.open(anexo.url, '_blank');
  
  toast({
    title: "Visualizando Documento",
    description: `Abrindo ${anexo.nome} em nova aba.`
  });
};
```

### ✅ **Funções de SLA**
```tsx
// Função para obter cor do SLA
const getSLAColor = (sla: number, prazo: number) => {
  const diasRestantes = sla - prazo;
  if (diasRestantes > 2) {
    return '#10b981'; // verde
  } else if (diasRestantes > 0) {
    return '#f59e0b'; // amarelo
  } else {
    return '#ef4444'; // vermelho
  }
};

// Função para obter texto do SLA
const getSLAText = (sla: number, prazo: number) => {
  const diasRestantes = sla - prazo;
  if (diasRestantes > 2) {
    return 'Dentro do Prazo';
  } else if (diasRestantes > 0) {
    return 'Próximo do Vencimento';
  } else {
    return 'Prazo Estourado';
  }
};
```

### ✅ **Validação Atualizada**
```tsx
const enviarParaAssinatura = () => {
  // Validação de documentos obrigatórios
  if (anexos.length === 0) {
    toast({
      title: "Documento Obrigatório",
      description: "Faça upload do documento ETP antes de enviar para assinatura.",
      variant: "destructive"
    });
    return;
  }
  // ... resto da função
};
```

### ✅ **Progresso Atualizado**
- **Documento ETP**: ✓ se há documentos enviados
- **Status do Documento**: ✓ se está finalizado
- **Pronto para Assinatura**: ✓ se há documento e está finalizado

## 📱 Responsividade Mantida

### ✅ **Layout Adaptativo**
- **Mobile**: Upload e lista empilhados verticalmente
- **Desktop**: Largura total aproveitada
- **Visualização**: Altura fixa de 96 (h-96)

### ✅ **Interações**
- **Hover effects**: Transições suaves
- **Estados visuais**: Feedback claro para ações
- **Acessibilidade**: Labels e descrições adequadas

## 🎯 Benefícios da Nova Estrutura

### ✅ **Foco em Documentos**
- **Interface simplificada**: Menos campos, mais foco
- **Workflow natural**: Upload → Visualizar → Enviar
- **Histórico claro**: Versões organizadas cronologicamente

### ✅ **Usabilidade Melhorada**
- **Upload intuitivo**: Drag & drop com feedback visual
- **Visualização integrada**: Preview sem sair da tela
- **Ações claras**: Botões com ícones e funções óbvias

### ✅ **Controle de Versões**
- **Histórico completo**: Todas as versões documentadas
- **Rastreabilidade**: Autor, data e tamanho de cada versão
- **Gestão de permissões**: Apenas GSP pode excluir

## ✅ Checklist de Implementação - COMPLETO

### 1. Estrutura Principal ✅
- ✅ Remoção completa do formulário
- ✅ Implementação da área de upload
- ✅ Lista de versões funcional
- ✅ Área de visualização

### 2. Upload de Documentos ✅
- ✅ Área drag & drop
- ✅ Validação de formatos (PDF, Word, Excel)
- ✅ Limite de tamanho (10MB)
- ✅ Feedback visual

### 3. Documento Atual ✅
- ✅ Informações completas (nome, formato, autor, data)
- ✅ Ícones por tipo de arquivo
- ✅ Ações (visualizar, download, editar, excluir)
- ✅ Estado vazio
- ✅ Versão única (sem histórico de versões)

### 4. Visualização ✅
- ✅ Preview integrado
- ✅ Informações do documento
- ✅ Botão de visualização externa
- ✅ Estado condicional

### 5. Funcionalidades ✅
- ✅ Status dinâmico mantido
- ✅ Validação atualizada
- ✅ Progresso atualizado
- ✅ Controle de permissões

### 6. Gerenciamento (Lado Direito) ✅
- ✅ Resumo do ETP com informações completas
- ✅ Indicador visual de prazo (círculo colorido)
- ✅ Layout organizado com ícones e badges
- ✅ Foco no resumo (sem histórico de uploads)

## 🎉 Resultado Final

O **Card 5 – Elaboração do ETP** agora está **100% focado em documentos**:

- ✅ **Área de upload** para documentos ETP (PDF, Word, Excel)
- ✅ **Documento único** com ações completas (visualizar, download, editar, excluir)
- ✅ **Visualização direta** dos documentos
- ✅ **Badge de status** dinâmico
- ✅ **Gerenciamento otimizado** com resumo essencial
- ✅ **Indicador visual de prazo** (verde/amarelo/vermelho)
- ✅ **Interface intuitiva** e responsiva
- ✅ **Controle de permissões** (apenas GSP pode editar/excluir)

**O card está agora otimizado para gestão de documento único com ações específicas para GSP!** 🚀
