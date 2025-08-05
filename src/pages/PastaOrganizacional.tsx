import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePastasOrganizacionais } from "@/hooks/usePastasOrganizacionais";
import ReturnButton from "@/components/ReturnButton";
import Topbar from "@/components/Topbar";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  FileText,
  Clock,
  User,
  Paperclip,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Settings
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { formatarNumeroProcesso } from "@/lib/processoUtils";

// Tipos
type ProcessStatus = "em_andamento" | "pendente" | "atrasado" | "concluido" | "cancelado";
type RegimeTramitacao = "Urgente" | "Normal" | "Prioritário";
type ParticipationType = "criador" | "responsavel" | "participante";

interface ProcessoGerencia {
  id: string;
  numeroProcesso: string;
  tipoProcesso: string;
  objeto: string;
  etapaAtual: string;
  proximaEtapa?: string;
  prazoEtapaAtual: string;
  responsavelAtual: string;
  regimeTramitacao: RegimeTramitacao;
  situacao: ProcessStatus;
  ano: string;
  tipoParticipacao: ParticipationType;
  gerenciaResponsavel: string;
  dataCriacao: string;
  ultimaAtualizacao: string;
  prazoFinal: string;
  temAnexos: boolean;
}

interface PastaOrganizacional {
  id: string;
  nome: string;
  descricao: string;
  icone: JSX.Element;
  cor: string;
  quantidadeProcessos: number;
  ultimaModificacao: string;
  filtro: (processo: ProcessoGerencia) => boolean;
}

// Dados mockados
const processosMock: ProcessoGerencia[] = [
  // Processos de 2024 (atuais)
  {
    id: "1",
    numeroProcesso: "Processo administrativo 001/2024",
    tipoProcesso: "DFD",
    objeto: "Aquisição de Equipamentos Médicos para UTI",
    etapaAtual: "Elaboração da FD",
    proximaEtapa: "Assinatura da FD",
    prazoEtapaAtual: "30/01/2024",
    responsavelAtual: "Yasmin Pissolati Mattos Bretz - GSP",
    regimeTramitacao: "Normal",
    situacao: "em_andamento",
    ano: "2024",
    tipoParticipacao: "criador",
    gerenciaResponsavel: "GECON",
    dataCriacao: "15/01/2024",
    ultimaAtualizacao: "25/01/2024",
    prazoFinal: "30/01/2024",
    temAnexos: true
  },
  {
    id: "2",
    numeroProcesso: "Processo administrativo 045/2024",
    tipoProcesso: "ETP",
    objeto: "Contratação de Serviços de Limpeza Hospitalar",
    etapaAtual: "Assinatura ETP",
    proximaEtapa: "Despacho do ETP",
    prazoEtapaAtual: "25/01/2024",
    responsavelAtual: "Guilherme de Carvalho Silva - GSL",
    regimeTramitacao: "Urgente",
    situacao: "atrasado",
    ano: "2024",
    tipoParticipacao: "responsavel",
    gerenciaResponsavel: "GECON",
    dataCriacao: "10/01/2024",
    ultimaAtualizacao: "24/01/2024",
    prazoFinal: "25/01/2024",
    temAnexos: false
  },
  {
    id: "3",
    numeroProcesso: "Processo administrativo 003/2024",
    tipoProcesso: "TR",
    objeto: "Consultoria Especializada em Gestão",
    etapaAtual: "Aprovação",
    proximaEtapa: "Publicação",
    prazoEtapaAtual: "22/01/2024",
    responsavelAtual: "Carlos Lima - GSP",
    regimeTramitacao: "Normal",
    situacao: "concluido",
    ano: "2024",
    tipoParticipacao: "participante",
    gerenciaResponsavel: "GECON",
    dataCriacao: "05/01/2024",
    ultimaAtualizacao: "20/01/2024",
    prazoFinal: "22/01/2024",
    temAnexos: true
  },
  {
    id: "4",
    numeroProcesso: "Processo administrativo 002/2024",
    tipoProcesso: "DFD",
    objeto: "Aquisição de Mobiliário para Consultórios",
    etapaAtual: "Matriz de Risco",
    proximaEtapa: "Assinatura da FD",
    prazoEtapaAtual: "15/02/2024",
    responsavelAtual: "Andressa Sterfany Santos da Silva - GUE",
    regimeTramitacao: "Prioritário",
    situacao: "em_andamento",
    ano: "2024",
    tipoParticipacao: "criador",
    gerenciaResponsavel: "GECON",
    dataCriacao: "20/01/2024",
    ultimaAtualizacao: "26/01/2024",
    prazoFinal: "15/02/2024",
    temAnexos: false
  },
  
  // Processos de 2023 (finalizados)
  {
    id: "5",
    numeroProcesso: "Processo administrativo 002/2023",
    tipoProcesso: "ETP",
    objeto: "Contratação de Segurança Patrimonial",
    etapaAtual: "Concluído",
    proximaEtapa: "-",
    prazoEtapaAtual: "20/12/2023",
    responsavelAtual: "Pedro Alves - GECON",
    regimeTramitacao: "Normal",
    situacao: "concluido",
    ano: "2023",
    tipoParticipacao: "participante",
    gerenciaResponsavel: "GECON",
    dataCriacao: "10/11/2023",
    ultimaAtualizacao: "15/12/2023",
    prazoFinal: "20/12/2023",
    temAnexos: true
  },
  {
    id: "6",
    numeroProcesso: "Processo administrativo 003/2023",
    tipoProcesso: "TR",
    objeto: "Sistema de Gestão Integrada",
    etapaAtual: "Concluído",
    proximaEtapa: "-",
    prazoEtapaAtual: "15/11/2023",
    responsavelAtual: "Lucia Ferreira - GECON",
    regimeTramitacao: "Normal",
    situacao: "concluido",
    ano: "2023",
    tipoParticipacao: "criador",
    gerenciaResponsavel: "GECON",
    dataCriacao: "05/10/2023",
    ultimaAtualizacao: "30/11/2023",
    prazoFinal: "15/11/2023",
    temAnexos: false
  },
  
  // Processos de 2022 (finalizados)
  {
    id: "7",
    numeroProcesso: "Processo administrativo 001/2022",
    tipoProcesso: "DFD",
    objeto: "Aquisição de Equipamentos de Informática",
    etapaAtual: "Concluído",
    proximaEtapa: "-",
    prazoEtapaAtual: "20/12/2022",
    responsavelAtual: "Roberto Santos - GECON",
    regimeTramitacao: "Normal",
    situacao: "concluido",
    ano: "2022",
    tipoParticipacao: "criador",
    gerenciaResponsavel: "GECON",
    dataCriacao: "05/02/2022",
    ultimaAtualizacao: "20/12/2022",
    prazoFinal: "20/12/2022",
    temAnexos: true
  },
  {
    id: "8",
    numeroProcesso: "Processo administrativo 002/2022",
    tipoProcesso: "TR",
    objeto: "Consultoria em Gestão de Qualidade",
    etapaAtual: "Concluído",
    proximaEtapa: "-",
    prazoEtapaAtual: "15/11/2022",
    responsavelAtual: "Fernanda Costa - GSP",
    regimeTramitacao: "Prioritário",
    situacao: "concluido",
    ano: "2022",
    tipoParticipacao: "responsavel",
    gerenciaResponsavel: "GECON",
    dataCriacao: "10/03/2022",
    ultimaAtualizacao: "15/11/2022",
    prazoFinal: "15/11/2022",
    temAnexos: true
  },
  {
    id: "9",
    numeroProcesso: "Processo administrativo 003/2024",
    tipoProcesso: "ETP",
    objeto: "Contratação de Serviços de Manutenção",
    etapaAtual: "Elaboração ETP",
    proximaEtapa: "Assinatura ETP",
    prazoEtapaAtual: "10/02/2024",
    responsavelAtual: "Carlos Lima - GSP",
    regimeTramitacao: "Normal",
    situacao: "em_andamento",
    ano: "2024",
    tipoParticipacao: "responsavel",
    gerenciaResponsavel: "GECON",
    dataCriacao: "25/01/2024",
    ultimaAtualizacao: "26/01/2024",
    prazoFinal: "10/02/2024",
    temAnexos: true
  }
];

const pastasOrganizacionais: PastaOrganizacional[] = [
  {
    id: "2025",
    nome: "Processos de 2025",
    descricao: "Processos iniciados em 2025",
    icone: <Calendar className="w-6 h-6" />,
    cor: "bg-purple-50 border-purple-200 text-purple-700",
    quantidadeProcessos: processosMock.filter(p => p.ano === "2025").length,
    ultimaModificacao: "15/01/2025",
    filtro: (p) => p.ano === "2025"
  },
  {
    id: "2024",
    nome: "Processos de 2024",
    descricao: "Processos iniciados em 2024",
    icone: <Calendar className="w-6 h-6" />,
    cor: "bg-blue-50 border-blue-200 text-blue-700",
    quantidadeProcessos: processosMock.filter(p => p.ano === "2024").length,
    ultimaModificacao: "26/01/2024",
    filtro: (p) => p.ano === "2024"
  },
  {
    id: "2023",
    nome: "Processos de 2023",
    descricao: "Processos iniciados em 2023",
    icone: <Calendar className="w-6 h-6" />,
    cor: "bg-slate-50 border-slate-200 text-slate-700",
    quantidadeProcessos: processosMock.filter(p => p.ano === "2023").length,
    ultimaModificacao: "15/12/2023",
    filtro: (p) => p.ano === "2023"
  },
  {
    id: "2022",
    nome: "Processos de 2022",
    descricao: "Processos iniciados em 2022",
    icone: <Calendar className="w-6 h-6" />,
    cor: "bg-green-50 border-green-200 text-green-700",
    quantidadeProcessos: processosMock.filter(p => p.ano === "2022").length,
    ultimaModificacao: "20/01/2024",
    filtro: (p) => p.ano === "2022"
  }
];

// Componentes auxiliares
function StatusBadge({ status }: { status: ProcessStatus }) {
  const variants = {
    em_andamento: { 
      label: "Em Andamento", 
      color: "bg-blue-50 text-blue-700 border-blue-200/50", 
      dot: "bg-blue-400"
    },
    pendente: { 
      label: "Pendente", 
      color: "bg-amber-50 text-amber-700 border-amber-200/50", 
      dot: "bg-amber-400"
    },
    atrasado: { 
      label: "Atrasado", 
      color: "bg-red-50 text-red-700 border-red-200/50", 
      dot: "bg-red-400"
    },
    concluido: { 
      label: "Concluído", 
      color: "bg-emerald-50 text-emerald-700 border-emerald-200/50", 
      dot: "bg-emerald-400"
    },
    cancelado: { 
      label: "Cancelado", 
      color: "bg-slate-50 text-slate-700 border-slate-200/50", 
      dot: "bg-slate-400"
    }
  };

  const variant = variants[status];
  return (
    <Badge className={`${variant.color} border font-medium flex items-center gap-2 px-3 py-1 rounded-full text-xs`}>
      <div className={`w-2 h-2 rounded-full ${variant.dot}`}></div>
      {variant.label}
    </Badge>
  );
}

function RegimeBadge({ regime }: { regime: RegimeTramitacao }) {
  const variants = {
    Normal: { 
      label: "Normal", 
      color: "bg-slate-50 text-slate-700 border-slate-200/50",
      dot: "bg-slate-400"
    },
    Urgente: { 
      label: "Urgente", 
      color: "bg-red-50 text-red-700 border-red-200/50",
      dot: "bg-red-400"
    },
    Prioritário: { 
      label: "Prioritário", 
      color: "bg-orange-50 text-orange-700 border-orange-200/50",
      dot: "bg-orange-400"
    }
  };

  const variant = variants[regime];
  return (
    <Badge className={`${variant.color} border font-medium flex items-center gap-2 px-3 py-1 rounded-full text-xs`}>
      <div className={`w-2 h-2 rounded-full ${variant.dot}`}></div>
      {variant.label}
    </Badge>
  );
}

function ParticipationIcon({ type }: { type: ParticipationType }) {
  const config = {
    criador: { icon: <User className="w-4 h-4" />, color: "text-green-600", tooltip: "Criador do processo" },
    responsavel: { icon: <User className="w-4 h-4" />, color: "text-blue-600", tooltip: "Responsável por etapa" },
    participante: { icon: <User className="w-4 h-4" />, color: "text-gray-600", tooltip: "Participante histórico" }
  };

  const item = config[type];
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`${item.color}`}>{item.icon}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{item.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PrazoDisplay({ prazo }: { prazo: string }) {
  const hoje = new Date();
  const prazoDate = new Date(prazo.split('/').reverse().join('-'));
  const diasRestantes = Math.ceil((prazoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  
  const getPrazoStyle = () => {
    if (diasRestantes < 0) {
      return "text-red-600 font-semibold"; // Vencido
    } else if (diasRestantes <= 3) {
      return "text-orange-600 font-semibold"; // 3 dias ou menos
    }
    return "text-gray-600"; // Normal
  };

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-gray-500" />
      <span className={getPrazoStyle()}>{prazo}</span>
    </div>
  );
}

function AnexosIcon({ temAnexos }: { temAnexos: boolean }) {
  if (!temAnexos) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-500 hover:text-blue-600">
            <Paperclip className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ver anexos</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Componente principal
export default function PastaOrganizacional() {
  const { pastaId } = useParams<{ pastaId: string }>();
  const navigate = useNavigate();
  const { atualizarUltimoAcesso } = usePastasOrganizacionais();
  
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [etapaFilter, setEtapaFilter] = useState("todos");
  const [situacaoFilter, setSituacaoFilter] = useState("todos");
  const [regimeFilter, setRegimeFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Atualizar data de último acesso quando a pasta for acessada
  React.useEffect(() => {
    if (pastaId) {
      // Atualizar a data de modificação da pasta automaticamente
      atualizarUltimoAcesso(pastaId);
      console.log(`Pasta ${pastaId} acessada - data atualizada`);
    }
  }, [pastaId, atualizarUltimoAcesso]);

  // Encontrar a pasta atual
  const pastaAtual = pastasOrganizacionais.find(p => p.id === pastaId);
  
  if (!pastaAtual) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pasta não encontrada</h1>
            <Button onClick={() => navigate("/processos-gerencia")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar processos da pasta
  const processosDaPasta = useMemo(() => {
    return processosMock.filter(pastaAtual.filtro);
  }, [pastaAtual]);

  // Aplicar filtros
  const processosFiltrados = useMemo(() => {
    return processosDaPasta.filter(processo => {
      const matchSearch = searchTerm === "" || 
        processo.numeroProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        processo.objeto.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchEtapa = etapaFilter === "todos" || processo.etapaAtual === etapaFilter;
      const matchSituacao = situacaoFilter === "todos" || processo.situacao === situacaoFilter;
      const matchRegime = regimeFilter === "todos" || processo.regimeTramitacao === regimeFilter;
      
      return matchSearch && matchEtapa && matchSituacao && matchRegime;
    });
  }, [processosDaPasta, searchTerm, etapaFilter, situacaoFilter, regimeFilter]);

  // Paginação
  const totalPages = Math.ceil(processosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const processosPaginados = processosFiltrados.slice(startIndex, endIndex);

  // Opções de filtro
  const etapasUnicas = [...new Set(processosDaPasta.map(p => p.etapaAtual))];
  const situacoesUnicas = [...new Set(processosDaPasta.map(p => p.situacao))];
  const regimesUnicos = [...new Set(processosDaPasta.map(p => p.regimeTramitacao))];

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Topbar />
      <div className="pt-20 w-full px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <ReturnButton variant="outline" className="gap-2" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pastaAtual.nome}</h1>
              <p className="text-gray-600">{pastaAtual.descricao}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total de processos</p>
              <p className="text-2xl font-bold text-gray-900">{processosFiltrados.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Última modificação</p>
              <p className="text-sm text-gray-600">{pastaAtual.ultimaModificacao}</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por número ou objeto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro Etapa */}
              <Select value={etapaFilter} onValueChange={setEtapaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Etapa Atual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as etapas</SelectItem>
                  {etapasUnicas.map(etapa => (
                    <SelectItem key={etapa} value={etapa}>{etapa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro Situação */}
              <Select value={situacaoFilter} onValueChange={setSituacaoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Situação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as situações</SelectItem>
                  {situacoesUnicas.map(situacao => (
                    <SelectItem key={situacao} value={situacao}>{situacao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro Regime */}
              <Select value={regimeFilter} onValueChange={setRegimeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Regime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os regimes</SelectItem>
                  {regimesUnicos.map(regime => (
                    <SelectItem key={regime} value={regime}>{regime}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Botão Limpar Filtros */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setEtapaFilter("todos");
                  setSituacaoFilter("todos");
                  setRegimeFilter("todos");
                  setCurrentPage(1);
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Processos */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Processos na Pasta</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {processosPaginados.length > 0 ? (
              <>
                <div className="border border-gray-200/60 rounded-lg overflow-hidden bg-white shadow-sm w-full">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <TableRow>
                        <TableHead className="w-12 py-3"></TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Processo</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Objeto</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Etapa Atual</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Próxima Etapa</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Prazo</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Regime</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3">Situação</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700 py-3">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processosPaginados.map((processo, index) => (
                        <TableRow key={processo.id} className={`hover:bg-blue-50/30 transition-colors border-b border-gray-100/60 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                          <TableCell className="py-3">
                            <ParticipationIcon type={processo.tipoParticipacao} />
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="font-semibold text-gray-800">{processo.numeroProcesso}</div>
                          </TableCell>
                          <TableCell className="py-3">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="max-w-xs truncate text-gray-600 font-medium cursor-help">
                                    {processo.objeto}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{processo.objeto}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge variant="outline" className="text-xs">{processo.etapaAtual}</Badge>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="text-sm text-gray-600">{processo.proximaEtapa || "-"}</span>
                          </TableCell>
                          <TableCell className="py-3">
                            <PrazoDisplay prazo={processo.prazoEtapaAtual} />
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <RegimeBadge regime={processo.regimeTramitacao} />
                              {processo.regimeTramitacao === "Urgente" && (
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <StatusBadge status={processo.situacao} />
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <div className="flex items-center justify-end gap-2">
                              <AnexosIcon temAnexos={processo.temAnexos} />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg" 
                                      onClick={() => navigate(`/processos/${processo.id}`)}
                                    >
                                      <Eye className="w-5 h-5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Ver detalhes do processo</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum processo encontrado</h3>
                <p className="text-gray-500">Não há processos nesta pasta com os filtros aplicados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}