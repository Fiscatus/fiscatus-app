import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import GerenciasTree from '@/components/gerencias/GerenciasTree';
import GerenciaDetail from '@/components/gerencias/GerenciaDetail';
import GerenciaDrawer from '@/components/gerencias/GerenciaDrawer';
import MembrosDialog from '@/components/gerencias/MembrosDialog';

export default function GerenciasPage() {
  const gerencias = useAdminStore(s => s.gerencias);
  const usuarios = useAdminStore(s => s.usuarios);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [defaultParentId, setDefaultParentId] = React.useState<string | null>(null);
  const [membersOpen, setMembersOpen] = React.useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerências</h2>
          <p className="text-muted-foreground">Gerencie usuários, roles e convites da organização</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingId(null); setDefaultParentId(null); setDrawerOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nova Gerência
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Esquerda: Árvore */}
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Estrutura de Gerências</CardTitle>
              <CardDescription>{gerencias.length} unidades • {usuarios.length} usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <GerenciasTree
                selectedId={selectedId}
                onSelect={setSelectedId}
                onCreateChild={(parentId) => { setEditingId(null); setDefaultParentId(parentId ?? null); setDrawerOpen(true); }}
                onEdit={(id) => { setEditingId(id); setDefaultParentId(null); setDrawerOpen(true); }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Direita: Detalhes */}
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Gerência</CardTitle>
              <CardDescription>{selectedId ? 'Gerência selecionada' : 'Selecione uma gerência à esquerda ou crie uma nova'}</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedId ? (
                <div className="text-sm text-muted-foreground">Selecione uma gerência à esquerda ou crie uma nova</div>
              ) : (
                <GerenciaDetail gerenciaId={selectedId} onEdit={(id) => { setEditingId(id); setDrawerOpen(true); }} onAddMember={() => setMembersOpen(true)} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <GerenciaDrawer open={drawerOpen} onOpenChange={setDrawerOpen} gerenciaId={editingId} defaultParentId={defaultParentId} />
      {selectedId && (
        <MembrosDialog open={membersOpen} onOpenChange={setMembersOpen} gerenciaId={selectedId} />
      )}
    </div>
  );
}


