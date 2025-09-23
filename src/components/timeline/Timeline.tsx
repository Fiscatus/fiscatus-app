import React, { useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { TimelineItemModel, TimelineStatus } from '@/types/timeline';
import { TimelineFilters } from './TimelineFilters';
import { DateSeparator } from './DateSeparator';
import { groupByDate } from '@/lib/timeline';
import { TimelineItem } from './TimelineItem';

export default function Timeline({ data }: { data: TimelineItemModel[] }) {
  const [q, setQ] = useState('');
  const [statuses, setStatuses] = useState<TimelineStatus[]>([]);
  const [period, setPeriod] = useState<'today'|'7d'|'30d'|'all'>('all');

  const filtered = useMemo(() => {
    const now = new Date();
    const cutoff = (() => {
      if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      if (period === '7d') return now.getTime() - 7 * 86400000;
      if (period === '30d') return now.getTime() - 30 * 86400000;
      return null;
    })();

    return data.filter(it => {
      const t = new Date(it.createdAt).getTime();
      if (cutoff && t < cutoff) return false;
      if (statuses.length && !statuses.includes(it.status)) return false;
      if (q) {
        const ql = q.toLowerCase();
        if (!it.title.toLowerCase().includes(ql) && !it.author.name.toLowerCase().includes(ql)) return false;
      }
      return true;
    });
  }, [data, q, statuses, period]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const toggleStatus = (s: TimelineStatus) =>
    setStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  return (
    <div className="rounded-2xl border border-slate-300 shadow-md bg-white p-6 mb-8">
      <header className="flex items-center gap-3 mb-4">
        <Clock3 className="w-6 h-6 text-slate-600" />
        <h2 className="text-lg font-bold text-slate-900">Timeline</h2>
        <div className="ml-auto">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            Histórico
          </span>
        </div>
      </header>
      <div className="border-b-2 border-slate-200 mb-6"></div>

      <TimelineFilters
        q={q} onQ={setQ}
        selected={statuses} onToggleStatus={toggleStatus}
        period={period} onPeriod={setPeriod}
        onClear={() => { setQ(''); setStatuses([]); setPeriod('all'); }}
        total={data.length}
        filtered={filtered.length}
      />

      <div className="pb-3 relative">
        {groups.length > 0 ? (
          <div className="max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
            {groups.map(g => (
              <section key={g.key}>
                <DateSeparator label={g.label} />
                <ul className="space-y-3">
                  {g.items.map(it => <TimelineItem key={it.id} item={it} />)}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="px-3.5 py-6 text-center text-slate-500 text-sm">
            Nenhum evento com os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
}

export { Timeline };

