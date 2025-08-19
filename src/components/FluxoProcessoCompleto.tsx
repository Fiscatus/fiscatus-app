import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  XCircle, 
  ChevronDown,
  FileText,
  PenTool,
  Users,
  Search,
  Shield,
  DollarSign,
  Scale,
  Upload,
  User,
  Calendar,
  Building2,
  Eye,
  Download,
  Edit3,
  Trash2,
  Save,
  X,
  Settings
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import { getBordaEtapa } from '@/lib/utils';
import EtapaDetalhesModal from './EtapaDetalhesModal';
import EtapaCardEditavel from './EtapaCardEditavel';
import EditarEtapaFluxoModal from './EditarEtapaFluxoModal';
import AdicionarEtapaButton from './AdicionarEtapaButton';
import BarraAcoesEdicao from './BarraAcoesEdicao';
import DFDFormSection from './DFDFormSection';
import DFDAprovacaoSection from './DFDAprovacaoSection';
import ConsolidacaoDemandaSection from './ConsolidacaoDemandaSection';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface Etapa {
  id: number;
  nome: string;
  nomeCompleto: string;
  status: 'pendente' | 'andamento' | 'concluido' | 'atrasado';
  prazoPrevisao: string;
  dataConclusao?: string;
  documento?: string;
  documentoUrl?: string;
  enviadoPor?: string;
  dataEnvio?: string;
  prazoCumprido?: boolean;
  responsavel: string;
  cargo: string;
  gerencia: string;
  dataInicio?: string;
  observacoes?: string;
  bloqueiaProximas?: boolean;
  obrigatoria?: boolean;
  exigeAssinatura?: boolean;
  tipoIcone?: string;
  envolvidos?: Array<{
    nome: string;
    cargo: string;
    papel: string;
    gerencia: string;
  }>;
}

interface FluxoProcessoCompletoProps {
  etapas?: Etapa[];
  onEtapaClick?: (etapa: Etapa) => void;
  gerenciaCriadora?: string; // Gerência que criou o processo
}

// Substituir o array etapasPadrao para conter os 22 nomes fornecidos, mantendo a estrutura dos objetos e preenchendo os campos nome/nomeCompleto conforme a lista do usuário.
const etapasPadrao: Etapa[] = [
  { id: 1, nome: "Elaboração/Análise do DFD", nomeCompleto: "Elaboração/Análise do DFD", status: "concluido", prazoPrevisao: "5 dias úteis", dataConclusao: "05/01/2025", prazoCumprido: true, responsavel: "Yasmin Pissolati Mattos Bretz", cargo: "Gerente de Soluções e Projetos", gerencia: "GSP - Gerência de Soluções e Projetos", dataInicio: "01/01/2025", documento: "DFD_012_2025.pdf", documentoUrl: "/docs/dfd.pdf" },
  { id: 2, nome: "Aprovação do DFD", nomeCompleto: "Aprovação do DFD", status: "concluido", prazoPrevisao: "3 dias úteis", dataConclusao: "08/01/2025", prazoCumprido: true, responsavel: "Guilherme de Carvalho Silva", cargo: "Gerente Suprimentos e Logistica", gerencia: "GSL - Gerência de Suprimentos e Logística", dataInicio: "06/01/2025" },
  { id: 3, nome: "Assinatura do DFD", nomeCompleto: "Assinatura do DFD", status: "concluido", prazoPrevisao: "3 dias úteis", dataConclusao: "12/01/2025", prazoCumprido: true, responsavel: "Lucas Moreira Brito", cargo: "GERENTE DE RH", gerencia: "GRH - Gerência de Recursos Humanos", dataInicio: "09/01/2025" },
  { id: 4, nome: "Despacho do DFD", nomeCompleto: "Despacho do DFD", status: "concluido", prazoPrevisao: "2 dias úteis", dataConclusao: "15/01/2025", prazoCumprido: true, responsavel: "Andressa Sterfany Santos da Silva", cargo: "Assessora Técnica de Saúde", gerencia: "GUE - Gerência de Urgência e Emergência", dataInicio: "13/01/2025" },
  { id: 5, nome: "Elaboração do ETP", nomeCompleto: "Elaboração do ETP", status: "andamento", prazoPrevisao: "10 dias úteis", responsavel: "Leticia Bonfim Guilherme", cargo: "Gerente de Licitações e Contratos", gerencia: "GLC - Gerência de Licitações e Contratos", dataInicio: "16/01/2025", documento: "ETP_012_2025_v1.pdf", documentoUrl: "/docs/etp.pdf" },
  { id: 6, nome: "Assinatura do ETP", nomeCompleto: "Assinatura do ETP", status: "pendente", prazoPrevisao: "2 dias úteis", responsavel: "Dallas Kelson Francisco de Souza", cargo: "Gerente Financeiro", gerencia: "GFC - Gerência Financeira e Contábil" },
  { id: 7, nome: "Despacho do ETP", nomeCompleto: "Despacho do ETP", status: "pendente", prazoPrevisao: "5 dias úteis", responsavel: "Georgia Guimaraes Pereira", cargo: "Controladora Interna", gerencia: "OUV - Ouvidoria" },
  { id: 8, nome: "Elaboração/Análise da Matriz de Risco", nomeCompleto: "Elaboração/Análise da Matriz de Risco", status: "pendente", prazoPrevisao: "7 dias úteis", responsavel: "Diran Rodrigues de Souza Filho", cargo: "Secretário Executivo", gerencia: "SE - Secretaria Executiva" },
  { id: 9, nome: "Aprovação da Matriz de Risco", nomeCompleto: "Aprovação da Matriz de Risco", status: "pendente", prazoPrevisao: "2 dias úteis", responsavel: "Yasmin Pissolati Mattos Bretz", cargo: "Gerente de Soluções e Projetos", gerencia: "GSP - Gerência de Soluções e Projetos" },
  { id: 10, nome: "Assinatura da Matriz de Risco", nomeCompleto: "Assinatura da Matriz de Risco", status: "pendente", prazoPrevisao: "15 dias úteis", responsavel: "Guilherme de Carvalho Silva", cargo: "Gerente Suprimentos e Logistica", gerencia: "GSL - Gerência de Suprimentos e Logística" },
  { id: 11, nome: "Cotação", nomeCompleto: "Cotação", status: "pendente", prazoPrevisao: "2 dias úteis", responsavel: "Lucas Moreira Brito", cargo: "GERENTE DE RH", gerencia: "GRH - Gerência de Recursos Humanos" },
  { id: 12, nome: "Elaboração do Termo de Referência (TR)", nomeCompleto: "Elaboração do Termo de Referência (TR)", status: "pendente", prazoPrevisao: "10 dias úteis", responsavel: "Andressa Sterfany Santos da Silva", cargo: "Assessora Técnica de Saúde", gerencia: "GUE - Gerência de Urgência e Emergência" },
  { id: 13, nome: "Assinatura do TR", nomeCompleto: "Assinatura do TR", status: "pendente", prazoPrevisao: "5 dias úteis", responsavel: "Leticia Bonfim Guilherme", cargo: "Gerente de Licitações e Contratos", gerencia: "GLC - Gerência de Licitações e Contratos" },
  { id: 14, nome: "Elaboração do Edital", nomeCompleto: "Elaboração do Edital", status: "pendente", prazoPrevisao: "3 dias úteis", responsavel: "Dallas Kelson Francisco de Souza", cargo: "Gerente Financeiro", gerencia: "GFC - Gerência Financeira e Contábil" },
  { id: 15, nome: "Análise Jurídica Prévia", nomeCompleto: "Análise Jurídica Prévia", status: "pendente", prazoPrevisao: "20 dias úteis", responsavel: "Georgia Guimaraes Pereira", cargo: "Controladora Interna", gerencia: "OUV - Ouvidoria" },
  { id: 16, nome: "Cumprimento de Ressalvas pós Análise Jurídica Prévia", nomeCompleto: "Cumprimento de Ressalvas pós Análise Jurídica Prévia", status: "pendente", prazoPrevisao: "10 dias úteis", responsavel: "Gabriel Radamesis Gomes Nascimento", cargo: "Assessor Jurídico", gerencia: "NAJ - Assessoria Jurídica" },
  { id: 17, nome: "Elaboração do Parecer Jurídico", nomeCompleto: "Elaboração do Parecer Jurídico", status: "pendente", prazoPrevisao: "1 dia útil", responsavel: "Yasmin Pissolati Mattos Bretz", cargo: "Gerente de Soluções e Projetos", gerencia: "GSP - Gerência de Soluções e Projetos" },
  { id: 18, nome: "Cumprimento de Ressalvas pós Parecer Jurídico", nomeCompleto: "Cumprimento de Ressalvas pós Parecer Jurídico", status: "pendente", prazoPrevisao: "1 dia útil", responsavel: "Yasmin Pissolati Mattos Bretz", cargo: "Gerente de Soluções e Projetos", gerencia: "GSP - Gerência de Soluções e Projetos" },
  { id: 19, nome: "Aprovação Jurídica", nomeCompleto: "Aprovação Jurídica", status: "pendente", prazoPrevisao: "1 dia útil", responsavel: "Yasmin Pissolati Mattos Bretz", cargo: "Gerente de Soluções e Projetos", gerencia: "GSP - Gerência de Soluções e Projetos" },
  { id: 20, nome: "Assinatura do Edital", nomeCompleto: "Assinatura do Edital", status: "pendente", prazoPrevisao: "1 dia útil", responsavel: "Yasmin Pissolati Mattos Bretz", cargo: "Gerente de Soluções e Projetos", gerencia: "GSP - Gerência de Soluções e Projetos" },
  { id: 21, nome: "Publicação", nomeCompleto: "Publicação", status: "pendente", prazoPrevisao: "1 dia útil", responsavel: "Yasmin Pissolati Mattos Bretz", cargo: "Gerente de Soluções e Projetos", gerencia: "GSP - Gerência de Soluções e Projetos" }
];

export default function FluxoProcessoCompleto({ etapas = etapasPadrao, onEtapaClick, gerenciaCriadora }: FluxoProcessoCompletoProps) {
  const [modalEtapa, setModalEtapa] = useState<Etapa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUser();
  
  // Estados para modo de edição
  const [modoEdicao, setModoEdicao] = useState(false);
  const [etapasEditadas, setEtapasEditadas] = useState<Etapa[]>(etapas);
  const [etapaParaEditar, setEtapaParaEditar] = useState<Etapa | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNovaEtapa, setIsNovaEtapa] = useState(false);
  const [temAlteracoes, setTemAlteracoes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dfdData, setDfdData] = useState<any>(null);
  const [showDFDModal, setShowDFDModal] = useState(false);
  const [showConsolidacaoModal, setShowConsolidacaoModal] = useState(false);
  const [currentEtapa, setCurrentEtapa] = useState<Etapa | null>(null);

  const { isGerenciaPai, podeEditarFluxo, podeExcluirEtapa, podeEditarCard } = usePermissoes();
  const { toast } = useToast();

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Atualizar etapas editadas quando as etapas originais mudarem
  useEffect(() => {
    if (!modoEdicao) {
      setEtapasEditadas(etapas);
      setTemAlteracoes(false);
    }
  }, [etapas, modoEdicao]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'concluido':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          label: 'Concluído',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'andamento':
        return {
          icon: <PlayCircle className="w-4 h-4 text-blue-600" />,
          label: 'Em Andamento',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'pendente':
        return {
          icon: (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
              <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: 'Pendente',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
      case 'atrasado':
        return {
          icon: <XCircle className="w-4 h-4 text-red-600" />,
          label: 'Atrasado',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
              <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: 'Pendente',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const getEtapaIcon = (etapaId: number) => {
    // Ícones temáticos para cada tipo de etapa
    const iconMap: { [key: number]: React.ReactNode } = {
      1: <FileText className="w-5 h-5" />, // DFD
      2: <Search className="w-5 h-5" />, // Análise
      3: <CheckCircle className="w-5 h-5" />, // Validação
      4: <PenTool className="w-5 h-5" />, // Assinatura
      5: <FileText className="w-5 h-5" />, // ETP
      6: <PenTool className="w-5 h-5" />, // Assinatura
      7: <Search className="w-5 h-5" />, // Análise
      8: <Shield className="w-5 h-5" />, // Matriz de Risco
      9: <PenTool className="w-5 h-5" />, // Assinatura
      10: <FileText className="w-5 h-5" />, // TR
      11: <PenTool className="w-5 h-5" />, // Assinatura
      12: <DollarSign className="w-5 h-5" />, // Cotação
      13: <Search className="w-5 h-5" />, // Análise
      14: <CheckCircle className="w-5 h-5" />, // Validação
      15: <FileText className="w-5 h-5" />, // Edital
      16: <Scale className="w-5 h-5" />, // Aprovação Jurídica
      17: <Upload className="w-5 h-5" /> // Publicação
    };
    return iconMap[etapaId] || <FileText className="w-5 h-5" />;
  };

  const handleEtapaClick = (etapa: Etapa) => {
    if (etapa.id === 1) {
      // Card "Elaboração/Análise do DFD"
      setCurrentEtapa(etapa);
      setShowDFDModal(true);
    } else if (etapa.id === 2) {
      // Card "Aprovação do DFD"
      setCurrentEtapa(etapa);
      setShowDFDModal(true);
    } else if (etapa.nome === 'Consolidação da Demanda') {
      // Card "Consolidação da Demanda"
      setCurrentEtapa(etapa);
      setShowConsolidacaoModal(true);
    } else {
      // Outros cards
      setModalEtapa(etapa);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalEtapa(null);
  };

  // Funções para modo de edição
  const ativarModoEdicao = () => {
    setModoEdicao(true);
    setEtapasEditadas([...etapas]);
    setTemAlteracoes(false);
  };

  const cancelarEdicao = () => {
    setModoEdicao(false);
    setEtapasEditadas([...etapas]);
    setTemAlteracoes(false);
    setEtapaParaEditar(null);
    setIsEditModalOpen(false);
  };

  const salvarAlteracoes = async () => {
    setIsLoading(true);
    
    try {
      // Verificar se tem pelo menos 17 etapas
      if (etapasEditadas.length < 17) {
        toast({
          title: "Erro ao salvar",
          description: "O fluxo deve ter pelo menos 17 etapas.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar as etapas originais
      // Em produção, aqui seria feita a chamada para a API
      console.log('Salvando alterações:', etapasEditadas);
      
      toast({
        title: "Alterações salvas",
        description: "O fluxo foi atualizado com sucesso.",
      });
      
      setModoEdicao(false);
      setTemAlteracoes(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setEtapasEditadas((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        setTemAlteracoes(true);
        return newItems;
      });
    }
  };

  const handleEditarEtapa = (etapa: Etapa) => {
    setEtapaParaEditar(etapa);
    setIsNovaEtapa(false);
    setIsEditModalOpen(true);
  };

  const handleExcluirEtapa = (etapaId: number) => {
    // Verificar se não vai ficar com menos de 17 etapas
    if (etapasEditadas.length <= 17) {
      toast({
        title: "Não é possível excluir",
        description: "O fluxo deve manter pelo menos 17 etapas.",
        variant: "destructive"
      });
      return;
    }

    setEtapasEditadas(prev => {
      const novasEtapas = prev.filter(e => e.id !== etapaId);
      setTemAlteracoes(true);
      return novasEtapas;
    });
    
    toast({
      title: "Etapa excluída",
      description: "A etapa foi removida do fluxo.",
    });
  };

  const handleAdicionarEtapa = (posicao: number, cardOpcional?: any) => {
    if (cardOpcional) {
      // Adicionar card opcional pré-configurado
      const novaEtapa: Etapa = {
        id: Date.now(),
        ...cardOpcional.template
      };

      // Inserir na posição especificada
      setEtapasEditadas(prev => {
        const novasEtapas = [...prev];
        novasEtapas.splice(posicao - 1, 0, novaEtapa);
        setTemAlteracoes(true);
        return novasEtapas;
      });

      toast({
        title: "Card adicionado",
        description: `O card "${cardOpcional.nome}" foi adicionado ao fluxo.`,
      });
    } else {
      // Se já tem 17 ou mais etapas, apenas adicionar uma nova
      if (etapasEditadas.length >= 17) {
        const novaEtapa: Etapa = {
          id: Date.now(), // ID temporário
          nome: '',
          nomeCompleto: '',
          status: 'pendente',
          prazoPrevisao: '',
          gerencia: '',
          responsavel: '',
          cargo: ''
        };

        setEtapaParaEditar(novaEtapa);
        setIsNovaEtapa(true);
        setIsEditModalOpen(true);
        return;
      }

      // Se tem menos de 17 etapas, adicionar etapas vazias até completar 17
      const etapasFaltantes = 17 - etapasEditadas.length;
      const novasEtapas: Etapa[] = [];
      
      for (let i = 0; i < etapasFaltantes; i++) {
        const novaEtapa: Etapa = {
          id: Date.now() + i, // ID temporário único
          nome: `Etapa ${etapasEditadas.length + i + 1}`,
          nomeCompleto: `Etapa ${etapasEditadas.length + i + 1}`,
          status: 'pendente',
          prazoPrevisao: '1 dia útil',
          gerencia: 'A definir',
          responsavel: 'A definir',
          cargo: 'A definir'
        };
        novasEtapas.push(novaEtapa);
      }

      setEtapasEditadas(prev => {
        const todasEtapas = [...prev, ...novasEtapas];
        setTemAlteracoes(true);
        return todasEtapas;
      });

      toast({
        title: "Etapas adicionadas",
        description: `${etapasFaltantes} etapas foram adicionadas para completar o fluxo de 17 etapas.`,
      });
    }
  };

  const handleSalvarEtapa = (etapa: Etapa) => {
    if (isNovaEtapa) {
      // Adicionar nova etapa
      setEtapasEditadas(prev => {
        const novasEtapas = [...prev, etapa];
        setTemAlteracoes(true);
        return novasEtapas;
      });
    } else {
      // Editar etapa existente
      setEtapasEditadas(prev => {
        const novasEtapas = prev.map(e => e.id === etapa.id ? etapa : e);
        setTemAlteracoes(true);
        return novasEtapas;
      });
    }
    
    setIsEditModalOpen(false);
    setEtapaParaEditar(null);
    setIsNovaEtapa(false);
  };

  const canManageEtapa = (etapa: Etapa) => {
    // Usar a nova lógica de permissões para cards, incluindo gerência criadora para o primeiro card
    return podeEditarCard(etapa.gerencia, etapa.id, gerenciaCriadora);
  };

  const handleVisualizarDocumento = (etapa: Etapa) => {
    if (etapa.documentoUrl) {
      window.open(etapa.documentoUrl, '_blank');
    }
  };

  const handleBaixarDocumento = (etapa: Etapa) => {
    if (etapa.documentoUrl) {
      const link = document.createElement('a');
      link.href = etapa.documentoUrl;
      link.download = etapa.documento || 'documento';
      link.click();
    }
  };

  const handleDFDComplete = (dfdData: any) => {
    const etapasAtualizadas = etapasEditadas.map(etapa => {
      if (etapa.id === 1) {
        return { ...etapa, status: 'concluido' as const };
      } else if (etapa.id === 2) {
        return { ...etapa, status: 'andamento' as const };
      }
      return etapa;
    });
    setEtapasEditadas(etapasAtualizadas);
  };

  const handleDFDDevolver = () => {
    const etapasAtualizadas = etapasEditadas.map(etapa => {
      if (etapa.id === 1) {
        return { ...etapa, status: 'andamento' as const };
      } else if (etapa.id === 2) {
        return { ...etapa, status: 'pendente' as const };
      }
      return etapa;
    });
    setEtapasEditadas(etapasAtualizadas);
  };

  const handleDFDAprovar = () => {
    const etapasAtualizadas = etapasEditadas.map(etapa => {
      if (etapa.id === 2) {
        return { ...etapa, status: 'concluido' as const };
      } else if (etapa.id === 3) {
        return { ...etapa, status: 'andamento' as const };
      }
      return etapa;
    });
    setEtapasEditadas(etapasAtualizadas);
  };

  const handleDFDEnviarParaAnalise = () => {
    const etapasAtualizadas = etapasEditadas.map(etapa => {
      if (etapa.id === 1) {
        return { ...etapa, status: 'concluido' as const };
      } else if (etapa.id === 2) {
        return { ...etapa, status: 'andamento' as const };
      }
      return etapa;
    });
    setEtapasEditadas(etapasAtualizadas);
  };

  const handleDFDSave = (data: any) => {
    setDfdData(data);
    // Salvar dados do DFD (implementar integração com backend)
    console.log('DFD Data saved:', data);
  };

  const handleConsolidacaoComplete = () => {
    console.log('Consolidação da Demanda concluída');
    setShowConsolidacaoModal(false);
    // Implementar lógica de conclusão
  };

  const handleConsolidacaoSave = (data: any) => {
    console.log('Salvar Consolidação da Demanda:', data);
    // Implementar lógica de salvamento
  };

  return (
    <div className="w-full">
      {/* Título integrado */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fluxo Completo do Processo</h2>
            <p className="text-gray-600">Acompanhe todas as etapas do planejamento de contratação</p>
          </div>
          
          
          {/* Botão Editar Fluxo - apenas para gerências-pai */}
          {isGerenciaPai && !modoEdicao && (
            <Button
              onClick={ativarModoEdicao}
              variant="outline"
              className="ml-4 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
            >
              <Settings className="w-4 h-4 mr-2" />
              Editar Fluxo
            </Button>
          )}
        </div>
        
        {/* Indicador de modo de edição */}
        {modoEdicao && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-800">
                Modo de Edição Ativo - Você pode arrastar, editar e gerenciar as etapas
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Linha de progresso visual */}
      <div className="mb-4">
        <div className="flex items-center justify-center gap-2">
          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ 
                width: `${(etapas.filter(e => e.status === 'concluido').length / etapas.length) * 100}%` 
              }}
            ></div>
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {etapas.filter(e => e.status === 'concluido').length} de {etapas.length} etapas concluídas
          </span>
        </div>
      </div>

      {/* Container do Fluxo Horizontal */}
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 p-4">
          {/* Renderização dos cards baseada no modo */}
          {modoEdicao ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToHorizontalAxis]}
            >
              <SortableContext items={etapasEditadas.map(e => e.id)} strategy={horizontalListSortingStrategy}>
                {etapasEditadas.map((etapa) => (
                  <EtapaCardEditavel
                    key={etapa.id}
                    etapa={etapa}
                    onEdit={handleEditarEtapa}
                    onDelete={handleExcluirEtapa}
                    canDelete={podeExcluirEtapa(etapa.status)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            etapas.map((etapa, index) => {
              const statusConfig = getStatusConfig(etapa.status);
              const isExpanded = false; // Modal substitui a expansão inline
              const canManage = canManageEtapa(etapa);
            
            return (
              <div key={etapa.id} className="w-full h-full">
                {/* Card da Etapa */}
                <motion.div
                  className={`border-2 rounded-xl transition-all duration-300 ${statusConfig.bgColor} hover:shadow-md bg-white relative w-full h-full min-h-[240px] ${getBordaEtapa(etapa.status, etapa.dataInicio, etapa.prazoPrevisao)} ${
                    etapa.status === 'concluido' ? 'ring-2 ring-green-200 shadow-lg' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Indicador de etapa concluída */}
                  {etapa.status === 'concluido' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  {/* Indicador de etapa pendente */}
                  {etapa.status === 'pendente' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Indicador de etapa em andamento */}
                  {etapa.status === 'andamento' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <PlayCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {/* Header do Card */}
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      {/* Número da Etapa */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        etapa.status === 'concluido' 
                          ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg' 
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {etapa.id}
                      </div>
                        
                      {/* Status Icon */}
                      <div className="flex items-center gap-1">
                        {statusConfig.icon}
                      </div>
                    </div>

                    {/* Nome da Etapa */}
                    <h3 className={`font-semibold text-center text-sm mb-3 leading-tight flex-1 ${
                      etapa.status === 'concluido' ? 'text-green-800 font-bold' : 'text-gray-900'
                    }`}>
                      {etapa.nome}
                    </h3>

                    {/* Gerência Responsável */}
                    <p className="text-xs text-gray-600 text-center mb-3">
                      {etapa.gerencia}
                    </p>
                    
                    {/* Prazo */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                        <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm text-gray-700 font-medium">
                        {etapa.prazoPrevisao}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center mb-3">
                      <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} border text-xs px-3 py-1 ${
                        etapa.status === 'concluido' ? 'ring-1 ring-green-300 font-semibold' : ''
                      }`}>
                        {statusConfig.label}
                        {etapa.status === 'concluido' && (
                          <span className="ml-1">✅</span>
                        )}
                      </Badge>
                    </div>

                    {/* Botão de Ação */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEtapaClick(etapa)}
                      className="w-full text-xs mt-auto"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </motion.div>
              </div>
            );
          }))}
          
          {/* Botão Nova Etapa - apenas no modo de edição */}
          {modoEdicao && (
            <div className="w-full flex items-center justify-center">
              <AdicionarEtapaButton
                etapas={etapasEditadas}
                onAdicionar={handleAdicionarEtapa}
                className="h-32"
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes da Etapa */}
      <EtapaDetalhesModal
        etapa={modalEtapa}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        gerenciaCriadora={gerenciaCriadora}
        onConcluirEtapa={(etapa) => {
          console.log('Concluir etapa:', etapa.id);
          // Implementar lógica de conclusão
        }}
        onEditarEtapa={(etapa) => {
          console.log('Editar etapa:', etapa.id);
          // Implementar lógica de edição
        }}
        onExcluirEtapa={(etapa) => {
          console.log('Excluir etapa:', etapa.id);
          // Implementar lógica de exclusão
        }}
        onSubstituirDocumento={(etapa) => {
          console.log('Substituir documento da etapa:', etapa.id);
          // Implementar lógica de substituição
        }}
        onVisualizarDocumento={handleVisualizarDocumento}
        onBaixarDocumento={handleBaixarDocumento}
        onAdicionarMembro={(etapa, membro) => {
          console.log('Adicionar membro à etapa:', etapa.id, membro);
          // Implementar lógica de adicionar membro
        }}
        onRemoverMembro={(etapa, membroId) => {
          console.log('Remover membro da etapa:', etapa.id, membroId);
          // Implementar lógica de remover membro
        }}
        onSalvarObservacao={(etapa, observacao) => {
          console.log('Salvar observação na etapa:', etapa.id, observacao);
          // Implementar lógica de salvar observação
        }}
      />

      {/* Modal de Edição de Etapa */}
      <EditarEtapaFluxoModal
        etapa={etapaParaEditar}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEtapaParaEditar(null);
          setIsNovaEtapa(false);
        }}
        onSave={handleSalvarEtapa}
        isNovaEtapa={isNovaEtapa}
      />

      {/* Barra de Ações de Edição */}
      <BarraAcoesEdicao
        isVisible={modoEdicao}
        onCancelar={cancelarEdicao}
        onSalvar={salvarAlteracoes}
        temAlteracoes={temAlteracoes}
        isLoading={isLoading}
      />

      {/* Dialog para DFD */}
      <Dialog open={showDFDModal} onOpenChange={setShowDFDModal}>
        <DialogContent className="w-[95vw] max-w-[95vw] max-h-[92vh] overflow-y-auto">
          {currentEtapa?.id === 1 ? (
            <DFDFormSection
              processoId="1"
              etapaId={currentEtapa.id}
              onComplete={handleDFDComplete}
              onSave={handleDFDSave}
              canEdit={canManageEtapa(currentEtapa)}
              gerenciaCriadora={gerenciaCriadora}
            />
          ) : currentEtapa?.id === 2 ? (
            <DFDAprovacaoSection
              processoId="1"
              etapaId={currentEtapa.id}
              onComplete={handleDFDAprovar}
              onSave={handleDFDSave}
              canEdit={canManageEtapa(currentEtapa)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Dialog para Consolidação da Demanda */}
      <Dialog open={showConsolidacaoModal} onOpenChange={setShowConsolidacaoModal}>
        <DialogContent className="w-[95vw] max-w-[95vw] max-h-[92vh] overflow-y-auto">
          {currentEtapa?.nome === 'Consolidação da Demanda' && (
            <ConsolidacaoDemandaSection
              processoId="1"
              etapaId={currentEtapa.id}
              onComplete={handleConsolidacaoComplete}
              onSave={handleConsolidacaoSave}
              canEdit={canManageEtapa(currentEtapa)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}