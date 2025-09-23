import React, { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/stores/adminStore';
import type { Gerencia, GerenciaStatus } from '@/types/admin';
import { toast } from '@/hooks/use-toast';

interface GerenciaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gerenciaId?: string | null;
  defaultParentId?: string | null;
}

export default function GerenciaDrawer({ open, onOpenChange, gerenciaId, defaultParentId = null }: GerenciaDrawerProps) {
  const isEditing = !!gerenciaId;
  const getGerencia = useAdminStore(s => s.getGerencia);
  const createGerencia = useAdminStore(s => s.createGerencia);
  const updateGerencia = useAdminStore(s => s.updateGerencia);
  const gerencias = useAdminStore(s => s.gerencias);
  const usuarios = useAdminStore(s => s.usuarios);

  const current = gerenciaId ? getGerencia(gerenciaId) : undefined;

  const [form, setForm] = useState<Partial<Gerencia>>({
    nome: current?.nome || '',
    sigla: current?.sigla || '',
    status: current?.status || 'ativa',
    unidadePaiId: current?.unidadePaiId ?? defaultParentId ?? null,
    responsavelUserId: current?.responsavelUserId ?? null,
    email: current?.email || '',
    telefone: current?.telefone || '',
    localizacao: current?.localizacao || '',
    competencias: current?.competencias || [],
    slaPadraoDias: current?.slaPadraoDias || undefined,
    descricao: current?.descricao || '',
  });

  React.useEffect(() => {
    if (isEditing && current) {
      setForm({
        nome: current.nome,
        sigla: current.sigla,
        status: current.status,
        unidadePaiId: current.unidadePaiId ?? null,
        responsavelUserId: current.responsavelUserId ?? null,
        email: current.email,
        telefone: current.telefone,
        localizacao: current.localizacao,
        competencias: current.competencias || [],
        slaPadraoDias: current.slaPadraoDias,
        descricao: current.descricao,
      });
    } else if (!isEditing) {
      setForm(f => ({ ...f, unidadePaiId: defaultParentId ?? null }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gerenciaId, isEditing, open]);

  const parentOptions = useMemo(() => gerencias.map(g => ({ id: g.id, nome: g.nome })), [gerencias]);

  const onSave = () => {
    try {
      if (!form.nome || !form.nome.trim()) {
        toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
        return;
      }
      if (form.sigla && form.sigla.length > 8) {
        toast({ title: 'Erro', description: 'Sigla deve ter no máximo 8 caracteres', variant: 'destructive' });
        return;
      }
      if (isEditing && gerenciaId) {
        updateGerencia(gerenciaId, {
          ...form,
          status: (form.status as GerenciaStatus) || 'ativa',
        } as Partial<Gerencia>);
        toast({ title: 'Sucesso', description: 'Gerência atualizada' });
      } else {
        const id = createGerencia({
          nome: form.nome!,
          sigla: form.sigla,
          status: (form.status as GerenciaStatus) || 'ativa',
          unidadePaiId: form.unidadePaiId ?? null,
          responsavelUserId: form.responsavelUserId ?? null,
          email: form.email,
          telefone: form.telefone,
          localizacao: form.localizacao,
          competencias: form.competencias || [],
          slaPadraoDias: form.slaPadraoDias,
          descricao: form.descricao,
          membros: [],
          createdAt: 0,
          updatedAt: 0,
        });
        toast({ title: 'Sucesso', description: 'Gerência criada' });
      }
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Falha ao salvar', variant: 'destructive' });
    }
  };

  const onCancel = () => onOpenChange(false);

  const addCompetencia = (tag: string) => {
    if (!tag.trim()) return;
    setForm(f => ({ ...f, competencias: Array.from(new Set([...(f.competencias || []), tag.trim()])) }));
  };
  const removeCompetencia = (tag: string) => setForm(f => ({ ...f, competencias: (f.competencias || []).filter(t => t !== tag) }));

  const [tagInput, setTagInput] = useState('');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Editar Gerência' : 'Nova Gerência'}</SheetTitle>
          <SheetDescription>Preencha as informações da gerência</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input value={form.nome || ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Gerência de Projetos" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sigla</Label>
              <Input value={form.sigla || ''} maxLength={8} onChange={(e) => setForm({ ...form, sigla: e.target.value })} placeholder="GSP" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={(form.status as GerenciaStatus) || 'ativa'} onValueChange={(v) => setForm({ ...form, status: v as GerenciaStatus })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Unidade Pai</Label>
              <Select value={form.unidadePaiId ?? 'null'} onValueChange={(v) => setForm({ ...form, unidadePaiId: v === 'null' ? null : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Raiz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Raiz</SelectItem>
                  {parentOptions.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Responsável</Label>
              <Select value={form.responsavelUserId ?? ''} onValueChange={(v) => setForm({ ...form, responsavelUserId: v || null })}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {usuarios.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.nome} — {u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>E-mail</Label>
              <Input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="gsp@org.gov.br" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(61) 99999-9999" />
            </div>
          </div>

          <div>
            <Label>Localização</Label>
            <Input value={form.localizacao || ''} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} placeholder="Prédio A, 3º andar" />
          </div>

          <div>
            <Label>Competências</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Digite e Enter" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCompetencia(tagInput); setTagInput(''); } }} />
              <Button type="button" variant="outline" onClick={() => { addCompetencia(tagInput); setTagInput(''); }}>Adicionar</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(form.competencias || []).map(c => (
                <Badge key={c} variant="secondary" className="cursor-pointer" onClick={() => removeCompetencia(c)}>{c} ✕</Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SLA padrão (dias)</Label>
              <Input type="number" min={0} value={form.slaPadraoDias ?? ''} onChange={(e) => setForm({ ...form, slaPadraoDias: e.target.value === '' ? undefined : Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea value={form.descricao || ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={4} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button onClick={onSave}>Salvar</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


