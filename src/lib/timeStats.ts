import { businessDaysDiff } from "@/lib/business-days/utils";

export type TimeStats = {
  finished: boolean;
  finishedAt?: string;
  onTime: boolean | null;    // null se não tiver due
  lateDays: number;          // >0 se atrasado
  earlyDays: number;         // >0 se adiantado
  totalBusiness: number;     // início -> (conclusão ou hoje)
  totalCalendar: number;
  toReviewStartBusiness?: number;
  reviewBusiness?: number;
  usedPct: number;           // % do prazo consumido (pode passar de 100%)
  hasInconsistency: boolean; // se há inconsistência na timeline
  inconsistencyMessage?: string;
};

// Normalizar data para fuso São Paulo e usar apenas a data (ignorar horas)
function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  // Fixar fuso para São Paulo (UTC-3)
  normalized.setHours(12, 0, 0, 0);
  return normalized;
}

// Calcular dias corridos entre datas (exclusive/inclusive)
function calendarDaysDiff(start: Date, end: Date): number {
  const a = normalizeDate(start);
  const b = normalizeDate(end);
  const ms = b.getTime() - a.getTime();
  const days = Math.ceil(Math.abs(ms) / (1000 * 60 * 60 * 24));
  return days;
}

// Validar ordem da timeline
function validateTimeline(start?: Date, revStart?: Date, revDue?: Date, due?: Date, end?: Date): { valid: boolean; message?: string } {
  if (!start) return { valid: true };
  
  const dates = [
    { date: start, name: "Início" },
    { date: revStart, name: "Início da Revisão" },
    { date: revDue, name: "Prazo da Revisão" },
    { date: due, name: "Prazo Final" },
    { date: end, name: "Conclusão" }
  ].filter(d => d.date);

  for (let i = 0; i < dates.length - 1; i++) {
    if (dates[i].date! > dates[i + 1].date!) {
      return { 
        valid: false, 
        message: `${dates[i].name} (${dates[i].date!.toLocaleDateString('pt-BR')}) é posterior a ${dates[i + 1].name} (${dates[i + 1].date!.toLocaleDateString('pt-BR')})` 
      };
    }
  }
  
  return { valid: true };
}

export function computeTimeStats(data: {
  startedAt?: string;
  reviewStartAt?: string;
  reviewDueAt?: string;
  dueAt?: string;
  closedAt?: string;
  holidays?: string[];
}) : TimeStats {
  const now = new Date();
  const start = data.startedAt ? new Date(data.startedAt) : undefined;
  const closed = data.closedAt ? new Date(data.closedAt) : undefined;
  const due = data.dueAt ? new Date(data.dueAt) : undefined;
  const revStart = data.reviewStartAt ? new Date(data.reviewStartAt) : undefined;
  const revDue = data.reviewDueAt ? new Date(data.reviewDueAt) : undefined;

  const end = closed ?? now;
  
  // Validar timeline
  const validation = validateTimeline(start, revStart, revDue, due, end);
  
  // BD(a, b): dias úteis entre a (exclusive) e b (inclusive)
  const bd = (a: Date, b: Date) => businessDaysDiff(a, b, { holidays: data.holidays ?? [] });
  const cd = (a: Date, b: Date) => calendarDaysDiff(a, b);

  // Duração total (úteis) = BD(start, end)
  let totalBusiness = 0, totalCalendar = 0;
  if (start) {
    totalBusiness = bd(start, end);
    totalCalendar = cd(start, end);
  }

  // Até início da revisão (se existir) = BD(start, revStart)
  let toReviewStartBusiness: number | undefined;
  if (start && revStart) toReviewStartBusiness = bd(start, revStart);

  // Tempo em revisão (se existir) = BD(revStart, min(revDue || end))
  let reviewBusiness: number | undefined;
  if (revStart) {
    const reviewEnd = revDue ?? end;
    reviewBusiness = bd(revStart, reviewEnd);
  }

  // Dias em atraso/adiantado
  let onTime: boolean | null = null, lateDays = 0, earlyDays = 0;
  if (due) {
    if (end > due) {
      // Dias em atraso (se end > due) = BD(due, end)
      onTime = false;
      lateDays = bd(due, end);
    } else {
      // Dias adiantado (se end < due) = BD(end, due)
      onTime = true;
      earlyDays = bd(end, due);
    }
  }

  // % do prazo utilizado (pode passar de 100%)
  let usedPct = 0;
  if (start && due) {
    const totalSla = Math.max(bd(start, due), 1);
    usedPct = Math.round((bd(start, end) / totalSla) * 100);
  }

  return {
    finished: !!closed,
    finishedAt: closed?.toISOString(),
    onTime, lateDays, earlyDays,
    totalBusiness, totalCalendar,
    toReviewStartBusiness, reviewBusiness,
    usedPct,
    hasInconsistency: !validation.valid,
    inconsistencyMessage: validation.message
  };
}
