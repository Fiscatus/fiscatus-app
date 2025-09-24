import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  AlertCircle,
  FileText,
  ClipboardList,
  Eye,
  PenLine,
  Calendar,
  Users,
  History,
  Download,
  Share2,
  MoreHorizontal,
  Filter,
  CalendarDays,
  User,
  Settings,
  BarChart3,
  SortAsc,
  SortDesc
} from "lucide-react";
import Topbar from "@/components/Topbar";
import { useUser, mockUsers } from "@/contexts/UserContext";
import { formatarNumeroProcesso } from "@/lib/processoUtils";

// Tipos
type ProcessStatus = "em_andamento" | "pendente" | "atrasado" | "concluido";
type ProcessType = "Pregão" | "Dispensa" | "Inexigibilidade" | "Concorrência" | "Credenciamento";
type ProcessPhase = "Elaboração DFD" | "Assinatura ETP" | "Matriz de Risco" | "TR" | "Edital" | "Publicação";
type UserAction = "Assinar" | "Corrigir" | "Analisar" | "Nenhuma";

interface Process {
  id: string;
  numeroProcesso: string;
  tipo: ProcessType;
  faseAtual: ProcessPhase;
  prazoFinal: string;
  status: ProcessStatus;
  pendenciaUsuario: UserAction;
  objeto: string;
  responsavel: string;
  dataCriacao: string;
  ultimaAtualizacao: string;
}

// Dados mockados
const processosMock: Process[] = [
  {
    id: "1",
    numeroProcesso: "Processo administrativo 012/2025",
    tipo: "Pregão",
    faseAtual: "Elaboração DFD",
    prazoFinal: "30/01/2025",
    status: "em_andamento",
    pendenciaUsuario: "Assinar",
    objeto: "Aquisição de Equipamentos Médicos para UTI",
    responsavel: "Dr. Maria Silva",
    dataCriacao: "15/01/2025",
    ultimaAtualizacao: "25/01/2025"
  },
  {
    id: "2",
    numeroProcesso: "Processo administrativo 045/2025",
    tipo: "Dispensa",
    faseAtual: "Assinatura ETP",
    prazoFinal: "25/01/2025",
    status: "atrasado",
    pendenciaUsuario: "Corrigir",
    objeto: "Estudo Técnico Preliminar - Serviços de Limpeza Hospitalar",
    responsavel: "Eng. João Santos",
    dataCriacao: "10/01/2025",
    ultimaAtualizacao: "24/01/2025"
  },
  {
    id: "3",
    numeroProcesso: "Processo administrativo 001/2025",
    tipo: "Concorrência",
    faseAtual: "TR",
    prazoFinal: "20/02/2025",
    status: "concluido",
    pendenciaUsuario: "Nenhuma",
    objeto: "Contratação de Consultoria Especializada",
    responsavel: "Andressa Sterfany Santos da Silva",
    dataCriacao: "05/01/2025",
    ultimaAtualizacao: "20/01/2025"
  },
  {
    id: "4",
    numeroProcesso: "Processo administrativo 052/2025",
    tipo: "Inexigibilidade",
    faseAtual: "Matriz de Risco",
    prazoFinal: "05/02/2025",
    status: "em_andamento",
    pendenciaUsuario: "Analisar",
    objeto: "Estudo Técnico - Aquisição de Medicamentos Especializados",
    responsavel: "Lucas Moreira Brito",
    dataCriacao: "12/01/2025",
    ultimaAtualizacao: "22/01/2025"
  },
  {
    id: "5",
    numeroProcesso: "Processo administrativo 015/2025",
    tipo: "Credenciamento",
    faseAtual: "Edital",
    prazoFinal: "20/02/2025",
    status: "concluido",
    pendenciaUsuario: "Nenhuma",
    objeto: "Serviços de TI e Infraestrutura",
    responsavel: "Leticia Bonfim Guilherme",
    dataCriacao: "08/01/2025",
    ultimaAtualizacao: "18/01/2025"
  },
  {
    id: "6",
    numeroProcesso: "Processo administrativo 038/2025",
    tipo: "Dispensa",
    faseAtual: "Publicação",
    prazoFinal: "10/01/2025",
    status: "atrasado",
    pendenciaUsuario: "Assinar",
    objeto: "Manutenção Predial e Serviços Gerais",
    responsavel: "Lucas Moreira Brito",
    dataCriacao: "03/01/2025",
    ultimaAtualizacao: "12/01/2025"
  },
  {
    id: "7",
    numeroProcesso: "Processo administrativo 023/2025",
    tipo: "Pregão",
    faseAtual: "Matriz de Risco",
    prazoFinal: "28/01/2025",
    status: "pendente",
    pendenciaUsuario: "Corrigir",
    objeto: "Análise de Riscos - Projeto de Expansão Hospitalar",
    responsavel: "Dr. Roberto Alves",
    dataCriacao: "14/01/2025",
    ultimaAtualizacao: "23/01/2025"
  },
  {
    id: "8",
    numeroProcesso: "Processo administrativo 019/2025",
    tipo: "Concorrência",
    faseAtual: "TR",
    prazoFinal: "08/02/2025",
    status: "em_andamento",
    pendenciaUsuario: "Assinar",
    objeto: "Termo de Referência - Serviços de Segurança",
    responsavel: "Cap. Luiz Silva",
    dataCriacao: "16/01/2025",
    ultimaAtualizacao: "24/01/2025"
  }
];



// Componente para Status Badge
function StatusBadge({ status }: { status: ProcessStatus }) {
  const statusConfig = {
    em_andamento: { label: "Em andamento", className: "bg-blue-100 text-blue-800 border-blue-200" },
    pendente: { label: "Pendente", className: "bg-orange-100 text-orange-800 border-orange-200" },
    atrasado: { label: "Atrasado", className: "bg-red-100 text-red-800 border-red-200" },
    concluido: { label: "Concluído", className: "bg-green-100 text-green-800 border-green-200" }
  };

  const config = statusConfig[status];
  
  return (
    <Badge className={`${config.className} border text-xs font-medium`}>
      {config.label}
    </Badge>
  );
}

// Componente para Prazo Badge
function PrazoBadge({ prazo }: { prazo: string }) {
  const hoje = new Date();
  const prazoDate = new Date(prazo.split('/').reverse().join('-'));
  const diffTime = prazoDate.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let className = "bg-green-100 text-green-800 border-green-200";
  let icon = <CheckCircle className="w-3 h-3" />;

  if (diffDays < 0) {
    className = "bg-red-100 text-red-800 border-red-200";
    icon = <AlertTriangle className="w-3 h-3" />;
  } else if (diffDays <= 3) {
    className = "bg-yellow-100 text-yellow-800 border-yellow-200";
    icon = <Clock className="w-3 h-3" />;
  }

  return (
    <Badge className={`${className} border flex items-center gap-1 text-xs font-medium`}>
      {icon}
      {prazo}
    </Badge>
  );
}

// Componente para Pendência com Botão de Ação
function PendenciaActionButton({ pendencia, onAction, processId }: { 
  pendencia: UserAction; 
  onAction: (processId: string, action: string) => void;
  processId: string;
}) {
  if (pendencia === "Nenhuma") {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs font-medium">
        <CheckCircle className="w-3 h-3 mr-1" />
        Sem pendência
      </Badge>
    );
  }

  const config = {
    "Assinar": { 
      className: "bg-blue-600 hover:bg-blue-700 text-white", 
      icon: <PenLine className="w-3 h-3" />
    },
    "Corrigir": { 
      className: "bg-red-600 hover:bg-red-700 text-white", 
      icon: <AlertTriangle className="w-3 h-3" />
    },
    "Analisar": { 
      className: "bg-purple-600 hover:bg-purple-700 text-white", 
      icon: <Eye className="w-3 h-3" />
    }
  };

  const selectedConfig = config[pendencia as keyof typeof config];

  return (
    <Button
      size="sm"
      onClick={() => onAction(processId, pendencia)}
      className={`${selectedConfig.className} text-xs h-8 px-3 font-medium`}
    >
      {selectedConfig.icon && <span className="mr-1">{selectedConfig.icon}</span>}
      {pendencia}
    </Button>
  );
}



// Componente para Action Button (apenas Ver Detalhes)
function ActionButton({ process, onVerDetalhes }: { 
  process: Process; 
  onVerDetalhes: (process: Process) => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onVerDetalhes(process)}
      className="text-xs h-8 px-3 font-medium"
    >
      <Eye className="w-3 h-3 mr-1" />
      Ver Detalhes
    </Button>
  );
}

// Componente para Process List Header
function ProcessListHeader({ estatisticas, navigate }: { estatisticas: any; navigate: any }) {
  return (
    <div className="mb-6">
      {/* Cabeçalho Principal */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Meus Processos</h1>
        <p className="text-gray-600 text-sm">Acompanhe seus processos em todas as fases do planejamento</p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-md rounded-xl border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
                <p className="text-xs text-gray-600 mt-1">Total</p>
              </div>
              <ClipboardList className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md rounded-xl border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{estatisticas.comPendencia}</p>
                <p className="text-xs text-gray-600 mt-1">Com Pendência</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md rounded-xl border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{estatisticas.atrasados}</p>
                <p className="text-xs text-gray-600 mt-1">Atrasados</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md rounded-xl border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{estatisticas.vencendo}</p>
                <p className="text-xs text-gray-600 mt-1">Vencendo</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente para Process Filter Bar
function ProcessFilterBar({ 
  searchTerm, 
  tipoFilter, 
  statusFilter, 
  pendenciaFilter,
  onSearchChange,
  onTipoChange,
  onStatusChange,
  onPendenciaChange
}: {
  searchTerm: string;
  tipoFilter: string;
  statusFilter: string;
  pendenciaFilter: string;
  onSearchChange: (value: string) => void;
  onTipoChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPendenciaChange: (value: string) => void;
}) {
  return (
    <Card className="bg-white shadow-md rounded-xl border-0 mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por nº do processo ou objeto"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-lg"
            />
          </div>

          {/* Tipo do processo */}
          <Select value={tipoFilter} onValueChange={onTipoChange}>
             <SelectTrigger className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-lg">
              <SelectValue placeholder="Tipo do processo" />
             </SelectTrigger>
             <SelectContent>
              <SelectItem value="todos">Tipo do processo</SelectItem>
              <SelectItem value="Pregão">Pregão</SelectItem>
              <SelectItem value="Dispensa">Dispensa</SelectItem>
              <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
              <SelectItem value="Concorrência">Concorrência</SelectItem>
              <SelectItem value="Credenciamento">Credenciamento</SelectItem>
             </SelectContent>
          </Select>

          {/* Status do processo */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-lg">
              <SelectValue placeholder="Status do processo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Status do processo</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>

          {/* Pendência */}
          <Select value={pendenciaFilter} onValueChange={onPendenciaChange}>
            <SelectTrigger className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-lg">
              <SelectValue placeholder="Pendência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Pendência</SelectItem>
              <SelectItem value="com_pendencia">Com pendência</SelectItem>
              <SelectItem value="sem_pendencia">Sem pendência</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MeusProcessos() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [pendenciaFilter, setPendenciaFilter] = useState("todos");
  const [sortKey, setSortKey] = useState<"numero" | "fase" | "prazo" | "status" | "pendencia">("numero");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");


  // Filtros aplicados
  const processosFiltrados = useMemo(() => {
    return processosMock.filter((process) => {
      // Filtro de busca
      const matchesSearch = searchTerm === "" || 
        process.numeroProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.objeto.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de tipo
      const matchesTipo = tipoFilter === "todos" || 
        process.tipo === tipoFilter;

      // Filtro de status
      const matchesStatus = statusFilter === "todos" || 
        process.status === statusFilter;

      // Filtro de pendência
      const matchesPendencia = pendenciaFilter === "todos" ||
        (pendenciaFilter === "com_pendencia" && process.pendenciaUsuario !== "Nenhuma") ||
        (pendenciaFilter === "sem_pendencia" && process.pendenciaUsuario === "Nenhuma");

      return matchesSearch && matchesTipo && matchesStatus && matchesPendencia;
    });
  }, [searchTerm, tipoFilter, statusFilter, pendenciaFilter]);

  const compareStrings = (a: string, b: string) => a.localeCompare(b, "pt-BR", { sensitivity: "base" });
  const compareNumeros = (a: string, b: string) => {
    const rx = /(\d+)/;
    const na = parseInt(a.match(rx)?.[1] || "0", 10);
    const nb = parseInt(b.match(rx)?.[1] || "0", 10);
    if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
    return compareStrings(a, b);
  };

  const getStatusLabel = (s: ProcessStatus) => ({
    em_andamento: "Em andamento",
    pendente: "Pendente",
    atrasado: "Atrasado",
    concluido: "Concluído",
  }[s]);

  const processosOrdenados = useMemo(() => {
    const list = [...processosFiltrados];
    list.sort((p1, p2) => {
      let res = 0;
      if (sortKey === "numero") res = compareNumeros(p1.numeroProcesso, p2.numeroProcesso);
      if (sortKey === "fase") res = compareStrings(p1.faseAtual || "", p2.faseAtual || "");
      if (sortKey === "prazo") res = compareStrings(p1.prazoFinal || "", p2.prazoFinal || "");
      if (sortKey === "status") res = compareStrings(getStatusLabel(p1.status), getStatusLabel(p2.status));
      if (sortKey === "pendencia") res = compareStrings(p1.pendenciaUsuario || "", p2.pendenciaUsuario || "");
      return sortOrder === "asc" ? res : -res;
    });
    return list;
  }, [processosFiltrados, sortKey, sortOrder]);

  const SortButton = ({ activeKey }: { activeKey: typeof sortKey }) => (
    <Button
      variant="ghost"
      size="icon"
      className={`h-7 w-7 ml-1 ${sortKey === activeKey ? "text-blue-600" : "text-gray-400"}`}
      onClick={() => {
        if (sortKey === activeKey) {
          setSortOrder(prev => prev === "asc" ? "desc" : "asc");
        } else {
          setSortKey(activeKey);
          setSortOrder("asc");
        }
      }}
      title={sortKey === activeKey ? (sortOrder === "asc" ? "Ordenar desc" : "Ordenar asc") : "Ordenar"}
      aria-label="Ordenar coluna"
    >
      {sortKey === activeKey && sortOrder === "desc" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
    </Button>
  );

  // Estatísticas
  const estatisticas = useMemo(() => {
    const total = processosMock.length;
    const comPendencia = processosMock.filter(p => p.pendenciaUsuario !== "Nenhuma").length;
    const atrasados = processosMock.filter(p => p.status === "atrasado").length;
    const vencendo = processosMock.filter(p => {
      const hoje = new Date();
      const prazoDate = new Date(p.prazoFinal.split('/').reverse().join('-'));
      const diffTime = prazoDate.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0;
    }).length;

    return { total, comPendencia, atrasados, vencendo };
  }, []);

  const handleVerDetalhes = (process: Process) => {
    // Redirecionar para a página de detalhes do processo
    navigate(`/processos/${process.id}`);
  };



  const handleAction = (processId: string, action: string) => {
    console.log(`Executando ação ${action} no processo ${processId}`);
    
    if (action === "Assinar") {
      // Encontrar o processo para obter o número do processo
      const processo = processosMock.find(p => p.id === processId);
      if (processo) {
        // Redirecionar para a página de assinaturas com o ID do processo
        navigate(`/assinaturas/${processId}`);
      }
    } else {
      // Para outras ações (Corrigir, Analisar), manter o comportamento atual
      console.log(`Ação ${action} executada para o processo ${processId}`);
      // Em produção, aqui seria feita a chamada para a API
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      
            {/* Container principal sem botão de retorno */}
      <div className="pt-16 md:pt-20 px-6 pb-6">
        {/* Filtros */}
        <ProcessFilterBar
          searchTerm={searchTerm}
          tipoFilter={tipoFilter}
          statusFilter={statusFilter}
          pendenciaFilter={pendenciaFilter}
          onSearchChange={setSearchTerm}
          onTipoChange={setTipoFilter}
          onStatusChange={setStatusFilter}
          onPendenciaChange={setPendenciaFilter}
        />

        {/* Tabela */}
        <Card className="bg-white shadow-md rounded-xl border-0">
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Processos ({processosOrdenados.length})</h2>
            </div>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-xs font-bold text-gray-800 uppercase px-6 py-4 w-2/5">
                      <div className="flex items-center">Nº do Processo <SortButton activeKey="numero" /></div>
                    </TableHead>
                    <TableHead className="text-xs font-bold text-gray-800 uppercase px-6 py-4 text-center">
                      <div className="flex items-center justify-center">Fase Atual <SortButton activeKey="fase" /></div>
                    </TableHead>
                    <TableHead className="text-xs font-bold text-gray-800 uppercase px-6 py-4 text-center">
                      <div className="flex items-center justify-center">Prazo Final <SortButton activeKey="prazo" /></div>
                    </TableHead>
                    <TableHead className="text-xs font-bold text-gray-800 uppercase px-6 py-4 text-center">
                      <div className="flex items-center justify-center">Status <SortButton activeKey="status" /></div>
                    </TableHead>
                    <TableHead className="text-xs font-bold text-gray-800 uppercase px-6 py-4 text-center">
                      <div className="flex items-center justify-center">Pendência <SortButton activeKey="pendencia" /></div>
                    </TableHead>
                    <TableHead className="text-xs font-bold text-gray-800 uppercase px-6 py-4 text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processosOrdenados.map((process) => (
                    <TableRow key={process.id} className="hover:bg-gray-50 border-b border-gray-100">
                      <TableCell className="px-6 py-4 w-2/5 min-w-0">
                        <div className="font-semibold text-blue-900 text-sm">
                          {process.numeroProcesso}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 break-words">
                          {process.objeto}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="text-sm font-medium text-gray-800">
                          {process.faseAtual}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <PrazoBadge prazo={process.prazoFinal} />
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <StatusBadge status={process.status} />
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <PendenciaActionButton 
                            pendencia={process.pendenciaUsuario}
                            onAction={handleAction}
                            processId={process.id}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <ActionButton 
                            process={process}
                            onVerDetalhes={handleVerDetalhes}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
}