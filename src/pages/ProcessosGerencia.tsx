import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MultiSelectField from "@/components/MultiSelectField";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Eye,
  Plus,
  PlayCircle,
  UserCheck,
  Archive,
  Download,
  FileClock,
  CircleDot,
  CheckCircle2,
  XCircle,
  Clock,
  BookUser,
  Users,
  Folder,
  Calendar,
  FileX,
  ArrowRight,
  History,
  Building2,
  Target,
  ChevronRight,
  Filter,
  ChevronDown,
  BarChart3,
  FilePlus,
  Activity,
  FileText,
  Paperclip,
  AlertTriangle,
  User,
  PenLine,
  FileSignature
} from "lucide-react";
import Topbar from "@/components/Topbar";
import GerenciarPastasModal from "@/components/GerenciarPastasModal";
import { usePastasOrganizacionais } from "@/hooks/usePastasOrganizacionais";
import { formatarNumeroProcesso } from "@/lib/processoUtils";

// Tipos
type ProcessStatus = "em_andamento" | "pendente" | "atrasado" | "concluido" | "cancelado";
type ProcessType = "DFD" | "ETP" | "Matriz de Risco" | "TR" | "Edital";
type ProcessPhase = "Elaboração da FD" | "Assinatura ETP" | "Matriz de Risco" | "TR" | "Edital" | "Publicação" | "Análise" | "Aprovação";
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
  {
    id: "1",
    numeroProcesso: "Processo administrativo 001/2024",
    tipoProcesso: "DFD",
    objeto: "Aquisição de Equipamentos Médicos para UTI",
    etapaAtual: "Elaboração da FD",
    proximaEtapa: "Assinatura da FD",
    prazoEtapaAtual: "30/01/2024",
    responsavelAtual: "João Silva - GSP",
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
    responsavelAtual: "Maria Santos - GECON",
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
    numeroProcesso: "Processo administrativo 001/2024",
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
    responsavelAtual: "Ana Costa - GECON",
    regimeTramitacao: "Prioritário",
    situacao: "em_andamento",
    ano: "2024",
    tipoParticipacao: "responsavel",
    gerenciaResponsavel: "GECON",  
    dataCriacao: "20/01/2024",
    ultimaAtualizacao: "26/01/2024",
    prazoFinal: "15/02/2024",
    temAnexos: false
  },
  {
    id: "5",
    numeroProcesso: "Processo administrativo 002/2023",
    tipoProcesso: "ETP",
    objeto: "Contratação de Segurança Patrimonial",
    etapaAtual: "Publicação",
    proximaEtapa: "Arquivamento",
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
    etapaAtual: "Análise",
    proximaEtapa: "Cancelamento",
    prazoEtapaAtual: "15/11/2023",
    responsavelAtual: "Lucia Ferreira - GECON",
    regimeTramitacao: "Normal",
    situacao: "cancelado",
    ano: "2023",
    tipoParticipacao: "criador",
    gerenciaResponsavel: "GECON",
    dataCriacao: "05/10/2023",
    ultimaAtualizacao: "30/11/2023",
    prazoFinal: "15/11/2023",
    temAnexos: false
  },
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

// Pastas organizacionais
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
    },
  };
  const variant = variants[regime];
  return (
    <Badge className={`${variant.color} border font-medium flex items-center gap-2 px-2 py-1 rounded-full text-xs`}>
      <div className={`w-1.5 h-1.5 rounded-full ${variant.dot}`}></div>
      {variant.label}
    </Badge>
  );
}

function ParticipationIcon({ type }: { type: ParticipationType }) {
  const config = {
    criador: { icon: <Target className="w-4 h-4" />, color: "text-green-600", tooltip: "Criador do processo" },
    responsavel: { icon: <UserCheck className="w-4 h-4" />, color: "text-blue-600", tooltip: "Responsável por etapa" },
    participante: { icon: <BookUser className="w-4 h-4" />, color: "text-gray-600", tooltip: "Participante histórico" }
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

// Componente para Badge de Tipo de Processo
function TipoProcessoBadge({ tipo }: { tipo: string }) {
  const getBadgeStyle = (tipo: string) => {
    switch (tipo) {
      case "DFD":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "ETP":
        return "bg-green-100 text-green-700 border-green-200";
      case "TR":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "PJUR":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Badge variant="outline" className={`text-xs font-medium ${getBadgeStyle(tipo)}`}>
      {tipo}
    </Badge>
  );
}

// Componente para exibir prazo com cores baseadas na urgência
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

// Componente para exibir responsável com avatar
function ResponsavelDisplay({ responsavel }: { responsavel: string }) {
  const nome = responsavel.split(' - ')[0];
  const cargo = responsavel.split(' - ')[1];
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
        <User className="w-3 h-3 text-blue-600" />
      </div>
      <div className="text-sm">
        <div className="font-medium text-gray-800">{nome}</div>
        <div className="text-xs text-gray-500">{cargo}</div>
      </div>
    </div>
  );
}

// Componente para ícone de anexos
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

// Componente para Card de Pasta Organizacional
function PastaCard({ pasta }: { pasta: PastaOrganizacional }) {
  const navigate = useNavigate();
  const { atualizarUltimoAcesso } = usePastasOrganizacionais();
  
  const handlePastaClick = () => {
    // Atualizar a data de último acesso antes de navegar
    atualizarUltimoAcesso(pasta.id);
    navigate(`/processos-gerencia/pasta/${pasta.id}`);
  };
  
  return (
    <Card 
      className="bg-white border border-gray-200/60 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={handlePastaClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-gray-50/50 text-gray-600 group-hover:bg-gray-100/50 transition-colors">
            {pasta.icone}
          </div>
          <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2 text-gray-800">{pasta.nome}</h3>
          <p className="text-sm text-gray-600 mb-3">{pasta.descricao}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{pasta.quantidadeProcessos} processos</span>
            <span className="text-gray-500">Atualizado em {pasta.ultimaModificacao}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para Card de Participação Atual (compacto)
function ParticipacaoAtualCard({ processo }: { processo: ProcessoGerencia }) {
  const navigate = useNavigate();
  
  return (
    <Card className="hover:shadow-sm transition-shadow border-gray-200/60">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <ParticipationIcon type={processo.tipoParticipacao} />
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">{processo.numeroProcesso}</h4>
              <p className="text-xs text-gray-500 truncate max-w-48">{processo.objeto}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="text-xs mb-1">{processo.etapaAtual}</Badge>
            <p className="text-xs text-gray-500">{processo.ano}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RegimeBadge regime={processo.regimeTramitacao} />
            <StatusBadge status={processo.situacao} />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-blue-600"
                  onClick={() => navigate(`/processos/${processo.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver detalhes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para Card de Estatística Rápida
function EstatisticaCard({ titulo, quantidade, icone, descricao }: {
  titulo: string;
  quantidade: number;
  icone: JSX.Element;
  descricao: string;
}) {
  return (
    <Card className="bg-white border border-gray-200/60 hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gray-50/50 text-gray-600">
            {icone}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{quantidade}</p>
            <p className="text-sm text-gray-500">total</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1 text-gray-800">{titulo}</h3>
          <p className="text-sm text-gray-600">{descricao}</p>
        </div>
      </CardContent>
    </Card>
  );
}



// Componente para Card de Acesso Rápido
function AcessoRapidoCard({ titulo, descricao, icone, quantidade, rota }: {
  titulo: string;
  descricao: string;
  icone: JSX.Element;
  quantidade: number;
  rota: string;
}) {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-white border border-gray-200/60 hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => navigate(rota)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-4 rounded-xl bg-gray-50/50 text-gray-600 group-hover:bg-gray-100/50 transition-colors">
            {icone}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{quantidade}</p>
            <p className="text-sm text-gray-500">processos</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-xl mb-2 text-gray-800">{titulo}</h3>
          <p className="text-sm text-gray-600 mb-4">{descricao}</p>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-gray-900">
            <span>Acessar lista completa</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para Tabela Completa de Processos
function ProcessTableComplete({ processos }: { processos: ProcessoGerencia[] }) {
  const navigate = useNavigate();

  if (processos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Archive className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum processo encontrado</h3>
        <p className="text-gray-500">Não há processos nesta categoria no momento.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200/60 rounded-lg overflow-hidden bg-white shadow-sm">
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
          {processos.map((processo, index) => (
            <TableRow key={processo.id} className={`hover:bg-blue-50/30 transition-colors border-b border-gray-100/60 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
              <TableCell className="py-3"><ParticipationIcon type={processo.tipoParticipacao} /></TableCell>
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
  );
}



// Componente para Filtros Avançados
function AdvancedFiltersSection({ filters, onFilterChange }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/60 shadow-sm mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por número do processo ou objeto..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
            className="pl-10 h-10 bg-gray-50/50 border-gray-200/60 rounded-lg text-gray-700 placeholder:text-gray-400 focus:bg-white transition-colors"
          />
        </div>
        
        <Select value={filters.yearFilter} onValueChange={(v) => onFilterChange('yearFilter', v)}>
          <SelectTrigger className="w-32 h-10">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os anos</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.statusFilter} onValueChange={(v) => onFilterChange('statusFilter', v)}>
          <SelectTrigger className="w-40 h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.regimeFilter} onValueChange={(v) => onFilterChange('regimeFilter', v)}>
          <SelectTrigger className="w-40 h-10">
            <SelectValue placeholder="Regime" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Regimes</SelectItem>
            <SelectItem value="Normal">Normal</SelectItem>
            <SelectItem value="Urgente">Urgente</SelectItem>
            <SelectItem value="Prioritário">Prioritário</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2 h-10 px-4 border-gray-200/60 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>
    </div>
  );
}

function CreateProcessModal() {
  // Dados mockados para gerências
  const gerencias = [
    { value: "GSP", label: "GSP - Gerência de Soluções e Projetos" },
    { value: "GSL", label: "GSL - Gerência de Suprimentos e Logística" },
    { value: "GRH", label: "GRH - Gerência de Recursos Humanos" },
    { value: "GUE", label: "GUE - Gerência de Urgência e Emergência" },
    { value: "GLC", label: "GLC - Gerência de Licitações e Contratos" },
    { value: "GFC", label: "GFC - Gerência Financeira e Contábil" },
    { value: "GTEC", label: "GTEC - Gerência de Tecnologia da Informação" },
    { value: "GAP", label: "GAP - Gerência de Administração e Patrimônio" },
    { value: "GESP", label: "GESP - Gerência de Especialidades" },
  ];

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    numeroProcesso: "",
    objetoProcesso: "",
    gerenciaCriadora: "GTEC - Gerência de Tecnologia da Informação", // Mock baseado no perfil
    gerenciasEnvolvidas: [] as string[],
    anoProcesso: new Date().getFullYear().toString(),
    tipoTramitacao: "",
    comentariosIniciais: "",
  });

  // Contador de palavras para o objeto do processo
  const contarPalavras = (texto: string) => {
    return texto.trim().split(/\s+/).filter(palavra => palavra.length > 0).length;
  };

  const palavrasObjeto = contarPalavras(formData.objetoProcesso);
  const navigate = useNavigate();

  // Gerar número do processo ao abrir o modal
  useEffect(() => {
    if (open) {
      const gerarNumeroProcesso = () => {
        const anoAtual = new Date().getFullYear();
        
        // Filtrar processos do ano atual
        const processosAnoAtual = processosMock.filter(p => p.ano === anoAtual.toString());
        
        if (processosAnoAtual.length === 0) {
          // Se não há processos no ano atual, começar com 001
          return `001/${anoAtual}`;
        }
        
        // Extrair números dos processos existentes e encontrar o maior
        const numeros = processosAnoAtual.map(p => {
          const match = p.numeroProcesso.match(/^(\d+)\/\d+$/);
          return match ? parseInt(match[1]) : 0;
        });
        
        const maiorNumero = Math.max(...numeros);
        const proximoNumero = maiorNumero + 1;
        
        return `${String(proximoNumero).padStart(3, '0')}/${anoAtual}`;
      };
      
      setFormData(prev => ({
        ...prev,
        numeroProcesso: gerarNumeroProcesso()
      }));
    }
  }, [open]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreate = () => {
    // Gerar ID único para o novo processo
    const novoId = `processo_${Date.now()}`;
    
    // Função para gerar número do processo subsequente
    const gerarNumeroProcesso = () => {
      const anoAtual = new Date().getFullYear();
      
      // Filtrar processos do ano atual
      const processosAnoAtual = processosMock.filter(p => p.ano === anoAtual.toString());
      
      if (processosAnoAtual.length === 0) {
        // Se não há processos no ano atual, começar com 001
        return `001/${anoAtual}`;
      }
      
      // Extrair números dos processos existentes e encontrar o maior
      const numeros = processosAnoAtual.map(p => {
        const match = p.numeroProcesso.match(/^(\d+)\/\d+$/);
        return match ? parseInt(match[1]) : 0;
      });
      
      const maiorNumero = Math.max(...numeros);
      const proximoNumero = maiorNumero + 1;
      
      return `${String(proximoNumero).padStart(3, '0')}/${anoAtual}`;
    };
    
    const numeroProcesso = gerarNumeroProcesso();
    
    // Criar processo vazio com dados padrão
    const novoProcesso = {
      id: novoId,
      numeroProcesso: numeroProcesso,
      objeto: formData.objetoProcesso || "Processo em construção",
      status: "em_andamento" as const,
      prazoFinal: "",
      gerenciaResponsavel: "GTEC - Gerência de Tecnologia da Informação",
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      criador: "Usuário Atual",
      situacaoAtual: "Em construção",
      etapaAtual: "Aguardando Elaboração do DFD",
      diasUteisConsumidos: 0,
      tipoTramitacao: formData.tipoTramitacao,
      gerenciasEnvolvidas: formData.gerenciasEnvolvidas
    };
    
    // Em um sistema real, aqui seria feita a chamada para a API
    console.log('Novo processo criado:', novoProcesso);
    
    // Redirecionar para a tela de detalhes do processo
    navigate(`/processo/${novoId}`);
    setOpen(false);
  };

  const isFormValid = () => {
    return formData.objetoProcesso.trim() !== "" && 
           formData.tipoTramitacao !== "" &&
           formData.gerenciasEnvolvidas.length > 0;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105">
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Processo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[80vw] p-0 bg-white rounded-2xl shadow-xl border-0">
        <DialogTitle className="sr-only">Criar Novo Processo</DialogTitle>
        <DialogDescription className="sr-only">
          Inicie um novo processo administrativo com fluxo completo
        </DialogDescription>
        
        {/* Header com botão de fechar */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Criar Novo Processo</h2>
              <p className="text-gray-600 text-sm mt-1">
                Inicie um novo processo administrativo com fluxo completo
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-full hover:bg-gray-100"
          >
            <XCircle className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Conteúdo do formulário */}
        <div className="px-8 py-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* Grid principal - 2 colunas em telas grandes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Número do Processo */}
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-900">
                  Número do Processo
                </label>
                <div className="relative">
                  <Input 
                    value={formData.numeroProcesso || "078/2025"}
                    disabled
                    className="h-12 bg-gray-50 text-gray-700 cursor-not-allowed font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <span className="text-xs text-gray-500">Automático</span>
                  </div>
                </div>
              </div>

              {/* Gerência Criadora */}
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-900">
                  Gerência Criadora
                </label>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900">
                        Gerência: GTEC
                      </p>
                      <p className="text-sm text-blue-700">
                        Gerência de Tecnologia da Informação
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipo de Tramitação */}
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-900">
                  Tipo de Tramitação *
                </label>
                <Select 
                  value={formData.tipoTramitacao} 
                  onValueChange={(value) => handleInputChange("tipoTramitacao", value)}
                >
                  <SelectTrigger className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-200">
                    <SelectValue placeholder="Selecione o tipo de tramitação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordinaria">Ordinária</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="prioritaria">Prioritária</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* Ano do Processo */}
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-900">
                  Ano do Processo
                </label>
                <Input 
                  value={formData.anoProcesso}
                  disabled
                  className="h-12 bg-gray-50 text-gray-700 cursor-not-allowed font-medium"
                />
              </div>

              {/* Outras Gerências */}
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-900">
                  Outras Gerências que podem participar *
                </label>
                <MultiSelectField
                  label="Outras gerências participantes"
                  name="gerenciasEnvolvidas"
                  value={formData.gerenciasEnvolvidas}
                  onChange={(value) => handleInputChange("gerenciasEnvolvidas", value)}
                  options={gerencias.filter(g => g.value !== "GTEC")}
                  placeholder="Selecione as gerências participantes"
                />
              </div>
            </div>
          </div>

          {/* Objeto do Processo - Largura Total */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-900">
              Objeto do Processo *
            </label>
            <div className="relative">
              <Textarea 
                placeholder="Descreva o objeto da contratação" 
                value={formData.objetoProcesso} 
                onChange={(e) => handleInputChange("objetoProcesso", e.target.value)}
                className="min-h-[120px] resize-none border-2 border-gray-300 focus:border-green-500 focus:ring-green-200 transition-colors"
              />
            </div>
          </div>
        </div>
        {/* Divisor e Botões */}
        <div className="border-t border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)} 
              className="px-8 py-3 bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 font-medium"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!isFormValid()} 
              className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              Iniciar Processo
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProcessosGerencia() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    searchTerm: "",
    yearFilter: "todos",
    statusFilter: "todos",
    regimeFilter: "todos",
  });
  const navigate = useNavigate();
  const { pastas, setPastas, atualizarUltimoAcesso } = usePastasOrganizacionais();

  // Inicializar pastas com dados padrão se não existirem
  React.useEffect(() => {
    if (pastas.length === 0) {
      setPastas(pastasOrganizacionais);
    }
  }, [pastas.length, setPastas]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({...prev, [key]: value}));
  };

  // Filtrar processos por participação atual (responsável pela etapa) - apenas processos em andamento
  const participacoesAtuais = useMemo(() => {
    return processosMock.filter(p => 
      p.tipoParticipacao === "responsavel" && 
      p.situacao !== "concluido" && 
      p.situacao !== "cancelado"
    )
    .filter(processo => 
      processo.numeroProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.objeto.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Filtrar todos os processos para a tabela completa
  const filteredProcessos = useMemo(() => {
    return processosMock.filter(processo => {
      const { searchTerm: filterSearch, yearFilter, statusFilter, regimeFilter } = filters;
      const matchesSearch = processo.numeroProcesso.toLowerCase().includes(filterSearch.toLowerCase()) ||
                           processo.objeto.toLowerCase().includes(filterSearch.toLowerCase());
      const matchesYear = yearFilter === "todos" || processo.ano === yearFilter;
      const matchesStatus = statusFilter === "todos" || processo.situacao === statusFilter;
      const matchesRegime = regimeFilter === "todos" || processo.regimeTramitacao === regimeFilter;

      return matchesSearch && matchesYear && matchesStatus && matchesRegime;
    });
  }, [filters]);

  // Separar por tipo de participação para as abas
  const processosIniciados = filteredProcessos.filter(p => p.tipoParticipacao === "criador");
  const processosParticipando = filteredProcessos.filter(p => p.tipoParticipacao === "responsavel");
  const processosHistorico = filteredProcessos.filter(p => p.tipoParticipacao === "participante");

  // Estatísticas para os cards rápidos
  const totalIniciados = processosMock.filter(p => p.tipoParticipacao === "criador").length;
  const totalAtivos = processosMock.filter(p => p.situacao === "em_andamento").length;
  const totalArquivados = processosMock.filter(p => p.situacao === "concluido" || p.situacao === "cancelado").length;
  const totalHistorico = processosMock.filter(p => p.tipoParticipacao === "participante").length;

  // Cálculos para os novos cards de acesso rápido
  const processosComPrazosProximos = processosMock.filter(processo => {
    const hoje = new Date();
    const prazoDate = new Date(processo.prazoEtapaAtual.split('/').reverse().join('-'));
    const diasRestantes = Math.ceil((prazoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 5 && diasRestantes >= 0 && processo.situacao !== "concluido" && processo.situacao !== "cancelado";
  });

  const processosAtrasados = processosMock.filter(processo => {
    const hoje = new Date();
    const prazoDate = new Date(processo.prazoEtapaAtual.split('/').reverse().join('-'));
    const diasRestantes = Math.ceil((prazoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes < 0 && processo.situacao !== "concluido" && processo.situacao !== "cancelado";
  });

  // Mock para assinaturas pendentes (em um sistema real, isso viria da API)
  const assinaturasPendentes = processosMock.filter(processo => 
    processo.etapaAtual.includes("Assinatura") && processo.situacao === "em_andamento"
  );

  return (
    <div className="min-h-screen w-full bg-gray-50/30 flex flex-col">
      <Topbar />
      
                            <main className="flex-1 pt-20 px-6 md:px-8 pb-12 bg-gray-50/30 w-full">
                                {/* Header */}
                        <div className="mb-8">
                          {/* Título principal */}
                          <div className="text-center w-full mb-4">
                            <h1 className="text-3xl font-bold text-primary flex items-center justify-center">
                              <Building2 className="w-8 h-8 mr-3 text-blue-500" />
                              Processos da Gerência
                            </h1>
                          </div>
                          
                          {/* Subtítulo */}
                          <div className="text-center mb-6">
                            <p className="text-sm text-muted-foreground">
                              Organize, monitore e gerencie todos os processos da sua gerência
                            </p>
                          </div>
                          
                          {/* Botão de criar processo */}
                          <div className="flex justify-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <CreateProcessModal />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Iniciar novo processo administrativo com fluxo completo</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                                                {/* Layout em 4 Seções Reorganizadas */}
                        <div className="space-y-10">

                          {/* 1. ACESSO RÁPIDO */}
                          <section className="bg-emerald-50/30 rounded-xl border border-emerald-100/50 shadow-sm p-8">
                            {/* Título da Seção */}
                            <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 rounded-xl">
                                  <Building2 className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                  <h2 className="text-2xl font-semibold text-primary mb-1">Acesso Rápido</h2>
                                  <p className="text-gray-600">Navegue rapidamente para listas específicas</p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <AcessoRapidoCard
                                titulo="Prazos Próximos"
                                descricao="Visualize os processos com etapas que vencem nos próximos 5 dias"
                                icone={<Clock className="w-8 h-8" />}
                                quantidade={processosComPrazosProximos.length}
                                rota="/processos-gerencia/prazos-proximos"
                              />
                              
                              <AcessoRapidoCard
                                titulo="Processos Atrasados"
                                descricao="Veja todos os processos com etapas em atraso na sua gerência"
                                icone={<AlertTriangle className="w-8 h-8" />}
                                quantidade={processosAtrasados.length}
                                rota="/processos-gerencia/atrasados"
                              />
                              
                              <AcessoRapidoCard
                                titulo="Assinaturas Pendentes"
                                descricao="Acesse todos os processos que aguardam assinatura da sua gerência"
                                icone={<FileSignature className="w-8 h-8" />}
                                quantidade={assinaturasPendentes.length}
                                rota="/processos-gerencia/assinaturas-pendentes"
                              />
                            </div>
                          </section>

                          {/* 2. PARTICIPAÇÕES ATUAIS */}
                          <section className="bg-blue-50/30 rounded-xl border border-blue-100/50 shadow-sm p-8">
                            {/* Título da Seção */}
                            <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                  <UserCheck className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h2 className="text-2xl font-semibold text-primary mb-1">Participações Atuais</h2>
                                  <p className="text-gray-600">Processos em que você está participando ativamente</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-sm font-medium bg-white">
                                {participacoesAtuais.length} processos
                              </Badge>
                            </div>

                            {/* Barra de busca para participações */}
                            <div className="mb-6">
                              <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                  placeholder="Buscar nas participações atuais..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="pl-10 border-gray-200/60 bg-white"
                                />
                              </div>
                            </div>

                            {/* Tabela Completa de Participações Atuais */}
                            {participacoesAtuais.length > 0 ? (
                              <ProcessTableComplete processos={participacoesAtuais} />
                            ) : (
                              <Card className="p-8 text-center border-dashed border-2 border-gray-300 bg-white">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                  <UserCheck className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma participação encontrada</h3>
                                <p className="text-gray-500">Não há processos em que você esteja participando atualmente.</p>
                              </Card>
                            )}
                          </section>

                          {/* 3. PASTAS ORGANIZACIONAIS */}
                          <section className="bg-slate-50/40 rounded-xl border border-slate-100/50 shadow-sm p-8 ring-1 ring-slate-200/30">
                                                        {/* Título da Seção */}
                            <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 rounded-xl">
                                  <Folder className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                  <h2 className="text-2xl font-semibold text-primary mb-1">Pastas Organizacionais</h2>
                                  <p className="text-gray-600">Organize seus processos por categorias e períodos</p>
                                </div>
                              </div>
                              <GerenciarPastasModal 
                                pastas={pastas}
                                onAdicionarPasta={(novaPasta) => {
                                  // Implementar lógica de adicionar pasta
                                  console.log('Adicionar pasta:', novaPasta);
                                }}
                                onEditarPasta={(id, pasta) => {
                                  // Implementar lógica de editar pasta
                                  console.log('Editar pasta:', id, pasta);
                                }}
                                onExcluirPasta={(id) => {
                                  // Implementar lógica de excluir pasta
                                  console.log('Excluir pasta:', id);
                                }}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                          {pastas.map((pasta) => (
                              <PastaCard key={pasta.id} pasta={pasta} />
                            ))}
                            </div>
                          </section>

                          {/* 4. ESTATÍSTICAS GERAIS */}
                          <section className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 rounded-xl border border-gray-100/50 shadow-sm p-8">
                            <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                  <BarChart3 className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h2 className="text-2xl font-semibold text-primary mb-1">Estatísticas Gerais</h2>
                                  <p className="text-gray-600">Visão geral dos processos da gerência</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <EstatisticaCard
                                titulo="Processos Iniciados"
                                quantidade={totalIniciados}
                                icone={<FilePlus className="w-6 h-6" />}
                                descricao="Total de processos criados pela gerência"
                              />
                              <EstatisticaCard
                                titulo="Processos Ativos"
                                quantidade={totalAtivos}
                                icone={<Activity className="w-6 h-6" />}
                                descricao="Processos em andamento atualmente"
                              />
                              <EstatisticaCard
                                titulo="Processos Arquivados"
                                quantidade={totalArquivados}
                                icone={<Archive className="w-6 h-6" />}
                                descricao="Processos concluídos ou cancelados"
                              />
                            </div>
                          </section>

        </div>
      </main>
    </div>
  );
} 