import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Flag, CalendarDays, Clock4, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { computePanel } from "@/lib/deadlinePanel";

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

  return (
    <Card className="rounded-2xl border shadow-sm">
      {/* HEADER (respeita a margem do balão) */}
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
      {/* CONTEÚDO: três blocos separados com respiro claro */}
      <div className="px-5 py-4 space-y-12">
        {/* GRID DE DATAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <DateCard className="h-[110px]" icon={<CalendarDays className="h-4 w-4" />} label="Início da Etapa" date={data.startedAt} />
          {data.reviewStartAt && <DateCard className="h-[110px]" icon={<Clock4 className="h-4 w-4" />} label="Início da Revisão" date={data.reviewStartAt} />}
          {data.reviewDueAt && (
            <DateCard className="h-[110px]" icon={<Clock4 className="h-4 w-4" />} label="Prazo da Revisão" date={data.reviewDueAt} />
          )}
          <DateCard
            className="h-[110px]"
            icon={<Flag className="h-4 w-4" />} label="Prazo Final da Etapa" date={data.dueAt}
            variant={c.overdue > 0 ? "danger" : isToday(data.dueAt) ? "warn" : "default"}
          />
        </div>

        {/* KPI + BARRA SLA (centralizado, sem estourar margens) */}
        <div>
          <KpiRow computed={{ derived: c.derived as string, elapsed: c.elapsed, remaining: c.remaining, overdue: c.overdue, mode: c.mode }} />
          {c.total > 0 && (
            <SlaBar 
              progress={c.progress} 
              showTick={c.derived !== "concluido"}
              tone={c.derived === "concluido" ? "done" : c.overdue > 0 ? "overdue" : "ongoing"}
            />
          )}
        </div>

        {/* MINI TIMELINE */}
        <MiniTimeline data={data} />
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

function DateCard({ icon, label, date, variant = "default", className }: {
  icon: React.ReactNode; label: string; date?: string; variant?: "default" | "warn" | "danger"; className?: string;
}) {
  const tone =
    variant === "danger" ? "border-rose-200 bg-rose-50" :
    variant === "warn" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white";
  return (
    <div className={cn("rounded-xl border bg-white p-3.5 flex items-start gap-3", tone, className)}>
      <div className="h-8 w-8 rounded-full border bg-white text-slate-700 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-600 leading-4 truncate">{label}</div>
        <div className="text-lg font-medium sm:font-semibold text-slate-900 leading-6 mt-0.5">{fmtDate(date)}</div>
        {!!fmtTime(date) && <div className="text-xs text-slate-500 leading-4 mt-0.5">{fmtTime(date)}</div>}
      </div>
    </div>
  );
}

function KpiRow({ computed }: { computed: { derived: string; elapsed: number; remaining: number; overdue: number; mode: string } }) {
  const unit = computed.mode === "business" ? "dias úteis" : "dias corridos";
  return (
    <div className="flex flex-col items-center gap-4">
      {computed.derived === "concluido" ? (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Concluído
          </div>
          <div className="mt-1 text-sm text-slate-600">em {computed.elapsed} {unit}</div>
        </div>
      ) : computed.overdue > 0 ? (
        <div className="text-center">
          <div className="text-3xl font-bold text-rose-600 leading-none">{computed.overdue}</div>
          <div className="mt-1 text-rose-600 text-sm inline-flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" /> dias em atraso
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-600 leading-none">{computed.remaining}</div>
          <div className="mt-1 text-emerald-600 text-sm">dias restantes</div>
        </div>
      )}
    </div>
  );
}

function SlaBar({ progress, showTick, tone }: { progress: number; showTick: boolean; tone: "overdue" | "ongoing" | "done" }) {
  const fillClass = tone === "done" ? "bg-emerald-500" : tone === "overdue" ? "bg-amber-400" : "bg-amber-400";
  return (
    <div className="mt-3 w-full max-w-[720px] mx-auto">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
        <span>Progresso</span><span>{progress}%</span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={cn("h-full", fillClass)} style={{ width: `${progress}%` }} />
        {showTick && <div className="absolute top-0 bottom-0 w-[2px] bg-slate-400/60" style={{ left: `${progress}%` }} />}
      </div>
    </div>
  );
}

function MiniTimeline({ data }: { data: DeadlinePanelData }) {
  const pts = [
    data.startedAt && { k: "start", l: "Início", d: data.startedAt },
    data.reviewStartAt && { k: "rs", l: "Rev. início", d: data.reviewStartAt },
    data.reviewDueAt && { k: "rd", l: "Rev. prazo", d: data.reviewDueAt },
    data.dueAt && { k: "due", l: "Prazo final", d: data.dueAt },
    data.closedAt && { k: "cl", l: "Concluído", d: data.closedAt },
  ].filter(Boolean) as { k: string; l: string; d: string }[];
  if (!pts.length) return null;

  const start = new Date(pts[0].d).getTime();
  const end = new Date(pts[pts.length - 1].d).getTime();
  const span = Math.max(end - start, 1);

  // Precompute positions and hide labels that ficariam sobrepostos (distância mínima entre labels)
  const positions = pts.map((p) => {
    const raw = ((new Date(p.d).getTime() - start) / span) * 100;
    const left = Math.min(98, Math.max(2, raw));
    return { ...p, left };
  });
  const MIN_LABEL_GAP = 8; // porcentagem mínima entre labels para evitar sobreposição visual
  let lastShown = -Infinity;
  const withVisibility = positions.map((p) => {
    const showLabel = p.left - lastShown >= MIN_LABEL_GAP;
    if (showLabel) lastShown = p.left;
    return { ...p, showLabel };
  });

  return (
    <div className="px-5 pb-4 pt-1">
      <div className="relative h-[72px] overflow-hidden">
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-slate-200" />
        {withVisibility.map((p) => {
          const nearLeft = p.left < 10;
          const nearRight = p.left > 90;
          const translateClass = nearLeft ? "translate-x-0" : nearRight ? "-translate-x-full" : "-translate-x-1/2";
          const textAlign = nearLeft ? "text-left" : nearRight ? "text-right" : "text-center";
          return (
            <div key={p.k} className={cn("absolute", translateClass)} style={{ left: `${p.left}%` }}>
              <div className="h-3.5 w-3.5 rounded-full bg-slate-600" />
              {p.showLabel && (
                <div className={cn("mt-1 text-[11px] text-slate-600", textAlign, "max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis")} title={`${p.l} • {fmtDate(p.d)}`}>
                  {p.l}<span className="text-slate-400"> • {fmtDate(p.d)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function isToday(d?: string) {
  if (!d) return false;
  const x = new Date(d), n = new Date();
  return x.getFullYear() === n.getFullYear() && x.getMonth() === n.getMonth() && x.getDate() === n.getDate();
}

function labelStatus(s: string) {
  return ({
    pendente: "Pendente", em_andamento: "Em Andamento", em_analise: "Em Análise",
    suspenso: "Suspenso", atrasado: "Atrasado", concluido: "Concluído"
  } as Record<string, string>)[s] ?? s;
}


