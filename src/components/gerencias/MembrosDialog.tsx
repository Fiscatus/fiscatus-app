import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAdminStore } from '@/stores/adminStore';
import type { MembroFuncao } from '@/types/admin';
import { toast } from '@/hooks/use-toast';

interface MembrosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gerenciaId: string;
}

export default function MembrosDialog({ open, onOpenChange, gerenciaId }: MembrosDialogProps) {
  const usuarios = useAdminStore(s => s.usuarios);
  const getGerencia = useAdminStore(s => s.getGerencia);
  const addMembro = useAdminStore(s => s.addMembro);
  const updateMembro = useAdminStore(s => s.updateMembro);

  const g = getGerencia(gerenciaId);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [funcao, setFuncao] = useState<MembroFuncao>('membro');
  const [desde, setDesde] = useState('');
  const [ate, setAte] = useState('');

  React.useEffect(() => {
    if (!open) {
      setSelectedUserId('');
      setFuncao('membro');
      setDesde('');
      setAte('');
    }
  }, [open]);

  const alreadyMembers = new Set((g?.membros || []).map(m => m.userId));
  const candidateUsers = useMemo(() => usuarios.filter(u => !alreadyMembers.has(u.id)), [usuarios, alreadyMembers]);

  const onSave = () => {
    try {
      if (!selectedUserId) {
        toast({ title: 'Erro', description: 'Selecione um usuário', variant: 'destructive' });
        return;
      }
      if (!g) return;
      addMembro(g.id, selectedUserId, funcao);
      if (desde || ate) {
        updateMembro(g.id, selectedUserId, { desde: desde || undefined, ate: ate || undefined });
      }
      toast({ title: 'Sucesso', description: 'Membro adicionado' });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Falha ao salvar', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Membro</DialogTitle>
          <DialogDescription>Selecione o usuário, função e datas</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Usuário</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {candidateUsers.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.nome} — {u.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Função</Label>
            <Select value={funcao} onValueChange={(v) => setFuncao(v as MembroFuncao)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chefe">Chefe</SelectItem>
                <SelectItem value="substituto">Substituto</SelectItem>
                <SelectItem value="membro">Membro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Desde</Label>
              <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div>
              <Label>Até</Label>
              <Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


