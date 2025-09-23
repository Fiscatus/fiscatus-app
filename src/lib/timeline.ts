import { DateGroup, TimelineItemModel } from "@/types/timeline";

export function groupByDate(items: TimelineItemModel[]): DateGroup[] {
  const map = new Map<string, DateGroup>();
  for (const it of items) {
    const d = new Date(it.createdAt);
    const key = d.toISOString().slice(0,10);
    const label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    if (!map.has(key)) map.set(key, { key, label, items: [] });
    map.get(key)!.items.push(it);
  }
  return [...map.values()]
    .sort((a,b) => b.key.localeCompare(a.key))
    .map(g => ({ ...g, items: g.items.sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt)) }));
}


