import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProgressaoTemporalProps {
  startISO: string;
  endISO: string;
  className?: string;
}

const countBusinessDays = (start: Date, end: Date) => {
  let count = 0;
  const cur = new Date(start.getTime());
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

const getBarColor = (percent: number) => {
  if (percent <= 70) return 'bg-green-500';
  if (percent <= 100) return 'bg-yellow-500';
  return 'bg-red-500';
};

export default function ProgressaoTemporal({ startISO, endISO, className }: ProgressaoTemporalProps) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const today = new Date();

  const total = Math.max(1, countBusinessDays(start, end));
  const passados = Math.min(total, countBusinessDays(start, today));
  const percent = Math.min(100, Math.round((passados / total) * 100));

  return (
    <div className={className || ''}>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Progresso</span>
        <span>{percent}%</span>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full bg-slate-200 rounded-full h-2 cursor-help">
              <div className={`h-2 rounded-full transition-all ${getBarColor(percent)}`} style={{ width: `${percent}%` }} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{passados} dias úteis decorridos de {total} totais</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}


