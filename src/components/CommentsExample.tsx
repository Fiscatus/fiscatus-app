import React from 'react';
import CommentsSection from './CommentsSection';

export default function CommentsExample() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Sistema de Comentários Refatorado
        </h1>
        <p className="text-slate-600">
          Design moderno, limpo e responsivo com suporte a menções
        </p>
      </div>

      {/* Exemplo de uso */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <CommentsSection
          processoId="123"
          etapaId="456"
          cardId="789"
          title="Comentários do Processo"
        />
      </div>

      {/* Informações sobre as funcionalidades */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Funcionalidades Implementadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
          <div>
            <h3 className="font-medium mb-2">🎨 Design Moderno</h3>
            <ul className="space-y-1 text-slate-600">
              <li>• Sem cores de fundo em containers</li>
              <li>• Bordas sutis e tipografia limpa</li>
              <li>• Espaçamentos hierárquicos</li>
              <li>• Layout responsivo mobile-first</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">⚡ Funcionalidades</h3>
            <ul className="space-y-1 text-slate-600">
              <li>• Suporte a @menções com popover</li>
              <li>• Navegação por teclado (↑/↓/Enter/Esc)</li>
              <li>• Atalho Ctrl/Cmd + Enter</li>
              <li>• Ordenação de comentários</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">♿ Acessibilidade</h3>
            <ul className="space-y-1 text-slate-600">
              <li>• ARIA labels e roles apropriados</li>
              <li>• Foco visível em elementos interativos</li>
              <li>• Navegação completa por teclado</li>
              <li>• Estados de loading e erro</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">📱 Responsivo</h3>
            <ul className="space-y-1 text-slate-600">
              <li>• Layout adaptativo para mobile</li>
              <li>• Texto responsivo (14px mobile)</li>
              <li>• Espaçamentos otimizados</li>
              <li>• Touch-friendly interactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
