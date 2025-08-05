import { useState, useEffect } from 'react';

interface PastaOrganizacional {
  id: string;
  nome: string;
  descricao: string;
  icone: JSX.Element;
  cor: string;
  quantidadeProcessos: number;
  ultimaModificacao: string;
  filtro: (processo: any) => boolean;
}

export function usePastasOrganizacionais() {
  const [pastas, setPastas] = useState<PastaOrganizacional[]>([]);

  // Função para atualizar a data de último acesso de uma pasta
  const atualizarUltimoAcesso = (pastaId: string) => {
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR');
    
    setPastas(prevPastas => 
      prevPastas.map(pasta => 
        pasta.id === pastaId 
          ? { ...pasta, ultimaModificacao: dataFormatada }
          : pasta
      )
    );

    // Salvar no localStorage para persistência
    const pastasAtualizadas = pastas.map(pasta => 
      pasta.id === pastaId 
        ? { ...pasta, ultimaModificacao: dataFormatada }
        : pasta
    );
    
    localStorage.setItem('pastasOrganizacionais', JSON.stringify(pastasAtualizadas));
  };

  // Função para obter a data de último acesso de uma pasta
  const getUltimoAcesso = (pastaId: string): string => {
    const pasta = pastas.find(p => p.id === pastaId);
    return pasta?.ultimaModificacao || '';
  };

  // Carregar pastas do localStorage na inicialização
  useEffect(() => {
    const pastasSalvas = localStorage.getItem('pastasOrganizacionais');
    if (pastasSalvas) {
      try {
        const pastasParsed = JSON.parse(pastasSalvas);
        setPastas(pastasParsed);
      } catch (error) {
        console.error('Erro ao carregar pastas do localStorage:', error);
      }
    }
  }, []);

  return {
    pastas,
    setPastas,
    atualizarUltimoAcesso,
    getUltimoAcesso
  };
} 