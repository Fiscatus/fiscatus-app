import React from 'react';
import { ChevronRight, HelpCircle, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function SubTopbar() {
  return (
    <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60 border-b">
      <div className="px-2 py-2">
        <div className="flex items-center justify-between">
          {/* Breadcrumb + Título */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-2 text-sm text-slate-600">
              <span>Planejamento</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 font-medium">Modelos de Fluxo</span>
            </nav>
          </div>

          {/* Ações à direita */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <HelpCircle className="w-4 h-4" />
                    <span className="sr-only">Ajuda</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Guia de uso dos Modelos de Fluxo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Keyboard className="w-4 h-4" />
                    <span className="sr-only">Atalhos</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">Atalhos de teclado:</p>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 rounded">Ctrl</kbd>
                        <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 rounded">N</kbd>
                        <span>Novo modelo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 rounded">Ctrl</kbd>
                        <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 rounded">S</kbd>
                        <span>Salvar</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 rounded">G</kbd>
                        <span>Alternar visualização</span>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
