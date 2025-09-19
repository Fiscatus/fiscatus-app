import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ModelInfoBarProps {
  nomeModelo: string;
  descricaoModelo: string;
  totalEtapas: number;
  totalDias: number;
  linhasCriticas: number;
  assinaturasPendentes: number;
  onNomeChange: (nome: string) => void;
  onDescricaoChange: (descricao: string) => void;
  onSalvar: () => void;
  onReverter: () => void;
}

export default function ModelInfoBar({
  nomeModelo,
  descricaoModelo,
  totalEtapas,
  totalDias,
  linhasCriticas,
  assinaturasPendentes,
  onNomeChange,
  onDescricaoChange,
  onSalvar,
  onReverter
}: ModelInfoBarProps) {
  const [modoEdicao, setModoEdicao] = useState(false);
  const [nomeTemp, setNomeTemp] = useState(nomeModelo);
  const [descricaoTemp, setDescricaoTemp] = useState(descricaoModelo);

  const handleSalvar = () => {
    onNomeChange(nomeTemp);
    onDescricaoChange(descricaoTemp);
    setModoEdicao(false);
    onSalvar();
  };

  const handleCancelar = () => {
    setNomeTemp(nomeModelo);
    setDescricaoTemp(descricaoModelo);
    setModoEdicao(false);
  };

  const handleReverter = () => {
    setNomeTemp(nomeModelo);
    setDescricaoTemp(descricaoModelo);
    setModoEdicao(false);
    onReverter();
  };

  return (
    <div className="rounded-2xl border bg-white p-3 md:p-4 flex flex-col gap-2">
      {/* Linha 1: Nome editável + badge "Sistema"; à direita Salvar (primary) e Reverter (ghost) */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {modoEdicao ? (
            <Input
              value={nomeTemp}
              onChange={(e) => setNomeTemp(e.target.value)}
              className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0"
              placeholder="Nome do modelo"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900 truncate">
                {nomeModelo}
              </h1>
              <Badge variant="secondary" className="text-xs">
                Sistema
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {modoEdicao ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelar}
                className="h-8"
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSalvar}
                className="h-8"
              >
                Salvar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReverter}
                className="h-8"
              >
                Reverter
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSalvar}
                className="h-8"
              >
                Salvar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Linha 2: Descrição (uma linha com "ver mais") */}
      <div>
        {modoEdicao ? (
          <Textarea
            value={descricaoTemp}
            onChange={(e) => setDescricaoTemp(e.target.value)}
            className="text-sm text-slate-600 border-0 p-0 h-auto resize-none focus-visible:ring-0"
            placeholder="Descrição do modelo"
            rows={2}
          />
        ) : (
          <p className="text-sm text-slate-600 line-clamp-1">
            {descricaoModelo}
            <button 
              className="text-indigo-600 hover:text-indigo-700 ml-1"
              onClick={() => setModoEdicao(true)}
            >
              ver mais
            </button>
          </p>
        )}
      </div>

      {/* Linha 3: Métricas (Badges sutis) */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="text-xs">
          {totalEtapas} Etapas
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {totalDias} Dias
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {linhasCriticas} Críticas
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {assinaturasPendentes} Pendentes
        </Badge>
      </div>
    </div>
  );
}