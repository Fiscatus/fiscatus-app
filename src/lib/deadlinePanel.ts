import { businessDaysDiff } from "@/lib/business-days/utils";

export type WorkdayMode = "business" | "calendar";

export type DeadlinePanelStatus =
  | "pendente"
  | "em_andamento"
  | "em_analise"
  | "concluido"
  | "atrasado"
  | "suspenso";

export type DeadlinePanelInput = {
  status: DeadlinePanelStatus;
  startedAt?: string;
  reviewStartAt?: string;
  reviewDueAt?: string;
  dueAt?: string;
  closedAt?: string;
  workdayMode?: WorkdayMode;
  holidays?: string[];
};

export type ComputePanelResult = {
  elapsed: number;
  total: number;
  remaining: number;
  overdue: number;
  progress: number; // 0-100
  derived: DeadlinePanelStatus | "atrasado" | "concluido";
  mode: WorkdayMode;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toDateSafe(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
}

function calendarDaysDiff(start: Date, end: Date): number {
  const a = new Date(start);
  const b = new Date(end);
  a.setHours(12, 0, 0, 0);
  b.setHours(12, 0, 0, 0);
  const ms = b.getTime() - a.getTime();
  const days = Math.ceil(Math.abs(ms) / (1000 * 60 * 60 * 24));
  return days;
}

function diffByMode(start: Date, end: Date, mode: WorkdayMode): number {
  if (mode === "business") {
    return Math.max(0, businessDaysDiff(start, end));
  }
  return Math.max(0, calendarDaysDiff(start, end));
}

export function computePanel(data: DeadlinePanelInput): ComputePanelResult {
  const mode: WorkdayMode = data.workdayMode ?? "business";

  const startedAt = toDateSafe(data.startedAt);
  const dueAt = toDateSafe(data.dueAt);
  const closedAt = toDateSafe(data.closedAt);
  const now = new Date();

  // Base: total
  const total = startedAt && dueAt ? diffByMode(startedAt, dueAt, mode) : 0;

  // Elapsed até hoje (ou até fechamento, se concluído)
  const elapsedBaseEnd = closedAt ?? now;
  const elapsed = startedAt ? clamp(diffByMode(startedAt, elapsedBaseEnd, mode), 0, Math.max(total, 0)) : 0;

  // Remaining e overdue (se não concluído)
  let remaining = 0;
  let overdue = 0;
  if (!closedAt && startedAt && dueAt) {
    const nowVsDue = diffByMode(dueAt, now, mode);
    const isOverdue = now.getTime() > dueAt.getTime();
    if (isOverdue) {
      // Evitar números exorbitantes e manter relação com o SLA total
      // Ex.: se o total é 7 dias, o atraso máximo exibido também será 7
      overdue = total > 0 ? Math.min(nowVsDue, total) : nowVsDue;
      remaining = 0;
    } else {
      const rem = diffByMode(now, dueAt, mode);
      remaining = clamp(rem, 0, Math.max(total - elapsed, 0));
      overdue = 0;
    }
  }

  // progress
  let progress = 0;
  if (total > 0) {
    progress = Math.min(100, Math.round((elapsed / total) * 100));
  }
  if (closedAt) {
    progress = 100;
  }

  // derived status
  let derived: ComputePanelResult["derived"] = data.status;
  if (closedAt || data.status === "concluido") {
    derived = "concluido";
  } else if (overdue > 0 || data.status === "atrasado") {
    derived = "atrasado";
  }

  return {
    elapsed,
    total,
    remaining,
    overdue,
    progress,
    derived,
    mode,
  };
}


