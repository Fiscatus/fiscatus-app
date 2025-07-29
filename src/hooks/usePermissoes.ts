import { useUser } from '@/contexts/UserContext';

// Gerências com permissão de editar fluxo (pais da gerência)
const GERENCIAS_PAI = [
  'Comissão de Implantação',
  'Secretaria Executiva', 
  'Ouvidoria',
  'Gerência de Soluções e Projetos'
];

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

  return {
    podeEditarFluxo,
    podeEditarProcesso,
    podeExcluirEtapa,
    podeReordenarEtapas,
    podeAdicionarEtapa,
    isGerenciaPai: podeEditarFluxo()
  };
} 