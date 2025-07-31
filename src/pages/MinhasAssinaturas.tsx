import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import Topbar from "@/components/Topbar";
import ReturnButton from "@/components/ReturnButton";
import FilterBar from "@/components/FilterBar";
import SignatureRow from "@/components/SignatureRow";
import SignatureModalV2 from "@/components/SignatureModalV2";
import EmptyState from "@/components/EmptyState";
import { formatarNumeroProcesso } from "@/lib/processoUtils";

// Dados mockados
const documentosMock = [
  {
    id: "1",
    numeroProcesso: "Processo administrativo 012/2025",
    nome: "Termo de Referência - Aquisição de Equipamentos Médicos",
    tipo: "DFD",
    prazo: "30/01/2025",
    status: "pendente" as const,
  },
  {
    id: "2",
    numeroProcesso: "Processo administrativo 045/2025",
    nome: "Estudo Técnico Preliminar - Serviços de Limpeza",
    tipo: "ETP",
    prazo: "25/01/2025",
    status: "atrasado" as const,
  },
  {
    id: "3",
    numeroProcesso: "Processo administrativo 008/2025",
    nome: "Termo de Referência - Contratação de Consultoria",
    tipo: "DFD",
    prazo: "15/02/2025",
    status: "assinado" as const,
  },
  {
    id: "4",
    numeroProcesso: "Processo administrativo 052/2025",
    nome: "Estudo Técnico - Aquisição de Medicamentos",
    tipo: "ETP",
    prazo: "05/02/2025",
    status: "pendente" as const,
  },
  {
    id: "5",
    numeroProcesso: "Processo administrativo 015/2025",
    nome: "Termo de Referência - Serviços de TI",
    tipo: "DFD",
    prazo: "20/02/2025",
    status: "pendente" as const,
  },
  {
    id: "6",
    numeroProcesso: "Processo administrativo 038/2025",
    nome: "Estudo Técnico - Manutenção Predial",
    tipo: "ETP",
    prazo: "10/01/2025",
    status: "assinado" as const,
  },
];

export default function MinhasAssinaturas() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [prazoFilter, setPrazoFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState<typeof documentosMock[0] | null>(null);

  // Efeito para abrir automaticamente o modal quando um ID é fornecido na URL
  useEffect(() => {
    if (id) {
      const documento = documentosMock.find(d => d.id === id);
      if (documento) {
        setSelectedDocumento(documento);
        setModalOpen(true);
      }
    }
  }, [id]);

  // Filtros aplicados
  const documentosFiltrados = useMemo(() => {
    return documentosMock.filter((doc) => {
      // Filtro de busca
      const matchesSearch = searchTerm === "" || 
        doc.numeroProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.nome.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de status
      const matchesStatus = statusFilter === "todos" || 
        (statusFilter === "pendentes" && (doc.status === "pendente" || doc.status === "atrasado")) ||
        (statusFilter === "assinados" && doc.status === "assinado");

      // Filtro de prazo (mock - em produção seria baseado em data real)
      const matchesPrazo = prazoFilter === "todos" ||
        (prazoFilter === "vencendo" && doc.status === "pendente") ||
        (prazoFilter === "vencidos" && doc.status === "atrasado");

      // Filtro de tipo
      const matchesTipo = tipoFilter === "todos" || 
        doc.tipo.toLowerCase() === tipoFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPrazo && matchesTipo;
    });
  }, [searchTerm, statusFilter, prazoFilter, tipoFilter]);

  // Estatísticas
  const stats = useMemo(() => {
    const pendentes = documentosMock.filter(d => d.status === "pendente").length;
    const atrasados = documentosMock.filter(d => d.status === "atrasado").length;
    const assinados = documentosMock.filter(d => d.status === "assinado").length;
    
    return { pendentes, atrasados, assinados };
  }, []);

  const handleVisualizar = (id: string) => {
    const documento = documentosMock.find(d => d.id === id);
    setSelectedDocumento(documento || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDocumento(null);
    // Se veio de uma URL com ID, voltar para a página de assinaturas sem parâmetro
    if (id) {
      navigate("/assinaturas");
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Topbar />
      
      <div className="flex-1 px-4 pt-24 pb-4 overflow-hidden">
        <div className="h-full w-full flex flex-col">
          {/* Cabeçalho */}
                        <div className="mb-2">
                <ReturnButton className="mb-1 text-gray-600 hover:text-gray-900" />
                
                {/* Título principal */}
                <div className="text-center w-full mt-2 mb-2">
                  <h1 className="text-3xl font-bold text-primary flex items-center justify-center">
                    <FileText className="w-8 h-8 mr-3 text-blue-500" />
                    Minhas Assinaturas
                  </h1>
                </div>
                
                {/* Subtítulo */}
                <div className="text-center mb-1">
                  <p className="text-sm text-muted-foreground">
                    Visualize e assine os documentos atribuídos a você
                  </p>
                </div>
                
                {/* Alerta de pendências */}
                {stats.pendentes > 0 && (
                  <div className="text-center mb-2">
                    <Badge variant="destructive" className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium mx-auto">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {stats.pendentes} documento{stats.pendentes > 1 ? 's' : ''} pendente{stats.pendentes > 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>

                            {/* Estatísticas rápidas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-3 mb-2 flex-shrink-0">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Pendentes</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendentes}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Atrasados</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.atrasados}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Assinados</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.assinados}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                            {/* Barra de filtros */}
                  <div className="flex-shrink-0 mb-2">
                    <FilterBar
                      searchTerm={searchTerm}
                      statusFilter={statusFilter}
                      prazoFilter={prazoFilter}
                      tipoFilter={tipoFilter}
                      onSearchChange={setSearchTerm}
                      onStatusChange={setStatusFilter}
                      onPrazoChange={setPrazoFilter}
                      onTipoChange={setTipoFilter}
                    />
                  </div>

          {/* Tabela de documentos */}
          <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="p-0 flex flex-col h-full">
                                    <div className="p-2 border-b border-gray-200 flex-shrink-0">
                        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Documentos Pendentes e Assinados
                        </h2>
                      </div>

              <div className="flex-1 overflow-hidden">
                {documentosFiltrados.length > 0 ? (
                  <div className="h-full overflow-auto scroll-behavior-smooth">
                    <table className="w-full table-fixed">
                      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                            Nº Processo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]">
                            Documento
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%] min-w-[80px]">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%] min-w-[120px]">
                            Prazo para Assinar
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%] min-w-[100px]">
                            Status
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[16%] min-w-[200px]">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {documentosFiltrados.map((documento) => (
                          <SignatureRow
                            key={documento.id}
                            documento={documento}
                            onVisualizar={handleVisualizar}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <EmptyState 
                      type={
                        statusFilter === "pendentes" ? "pendentes" :
                        statusFilter === "assinados" ? "assinados" : "geral"
                      } 
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de visualização */}
      <SignatureModalV2
        isOpen={modalOpen}
        onClose={handleCloseModal}
        documento={selectedDocumento}
      />
    </div>
  );
} 