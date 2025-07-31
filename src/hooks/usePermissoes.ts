import { useUser } from '@/contexts/UserContext';

// Gerências com permissão de editar fluxo (pais da gerência)
const GERENCIAS_PAI = [
  'Comissão de Implantação',
  'SE - Secretaria Executiva', 
  'OUV - Ouvidoria',
  'GSP - Gerência de Soluções e Projetos'
];

// Gerências pai específicas (entidades "pais" do sistema)
const GERENCIAS_PAI_SISTEMA = [
  'Comissão de Implantação',
  'SE - Secretaria Executiva',
  'OUV - Ouvidoria'
];

// GSP - Gerência de Soluções e Projetos (acesso total irrestrito)
const GSP_GERENCIA = 'GSP - Gerência de Soluções e Projetos';

export function usePermissoes() {
  const { user } = useUser();

  const podeEditarFluxo = () => {
    if (!user) return false;
    return GERENCIAS_PAI.includes(user.gerencia);
  };

  const podeEditarProcesso = () => {
    if (!user) return false;
    return GERENCIAS_PAI.includes(user.gerencia);
  };

  const podeExcluirEtapa = (etapaStatus: string) => {
    return podeEditarFluxo() && etapaStatus === 'pendente';
  };

  const podeReordenarEtapas = () => {
    return podeEditarFluxo();
  };

  const podeAdicionarEtapa = () => {
    return podeEditarFluxo();
  };

  // Nova função: Verificar se pode abrir card em modo de edição
  const podeEditarCard = (etapaGerencia: string, etapaId?: number, gerenciaCriadora?: string) => {
    if (!user) return false;
    
    // GSP possui acesso total irrestrito
    if (user.gerencia === GSP_GERENCIA) {
      return true;
    }
    
    // Gerências pai do sistema têm acesso total
    if (GERENCIAS_PAI_SISTEMA.includes(user.gerencia)) {
      return true;
    }
    
    // Gerência responsável pelo card pode editar apenas esse card específico
    if (user.gerencia === etapaGerencia) {
      return true;
    }
    
    // NOVA REGRA: Para o primeiro card (Elaboração/Análise do DFD), 
    // permitir acesso à gerência criadora do processo
    if (etapaId === 1 && gerenciaCriadora && user.gerencia === gerenciaCriadora) {
      return true;
    }
    
    return false;
  };

  // Verificar se é GSP (acesso total irrestrito)
  const isGSP = () => {
    if (!user) return false;
    return user.gerencia === GSP_GERENCIA;
  };

  // Verificar se é gerência pai do sistema
  const isGerenciaPaiSistema = () => {
    if (!user) return false;
    return GERENCIAS_PAI_SISTEMA.includes(user.gerencia);
  };

  return {
    podeEditarFluxo,
    podeEditarProcesso,
    podeExcluirEtapa,
    podeReordenarEtapas,
    podeAdicionarEtapa,
    podeEditarCard,
    isGerenciaPai: podeEditarFluxo(),
    isGSP,
    isGerenciaPaiSistema
  };
} 