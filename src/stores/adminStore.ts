import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AdminUsuarioMock, Gerencia, GerenciaStatus, MembroFuncao } from '@/types/admin';

type CreateGerenciaInput = Omit<Gerencia, 'id' | 'createdAt' | 'updatedAt'>;

interface AdminStore {
  gerencias: Gerencia[];
  usuarios: AdminUsuarioMock[];
  // CRUD
  createGerencia: (g: CreateGerenciaInput) => string;
  updateGerencia: (id: string, patch: Partial<Gerencia>) => void;
  deleteGerencia: (id: string) => void;
  moveGerencia: (id: string, novaUnidadePaiId: string | null) => void;
  // membros
  addMembro: (gerenciaId: string, userId: string, funcao: MembroFuncao) => void;
  updateMembro: (gerenciaId: string, userId: string, patch: Partial<Gerencia['membros'][number]>) => void;
  removeMembro: (gerenciaId: string, userId: string) => void;
  // helpers
  getGerencia: (id: string) => Gerencia | undefined;
  findChildren: (parentId: string | null) => Gerencia[];
}

function normalizeNome(nome: string): string {
  return nome.trim().toLowerCase();
}

function hasCycle(gerencias: Gerencia[], id: string, novoPai: string | null): boolean {
  if (novoPai === null) return false;
  if (novoPai === id) return true;
  // sobe a cadeia até a raiz; se encontrar id, há ciclo
  let cursor: string | null | undefined = novoPai;
  const byId = new Map(gerencias.map(g => [g.id, g] as const));
  const visited = new Set<string>();
  while (cursor) {
    if (cursor === id) return true;
    if (visited.has(cursor)) return true; // segurança
    visited.add(cursor);
    cursor = byId.get(cursor)?.unidadePaiId ?? null;
  }
  return false;
}

function ensureResponsavelInMembros(g: Gerencia): Gerencia {
  const responsavel = g.responsavelUserId;
  if (!responsavel) return g;
  const exists = g.membros.some(m => m.userId === responsavel);
  if (exists) return g;
  return {
    ...g,
    membros: [{ userId: responsavel, funcao: 'chefe' as MembroFuncao }, ...g.membros],
  };
}

const seedUsuarios: AdminUsuarioMock[] = [
  { id: 'u1', nome: 'Ana Clara', email: 'ana.clara@hospital.gov.br', ativo: true },
  { id: 'u2', nome: 'Bruno Lima', email: 'bruno.lima@hospital.gov.br', ativo: true },
  { id: 'u3', nome: 'Carla Souza', email: 'carla.souza@hospital.gov.br', ativo: true },
  { id: 'u4', nome: 'Diego Martins', email: 'diego.martins@hospital.gov.br', ativo: true },
  { id: 'u5', nome: 'Eduarda Nunes', email: 'eduarda.nunes@hospital.gov.br', ativo: true },
  { id: 'u6', nome: 'Felipe Araujo', email: 'felipe.araujo@hospital.gov.br', ativo: true },
  { id: 'u7', nome: 'Gabriela Rocha', email: 'gabriela.rocha@hospital.gov.br', ativo: true },
  { id: 'u8', nome: 'Henrique Alves', email: 'henrique.alves@hospital.gov.br', ativo: true },
  { id: 'u9', nome: 'Isabela Castro', email: 'isabela.castro@hospital.gov.br', ativo: true },
  { id: 'u10', nome: 'João Pedro', email: 'joao.pedro@hospital.gov.br', ativo: true },
];

const now = () => Date.now();

const seedGerencias = (): Gerencia[] => {
  const gspId = 'g1';
  const glcId = 'g2';
  const gfcId = 'g3';
  const grhId = 'g4';
  const gueId = 'g5';
  const base: Omit<Gerencia, 'id'>[] = [
    { id: gspId } as any,
  ];
  const list: Gerencia[] = [
    {
      id: gspId,
      nome: 'Gerência de Soluções e Projetos',
      sigla: 'GSP',
      status: 'ativa',
      unidadePaiId: null,
      membros: [],
      createdAt: now(),
      updatedAt: now(),
      descricao: 'Responsável por soluções e projetos',
      competencias: ['projetos', 'soluções'],
      responsavelUserId: 'u1',
      email: 'gsp@hospital.gov.br',
    },
    {
      id: glcId,
      nome: 'Gerência de Licitações',
      sigla: 'GLC',
      status: 'ativa',
      unidadePaiId: gspId,
      membros: [],
      createdAt: now(),
      updatedAt: now(),
      responsavelUserId: 'u2',
    },
    {
      id: gfcId,
      nome: 'Gerência Financeira',
      sigla: 'GFC',
      status: 'ativa',
      unidadePaiId: gspId,
      membros: [],
      createdAt: now(),
      updatedAt: now(),
      responsavelUserId: 'u3',
    },
    {
      id: grhId,
      nome: 'Gerência de Recursos Humanos',
      sigla: 'GRH',
      status: 'ativa',
      unidadePaiId: null,
      membros: [],
      createdAt: now(),
      updatedAt: now(),
      responsavelUserId: 'u4',
    },
    {
      id: gueId,
      nome: 'Gerência de Urgência e Emergência',
      sigla: 'GUE',
      status: 'inativa',
      unidadePaiId: null,
      membros: [],
      createdAt: now(),
      updatedAt: now(),
      responsavelUserId: 'u5',
    },
  ];
  return list.map(ensureResponsavelInMembros);
};

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      gerencias: seedGerencias(),
      usuarios: seedUsuarios,

      createGerencia: (g) => {
        const state = get();
        if (!g.nome || !g.nome.trim()) throw new Error('Nome é obrigatório');
        const nomeKey = normalizeNome(g.nome);
        if (state.gerencias.some(x => normalizeNome(x.nome) === nomeKey)) {
          throw new Error('Nome de gerência deve ser único');
        }
        const id = `g_${Math.random().toString(36).slice(2, 9)}`;
        const nowTs = now();
        const nova: Gerencia = ensureResponsavelInMembros({
          ...g,
          id,
          createdAt: nowTs,
          updatedAt: nowTs,
        } as Gerencia);
        set({ gerencias: [...state.gerencias, nova] });
        return id;
      },

      updateGerencia: (id, patch) => {
        set((state) => {
          const idx = state.gerencias.findIndex(g => g.id === id);
          if (idx === -1) return state;
          const atual = state.gerencias[idx];
          let atualizado: Gerencia = { ...atual, ...patch, updatedAt: now() };
          if (patch?.nome && normalizeNome(patch.nome) !== normalizeNome(atual.nome)) {
            if (state.gerencias.some(g => g.id !== id && normalizeNome(g.nome) === normalizeNome(patch.nome!))) {
              throw new Error('Nome de gerência deve ser único');
            }
          }
          if (patch?.unidadePaiId !== undefined) {
            if (hasCycle(state.gerencias, id, patch.unidadePaiId ?? null)) {
              throw new Error('Movimento inválido: criaria ciclo');
            }
          }
          atualizado = ensureResponsavelInMembros(atualizado);
          const newList = [...state.gerencias];
          newList[idx] = atualizado;
          return { ...state, gerencias: newList };
        });
      },

      deleteGerencia: (id) => {
        set((state) => {
          const hasChildren = state.gerencias.some(g => g.unidadePaiId === id);
          if (hasChildren) {
            throw new Error('Não é possível excluir: possui subunidades');
          }
          return { ...state, gerencias: state.gerencias.filter(g => g.id !== id) };
        });
      },

      moveGerencia: (id, novaUnidadePaiId) => {
        set((state) => {
          if (hasCycle(state.gerencias, id, novaUnidadePaiId)) {
            throw new Error('Movimento inválido: criaria ciclo');
          }
          const newList = state.gerencias.map(g => g.id === id ? { ...g, unidadePaiId: novaUnidadePaiId, updatedAt: now() } : g);
          return { ...state, gerencias: newList };
        });
      },

      addMembro: (gerenciaId, userId, funcao) => {
        set((state) => {
          const idx = state.gerencias.findIndex(g => g.id === gerenciaId);
          if (idx === -1) return state;
          const g = state.gerencias[idx];
          if (g.membros.some(m => m.userId === userId)) return state;
          const membros = [...g.membros, { userId, funcao }];
          const atualizado = ensureResponsavelInMembros({ ...g, membros, updatedAt: now() });
          const list = [...state.gerencias];
          list[idx] = atualizado;
          return { ...state, gerencias: list };
        });
      },

      updateMembro: (gerenciaId, userId, patch) => {
        set((state) => {
          const idx = state.gerencias.findIndex(g => g.id === gerenciaId);
          if (idx === -1) return state;
          const g = state.gerencias[idx];
          const membros = g.membros.map(m => m.userId === userId ? { ...m, ...patch } : m);
          const atualizado = ensureResponsavelInMembros({ ...g, membros, updatedAt: now() });
          const list = [...state.gerencias];
          list[idx] = atualizado;
          return { ...state, gerencias: list };
        });
      },

      removeMembro: (gerenciaId, userId) => {
        set((state) => {
          const idx = state.gerencias.findIndex(g => g.id === gerenciaId);
          if (idx === -1) return state;
          const g = state.gerencias[idx];
          let membros = g.membros.filter(m => m.userId !== userId);
          // se remover responsável, zera responsavelUserId
          const responsavelUserId = g.responsavelUserId === userId ? null : g.responsavelUserId ?? null;
          const atualizado = ensureResponsavelInMembros({ ...g, membros, responsavelUserId, updatedAt: now() });
          const list = [...state.gerencias];
          list[idx] = atualizado;
          return { ...state, gerencias: list };
        });
      },

      getGerencia: (id) => get().gerencias.find(g => g.id === id),
      findChildren: (parentId) => get().gerencias.filter(g => (g.unidadePaiId ?? null) === parentId).sort((a, b) => a.nome.localeCompare(b.nome)),
    }),
    {
      name: 'admin-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ gerencias: state.gerencias, usuarios: state.usuarios }),
    }
  )
);

export type { AdminStore };


