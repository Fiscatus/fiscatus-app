import React from 'react';
import { CheckCircle2, XCircle, FileText, Paperclip, MessageSquare, FileCheck } from 'lucide-react';
import { TimelineStatus } from '@/types/timeline';

export const STATUS_STYLES: Record<TimelineStatus, { badge: string; pin?: string; icon: React.ComponentType<{ className?: string }>; iconClass: string }> = {
  aprovado: { badge: 'border-green-300 text-green-700 bg-green-50', pin: 'border-green-300', icon: CheckCircle2, iconClass: 'text-green-600' },
  devolvido: { badge: 'border-red-300 text-red-700 bg-red-50', pin: 'border-red-300', icon: XCircle, iconClass: 'text-red-600' },
  versao: { badge: 'border-blue-300 text-blue-700 bg-blue-50', pin: 'border-blue-300', icon: FileText, iconClass: 'text-blue-600' },
  anexo: { badge: 'border-slate-300 text-slate-700 bg-slate-50', pin: 'border-slate-300', icon: Paperclip, iconClass: 'text-slate-700' },
  comentario: { badge: 'border-slate-300 text-slate-700 bg-white', pin: 'border-slate-300', icon: MessageSquare, iconClass: 'text-indigo-600' },
  assinado: { badge: 'border-emerald-300 text-emerald-700 bg-emerald-50', pin: 'border-emerald-300', icon: FileCheck, iconClass: 'text-emerald-600' },
  rejeitado: { badge: 'border-rose-300 text-rose-700 bg-rose-50', pin: 'border-rose-300', icon: XCircle, iconClass: 'text-rose-600' }
};

export const labelFromStatus = (s: TimelineStatus): string => {
  switch (s) {
    case 'versao': return 'Versão';
    case 'aprovado': return 'Aprovado';
    case 'devolvido': return 'Devolvido';
    case 'anexo': return 'Anexo';
    case 'comentario': return 'Comentário';
    case 'assinado': return 'Assinado';
    case 'rejeitado': return 'Rejeitado';
    default: return s;
  }
};


