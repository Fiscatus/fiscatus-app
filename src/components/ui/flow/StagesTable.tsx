import React from 'react';
import { Clock, Eye, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Etapa {
  index: number;
  title: string;
  department: string;
  days: number;
  status: 'done' | 'in_progress' | 'pending';
}

interface StagesTableProps {
  etapas: Etapa[];
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
  onView?: (index: number) => void;
}

export default function StagesTable({ etapas, onEdit, onDelete, onView }: StagesTableProps) {
  const handleEdit = (index: number) => {
    onEdit?.(index);
  };

  const handleDelete = (index: number) => {
    onDelete?.(index);
  };

  const handleView = (index: number) => {
    onView?.(index);
  };

  return (
    <div 
      id="list-anchor" 
      className="scroll-mt-[calc(var(--safe-top)+var(--toolbar-h)+56px)] pt-2"
    >
      <div className="rounded-2xl border bg-white shadow-sm overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-[calc(var(--safe-top)+var(--toolbar-h)+56px)] z-10 bg-white border-b">
            <tr>
              <th className="w-16 text-center p-3 font-medium text-slate-600">#</th>
              <th className="text-left p-3 font-medium text-slate-600">Etapa</th>
              <th className="text-left p-3 font-medium text-slate-600">Setor</th>
              <th className="w-24 text-center p-3 font-medium text-slate-600">Prazo</th>
              <th className="w-32 text-center p-3 font-medium text-slate-600">Status</th>
              <th className="w-32 text-center p-3 font-medium text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {etapas.map((etapa) => (
              <tr 
                key={etapa.index} 
                className="hover:bg-slate-50/50 transition-colors border-b"
              >
                <td className="text-center p-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
                    {etapa.index}
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-medium text-slate-900">{etapa.title}</div>
                </td>
                <td className="p-3">
                  <div className="text-sm text-slate-600">{etapa.department}</div>
                </td>
                <td className="text-center p-3">
                  <div className="flex items-center justify-center gap-1 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    {etapa.days}d
                  </div>
                </td>
                <td className="text-center p-3">
                  <div className={`inline-flex items-center rounded-full text-xs font-medium px-3 py-1 ${
                    etapa.status === 'done' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : etapa.status === 'in_progress'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {etapa.status === 'done' && 'Concluído'}
                    {etapa.status === 'in_progress' && 'Em Andamento'}
                    {etapa.status === 'pending' && 'Pendente'}
                  </div>
                </td>
                <td className="text-center p-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(etapa.index)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(etapa.index)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(etapa.index)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}