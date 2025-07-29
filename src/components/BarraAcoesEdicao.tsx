import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BarraAcoesEdicaoProps {
  isVisible: boolean;
  onCancelar: () => void;
  onSalvar: () => void;
  temAlteracoes: boolean;
  isLoading?: boolean;
}

export default function BarraAcoesEdicao({
  isVisible,
  onCancelar,
  onSalvar,
  temAlteracoes,
  isLoading = false
}: BarraAcoesEdicaoProps) {
  const handleCancelar = () => {
    if (temAlteracoes) {
      const confirmar = window.confirm(
        'Você tem alterações não salvas. Tem certeza que deseja cancelar? Todas as alterações serão perdidas.'
      );
      if (!confirmar) return;
    }
    onCancelar();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Indicador de modo de edição */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-700">
                    Modo de Edição Ativo
                  </span>
                </div>

                {temAlteracoes && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Alterações não salvas</span>
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelar}
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>

                <Button
                  onClick={onSalvar}
                  disabled={isLoading || !temAlteracoes}
                  className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Dicas de uso */}
            <div className="mt-3 text-xs text-gray-500 border-t pt-3">
              <div className="flex flex-wrap gap-4">
                <span>• Arraste os cards para reordenar</span>
                <span>• Clique no ícone de edição para modificar uma etapa</span>
                <span>• Use o botão "Nova Etapa" para adicionar etapas</span>
                <span>• Etapas já iniciadas não podem ser excluídas</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 