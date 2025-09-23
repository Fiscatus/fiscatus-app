import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Paperclip, Clock } from 'lucide-react';
import { TimelineItemModel } from '@/types/timeline';
import { STATUS_STYLES, labelFromStatus } from './statusTokens';

export function TimelineItem({ item }:{ item: TimelineItemModel }) {
  const S = STATUS_STYLES[item.status];
  const Icon = S.icon;
  return (
    <li className="relative pl-10">
      {/* espinha vertical */}
      <span className="pointer-events-none absolute left-5 top-0 bottom-0 w-[2px] bg-slate-200 z-0" />
      {/* pino */}
      <span className={`absolute left-2.5 top-3 h-5 w-5 rounded-full border border-slate-300 bg-white flex items-center justify-center shadow-sm z-10 ${S.pin || ''}`}>
        <Icon className={`h-3.5 w-3.5 ${S.iconClass}`} />
      </span>
      {/* conector curto */}
      <span className="absolute left-5 top-5 w-4 h-[2px] bg-slate-200" />

      {/* cartão */}
      <div className="ml-9 rounded-xl border bg-white p-3 hover:shadow-md transition-shadow focus-within:ring-2 ring-indigo-200">
        {/* título + hora */}
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-slate-900 truncate flex-1">{item.title}</h4>
          <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
            <Clock className="w-3 h-3" />
            <span>{new Date(item.createdAt).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        {/* autor + status */}
        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-600">
          <Avatar className="h-4 w-4">
            <AvatarImage src={item.author.avatarUrl} />
            <AvatarFallback>{item.author.name?.[0] ?? 'U'}</AvatarFallback>
          </Avatar>
          <span className="truncate">{item.author.name}</span>
          <Badge variant="outline" className={`h-5 px-1.5 ${S.badge}`}>{labelFromStatus(item.status)}</Badge>
        </div>
        {/* descrição opcional */}
        {item.description && (
          <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{item.description}</p>
        )}
        {/* anexos opcionais */}
        {!!item.attachments?.length && (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.attachments.map(a => (
              <span key={a.name} className="inline-flex items-center gap-1.5 text-[11px] rounded-md border px-1.5 py-0.5">
                <Paperclip className="h-3 w-3" /> {a.name}{a.size ? ` • ${a.size}` : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}


