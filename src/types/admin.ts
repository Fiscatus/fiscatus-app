export type GerenciaStatus = "ativa" | "inativa";
export type MembroFuncao = "chefe" | "substituto" | "membro";

export interface GerenciaMembro {
  userId: string;
  funcao: MembroFuncao;
  desde?: string;
  ate?: string;
}

export interface Gerencia {
  id: string;
  nome: string;
  sigla?: string;
  email?: string;
  telefone?: string;
  descricao?: string;
  status: GerenciaStatus;
  unidadePaiId?: string | null;
  localizacao?: string;
  competencias?: string[];
  slaPadraoDias?: number;
  responsavelUserId?: string | null;
  membros: GerenciaMembro[];
  createdAt: number;
  updatedAt: number;
}

export interface AdminUsuarioMock {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
}


