import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  nome: string;
  cargo: string;
  gerencia: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock de usuários para teste - correspondendo às gerências das etapas do fluxo
const mockUsers: User[] = [
  // GERÊNCIAS-PAI (com permissão de editar fluxo)
  {
    id: '1',
    nome: 'Lara Rubia Vaz Diniz Fraguas',
    cargo: 'Supervisão contratual',
    gerencia: 'Comissão de Implantação',
    email: 'lara.fraguas@hospital.gov.br'
  },
  {
    id: '2',
    nome: 'Diran Rodrigues de Souza Filho',
    cargo: 'Secretário Executivo',
    gerencia: 'SE - Secretaria Executiva',
    email: 'diran.rodrigues@hospital.gov.br'
  },
  {
    id: '3',
    nome: 'Georgia Guimaraes Pereira',
    cargo: 'Controladora Interna',
    gerencia: 'OUV - Ouvidoria',
    email: 'georgia.guimaraes@hospital.gov.br'
  },
  {
    id: '4',
    nome: 'Yasmin Pissolati Mattos Bretz',
    cargo: 'Gerente de Soluções e Projetos',
    gerencia: 'GSP - Gerência de Soluções e Projetos',
    email: 'yasmin.pissolati@hospital.gov.br'
  },
  // OUTRAS GERÊNCIAS (sem permissão de editar fluxo)
  {
    id: '5',
    nome: 'Guilherme de Carvalho Silva',
    cargo: 'Gerente Suprimentos e Logistica',
    gerencia: 'GSL - Gerência de Suprimentos e Logística',
    email: 'guilherme.carvalho@hospital.gov.br'
  },
  {
    id: '6',
    nome: 'Lucas Moreira Brito',
    cargo: 'GERENTE DE RH',
    gerencia: 'GRH - Gerência de Recursos Humanos',
    email: 'lucas.moreira@hospital.gov.br'
  },
  {
    id: '7',
    nome: 'Andressa Sterfany Santos da Silva',
    cargo: 'Assessora Técnica de Saúde',
    gerencia: 'GUE - Gerência de Urgência e Emergência',
    email: 'andressa.sterfany@hospital.gov.br'
  },
  {
    id: '8',
    nome: 'Leticia Bonfim Guilherme',
    cargo: 'Gerente de Licitações e Contratos',
    gerencia: 'GLC - Gerência de Licitações e Contratos',
    email: 'leticia.bonfim@hospital.gov.br'
  },
  {
    id: '9',
    nome: 'Dallas Kelson Francisco de Souza',
    cargo: 'Gerente Financeiro',
    gerencia: 'GFC - Gerência Financeira e Contábil',
    email: 'dallas.kelson@hospital.gov.br'
  },
  {
    id: '10',
    nome: 'Gabriel Radamesis Gomes Nascimento',
    cargo: 'Assessor Jurídico',
    gerencia: 'NAJ - Assessoria Jurídica',
    email: 'gabriel.radamesis@hospital.gov.br'
  }
];

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  // Simular usuário logado - em produção viria de autenticação real
  const [user, setUser] = useState<User | null>(mockUsers[0]); // Dir. Carlos Superintendente (Comissão de Implantação) por padrão

  const value: UserContextType = {
    user,
    setUser,
    isAuthenticated: !!user
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export { mockUsers };
export type { User }; 