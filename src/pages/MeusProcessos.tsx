import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  ChevronRight,
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
  ArrowLeft
} from "lucide-react";
import Topbar from "@/components/Topbar";
import { useUser, mockUsers } from "@/contexts/UserContext";

// Tipos
type ProcessStatus = "em_andamento" | "pendente" | "atrasado" | "concluido";
type ProcessType = "DFD" | "ETP" | "Matriz de Risco" | "TR" | "Edital";
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
    numeroProcesso: "DFD 012/2025",
    tipo: "DFD",
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
    numeroProcesso: "ETP 045/2025",
    tipo: "ETP",
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
    numeroProcesso: "TR 001/2025",
    tipo: "TR",
    faseAtual: "TR",
    prazoFinal: "20/02/2025",
    status: "concluido",
    pendenciaUsuario: "Nenhuma",
    objeto: "Contratação de Consultoria Especializada",
    responsavel: "Dra. Ana Costa",
    dataCriacao: "05/01/2025",
    ultimaAtualizacao: "20/01/2025"
  },
  {
    id: "4",
    numeroProcesso: "ETP 052/2025",
    tipo: "ETP",
    faseAtual: "Matriz de Risco",
    prazoFinal: "05/02/2025",
    status: "em_andamento",
    pendenciaUsuario: "Analisar",
    objeto: "Estudo Técnico - Aquisição de Medicamentos Especializados",
    responsavel: "Dr. Carlos Oliveira",
    dataCriacao: "12/01/2025",
    ultimaAtualizacao: "22/01/2025"
  },
  {
    id: "5",
    numeroProcesso: "DFD 015/2025",
    tipo: "DFD",
    faseAtual: "Edital",
    prazoFinal: "20/02/2025",
    status: "concluido",
    pendenciaUsuario: "Nenhuma",
    objeto: "Serviços de TI e Infraestrutura",
    responsavel: "Eng. Pedro Lima",
    dataCriacao: "08/01/2025",
    ultimaAtualizacao: "18/01/2025"
  },
  {
    id: "6",
    numeroProcesso: "ETP 038/2025",
    tipo: "ETP",
    faseAtual: "Publicação",
    prazoFinal: "10/01/2025",
    status: "atrasado",
    pendenciaUsuario: "Assinar",
    objeto: "Manutenção Predial e Serviços Gerais",
    responsavel: "Arq. Fernanda Martins",
    dataCriacao: "03/01/2025",
    ultimaAtualizacao: "12/01/2025"
  },
  {
    id: "7",
    numeroProcesso: "MR 023/2025",
    tipo: "Matriz de Risco",
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
    numeroProcesso: "TR 019/2025",
    tipo: "TR",
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

// Componente para Timeline
function ProcessTimeline({ currentPhase }: { currentPhase: ProcessPhase }) {
  const phases: ProcessPhase[] = [
    "Elaboração DFD",
    "Assinatura ETP", 
    "Matriz de Risco",
    "TR",
    "Edital",
    "Publicação"
  ];

  const currentIndex = phases.indexOf(currentPhase);

  return (
    <div className="flex items-center space-x-2 mb-6">
      {phases.map((phase, index) => (
        <div key={phase} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
            index <= currentIndex 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 text-gray-500"
          }`}>
            {index + 1}
          </div>
          <span className={`ml-2 text-sm ${
            index <= currentIndex ? "text-blue-600 font-medium" : "text-gray-500"
          }`}>
            {phase}
          </span>
          {index < phases.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-300 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}

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
    <div className="mb-8">
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        onClick={() => navigate("/dfd")}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Dashboard
      </Button>
      
      {/* Título centralizado */}
      <div className="text-center mt-4 mb-6">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center mb-2">
          <ClipboardList className="w-8 h-8 mr-3 text-blue-500" />
          Meus Processos
        </h1>
        <p className="text-gray-600 text-lg">Acompanhe seus processos em todas as fases do planejamento</p>
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

                     {/* Tipo */}
           <Select value={tipoFilter} onValueChange={onTipoChange}>
             <SelectTrigger className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-lg">
               <SelectValue placeholder="Filtrar por tipo" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="todos">Todos os tipos</SelectItem>
               <SelectItem value="DFD">DFD</SelectItem>
               <SelectItem value="ETP">ETP</SelectItem>
               <SelectItem value="Matriz de Risco">Matriz de Risco</SelectItem>
               <SelectItem value="TR">TR</SelectItem>
               <SelectItem value="Edital">Edital</SelectItem>
             </SelectContent>
           </Select>

          {/* Status */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>

          {/* Pendência */}
          <Select value={pendenciaFilter} onValueChange={onPendenciaChange}>
            <SelectTrigger className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-lg">
              <SelectValue placeholder="Pendência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);

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
    navigate(`/processos/${process.id}`);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProcess(null);
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
      
      {/* Seletor de Usuário para Teste */}
      <div className="pt-20 px-6 pb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Simular Usuário (Para Teste de Permissões)</h3>
                <p className="text-xs text-gray-500">Altere o usuário para testar as diferentes permissões por gerência</p>
              </div>
            </div>
            <Select value={user?.id || ''} onValueChange={(value) => {
              const selectedUser = mockUsers.find(u => u.id === value);
              if (selectedUser) setUser(selectedUser);
            }}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map((mockUser) => (
                  <SelectItem key={mockUser.id} value={mockUser.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="font-medium">{mockUser.nome}</span>
                      <span className="text-xs text-gray-500">({mockUser.gerencia})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {user && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Usuário Atual:</strong> {user.nome} - {user.cargo} ({user.gerencia})
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-6 pb-6">
        {/* Header com Indicadores */}
        <ProcessListHeader estatisticas={estatisticas} navigate={navigate} />

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
              <h2 className="text-lg font-semibold text-gray-900">Processos ({processosFiltrados.length})</h2>
            </div>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-600 px-6 py-4 w-2/5">Nº do Processo</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 px-6 py-4 text-center">Fase Atual</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 px-6 py-4 text-center">Prazo Final</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 px-6 py-4 text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 px-6 py-4 text-center">Pendência</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 px-6 py-4 text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processosFiltrados.map((process) => (
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

      {/* Modal de Detalhes */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProcess && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {selectedProcess.numeroProcesso} - {selectedProcess.objeto}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Timeline */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Progresso do Processo</h3>
                  <ProcessTimeline currentPhase={selectedProcess.faseAtual} />
                </div>

                {/* Informações do Processo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-white shadow-md rounded-xl border-0">
                    <CardContent className="p-4">
                      <h4 className="text-base font-semibold mb-3">Informações Gerais</h4>
                                             <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Número:</span>
                          <span className="font-semibold text-sm text-blue-900">{selectedProcess.numeroProcesso}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Status:</span>
                          <StatusBadge status={selectedProcess.status} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Prazo Final:</span>
                          <PrazoBadge prazo={selectedProcess.prazoFinal} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Responsável:</span>
                          <span className="font-medium text-sm">{selectedProcess.responsavel}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                                       <Card className="bg-white shadow-md rounded-xl border-0">
                    <CardContent className="p-4">
                      <h4 className="text-base font-semibold mb-3">Pendências</h4>
                      <div className="flex items-center justify-center">
                        <PendenciaActionButton 
                          pendencia={selectedProcess.pendenciaUsuario}
                          onAction={handleAction}
                          processId={selectedProcess.id}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Documento Atual */}
                <Card className="bg-white shadow-md rounded-xl border-0">
                  <CardContent className="p-4">
                    <h4 className="text-base font-semibold mb-3">Documento Atual</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4 text-sm">Preview do documento em PDF</p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Download className="w-4 h-4 mr-1" />
                          Baixar PDF
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Share2 className="w-4 h-4 mr-1" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Histórico */}
                <Card className="bg-white shadow-md rounded-xl border-0">
                  <CardContent className="p-4">
                    <h4 className="text-base font-semibold mb-3">Histórico de Ações</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Processo criado</p>
                          <p className="text-xs text-gray-600">Por {selectedProcess.responsavel} em {selectedProcess.dataCriacao}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Documento enviado para análise</p>
                          <p className="text-xs text-gray-600">Por Dr. Silva em 20/01/2025</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Correções solicitadas</p>
                          <p className="text-xs text-gray-600">Por Dra. Costa em 22/01/2025</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ações */}
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={handleCloseModal} className="text-sm">
                    Fechar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 