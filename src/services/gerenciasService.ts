/**
 * Serviço para gerenciar gerências do sistema
 */

export interface Gerencia {
  id: string;
  codigo: string;
  nome: string;
  nomeCompleto: string;
  ativo: boolean;
  tipo: 'gerencia' | 'diretoria' | 'assessoria' | 'comissao' | 'secretaria';
  responsavel?: {
    id: string;
    nome: string;
    cargo: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GerenciaResponse {
  success: boolean;
  data: Gerencia[];
  message?: string;
}

/**
 * Busca todas as gerências ativas do sistema
 */
export async function fetchGerencias(): Promise<Gerencia[]> {
  try {
    // TODO: Substituir pela URL real da API quando disponível
    const response = await fetch('/api/gerencias', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Adicionar token de autenticação quando necessário
        // 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar gerências: ${response.status}`);
    }

    const result: GerenciaResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Erro ao buscar gerências');
    }

    return result.data.filter(gerencia => gerencia.ativo);
  } catch (error) {
    console.error('Erro ao buscar gerências:', error);
    
    // Fallback para dados mockados enquanto a API não está disponível
    return getMockGerencias();
  }
}

/**
 * Busca uma gerência específica por ID
 */
export async function fetchGerenciaById(id: string): Promise<Gerencia | null> {
  try {
    const response = await fetch(`/api/gerencias/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar gerência: ${response.status}`);
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Erro ao buscar gerência:', error);
    return null;
  }
}

/**
 * Busca gerências por tipo
 */
export async function fetchGerenciasByTipo(tipo: Gerencia['tipo']): Promise<Gerencia[]> {
  try {
    const response = await fetch(`/api/gerencias?tipo=${tipo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar gerências: ${response.status}`);
    }

    const result: GerenciaResponse = await response.json();
    return result.success ? result.data.filter(g => g.ativo) : [];
  } catch (error) {
    console.error('Erro ao buscar gerências por tipo:', error);
    return getMockGerencias().filter(g => g.tipo === tipo);
  }
}

/**
 * Dados mockados como fallback
 * TODO: Remover quando a API estiver disponível
 */
function getMockGerencias(): Gerencia[] {
  return [
    {
      id: '1',
      codigo: 'CI',
      nome: 'Comissão de Implantação',
      nomeCompleto: 'Comissão de Implantação',
      ativo: true,
      tipo: 'comissao',
      responsavel: {
        id: '1',
        nome: 'Lara Rubia Vaz Diniz Fraguas',
        cargo: 'Supervisão contratual',
        email: 'lara.fraguas@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      codigo: 'SE',
      nome: 'Secretaria Executiva',
      nomeCompleto: 'SE - Secretaria Executiva',
      ativo: true,
      tipo: 'secretaria',
      responsavel: {
        id: '2',
        nome: 'Diran Rodrigues de Souza Filho',
        cargo: 'Secretário Executivo',
        email: 'diran.rodrigues@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      codigo: 'OUV',
      nome: 'Ouvidoria',
      nomeCompleto: 'OUV - Ouvidoria',
      ativo: true,
      tipo: 'assessoria',
      responsavel: {
        id: '3',
        nome: 'Georgia Guimaraes Pereira',
        cargo: 'Controladora Interna',
        email: 'georgia.guimaraes@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      codigo: 'GSP',
      nome: 'Gerência de Soluções e Projetos',
      nomeCompleto: 'GSP - Gerência de Soluções e Projetos',
      ativo: true,
      tipo: 'gerencia',
      responsavel: {
        id: '4',
        nome: 'Yasmin Pissolati Mattos Bretz',
        cargo: 'Gerente de Soluções e Projetos',
        email: 'yasmin.pissolati@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      codigo: 'GSL',
      nome: 'Gerência de Suprimentos e Logística',
      nomeCompleto: 'GSL - Gerência de Suprimentos e Logística',
      ativo: true,
      tipo: 'gerencia',
      responsavel: {
        id: '5',
        nome: 'Guilherme de Carvalho Silva',
        cargo: 'Gerente Suprimentos e Logistica',
        email: 'guilherme.carvalho@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '6',
      codigo: 'GRH',
      nome: 'Gerência de Recursos Humanos',
      nomeCompleto: 'GRH - Gerência de Recursos Humanos',
      ativo: true,
      tipo: 'gerencia',
      responsavel: {
        id: '6',
        nome: 'Lucas Moreira Brito',
        cargo: 'GERENTE DE RH',
        email: 'lucas.moreira@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '7',
      codigo: 'GUE',
      nome: 'Gerência de Urgência e Emergência',
      nomeCompleto: 'GUE - Gerência de Urgência e Emergência',
      ativo: true,
      tipo: 'gerencia',
      responsavel: {
        id: '7',
        nome: 'Andressa Sterfany Santos da Silva',
        cargo: 'Assessora Técnica de Saúde',
        email: 'andressa.sterfany@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '8',
      codigo: 'GLC',
      nome: 'Gerência de Licitações e Contratos',
      nomeCompleto: 'GLC - Gerência de Licitações e Contratos',
      ativo: true,
      tipo: 'gerencia',
      responsavel: {
        id: '8',
        nome: 'Leticia Bonfim Guilherme',
        cargo: 'Gerente de Licitações e Contratos',
        email: 'leticia.bonfim@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '9',
      codigo: 'GFC',
      nome: 'Gerência Financeira e Contábil',
      nomeCompleto: 'GFC - Gerência Financeira e Contábil',
      ativo: true,
      tipo: 'gerencia',
      responsavel: {
        id: '9',
        nome: 'Maria Silva',
        cargo: 'Gerente Financeira',
        email: 'maria.silva@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '10',
      codigo: 'GTEC',
      nome: 'Gerência de Tecnologia da Informação',
      nomeCompleto: 'GTEC - Gerência de Tecnologia da Informação',
      ativo: true,
      tipo: 'gerencia',
      responsavel: {
        id: '10',
        nome: 'João Santos',
        cargo: 'Gerente de TI',
        email: 'joao.santos@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '11',
      codigo: 'GAP',
      nome: 'Gerência de Administração e Patrimônio',
      nomeCompleto: 'GAP - Gerência de Administração e Patrimônio',
      ativo: true,
      tipo: 'gerencia',
      responsavel: {
        id: '11',
        nome: 'Ana Costa',
        cargo: 'Gerente de Administração',
        email: 'ana.costa@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '12',
      codigo: 'GESP',
      nome: 'Gerência de Especialidades',
      nomeCompleto: 'GESP - Gerência de Especialidades',
      ativo: true,
      tipo: 'gerencia',
      responsavel: {
        id: '12',
        nome: 'Pedro Lima',
        cargo: 'Gerente de Especialidades',
        email: 'pedro.lima@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '13',
      codigo: 'NAJ',
      nome: 'Assessoria Jurídica',
      nomeCompleto: 'NAJ - Assessoria Jurídica',
      ativo: true,
      tipo: 'assessoria',
      responsavel: {
        id: '13',
        nome: 'Fernanda Martins',
        cargo: 'Assessora Jurídica',
        email: 'fernanda.martins@hospital.gov.br'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];
}

/**
 * Converte gerências para formato de opções de select
 */
export function gerenciasToOptions(gerencias: Gerencia[]) {
  return gerencias.map(gerencia => ({
    value: gerencia.nomeCompleto,
    label: gerencia.nomeCompleto,
    codigo: gerencia.codigo,
    responsavel: gerencia.responsavel
  }));
}

/**
 * Converte gerências para formato de opções simples (apenas código)
 */
export function gerenciasToSimpleOptions(gerencias: Gerencia[]) {
  return gerencias.map(gerencia => ({
    value: gerencia.codigo,
    label: gerencia.codigo,
    nomeCompleto: gerencia.nomeCompleto
  }));
}
