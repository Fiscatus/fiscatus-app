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
  Settings,
  CheckSquare,
  FileSignature,
  Send,
  ClipboardList,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  RotateCcw,
  Newspaper
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
import { useMediaQuery } from '@/hooks/use-media-query';
import { getBordaEtapa } from '@/lib/utils';
import EtapaDetalhesModal from './EtapaDetalhesModal';
import EtapaCardEditavel from './EtapaCardEditavel';
import EditarEtapaFluxoModal from './EditarEtapaFluxoModal';
import AdicionarEtapaButton from './AdicionarEtapaButton';
import BarraAcoesEdicao from './BarraAcoesEdicao';
import DFDFormSection from './DFDFormSection';
import DFDAprovacaoSection from './DFDAprovacaoSection';
import DFDAssinaturaSection from './DFDAssinaturaSection';
import DFDDespachoSection from './DFDDespachoSection';
import DFDAnaliseJuridicaSection from './DFDAnaliseJuridicaSection';
import DFDCumprimentoRessalvasSection from './DFDCumprimentoRessalvasSection';
import DFDPublicacaoSection from './DFDPublicacaoSection';
import ConsolidacaoDemandaSection from './ConsolidacaoDemandaSection';
import ETPElaboracaoSection from './ETPElaboracaoSection';
import ETPSignatureSection from './ETPSignatureSection';
import ETPDespachoSection from './ETPDespachoSection';
import MatrizRiscoElaboracaoSection from './MatrizRiscoElaboracaoSection';
import MatrizRiscoSignatureSection from './MatrizRiscoSignatureSection';
import TRSignatureSection from './TRSignatureSection';
import EditalSignatureSection from './EditalSignatureSection';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from './ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';

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
  { id: 1, nome: "Elaboração do DFD", nomeCompleto: "Elaboração do DFD", status: "concluido", prazoPrevisao: "5 dias úteis", dataConclusao: "05/01/2025", prazoCumprido: true, responsavel: "Yasmin Pissolati Mattos Bretz", cargo: "Gerente de Soluções e Projetos", gerencia: "GSP - Gerência de Soluções e Projetos", dataInicio: "01/01/2025", documento: "DFD_012_2025.pdf", documentoUrl: "/docs/dfd.pdf" },
  { id: 2, nome: "Aprovação do DFD", nomeCompleto: "Aprovação do DFD", status: "concluido", prazoPrevisao: "3 dias úteis", dataConclusao: "08/01/2025", prazoCumprido: true, responsavel: "Guilherme de Carvalho Silva", cargo: "Gerente Suprimentos e Logistica", gerencia: "GSL - Gerência de Suprimentos e Logística", dataInicio: "06/01/2025" },
  { id: 3, nome: "Assinatura do DFD", nomeCompleto: "Assinatura do DFD", status: "concluido", prazoPrevisao: "3 dias úteis", dataConclusao: "12/01/2025", prazoCumprido: true, responsavel: "Diran Rodrigues de Souza Filho", cargo: "Secretário Executivo", gerencia: "SE - Secretaria Executiva", dataInicio: "09/01/2025" },
  { id: 4, nome: "Despacho do DFD", nomeCompleto: "Despacho do DFD", status: "pendente", prazoPrevisao: "2 dias úteis", dataConclusao: "15/01/2025", prazoCumprido: true, responsavel: "Yasmin Pissolati Mattos Bretz", cargo: "Gerente de Soluções e Projetos", gerencia: "GSP - Gerência de Soluções e Projetos", dataInicio: "13/01/2025" },
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
  { id: 15, nome: "Análise Jurídica Prévia", nomeCompleto: "Análise Jurídica Prévia", status: "pendente", prazoPrevisao: "5 dias úteis", responsavel: "Gabriel Radamesis Gomes Nascimento", cargo: "Assessor Jurídico", gerencia: "NAJ - Assessoria Jurídica" },
  { id: 16, nome: "Cumprimento de Ressalvas pós Análise Jurídica Prévia", nomeCompleto: "Cumprimento de Ressalvas pós Análise Jurídica Prévia", status: "pendente", prazoPrevisao: "3 dias úteis", responsavel: "Gabriel Radamesis Gomes Nascimento", cargo: "Assessor Jurídico", gerencia: "NAJ - Assessoria Jurídica" },
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
  
  // Função para obter informações do header de cada etapa
  const getEtapaHeaderInfo = (etapa: Etapa) => {
    switch (etapa.id) {
      case 1: // Elaboração do DFD
        return {
          title: "Elaboração do DFD",
          subtitle: "Documento de Formalização da Demanda",
          icon: <FileText className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="versao" className="bg-blue-100 text-blue-800 px-3 py-1">
              <FileText className="w-4 h-4 mr-2" />
              <span>Versão 1.0</span>
            </Badge>,
            <Badge key="concluida" className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Etapa Concluída
            </Badge>
          ]
        };
      case 2: // Aprovação do DFD
        return {
          title: "Aprovação do DFD",
          subtitle: "Análise e Aprovação Técnica",
          icon: <CheckSquare className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="status" className="bg-blue-100 text-blue-800 px-3 py-1">
              <Search className="w-4 h-4 mr-2" />
              <span>Em Análise</span>
            </Badge>
          ]
        };
      case 3: // Assinatura do DFD
        return {
          title: "Assinatura do DFD",
          subtitle: "Assinatura Digital do Documento",
          icon: <FileSignature className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="versao" className="bg-purple-100 text-purple-800 px-3 py-1">
              <PenTool className="w-4 h-4 mr-2" />
              <span>Versão Final</span>
            </Badge>,
            <Badge key="assinado" className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Assinado (2/3)
            </Badge>,
            <Badge key="status" className="bg-orange-100 text-orange-800 px-3 py-1">
              <Clock className="w-4 h-4 mr-2" />
              <span>Pendente de Assinatura</span>
            </Badge>
          ]
        };
      case 4: // Despacho do DFD
        return {
          title: "Despacho do DFD",
          subtitle: "Despacho e Encaminhamento",
          icon: <Send className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="status" className="bg-orange-100 text-orange-800 px-3 py-1">
              <Send className="w-4 h-4 mr-2" />
              <span>Pendente</span>
            </Badge>
          ]
        };
      case 5: // Elaboração do ETP
        return {
          title: "Elaboração do ETP",
          subtitle: "Estudo Técnico Preliminar",
          icon: <ClipboardList className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="status" className="bg-yellow-100 text-yellow-800 px-3 py-1">
              <ClipboardList className="w-4 h-4 mr-2" />
              Rascunho
            </Badge>,
            <Badge key="sla" className="bg-green-100 text-green-800 px-3 py-1">
              Dentro do Prazo
            </Badge>
          ]
        };
      case 6: // Assinatura do ETP
        return {
          title: "Assinatura do ETP",
          subtitle: "Assinatura Digital do ETP",
          icon: <FileSignature className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="versao" className="bg-purple-100 text-purple-800 px-3 py-1">
              <PenTool className="w-4 h-4 mr-2" />
              <span>Versão Final</span>
            </Badge>,
            <Badge key="status" className="bg-orange-100 text-orange-800 px-3 py-1">
              <Clock className="w-4 h-4 mr-2" />
              <span>Pendente de Assinatura</span>
            </Badge>
          ]
        };
      case 7: // Despacho do ETP
        return {
          title: "Despacho do ETP",
          subtitle: "Despacho e Encaminhamento do ETP",
          icon: <Send className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="status" className="bg-gray-100 text-gray-800 px-3 py-1">
              <Send className="w-4 h-4 mr-2" />
              <span>Não Iniciado</span>
            </Badge>
          ]
        };
      case 8: // Elaboração/Análise da Matriz de Risco
        return {
          title: "Elaboração/Análise da Matriz de Risco",
          subtitle: "Avaliação de Riscos do Projeto",
          icon: <AlertTriangle className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="status" className="bg-gray-100 text-gray-800 px-3 py-1">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span>Não Iniciado</span>
            </Badge>
          ]
        };
      case 9: // Aprovação da Matriz de Risco
        return {
          title: "Aprovação da Matriz de Risco",
          subtitle: "Aprovação da Avaliação de Riscos",
          icon: <CheckSquare className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="status" className="bg-gray-100 text-gray-800 px-3 py-1">
              <CheckSquare className="w-4 h-4 mr-2" />
              <span>Não Iniciado</span>
            </Badge>
          ]
        };
      case 10: // Assinatura da Matriz de Risco
        return {
          title: "Assinatura da Matriz de Risco",
          subtitle: "Assinatura da Avaliação de Riscos",
          icon: <FileSignature className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="versao" className="bg-purple-100 text-purple-800 px-3 py-1">
              <PenTool className="w-4 h-4 mr-2" />
              <span>Versão Final</span>
            </Badge>,
            <Badge key="status" className="bg-orange-100 text-orange-800 px-3 py-1">
              <Clock className="w-4 h-4 mr-2" />
              <span>Pendente de Assinatura</span>
            </Badge>
          ]
        };
      case 11: // Cotação
        return {
          title: "Cotação",
          subtitle: "Solicitação de Preços",
          icon: <DollarSign className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="status" className="bg-gray-100 text-gray-800 px-3 py-1">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>Não Iniciado</span>
            </Badge>
          ]
        };
      case 15: // Análise Jurídica Prévia
        return {
          title: "Análise Jurídica Prévia",
          subtitle: "Análise Preliminar da Assessoria Jurídica (NAJ)",
          icon: <Scale className="w-6 h-6 text-blue-600" />,
          statusBadges: [
            <Badge key="status" className="bg-blue-100 text-blue-800 px-3 py-1">
              <Scale className="w-4 h-4 mr-2" />
              <span>Aguardando Análise</span>
            </Badge>
          ]
        };
      case 16: // Cumprimento de Ressalvas pós Análise Jurídica Prévia
        return {
          title: "Cumprimento de Ressalvas",
          subtitle: "Correções pós Análise Jurídica Prévia",
          icon: <RotateCcw className="w-6 h-6 text-orange-600" />,
          statusBadges: [
            <Badge key="status" className="bg-orange-100 text-orange-800 px-3 py-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              <span>Em Correção</span>
            </Badge>
          ]
        };
      case 13: // Assinatura do TR
        return {
          title: "Assinatura do TR",
          subtitle: "Assinatura Digital do Termo de Referência",
          icon: <FileSignature className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="versao" className="bg-purple-100 text-purple-800 px-3 py-1">
              <PenTool className="w-4 h-4 mr-2" />
              <span>Versão Final</span>
            </Badge>,
            <Badge key="status" className="bg-orange-100 text-orange-800 px-3 py-1">
              <Clock className="w-4 h-4 mr-2" />
              <span>Pendente de Assinatura</span>
            </Badge>
          ]
        };
      case 20: // Assinatura do Edital
        return {
          title: "Assinatura do Edital",
          subtitle: "Assinatura Digital do Edital",
          icon: <FileSignature className="w-6 h-6 text-indigo-600" />,
          statusBadges: [
            <Badge key="versao" className="bg-purple-100 text-purple-800 px-3 py-1">
              <PenTool className="w-4 h-4 mr-2" />
              <span>Versão Final</span>
            </Badge>,
            <Badge key="status" className="bg-orange-100 text-orange-800 px-3 py-1">
              <Clock className="w-4 h-4 mr-2" />
              <span>Pendente de Assinatura</span>
            </Badge>
          ]
        };
      case 21: // Publicação
        return {
          title: "Publicação",
          subtitle: "Publicação Oficial do Edital",
          icon: <Newspaper className="w-6 h-6 text-green-600" />,
          statusBadges: [
            <Badge key="status" className="bg-green-100 text-green-800 px-3 py-1">
              <Newspaper className="w-4 h-4 mr-2" />
              <span>Pendente de Publicação</span>
            </Badge>
          ]
        };
      default:
        return {
          title: etapa.nome,
          subtitle: "",
          icon: <FileText className="w-6 h-6 text-indigo-600" />,
          statusBadges: []
        };
    }
  };
  
  // Estados para modo de edição
  const [modoEdicao, setModoEdicao] = useState(false);
  const [etapasEditadas, setEtapasEditadas] = useState<Etapa[]>(etapas);
  const [etapaParaEditar, setEtapaParaEditar] = useState<Etapa | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNovaEtapa, setIsNovaEtapa] = useState(false);
  const [temAlteracoes, setTemAlteracoes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dfdData, setDfdData] = useState<any>({
    numeroDFD: 'DFD 006/2025',
    objeto: 'Aquisição de equipamentos de informática para modernização dos sistemas da GSP',
    regimeTramitacao: 'ORDINARIO',
    areaSetorDemandante: 'GSP - Gerência de Soluções e Projetos',
    responsavelElaboracao: 'Yasmin Pissolati Mattos Bretz',
    dataElaboracao: '2025-01-15',
    prioridade: 'MEDIO',
    status: 'aprovado',
    aprovadoPor: 'Yasmin Pissolati Mattos Bretz',
    aprovadoData: '2025-01-15T10:00:00Z'
  });
  const [showDFDModal, setShowDFDModal] = useState(false);
  const [showConsolidacaoModal, setShowConsolidacaoModal] = useState(false);
  const [showETPModal, setShowETPModal] = useState(false);
  const [currentEtapa, setCurrentEtapa] = useState<Etapa | null>(null);

  // Hooks responsivos para detectar tamanho da tela
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  // Event listener para fechar modal com tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDFDModal) {
          setShowDFDModal(false);
        }
        if (showETPModal) {
          setShowETPModal(false);
        }
        if (showConsolidacaoModal) {
          setShowConsolidacaoModal(false);
        }
      }
    };

    if (showDFDModal || showETPModal || showConsolidacaoModal) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDFDModal, showETPModal, showConsolidacaoModal]);

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
      4: <FileText className="w-5 h-5" />, // Despacho do DFD
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
      // Card "Elaboração do DFD"
      setCurrentEtapa(etapa);
      setShowDFDModal(true);
    } else if (etapa.id === 2) {
      // Card "Aprovação do DFD"
      setCurrentEtapa(etapa);
      setShowDFDModal(true);
    } else if (etapa.id === 3) {
      // Card "Assinatura do DFD"
      setCurrentEtapa(etapa);
      setShowDFDModal(true);
    } else if (etapa.id === 4) {
      // Card "Despacho do DFD"
      setCurrentEtapa(etapa);
      setShowDFDModal(true);
    } else if (etapa.id === 5) {
      // Card "Elaboração do ETP"
      setCurrentEtapa(etapa);
      setShowETPModal(true);
    } else if (etapa.id === 6) {
      // Card "Assinatura do ETP"
      setCurrentEtapa(etapa);
      setShowETPModal(true);
    } else if (etapa.id === 7) {
      // Card "Despacho do ETP"
      setCurrentEtapa(etapa);
      setShowETPModal(true);
    } else if (etapa.id === 8) {
      // Card "Elaboração/Análise da Matriz de Risco"
      setCurrentEtapa(etapa);
      setShowETPModal(true);
    } else if (etapa.id === 10) {
      // Card "Assinatura da Matriz de Risco"
      setCurrentEtapa(etapa);
      setShowETPModal(true);
    } else if (etapa.id === 13) {
      // Card "Assinatura do TR"
      setCurrentEtapa(etapa);
      setShowETPModal(true);
    } else if (etapa.id === 20) {
      // Card "Assinatura do Edital"
      setCurrentEtapa(etapa);
      setShowETPModal(true);
    } else if (etapa.id === 15) {
      // Card "Análise Jurídica Prévia"
      setCurrentEtapa(etapa);
      setShowDFDModal(true);
    } else if (etapa.id === 16) {
      // Card "Cumprimento de Ressalvas pós Análise Jurídica Prévia"
      setCurrentEtapa(etapa);
      setShowDFDModal(true);
    } else if (etapa.id === 21) {
      // Card "Publicação"
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

  const handleDFDComplete = (newDfdData: any) => {
    // Atualizar os dados do DFD com os novos dados
    setDfdData(prevData => ({
      ...prevData,
      ...newDfdData
    }));
    
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
    setDfdData(prevData => ({
      ...prevData,
      ...data
    }));
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

  const handleETPComplete = (data: any) => {
    console.log('ETP concluído:', data);
    setShowETPModal(false);
    
    // Atualizar status das etapas
    const etapasAtualizadas = etapasEditadas.map(etapa => {
      if (etapa.id === 5) {
        return { ...etapa, status: 'concluido' as const };
      } else if (etapa.id === 6) {
        return { ...etapa, status: 'andamento' as const };
      }
      return etapa;
    });
    setEtapasEditadas(etapasAtualizadas);
    
    toast({
      title: "ETP Concluído",
      description: "O Estudo Técnico Preliminar foi finalizado com sucesso."
    });
  };

  const handleETPSave = (data: any) => {
    console.log('Salvar ETP:', data);
    // Implementar lógica de salvamento do ETP
    toast({
      title: "ETP Salvo",
      description: "O rascunho do ETP foi salvo com sucesso."
    });
  };

  const handleMatrizRiscoComplete = (data: any) => {
    console.log('Matriz de Risco concluída:', data);
    
    // Atualizar status das etapas
    const etapasAtualizadas = etapasEditadas.map(etapa => {
      if (etapa.id === 9) {
        return { ...etapa, status: 'concluido' as const };
      } else if (etapa.id === 10) {
        return { ...etapa, status: 'concluido' as const };
      } else if (etapa.id === 11) {
        return { ...etapa, status: 'andamento' as const };
      }
      return etapa;
    });
    setEtapasEditadas(etapasAtualizadas);
    
    toast({
      title: "Matriz de Risco Concluída",
      description: "A assinatura da Matriz de Risco foi finalizada com sucesso."
    });
  };

  const handleMatrizRiscoSave = (data: any) => {
    console.log('Salvar Matriz de Risco:', data);
    // Implementar lógica de salvamento da Matriz de Risco
    toast({
      title: "Matriz de Risco Salva",
      description: "O rascunho da Matriz de Risco foi salvo com sucesso."
    });
  };

  const handleTRComplete = (data: any) => {
    console.log('TR concluído:', data);
    
    // Atualizar status das etapas
    const etapasAtualizadas = etapasEditadas.map(etapa => {
      if (etapa.id === 12) {
        return { ...etapa, status: 'concluido' as const };
      } else if (etapa.id === 13) {
        return { ...etapa, status: 'concluido' as const };
      } else if (etapa.id === 14) {
        return { ...etapa, status: 'andamento' as const };
      }
      return etapa;
    });
    setEtapasEditadas(etapasAtualizadas);
    
    toast({
      title: "TR Concluído",
      description: "A assinatura do Termo de Referência foi finalizada com sucesso."
    });
  };

  const handleTRSave = (data: any) => {
    console.log('Salvar TR:', data);
    // Implementar lógica de salvamento do TR
    toast({
      title: "TR Salvo",
      description: "O rascunho do Termo de Referência foi salvo com sucesso."
    });
  };

  const handleEditalComplete = (data: any) => {
    console.log('Edital concluído:', data);
    
    // Atualizar status das etapas
    const etapasAtualizadas = etapasEditadas.map(etapa => {
      if (etapa.id === 19) {
        return { ...etapa, status: 'concluido' as const };
      } else if (etapa.id === 20) {
        return { ...etapa, status: 'concluido' as const };
      } else if (etapa.id === 21) {
        return { ...etapa, status: 'andamento' as const };
      }
      return etapa;
    });
    setEtapasEditadas(etapasAtualizadas);
    
    toast({
      title: "Edital Concluído",
      description: "A assinatura do Edital foi finalizada com sucesso."
    });
  };

  const handleEditalSave = (data: any) => {
    console.log('Salvar Edital:', data);
    // Implementar lógica de salvamento do Edital
    toast({
      title: "Edital Salvo",
      description: "O rascunho do Edital foi salvo com sucesso."
    });
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-4">
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
              
              // Debug para verificar se a gerência está sendo passada corretamente
              if (etapa.id === 4) {
                console.log('Card 4 - Gerência:', etapa.gerencia);
              }
            
            return (
              <div key={etapa.id} className="w-full h-full">
                {/* Card da Etapa */}
                <motion.div
                  className={`border-2 rounded-xl transition-all duration-300 ${statusConfig.bgColor} hover:shadow-md bg-white relative w-full h-full min-h-[260px] ${getBordaEtapa(etapa.status, etapa.dataInicio, etapa.prazoPrevisao)} ${
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
                  <div className="p-4 h-full flex flex-col overflow-visible">
                    <div className="flex items-center justify-between mb-3">
                      {/* Número da Etapa */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        etapa.status === 'concluido' 
                          ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg' 
                          : etapa.status === 'andamento'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg'
                          : etapa.status === 'atrasado'
                          ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg'
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
                    <h3 className={`font-bold text-center text-base mb-2 leading-tight ${
                      etapa.status === 'concluido' ? 'text-green-800' : 
                      etapa.status === 'andamento' ? 'text-blue-800' : 
                      etapa.status === 'atrasado' ? 'text-red-800' : 
                      'text-gray-900'
                    }`}>
                      {etapa.nome}
                    </h3>

                    {/* Gerência Responsável */}
                    <div className="text-xs text-gray-700 text-center mb-2 min-h-[1.5rem] leading-tight font-semibold px-1 bg-gray-50 py-1 rounded">
                      <span className="block">{etapa.gerencia || 'Gerência não definida'}</span>
                    </div>
                    
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

      {/* Modal DFD com tamanho responsivo */}
      {showDFDModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`
            bg-white rounded-lg shadow-xl border overflow-hidden
            ${isMobile 
              ? 'w-full max-w-[96vw] max-h-[92vh]' 
              : isTablet 
                ? 'w-full max-w-[90vw] max-h-[88vh]' 
                : 'w-full max-w-[75vw] max-h-[85vh]'
            }
          `}>
            {/* Header com título, subtítulo e botão X */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                {currentEtapa && getEtapaHeaderInfo(currentEtapa).icon}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {currentEtapa ? getEtapaHeaderInfo(currentEtapa).title : 'Detalhes da Etapa'}
                  </h2>
                  {currentEtapa && getEtapaHeaderInfo(currentEtapa).subtitle && (
                    <p className="text-sm text-slate-500">
                      {getEtapaHeaderInfo(currentEtapa).subtitle}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentEtapa && getEtapaHeaderInfo(currentEtapa).statusBadges}
                <button 
                  onClick={() => setShowDFDModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100/80 border border-gray-200/60 shadow-sm opacity-60 hover:opacity-80 transition-all duration-200 flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Conteúdo do modal */}
            <div className={`
              overflow-y-auto overflow-x-hidden px-6 py-4
              ${isMobile 
                ? 'max-h-[calc(92vh-120px)]' 
                : isTablet 
                  ? 'max-h-[calc(88vh-120px)]' 
                  : 'max-h-[calc(85vh-120px)]'
              }
            `}>
              {currentEtapa?.id === 1 ? (
                <div className="pb-6">
                  <DFDFormSection
                    processoId="1"
                    etapaId={currentEtapa.id}
                    onComplete={handleDFDComplete}
                    onSave={handleDFDSave}
                    canEdit={true}
                    gerenciaCriadora={gerenciaCriadora}
                  />
                </div>
              ) : currentEtapa?.id === 2 ? (
                <DFDAprovacaoSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleDFDAprovar}
                  onSave={handleDFDSave}
                  canEdit={canManageEtapa(currentEtapa)}
                />
              ) : currentEtapa?.id === 3 ? (
                <DFDAssinaturaSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleDFDComplete}
                  onSave={handleDFDSave}
                  canEdit={canManageEtapa(currentEtapa)}
                  gerenciaCriadora={gerenciaCriadora}
                />
              ) : currentEtapa?.id === 4 ? (
                <DFDDespachoSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleDFDComplete}
                  onSave={handleDFDSave}
                  canEdit={canManageEtapa(currentEtapa)}
                  gerenciaCriadora={gerenciaCriadora}
                  initialData={dfdData}
                />
              ) : currentEtapa?.id === 15 ? (
                <DFDAnaliseJuridicaSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleDFDComplete}
                  onSave={handleDFDSave}
                  canEdit={canManageEtapa(currentEtapa)}
                />
              ) : currentEtapa?.id === 16 ? (
                <DFDCumprimentoRessalvasSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleDFDComplete}
                  onSave={handleDFDSave}
                  canEdit={canManageEtapa(currentEtapa)}
                  initialData={dfdData}
                />
              ) : currentEtapa?.id === 21 ? (
                <DFDPublicacaoSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleDFDComplete}
                  onSave={handleDFDSave}
                  canEdit={canManageEtapa(currentEtapa)}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Modal ETP com tamanho responsivo */}
      {showETPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`
            bg-white rounded-lg shadow-xl border overflow-hidden
            ${isMobile 
              ? 'w-full max-w-[96vw] max-h-[92vh]' 
              : isTablet 
                ? 'w-full max-w-[90vw] max-h-[88vh]' 
                : 'w-full max-w-[75vw] max-h-[85vh]'
            }
          `}>
            {/* Header com título, subtítulo e botão X */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                {currentEtapa && getEtapaHeaderInfo(currentEtapa).icon}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {currentEtapa ? getEtapaHeaderInfo(currentEtapa).title : 'Detalhes da Etapa'}
                  </h2>
                  {currentEtapa && getEtapaHeaderInfo(currentEtapa).subtitle && (
                    <p className="text-sm text-slate-500">
                      {getEtapaHeaderInfo(currentEtapa).subtitle}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentEtapa && getEtapaHeaderInfo(currentEtapa).statusBadges}
                <button 
                  onClick={() => setShowETPModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100/80 border border-gray-200/60 shadow-sm opacity-60 hover:opacity-80 transition-all duration-200 flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Conteúdo do modal */}
            <div className={`
              overflow-y-auto overflow-x-hidden px-6 py-4
              ${isMobile 
                ? 'max-h-[calc(92vh-120px)]' 
                : isTablet 
                  ? 'max-h-[calc(88vh-120px)]' 
                  : 'max-h-[calc(85vh-120px)]'
              }
            `}>
              {currentEtapa?.id === 5 && (
                <ETPElaboracaoSection
                  processoId="1"
                  etapaId={currentEtapa.id.toString()}
                  onComplete={handleETPComplete}
                  onSave={handleETPSave}
                  canEdit={canManageEtapa(currentEtapa)}
                  gerenciaCriadora={gerenciaCriadora}
                />
              )}
              {currentEtapa?.id === 6 && (
                <ETPSignatureSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleETPComplete}
                  onSave={handleETPSave}
                  canEdit={canManageEtapa(currentEtapa)}
                  gerenciaCriadora={gerenciaCriadora}
                />
              )}
              {currentEtapa?.id === 7 && (
                <ETPDespachoSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleETPComplete}
                  onSave={handleETPSave}
                  canEdit={canManageEtapa(currentEtapa)}
                  gerenciaCriadora={gerenciaCriadora}
                />
              )}
              {currentEtapa?.id === 8 && (
                <MatrizRiscoElaboracaoSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleMatrizRiscoComplete}
                  onSave={handleMatrizRiscoSave}
                  canEdit={canManageEtapa(currentEtapa)}
                  gerenciaCriadora={gerenciaCriadora}
                />
              )}
              {currentEtapa?.id === 10 && (
                <MatrizRiscoSignatureSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleMatrizRiscoComplete}
                  onSave={handleMatrizRiscoSave}
                  canEdit={canManageEtapa(currentEtapa)}
                  gerenciaCriadora={gerenciaCriadora}
                />
              )}
              {currentEtapa?.id === 13 && (
                <TRSignatureSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleTRComplete}
                  onSave={handleTRSave}
                  canEdit={canManageEtapa(currentEtapa)}
                  gerenciaCriadora={gerenciaCriadora}
                />
              )}
              {currentEtapa?.id === 20 && (
                <EditalSignatureSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleEditalComplete}
                  onSave={handleEditalSave}
                  canEdit={canManageEtapa(currentEtapa)}
                  gerenciaCriadora={gerenciaCriadora}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Consolidação da Demanda com tamanho responsivo */}
      {showConsolidacaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`
            bg-white rounded-lg shadow-xl border overflow-hidden
            ${isMobile 
              ? 'w-full max-w-[96vw] max-h-[92vh]' 
              : isTablet 
                ? 'w-full max-w-[90vw] max-h-[88vh]' 
                : 'w-full max-w-[75vw] max-h-[85vh]'
            }
          `}>
            {/* Header com título, subtítulo e botão X */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-600" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Consolidação da Demanda
                  </h2>
                  <p className="text-sm text-slate-500">
                    Notificação e consolidação de setores interessados
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Em Andamento</span>
                </Badge>
                <button 
                  onClick={() => setShowConsolidacaoModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100/80 border border-gray-200/60 shadow-sm opacity-60 hover:opacity-80 transition-all duration-200 flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Conteúdo do modal */}
            <div className={`
              overflow-y-auto overflow-x-hidden px-6 py-4
              ${isMobile 
                ? 'max-h-[calc(92vh-120px)]' 
                : isTablet 
                  ? 'max-h-[calc(88vh-120px)]' 
                  : 'max-h-[calc(85vh-120px)]'
              }
            `}>
              {currentEtapa?.nome === 'Consolidação da Demanda' && (
                <ConsolidacaoDemandaSection
                  processoId="1"
                  etapaId={currentEtapa.id}
                  onComplete={handleConsolidacaoComplete}
                  onSave={handleConsolidacaoSave}
                  canEdit={canManageEtapa(currentEtapa)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}