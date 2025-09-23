import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Role {
  _id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface UserOrg {
  role: string;
  isOrgAdmin: boolean;
  orgId: string;
  orgName: string;
}

interface User {
  _id: string;
  email: string;
  password: string;
  orgs: UserOrg[];
  isActive: boolean;
  isPlatformAdmin: boolean;
  nome?: string;
  cargo?: string;
  gerencia?: string;
}

interface Invite {
  _id: string;
  token: string;
  role: string;
  email?: string;
  used: boolean;
  createdBy: string;
  acceptedBy?: string;
  createdAt: string;
  expiresAt: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  acceptInvite: (token: string, userData: any) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock de roles com permissões
const mockRoles: Role[] = [
  {
    _id: '1',
    name: 'Administrador da Plataforma',
    permissions: [
      'platform.admin',
      'users.manage',
      'roles.manage',
      'invites.manage',
      'organizations.manage',
      'processes.manage',
      'reports.view'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Administrador da Organização',
    permissions: [
      'org.admin',
      'users.manage',
      'roles.manage',
      'invites.create',
      'processes.manage',
      'reports.view'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'Gerente de Processos',
    permissions: [
      'processes.create',
      'processes.edit',
      'processes.view',
      'reports.view'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '4',
    name: 'Analista',
    permissions: [
      'processes.view',
      'processes.edit',
      'reports.view'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '5',
    name: 'Visualizador',
    permissions: [
      'processes.view',
      'reports.view'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock de usuários para teste - correspondendo às gerências das etapas do fluxo
const mockUsers: User[] = [
  // GERÊNCIAS-PAI (com permissão de editar fluxo)
  {
    _id: '1',
    email: 'lara.fraguas@hospital.gov.br',
    password: 'hashed_password',
    orgs: [{
      role: '2',
      isOrgAdmin: true,
      orgId: 'org1',
      orgName: 'Hospital Governo'
    }],
    isActive: true,
    isPlatformAdmin: false,
    nome: 'Lara Rubia Vaz Diniz Fraguas',
    cargo: 'Supervisão contratual',
    gerencia: 'GSP - Gerência de Soluções e Projetos'
  },
  {
    _id: '2',
    email: 'diran.rodrigues@hospital.gov.br',
    password: 'hashed_password',
    orgs: [{
      role: '2',
      isOrgAdmin: true,
      orgId: 'org1',
      orgName: 'Hospital Governo'
    }],
    isActive: true,
    isPlatformAdmin: false,
    nome: 'Diran Rodrigues de Souza Filho',
    cargo: 'Secretário Executivo',
    gerencia: 'GRH - Gerência de Recursos Humanos'
  },
  {
    _id: '3',
    email: 'georgia.guimaraes@hospital.gov.br',
    password: 'hashed_password',
    orgs: [{
      role: '2',
      isOrgAdmin: true,
      orgId: 'org1',
      orgName: 'Hospital Governo'
    }],
    isActive: true,
    isPlatformAdmin: false,
    nome: 'Georgia Guimaraes Pereira',
    cargo: 'Controladora Interna',
    gerencia: 'GUE - Gerência de Urgência e Emergência'
  },
  {
    _id: '4',
    email: 'yasmin.pissolati@hospital.gov.br',
    password: 'hashed_password',
    orgs: [{
      role: '1',
      isOrgAdmin: false,
      orgId: 'org1',
      orgName: 'Hospital Governo'
    }],
    isActive: true,
    isPlatformAdmin: true,
    nome: 'Yasmin Pissolati Mattos Bretz',
    cargo: 'Gerente de Soluções e Projetos',
    gerencia: 'GSP - Gerência de Soluções e Projetos'
  },
  // OUTRAS GERÊNCIAS (sem permissão de editar fluxo)
  {
    _id: '5',
    email: 'guilherme.carvalho@hospital.gov.br',
    password: 'hashed_password',
    orgs: [{
      role: '3',
      isOrgAdmin: false,
      orgId: 'org1',
      orgName: 'Hospital Governo'
    }],
    isActive: true,
    isPlatformAdmin: false,
    nome: 'Guilherme de Carvalho Silva',
    cargo: 'Gerente de Licitações',
    gerencia: 'GLC - Gerência de Licitações'
  },
  {
    _id: '6',
    email: 'lucas.moreira@hospital.gov.br',
    password: 'hashed_password',
    orgs: [{
      role: '3',
      isOrgAdmin: false,
      orgId: 'org1',
      orgName: 'Hospital Governo'
    }],
    isActive: true,
    isPlatformAdmin: false,
    nome: 'Lucas Moreira Brito',
    cargo: 'Gerente de Recursos Humanos',
    gerencia: 'GRH - Gerência de Recursos Humanos'
  },
  {
    _id: '7',
    email: 'andressa.sterfany@hospital.gov.br',
    password: 'hashed_password',
    orgs: [{
      role: '4',
      isOrgAdmin: false,
      orgId: 'org1',
      orgName: 'Hospital Governo'
    }],
    isActive: true,
    isPlatformAdmin: false,
    nome: 'Andressa Sterfany Santos da Silva',
    cargo: 'Assessora Técnica de Saúde',
    gerencia: 'GUE - Gerência de Urgência e Emergência'
  },
  {
    _id: '8',
    email: 'leticia.bonfim@hospital.gov.br',
    password: 'hashed_password',
    orgs: [{
      role: '4',
      isOrgAdmin: false,
      orgId: 'org1',
      orgName: 'Hospital Governo'
    }],
    isActive: true,
    isPlatformAdmin: false,
    nome: 'Leticia Bonfim Guilherme',
    cargo: 'Gerente de Licitações',
    gerencia: 'GLC - Gerência de Licitações'
  },
  {
    _id: '9',
    email: 'dallas.kelson@hospital.gov.br',
    password: 'hashed_password',
    orgs: [{
      role: '4',
      isOrgAdmin: false,
      orgId: 'org1',
      orgName: 'Hospital Governo'
    }],
    isActive: true,
    isPlatformAdmin: false,
    nome: 'Dallas Kelson Francisco de Souza',
    cargo: 'Gerente Financeiro',
    gerencia: 'GFC - Gerência Financeira'
  },
  {
    _id: '10',
    email: 'gabriel.radamesis@hospital.gov.br',
    password: 'hashed_password',
    orgs: [{
      role: '4',
      isOrgAdmin: false,
      orgId: 'org1',
      orgName: 'Hospital Governo'
    }],
    isActive: true,
    isPlatformAdmin: false,
    nome: 'Gabriel Radamesis Gomes Nascimento',
    cargo: 'Assessor',
    gerencia: 'GSP - Gerência de Soluções e Projetos'
  },
  // Usuários sem organização para teste
  {
    _id: '11',
    email: 'usuario.sem.org@hospital.gov.br',
    password: 'hashed_password',
    orgs: [],
    isActive: true,
    isPlatformAdmin: false,
    nome: 'Usuário Sem Organização',
    cargo: 'Analista',
    gerencia: 'GLC - Gerência de Licitações'
  },
  {
    _id: '12',
    email: 'novo.usuario@hospital.gov.br',
    password: 'hashed_password',
    orgs: [],
    isActive: true,
    isPlatformAdmin: false,
    nome: 'Novo Usuário',
    cargo: 'Consultor',
    gerencia: 'GFC - Gerência Financeira'
  }
];

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  // Simular usuário logado - em produção viria de autenticação real
  const [user, setUser] = useState<User | null>(mockUsers[3]); // Yasmin (GSP - Platform Admin) por padrão

  const acceptInvite = async (token: string, userData: any): Promise<boolean> => {
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Encontrar o convite pelo token
      const mockInvites: Invite[] = [
        {
          _id: '1',
          token: 'inv_abc123def456',
          role: '3',
          email: 'novo.usuario@hospital.gov.br',
          used: false,
          createdBy: '4',
          acceptedBy: undefined,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const invite = mockInvites.find(inv => inv.token === token);
      if (!invite) {
        return false;
      }

      // Encontrar a role
      const role = mockRoles.find(r => r._id === invite.role);
      if (!role) {
        return false;
      }

      // Atualizar o usuário atual com a nova organização
      if (user) {
        const updatedUser: User = {
          ...user,
          nome: userData.nome || user.nome,
          email: userData.email || user.email,
          cargo: userData.cargo || user.cargo,
          gerencia: userData.gerencia || user.gerencia,
          orgs: [
            ...user.orgs,
            {
              role: invite.role,
              isOrgAdmin: false,
              orgId: 'org1',
              orgName: 'Hospital Governo'
            }
          ]
        };
        setUser(updatedUser);
      }

      return true;
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      return false;
    }
  };

  const value: UserContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    acceptInvite
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

export { mockUsers, mockRoles };
export type { User, Role, UserOrg, Invite }; 