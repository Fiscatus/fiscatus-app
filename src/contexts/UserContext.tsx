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
  // GERÊNCIAS-PAI (com permissão de editar fluxo) - PRIMEIROS
  {
    id: '1',
    nome: 'Dir. Carlos Superintendente',
    cargo: 'Diretor Superintendente',
    gerencia: 'Comissão de Implantação',
    email: 'carlos.superintendente@hospital.gov.br'
  },
  {
    id: '2',
    nome: 'Sec. Marina Executiva',
    cargo: 'Secretária Executiva',
    gerencia: 'Secretaria Executiva',
    email: 'marina.executiva@hospital.gov.br'
  },
  {
    id: '3',
    nome: 'Ouv. Roberto Geral',
    cargo: 'Ouvidor Geral',
    gerencia: 'Ouvidoria',
    email: 'roberto.ouvidor@hospital.gov.br'
  },
  {
    id: '4',
    nome: 'Ger. Ana Soluções',
    cargo: 'Gerente de Soluções',
    gerencia: 'Gerência de Soluções e Projetos',
    email: 'ana.solucoes@hospital.gov.br'
  },
  // OUTRAS GERÊNCIAS (sem permissão de editar fluxo)
  {
    id: '5',
    nome: 'Dr. João Silva',
    cargo: 'Gerente de Planejamento',
    gerencia: 'Gerência de Soluções e Projetos',
    email: 'joao.silva@hospital.gov.br'
  },
  {
    id: '6',
    nome: 'Eng. Maria Santos',
    cargo: 'Engenheira Chefe',
    gerencia: 'Gerência de Suprimentos e Logística',
    email: 'maria.santos@hospital.gov.br'
  },
  {
    id: '7',
    nome: 'Arq. Carlos Oliveira',
    cargo: 'Arquiteto Senior',
    gerencia: 'Gerência de Recursos Humanos',
    email: 'carlos.oliveira@hospital.gov.br'
  },
  {
    id: '8',
    nome: 'Dir. Ana Costa',
    cargo: 'Diretora Executiva',
    gerencia: 'Gerência de Urgência e Emergência',
    email: 'ana.costa@hospital.gov.br'
  },
  {
    id: '9',
    nome: 'Eng. Pedro Lima',
    cargo: 'Engenheiro de Projetos',
    gerencia: 'Gerência de Licitações e Contratos',
    email: 'pedro.lima@hospital.gov.br'
  },
  {
    id: '10',
    nome: 'Dir. Roberto Silva',
    cargo: 'Diretor Técnico',
    gerencia: 'Gerência Financeira e Contábil',
    email: 'roberto.silva@hospital.gov.br'
  },
  {
    id: '11',
    nome: 'Esp. Fernanda Martins',
    cargo: 'Especialista em Análise',
    gerencia: 'Ouvidoria',
    email: 'fernanda.martins@hospital.gov.br'
  },
  {
    id: '12',
    nome: 'Esp. Ricardo Alves',
    cargo: 'Especialista em Riscos',
    gerencia: 'Secretário Executivo',
    email: 'ricardo.alves@hospital.gov.br'
  },
  {
    id: '13',
    nome: 'Dir. Paulo Mendes',
    cargo: 'Diretor de Riscos',
    gerencia: 'Gerência de Soluções e Projetos',
    email: 'paulo.mendes@hospital.gov.br'
  },
  {
    id: '14',
    nome: 'Adv. Camila Rocha',
    cargo: 'Advogada',
    gerencia: 'Gerência de Suprimentos e Logística',
    email: 'camila.rocha@hospital.gov.br'
  },
  {
    id: '15',
    nome: 'Dir. Juliana Costa',
    cargo: 'Diretora de Contratos',
    gerencia: 'Gerência de Recursos Humanos',
    email: 'juliana.costa@hospital.gov.br'
  },
  {
    id: '16',
    nome: 'Esp. Luiza Campos',
    cargo: 'Especialista em Compras',
    gerencia: 'Gerência de Urgência e Emergência',
    email: 'luiza.campos@hospital.gov.br'
  },
  {
    id: '17',
    nome: 'Dir. Fernando Santos',
    cargo: 'Diretor Financeiro',
    gerencia: 'Gerência de Licitações e Contratos',
    email: 'fernando.santos@hospital.gov.br'
  },
  {
    id: '18',
    nome: 'Dir. Geral Eduardo Lima',
    cargo: 'Diretor Geral',
    gerencia: 'Gerência Financeira e Contábil',
    email: 'eduardo.lima@hospital.gov.br'
  },
  {
    id: '19',
    nome: 'Adv. Roberto Lima',
    cargo: 'Advogado Senior',
    gerencia: 'Ouvidoria',
    email: 'roberto.lima@hospital.gov.br'
  },
  {
    id: '20',
    nome: 'Adv. Patricia Silva',
    cargo: 'Assessora Jurídica',
    gerencia: 'Secretário Executivo',
    email: 'patricia.silva@hospital.gov.br'
  },
  {
    id: '21',
    nome: 'Esp. Ana Paula',
    cargo: 'Especialista em Comunicação',
    gerencia: 'Gerência de Soluções e Projetos',
    email: 'ana.paula@hospital.gov.br'
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