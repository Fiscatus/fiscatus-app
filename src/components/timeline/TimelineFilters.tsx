import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TimelineStatus } from '@/types/timeline';
import { X } from 'lucide-react';

const STATUS: {key: TimelineStatus; label: string}[] = [
  {key:'versao',label:'Versão'}, {key:'aprovado',label:'Aprovado'},
  {key:'devolvido',label:'Devolvido'}, {key:'anexo',label:'Anexo'},
  {key:'comentario',label:'Comentário'}, {key:'assinado',label:'Assinado'},
  {key:'rejeitado',label:'Rejeitado'},
];

export function TimelineFilters({
  q, onQ, selected, onToggleStatus, period, onPeriod, onClear, total, filtered
}:{
  q: string; onQ:(v:string)=>void;
  selected: TimelineStatus[]; onToggleStatus:(s:TimelineStatus)=>void;
  period: 'today'|'7d'|'30d'|'all'; onPeriod:(p:'today'|'7d'|'30d'|'all')=>void;
  onClear: ()=>void;
  total: number;
  filtered: number;
}) {
  return (
    <div className="px-3.5 pt-2 pb-3 space-y-3">
      {/* Linha 1: busca + período + contador + limpar */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar por título ou autor..."
          value={q} onChange={e=>onQ(e.target.value)}
          className="h-9 max-w-[360px]"
        />
        {/* Query ativa em chip */}
        {q && (
          <span className="inline-flex items-center gap-1 text-xs border rounded-md px-2 py-1 bg-slate-50 text-slate-700">
            "{q}"
            <button aria-label="Limpar busca" className="text-slate-500 hover:text-slate-700" onClick={()=>onQ('')}>
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          {(['today','7d','30d','all'] as const).map(p => (
            <Button key={p} size="sm" variant={period===p?'secondary':'outline'}
              onClick={()=>onPeriod(p)} className="h-8 px-2.5 text-xs">
              {p==='today'?'Hoje':p==='7d'?'7 dias':p==='30d'?'30 dias':'Todos'}
            </Button>
          ))}
          <div className="mx-1 h-6 w-px bg-slate-200" />
          <span className="text-xs text-slate-600 whitespace-nowrap">
            {filtered} de {total}
          </span>
          <Button size="sm" variant="ghost" className="h-8 text-slate-600" onClick={onClear}>Limpar</Button>
        </div>
      </div>
      {/* Linha 2: Status (pills) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS.map(s => {
          const active = selected.includes(s.key);
          return (
            <Button key={s.key}
              size="xs" variant={active?'secondary':'outline'}
              className="h-6 px-2 text-[11px]" onClick={()=>onToggleStatus(s.key)}>
              {s.label}
            </Button>
          );
        })}
      </div>
      {/* Resumo textual dos filtros ativos */}
      {(selected.length>0 || q) && (
        <div className="text-[11px] text-slate-500">
          {selected.length>0 && (
            <span>Filtrando por status: {selected.length} selecionado(s).</span>
          )}
          {q && (
            <span className="ml-2">Busca: "{q}"</span>
          )}
        </div>
      )}
    </div>
  );
}


