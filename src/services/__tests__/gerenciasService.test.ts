import { fetchGerencias, gerenciasToOptions, gerenciasToSimpleOptions } from '../gerenciasService';

describe('Serviço de Gerências', () => {
  it('deve buscar gerências com sucesso', async () => {
    const gerencias = await fetchGerencias();
    
    expect(gerencias).toBeDefined();
    expect(Array.isArray(gerencias)).toBe(true);
    expect(gerencias.length).toBeGreaterThan(0);
    
    // Verificar estrutura das gerências
    const primeiraGerencia = gerencias[0];
    expect(primeiraGerencia).toHaveProperty('id');
    expect(primeiraGerencia).toHaveProperty('codigo');
    expect(primeiraGerencia).toHaveProperty('nome');
    expect(primeiraGerencia).toHaveProperty('nomeCompleto');
    expect(primeiraGerencia).toHaveProperty('ativo');
    expect(primeiraGerencia).toHaveProperty('tipo');
  });

  it('deve converter gerências para opções de select', () => {
    const gerencias = [
      {
        id: '1',
        codigo: 'GSP',
        nome: 'Gerência de Soluções e Projetos',
        nomeCompleto: 'GSP - Gerência de Soluções e Projetos',
        ativo: true,
        tipo: 'gerencia' as const,
        responsavel: {
          id: '1',
          nome: 'João Silva',
          cargo: 'Gerente',
          email: 'joao@example.com'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    const options = gerenciasToOptions(gerencias);
    
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveProperty('value', 'GSP - Gerência de Soluções e Projetos');
    expect(options[0]).toHaveProperty('label', 'GSP - Gerência de Soluções e Projetos');
    expect(options[0]).toHaveProperty('codigo', 'GSP');
    expect(options[0]).toHaveProperty('responsavel');
  });

  it('deve converter gerências para opções simples', () => {
    const gerencias = [
      {
        id: '1',
        codigo: 'GSP',
        nome: 'Gerência de Soluções e Projetos',
        nomeCompleto: 'GSP - Gerência de Soluções e Projetos',
        ativo: true,
        tipo: 'gerencia' as const,
        responsavel: {
          id: '1',
          nome: 'João Silva',
          cargo: 'Gerente',
          email: 'joao@example.com'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    const options = gerenciasToSimpleOptions(gerencias);
    
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveProperty('value', 'GSP');
    expect(options[0]).toHaveProperty('label', 'GSP');
    expect(options[0]).toHaveProperty('nomeCompleto', 'GSP - Gerência de Soluções e Projetos');
  });

  it('deve retornar apenas gerências ativas', async () => {
    const gerencias = await fetchGerencias();
    
    const gerenciasAtivas = gerencias.filter(g => g.ativo);
    expect(gerenciasAtivas.length).toBe(gerencias.length);
  });
});
