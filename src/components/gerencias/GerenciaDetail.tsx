import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminStore } from '@/stores/adminStore';
import type { Gerencia } from '@/types/admin';
import { Edit, Trash2, UserPlus } from 'lucide-react';

export interface GerenciaDetailProps {
  gerenciaId: string;
  onEdit?: (id: string) => void;
  onAddMember?: (id: string) => void;
}

export default function GerenciaDetail({ gerenciaId, onEdit, onAddMember }: GerenciaDetailProps) {
  const getGerencia = useAdminStore(s => s.getGerencia);
  const findChildren = useAdminStore(s => s.findChildren);
  const usuarios = useAdminStore(s => s.usuarios);

  const g = getGerencia(gerenciaId);
  if (!g) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerência não encontrada</CardTitle>
          <CardDescription>Verifique a seleção à esquerda</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const parentChain = buildBreadcrumb(gerenciaId, getGerencia);
  const children = findChildren(gerenciaId);

  const responsavel = g.responsavelUserId ? usuarios.find(u => u.id === g.responsavelUserId) : undefined;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              {g.nome}
              {g.sigla && <Badge variant="secondary">{g.sigla}</Badge>}
            </CardTitle>
            <CardDescription>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={g.status === 'ativa' ? 'outline' : 'secondary'} className={g.status === 'inativa' ? 'opacity-60' : ''}>
                  {g.status === 'ativa' ? 'Ativa' : 'Inativa'}
                </Badge>
                <span className="text-xs text-muted-foreground">Atualizada em {new Date(g.updatedAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onEdit?.(g.id)}>
              <Edit className="w-4 h-4 mr-2" /> Editar
            </Button>
            <Button variant="outline" disabled>
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Responsável" value={responsavel ? `${responsavel.nome} (${responsavel.email})` : '—'} />
          <InfoRow label="E-mail" value={g.email || '—'} />
          <InfoRow label="Telefone" value={g.telefone || '—'} />
          <div>
            <div className="text-sm font-medium text-muted-foreground">Competências</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {g.competencias?.length ? g.competencias.map((c) => (
                <Badge key={c} variant="secondary">{c}</Badge>
              )) : <span className="text-sm text-muted-foreground">—</span>}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm font-medium text-muted-foreground mb-1">Unidade Pai</div>
            <div className="text-sm">
              {parentChain.length === 0 ? 'Raiz' : parentChain.map(p => p.nome).join(' › ')}
            </div>
          </div>
          {g.descricao && (
            <div className="md:col-span-2">
              <div className="text-sm font-medium text-muted-foreground mb-1">Descrição</div>
              <div className="text-sm whitespace-pre-wrap">{g.descricao}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Membros</CardTitle>
            <CardDescription>Usuários associados à gerência</CardDescription>
          </div>
          <Button onClick={() => onAddMember?.(g.id)}>
            <UserPlus className="w-4 h-4 mr-2" /> Adicionar Membro
          </Button>
        </CardHeader>
        <CardContent>
          {g.membros.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nenhum membro. Clique em "Adicionar Membro".</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Até</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {g.membros.map((m) => {
                  const u = usuarios.find(x => x.id === m.userId);
                  return (
                    <TableRow key={m.userId}>
                      <TableCell>{u?.nome || m.userId}</TableCell>
                      <TableCell>{u?.email || '—'}</TableCell>
                      <TableCell className="capitalize">{m.funcao}</TableCell>
                      <TableCell>{m.desde ? new Date(m.desde).toLocaleDateString('pt-BR') : '—'}</TableCell>
                      <TableCell>{m.ate ? new Date(m.ate).toLocaleDateString('pt-BR') : '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Subunidades removido conforme solicitado */}
    </div>
  );
}

function buildBreadcrumb(id: string, getGerencia: (id: string) => Gerencia | undefined): Gerencia[] {
  const chain: Gerencia[] = [];
  let cursor = getGerencia(id);
  while (cursor && cursor.unidadePaiId) {
    const parent = getGerencia(cursor.unidadePaiId);
    if (!parent) break;
    chain.unshift(parent);
    cursor = parent;
  }
  return chain;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-sm mt-1 break-words">{value}</div>
    </div>
  );
}


