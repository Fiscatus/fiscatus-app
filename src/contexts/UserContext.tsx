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
  {
    id: '1',
    nome: 'Dr. João Silva',
    cargo: 'Gerente de Planejamento',
    gerencia: 'Gerência de Planejamento',
    email: 'joao.silva@hospital.gov.br'
  },
  {
    id: '2',
    nome: 'Eng. Maria Santos',
    cargo: 'Engenheira Chefe',
    gerencia: 'Gerência Técnica',
    email: 'maria.santos@hospital.gov.br'
  },
  {
    id: '3',
    nome: 'Arq. Carlos Oliveira',
    cargo: 'Arquiteto Senior',
    gerencia: 'Gerência de Engenharia',
    email: 'carlos.oliveira@hospital.gov.br'
  },
  {
    id: '4',
    nome: 'Dir. Ana Costa',
    cargo: 'Diretora Executiva',
    gerencia: 'Diretoria Executiva',
    email: 'ana.costa@hospital.gov.br'
  },
  {
    id: '5',
    nome: 'Eng. Pedro Lima',
    cargo: 'Engenheiro de Projetos',
    gerencia: 'Gerência de Projetos',
    email: 'pedro.lima@hospital.gov.br'
  },
  {
    id: '6',
    nome: 'Dir. Roberto Silva',
    cargo: 'Diretor Técnico',
    gerencia: 'Diretoria Técnica',
    email: 'roberto.silva@hospital.gov.br'
  },
  {
    id: '7',
    nome: 'Esp. Fernanda Martins',
    cargo: 'Especialista em Análise',
    gerencia: 'Gerência de Análise',
    email: 'fernanda.martins@hospital.gov.br'
  },
  {
    id: '8',
    nome: 'Esp. Ricardo Alves',
    cargo: 'Especialista em Riscos',
    gerencia: 'Gerência de Riscos',
    email: 'ricardo.alves@hospital.gov.br'
  },
  {
    id: '9',
    nome: 'Dir. Paulo Mendes',
    cargo: 'Diretor de Riscos',
    gerencia: 'Diretoria de Riscos',
    email: 'paulo.mendes@hospital.gov.br'
  },
  {
    id: '10',
    nome: 'Adv. Camila Rocha',
    cargo: 'Advogada',
    gerencia: 'Gerência de Contratos',
    email: 'camila.rocha@hospital.gov.br'
  },
  {
    id: '11',
    nome: 'Dir. Juliana Costa',
    cargo: 'Diretora de Contratos',
    gerencia: 'Diretoria de Contratos',
    email: 'juliana.costa@hospital.gov.br'
  },
  {
    id: '12',
    nome: 'Esp. Luiza Campos',
    cargo: 'Especialista em Compras',
    gerencia: 'Gerência de Compras',
    email: 'luiza.campos@hospital.gov.br'
  },
  {
    id: '13',
    nome: 'Dir. Fernando Santos',
    cargo: 'Diretor Financeiro',
    gerencia: 'Gerência Financeira',
    email: 'fernando.santos@hospital.gov.br'
  },
  {
    id: '14',
    nome: 'Dir. Carlos Mendes',
    cargo: 'Diretor Geral',
    gerencia: 'Diretoria Geral',
    email: 'carlos.mendes@hospital.gov.br'
  },
  {
    id: '15',
    nome: 'Adv. Roberto Lima',
    cargo: 'Advogado Senior',
    gerencia: 'Gerência Jurídica',
    email: 'roberto.lima@hospital.gov.br'
  },
  {
    id: '16',
    nome: 'Adv. Patricia Silva',
    cargo: 'Assessora Jurídica',
    gerencia: 'Assessoria Jurídica',
    email: 'patricia.silva@hospital.gov.br'
  },
  {
    id: '17',
    nome: 'Esp. Ana Paula',
    cargo: 'Especialista em Comunicação',
    gerencia: 'Gerência de Comunicação',
    email: 'ana.paula@hospital.gov.br'
  }
];

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  // Simular usuário logado - em produção viria de autenticação real
  const [user, setUser] = useState<User | null>(mockUsers[4]); // Eng. Pedro Lima (Gerência de Projetos) por padrão

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