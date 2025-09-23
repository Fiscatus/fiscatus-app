import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import type { Gerencia } from '@/types/admin';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// Hierarquia desabilitada: sem drag and drop

type StatusFilter = 'todas' | 'ativas' | 'inativas';

export interface GerenciasTreeProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateChild?: (parentId: string | null) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function GerenciasTree({ selectedId, onSelect, onCreateChild, onEdit, onDelete }: GerenciasTreeProps) {
  const gerencias = useAdminStore(s => s.gerencias);
  const findChildren = useAdminStore(s => s.findChildren);
  const moveGerencia = useAdminStore(s => s.moveGerencia);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('todas');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const roots = useMemo(() => findChildren(null), [findChildren, gerencias]);

  const matchStatus = (g: Gerencia) => {
    if (status === 'todas') return true;
    if (status === 'ativas') return g.status === 'ativa';
    return g.status === 'inativa';
  };

  const matchQuery = (g: Gerencia) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      g.nome.toLowerCase().includes(q) ||
      (g.sigla?.toLowerCase().includes(q) ?? false) ||
      (g.descricao?.toLowerCase().includes(q) ?? false)
    );
  };

  const visible = (g: Gerencia) => matchStatus(g) && matchQuery(g);

  const toggle = (_id: string) => {};

  const renderNode = (g: Gerencia, depth = 0): React.ReactNode => {
    const children: Gerencia[] = [];
    const isCollapsed = false;
    const hasChildren = false;
    const isSelected = selectedId === g.id;

    // Se o nó não bate filtros, ainda pode aparecer se algum descendente bater (para contexto da árvore)
    const childNodes: React.ReactNode[] = [];
    const selfVisible = visible(g);
    const anyChildVisible = childNodes.length > 0;
    if (!selfVisible && !anyChildVisible) return null;

    // Drag & Drop removido

    return (
      <div key={g.id}>
        <div
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
          onClick={() => onSelect(g.id)}
          aria-selected={isSelected}
          role="treeitem"
          aria-expanded={undefined}
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          <span className="w-4 h-4" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">{g.nome}</span>
              {g.sigla && (
                <Badge variant="secondary" className="text-[10px]">{g.sigla}</Badge>
              )}
              <Badge variant={g.status === 'ativa' ? 'outline' : 'secondary'} className={`text-[10px] ${g.status === 'inativa' ? 'opacity-60' : ''}`}>
                {g.status === 'ativa' ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} aria-label="Ações">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(g.id)}>Editar</DropdownMenuItem>
              {/* Sem hierarquia */}
              <DropdownMenuItem onClick={() => onDelete?.(g.id)}>Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasChildren && !isCollapsed && (
          <div role="group">
            {childNodes}
          </div>
        )}
      </div>
    );
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const id = String(active.id);
    const novoPai = String(over.id);
    try {
      moveGerencia(id, novoPai);
      toast({ title: 'Movido', description: 'Gerência movida na hierarquia' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Falha ao mover', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Input
          placeholder="Buscar gerência…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select value={status} onValueChange={(v: StatusFilter) => setStatus(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="ativas">Ativas</SelectItem>
            <SelectItem value="inativas">Inativas</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => onCreateChild?.(null)}>
          <Plus className="w-4 h-4 mr-2" /> Nova Gerência
        </Button>
      </div>

      <div role="tree" aria-label="Lista de Gerências" className="max-h-[60vh] overflow-auto">
        {roots.map(g => renderNode(g))}
        {roots.length === 0 && (
          <div className="text-sm text-muted-foreground py-4 px-2">Nenhuma gerência cadastrada.</div>
        )}
      </div>
    </div>
  );
}


