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
import EtapaDetalhesModal from './EtapaDetalhesModal';
import EtapaCardEditavel from './EtapaCardEditavel';
import EditarEtapaFluxoModal from './EditarEtapaFluxoModal';
import AdicionarEtapaButton from './AdicionarEtapaButton';
import BarraAcoesEdicao from './BarraAcoesEdicao';

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
}

// Dados das 17 etapas do processo
const etapasPadrao: Etapa[] = [
  {
    id: 1,
    nome: "Elaboração do DFD",
    nomeCompleto: "Elaboração do Documento de Formalização da Demanda",
    status: "concluido",
    prazoPrevisao: "5 dias úteis",
    dataConclusao: "05/01/2025",
    prazoCumprido: true,
    responsavel: "Dr. João Silva",
    cargo: "Gerente de Planejamento",
    gerencia: "Gerência de Soluções e Projetos",
    dataInicio: "01/01/2025",
    documento: "DFD_012_2025.pdf",
    documentoUrl: "/docs/dfd.pdf"
  },
  {
    id: 2,
    nome: "Análise da Demanda",
    nomeCompleto: "Análise Técnica da Demanda Apresentada",
    status: "concluido",
    prazoPrevisao: "3 dias úteis",
    dataConclusao: "08/01/2025",
    prazoCumprido: true,
    responsavel: "Eng. Maria Santos",
    cargo: "Engenheira Chefe",
    gerencia: "Gerência de Suprimentos e Logística",
    dataInicio: "06/01/2025"
  },
  {
    id: 3,
    nome: "Validação Técnica",
    nomeCompleto: "Validação Técnica das Especificações",
    status: "concluido",
    prazoPrevisao: "3 dias úteis",
    dataConclusao: "12/01/2025",
    prazoCumprido: true,
    responsavel: "Arq. Carlos Oliveira",
    cargo: "Arquiteto Senior",
    gerencia: "Gerência de Recursos Humanos",
    dataInicio: "09/01/2025"
  },
  {
    id: 4,
    nome: "Assinatura do DFD",
    nomeCompleto: "Assinatura e Aprovação do DFD",
    status: "concluido",
    prazoPrevisao: "2 dias úteis",
    dataConclusao: "15/01/2025",
    prazoCumprido: true,
    responsavel: "Dir. Ana Costa",
    cargo: "Diretora Executiva",
    gerencia: "Gerência de Urgência e Emergência",
    dataInicio: "13/01/2025"
  },
  {
    id: 5,
    nome: "Elaboração do ETP",
    nomeCompleto: "Elaboração do Estudo Técnico Preliminar",
    status: "andamento",
    prazoPrevisao: "10 dias úteis",
    responsavel: "Eng. Pedro Lima",
    cargo: "Engenheiro de Projetos",
    gerencia: "Gerência de Licitações e Contratos",
    dataInicio: "16/01/2025",
    documento: "ETP_012_2025_v1.pdf",
    documentoUrl: "/docs/etp.pdf",
    envolvidos: [
      {
        nome: "Téc. Ana Silva",
        cargo: "Técnica de Apoio",
        papel: "Apoio Técnico",
        gerencia: "Gerência de Licitações e Contratos"
      },
      {
        nome: "Est. Carlos Mendes",
        cargo: "Estagiário",
        papel: "Auxiliar de Campo",
        gerencia: "Gerência de Licitações e Contratos"
      }
    ]
  },
  {
    id: 6,
    nome: "Assinatura do ETP",
    nomeCompleto: "Assinatura do Estudo Técnico Preliminar",
    status: "pendente",
    prazoPrevisao: "2 dias úteis",
    responsavel: "Dir. Roberto Silva",
    cargo: "Diretor Técnico",
    gerencia: "Gerência Financeira e Contábil"
  },
  {
    id: 7,
    nome: "Análise e Aprovação do ETP",
    nomeCompleto: "Análise e Aprovação do Estudo Técnico Preliminar",
    status: "pendente",
    prazoPrevisao: "5 dias úteis",
    responsavel: "Esp. Fernanda Martins",
    cargo: "Especialista em Análise",
    gerencia: "Ouvidoria"
  },
  {
    id: 8,
    nome: "Elaboração da Matriz de Risco",
    nomeCompleto: "Elaboração da Matriz de Análise de Riscos",
    status: "pendente",
    prazoPrevisao: "7 dias úteis",
    responsavel: "Esp. Ricardo Alves",
    cargo: "Especialista em Riscos",
    gerencia: "Secretário Executivo",
    envolvidos: [
      {
        nome: "Esp. Mariana Costa",
        cargo: "Especialista em Riscos",
        papel: "Analista Senior",
        gerencia: "Secretário Executivo"
      },
      {
        nome: "Téc. Roberto Alves",
        cargo: "Técnico de Campo",
        papel: "Coleta de Dados",
        gerencia: "Secretário Executivo"
      },
      {
        nome: "Est. Juliana Pereira",
        cargo: "Estagiária",
        papel: "Apoio Administrativo",
        gerencia: "Secretário Executivo"
      }
    ]
  },
  {
    id: 9,
    nome: "Assinatura da Matriz de Risco",
    nomeCompleto: "Assinatura da Matriz de Análise de Riscos",
    status: "pendente",
    prazoPrevisao: "2 dias úteis",
    responsavel: "Dir. Paulo Mendes",
    cargo: "Diretor de Riscos",
    gerencia: "Gerência de Soluções e Projetos"
  },
  {
    id: 10,
    nome: "Elaboração do TR",
    nomeCompleto: "Elaboração do Termo de Referência",
    status: "pendente",
    prazoPrevisao: "15 dias úteis",
    responsavel: "Adv. Camila Rocha",
    cargo: "Advogada",
    gerencia: "Gerência de Suprimentos e Logística"
  },
  {
    id: 11,
    nome: "Assinatura do TR",
    nomeCompleto: "Assinatura do Termo de Referência",
    status: "pendente",
    prazoPrevisao: "2 dias úteis",
    responsavel: "Dir. Juliana Costa",
    cargo: "Diretora de Contratos",
    gerencia: "Gerência de Recursos Humanos"
  },
  {
    id: 12,
    nome: "Cotação/Mapeamento",
    nomeCompleto: "Cotação e Mapeamento de Preços",
    status: "pendente",
    prazoPrevisao: "10 dias úteis",
    responsavel: "Esp. Luiza Campos",
    cargo: "Especialista em Compras",
    gerencia: "Gerência de Urgência e Emergência"
  },
  {
    id: 13,
    nome: "Análise da Cotação",
    nomeCompleto: "Análise Técnica da Cotação de Preços",
    status: "pendente",
    prazoPrevisao: "5 dias úteis",
    responsavel: "Dir. Fernando Santos",
    cargo: "Diretor Financeiro",
    gerencia: "Gerência de Licitações e Contratos"
  },
  {
    id: 14,
    nome: "Validação Final",
    nomeCompleto: "Validação Final do Processo",
    status: "pendente",
    prazoPrevisao: "3 dias úteis",
    responsavel: "Dir. Geral Eduardo Lima",
    cargo: "Diretor Geral",
    gerencia: "Gerência Financeira e Contábil"
  },
  {
    id: 15,
    nome: "Elaboração do Edital",
    nomeCompleto: "Elaboração do Edital de Licitação",
    status: "pendente",
    prazoPrevisao: "20 dias úteis",
    responsavel: "Adv. Roberto Lima",
    cargo: "Advogado Senior",
    gerencia: "Ouvidoria"
  },
  {
    id: 16,
    nome: "Aprovação Jurídica",
    nomeCompleto: "Aprovação Jurídica do Edital",
    status: "pendente",
    prazoPrevisao: "10 dias úteis",
    responsavel: "Adv. Patricia Silva",
    cargo: "Assessora Jurídica",
    gerencia: "Secretário Executivo"
  },
  {
    id: 17,
    nome: "Publicação",
    nomeCompleto: "Publicação do Edital",
    status: "pendente",
    prazoPrevisao: "1 dia útil",
    responsavel: "Esp. Ana Paula",
    cargo: "Especialista em Comunicação",
    gerencia: "Gerência de Soluções e Projetos"
  }
];

export default function FluxoProcessoCompleto({ etapas = etapasPadrao, onEtapaClick }: FluxoProcessoCompletoProps) {
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

  const { isGerenciaPai, podeEditarFluxo, podeExcluirEtapa } = usePermissoes();
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
    setModalEtapa(etapa);
    setIsModalOpen(true);
    onEtapaClick?.(etapa);
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

  const handleAdicionarEtapa = (posicao: number) => {
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
    // Qualquer pessoa da gerência responsável pode gerenciar a etapa
    return etapa.status === 'andamento' && user?.gerencia === etapa.gerencia;
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
                  className={`border-2 rounded-xl transition-all duration-300 ${statusConfig.bgColor} ${statusConfig.borderColor} hover:shadow-md bg-white relative w-full h-full min-h-[240px] ${
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
    </div>
  );
}