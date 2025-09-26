import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Flag, CalendarDays, Clock4, CheckCircle2, AlertTriangle, Play, Timer, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { computePanel } from "@/lib/deadlinePanel";
import { computeTimeStats, TimeStats } from "@/lib/timeStats";

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");
const fmtTime = (d?: string) => (d ? new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "");

export type DeadlinePanelData = {
  status: "pendente" | "em_andamento" | "em_analise" | "concluido" | "atrasado" | "suspenso";
  startedAt?: string;
  reviewStartAt?: string;
  reviewDueAt?: string;
  dueAt?: string;
  closedAt?: string;
  workdayMode?: "business" | "calendar";
  holidays?: string[];
};

// Helper para tons de cor
function toneCls(tone: "ok" | "warn" | "risk" | "neutral") {
  return tone === "ok" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
         tone === "warn" ? "bg-amber-50 text-amber-700 border-amber-200" :
         tone === "risk" ? "bg-rose-50 text-rose-700 border-rose-200" :
         "bg-slate-50 text-slate-700 border-slate-200";
}

// Helper para status tone
function statusTone(status: string, overdue: number, remaining: number) {
  if (status === "concluido") return "ok";
  if (overdue > 0) return "risk";
  if (remaining <= 1) return "warn";
  return "neutral";
}

export function DeadlinePanel({ data, onChangeMode }: { data: DeadlinePanelData; onChangeMode?: (m: "business" | "calendar") => void; }) {
  const c = computePanel({
    status: data.status,
    startedAt: data.startedAt,
    reviewStartAt: data.reviewStartAt,
    reviewDueAt: data.reviewDueAt,
    dueAt: data.dueAt,
    closedAt: data.closedAt,
    workdayMode: data.workdayMode,
    holidays: data.holidays,
  });

  const s: TimeStats = computeTimeStats({
    startedAt: data.startedAt,
    reviewStartAt: data.reviewStartAt,
    reviewDueAt: data.reviewDueAt,
    dueAt: data.dueAt,
    closedAt: data.closedAt,
    holidays: data.holidays
  });

  // Lógica anti-redundância
  const hasReview = !!(data.reviewStartAt || data.reviewDueAt);
  const hasDue = !!data.dueAt;

  // Determinar status para chips (sem repetição)
  const statusText = s.finished ? "Concluída" : 
                    c.overdue > 0 ? "Em atraso" :
                    c.remaining <= 1 ? "Vence hoje" : "Em aberto";

  // Delta chip (faltam/atrasado/concluído) - versão completa
  const deltaText = s.finished ? `Concluído em ${s.totalBusiness}d úteis` :
                   c.overdue > 0 ? `Atrasado ${c.overdue} dias úteis` :
                   c.remaining > 0 ? `Faltam ${c.remaining}d úteis` : "Vence hoje";

  const deltaTone = s.finished ? "ok" :
                   c.overdue > 0 ? "risk" :
                   c.remaining <= 1 ? "warn" : "ok";

  // Preparar steps para o stepper (apenas os relevantes)
  const steps = [
    data.startedAt && { 
      label: "Início", 
      date: data.startedAt, 
      status: "completed",
      icon: <Play className="h-3 w-3" />
    },
    hasReview && data.reviewStartAt && { 
      label: "Início da Revisão", 
      date: data.reviewStartAt, 
      status: "completed",
      icon: <Clock4 className="h-3 w-3" />
    },
    hasReview && data.reviewDueAt && { 
      label: "Prazo da Revisão", 
      date: data.reviewDueAt, 
      status: s.finished ? "completed" : "pending",
      icon: <Clock4 className="h-3 w-3" />
    },
    data.dueAt && { 
      label: s.finished ? "Conclusão" : "Prazo Final", 
      date: s.finished ? s.finishedAt : data.dueAt, 
      status: s.finished ? (s.onTime ? "completed" : "overdue") : c.overdue > 0 ? "overdue" : "pending",
      icon: <Flag className="h-3 w-3" />
    },
  ].filter(Boolean);

  return (
    <Card className="rounded-2xl border shadow-sm">
      {/* HEADER */}
      <div className="px-5 py-3.5 border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-slate-600" />
          <h3 className="text-base font-semibold text-slate-900">Status &amp; Prazos</h3>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={c.derived as any} />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Dias:</span>
            <Select value={c.mode} onValueChange={(v) => onChangeMode?.(v as any)}>
              <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Úteis</SelectItem>
                <SelectItem value="calendar">Corridos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 1) FAIXA DE RESUMO (chips concisos) */}
      <div className="px-5 pt-3 pb-2 flex flex-wrap items-center gap-2">
        <Chip tone={statusTone(c.derived, c.overdue, c.remaining)}>
          {statusText}
        </Chip>
        {hasDue && (
          <Chip variant="outline">
            Prazo final • {fmtDate(data.dueAt)} {fmtTime(data.dueAt)}
          </Chip>
        )}
        <Chip variant="outline" tone={deltaTone}>
          {deltaText}
        </Chip>
      </div>

      {/* CONTEÚDO: Layout anti-redundância */}
      <div className="px-5 space-y-6">
        {/* 2) SEÇÃO CONCLUSÃO (sem chips repetidos) */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-700" />
            Conclusão
          </h3>
          <p className="text-sm text-slate-600">
            {s.finished ? (
              <>Concluída em <b>{fmtDate(s.finishedAt)} {fmtTime(s.finishedAt)}</b>.</>
            ) : (
              <>Etapa em aberto desde <b>{fmtDate(data.startedAt)} {fmtTime(data.startedAt)}</b>.</>
            )}
          </p>
        </div>

        {/* 3) CRONOGRAMA (stepper minimalista) */}
        {steps.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Cronograma</h3>
              {s.hasInconsistency && (
                <Chip tone="risk" variant="outline">
                  Inconsistência
                </Chip>
              )}
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <Stepper steps={steps} hasInconsistency={s.hasInconsistency} />
              {s.hasInconsistency && s.inconsistencyMessage && (
                <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-xs text-rose-700">{s.inconsistencyMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4) MÉTRICAS ESSENCIAIS */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Métricas de Tempo</h3>
          
          {/* Grupo A - Durações */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide">Durações</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <MetricCard 
                icon={<Timer className="h-4 w-4" />}
                label="Duração total (úteis)"
                value={`${s.totalBusiness}d`}
                subValue={s.totalCalendar ? `(${s.totalCalendar}d corridos)` : undefined}
              />
              {hasReview && typeof s.toReviewStartBusiness === "number" && (
                <MetricCard 
                  icon={<Clock4 className="h-4 w-4" />}
                  label="Até início da revisão" 
                  value={`${s.toReviewStartBusiness}d`} 
                />
              )}
              {hasReview && typeof s.reviewBusiness === "number" && (
                <MetricCard 
                  icon={<Clock4 className="h-4 w-4" />}
                  label="Tempo em revisão" 
                  value={`${s.reviewBusiness}d`} 
                />
              )}
            </div>
          </div>

          {/* Grupo B - Qualidade do prazo (apenas se houver dueAt) */}
          {hasDue && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide">Qualidade do Prazo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <MetricCard 
                  label="% do prazo utilizado" 
                  value={`${s.usedPct}%`} 
                  tone={s.usedPct > 85 ? "risk" : s.usedPct > 60 ? "warn" : "ok"} 
                />
                <MetricCard 
                  label={s.onTime ? "Dias adiantado" : "Dias em atraso"} 
                  value={`${s.onTime ? s.earlyDays : s.lateDays}d`} 
                  tone={s.onTime ? "ok" : "risk"} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Nota sobre cálculos */}
        <div className="text-[11px] text-slate-500 pt-4 border-t border-slate-200">
          Cálculos em <span className="font-medium">dias úteis</span>; os corridos são exibidos quando relevantes.
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: DeadlinePanelData["status"] | "atrasado" | "concluido" }) {
  const cls =
    status === "concluido" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    status === "atrasado" ? "bg-rose-50 text-rose-700 border-rose-200" :
    status === "em_analise" ? "bg-violet-50 text-violet-700 border-violet-200" :
    status === "em_andamento" ? "bg-sky-50 text-sky-700 border-sky-200" :
    status === "suspenso" ? "bg-amber-50 text-amber-700 border-amber-200" :
    "bg-slate-50 text-slate-700 border-slate-200";
  return <Badge className={cls}>{labelStatus(status as string)}</Badge>;
}

// Componente Stepper
function Stepper({ steps, hasInconsistency }: { 
  steps: Array<{ label: string; date: string; status: string; icon: React.ReactNode }>;
  hasInconsistency?: boolean;
}) {
  return (
    <div className="relative">
      {/* Trilho com gradiente */}
      <div className={cn(
        "absolute top-3 left-0 right-0 h-[6px] rounded-full",
        hasInconsistency ? "bg-gradient-to-r from-rose-200 to-rose-300" : "bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-200"
      )}></div>
      
      <div className="flex items-center justify-between relative z-10">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className={cn(
              "flex items-center justify-center h-3 w-3 md:h-3.5 md:w-3.5 rounded-full border-2 bg-white shadow-sm transition-colors",
              hasInconsistency ? "border-rose-500 text-rose-600" :
              step.status === "completed" ? "border-emerald-500 text-emerald-600" :
              step.status === "overdue" ? "border-rose-500 text-rose-600" :
              step.status === "pending" ? "border-amber-500 text-amber-600" :
              "border-slate-300 text-slate-500"
            )}>
              {step.status === "completed" ? (
                <CheckCircle2 className="h-2 w-2 md:h-2.5 md:w-2.5" />
              ) : (
                step.icon
              )}
            </div>
            <span className="text-[12px] font-medium text-slate-800 mt-2 truncate max-w-[120px]" title={step.label}>
              {step.label}
            </span>
            <span className="text-[11px] text-slate-500 mt-1">
              {fmtDate(step.date)} {fmtTime(step.date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente Chip
function Chip({ 
  children, 
  tone = "neutral", 
  variant = "solid" 
}: { 
  children: React.ReactNode; 
  tone?: "ok" | "warn" | "risk" | "neutral"; 
  variant?: "solid" | "outline" 
}) {
  const base = "text-xs rounded-full px-2.5 py-1";
  const tones = {
    ok: variant === "solid" ? "bg-emerald-600 text-white" : "border border-emerald-200 text-emerald-700 bg-emerald-50",
    warn: variant === "solid" ? "bg-amber-600 text-white" : "border border-amber-200 text-amber-700 bg-amber-50",
    risk: variant === "solid" ? "bg-rose-600 text-white" : "border border-rose-200 text-rose-700 bg-rose-50",
    neutral: variant === "solid" ? "bg-slate-600 text-white" : "border border-slate-200 text-slate-700 bg-slate-50",
  };
  return <span className={cn(base, tones[tone])}>{children}</span>;
}

// Componente MetricCard atualizado
function MetricCard({
  icon, label, value, subValue, tone = "neutral"
}: {
  icon?: React.ReactNode; 
  label: string; 
  value: string; 
  subValue?: string; 
  tone?: "neutral" | "ok" | "warn" | "risk";
}) {
  const toneCls = {
    neutral: "border-slate-200 text-slate-700",
    ok: "border-emerald-200 text-emerald-700",
    warn: "border-amber-200 text-amber-700",
    risk: "border-rose-200 text-rose-700"
  }[tone];
  
  return (
    <div className="rounded-xl border p-3 min-h-[64px] flex items-center justify-between hover:shadow-sm transition-all duration-200 focus-within:ring-2 ring-indigo-200">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="text-slate-600 flex-shrink-0">{icon}</span>}
        <span className="text-[12px] text-slate-600 truncate max-w-[180px]" title={label}>
          {label}
        </span>
      </div>
      <span className={cn("text-sm font-medium px-2.5 py-1 rounded-full border flex-shrink-0", toneCls)}>
        {value}{subValue && <span className="text-slate-400 ml-1"> {subValue}</span>}
      </span>
    </div>
  );
}

function labelStatus(s: string) {
  return ({
    pendente: "Pendente", em_andamento: "Em Andamento", em_analise: "Em Análise",
    suspenso: "Suspenso", atrasado: "Atrasado", concluido: "Concluído"
  } as Record<string, string>)[s] ?? s;
}