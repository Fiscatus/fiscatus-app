import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  FolderOpen,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

interface Documento {
  id: string;
  nome: string;
  tipo: "pdf" | "doc" | "xlsx" | "img";
  tamanho: string;
  dataUpload: string;
  uploadPor: string;
  versao: string;
  status: "aprovado" | "pendente" | "rejeitado";
  etapa: string;
  descricao?: string;
}

interface DocumentosRelacionadosProps {
  documentos: Documento[];
}

const documentosMock: Documento[] = [
  {
    id: "1",
    nome: "DFD_012_2025_v1.pdf",
    tipo: "pdf",
    tamanho: "2.4 MB",
    dataUpload: "05/01/2025",
    uploadPor: "Dr. Maria Silva",
    versao: "1.0",
    status: "aprovado",
    etapa: "Elaboração do DFD",
    descricao: "Documento de Formalização de Demanda inicial"
  },
  {
    id: "2",
    nome: "ETP_012_2025_v2.pdf",
    tipo: "pdf",
    tamanho: "3.1 MB",
    dataUpload: "24/01/2025",
    uploadPor: "Eng. Pedro Lima",
    versao: "2.0",
    status: "pendente",
    etapa: "Elaboração do ETP",
    descricao: "Estudo Técnico Preliminar - versão atualizada"
  },
  {
    id: "3",
    nome: "Analise_Tecnica_DFD.pdf",
    tipo: "pdf",
    tamanho: "1.8 MB",
    dataUpload: "18/01/2025",
    uploadPor: "Eng. João Santos",
    versao: "1.0",
    status: "aprovado",
    etapa: "Análise do DFD",
    descricao: "Relatório de análise técnica do DFD"
  },
  {
    id: "4",
    nome: "Especificacoes_Tecnicas.xlsx",
    tipo: "xlsx",
    tamanho: "456 KB",
    dataUpload: "23/01/2025",
    uploadPor: "Dr. Maria Silva",
    versao: "1.1",
    status: "aprovado",
    etapa: "Elaboração do ETP",
    descricao: "Planilha com especificações técnicas detalhadas"
  },
  {
    id: "5",
    nome: "Parecer_Juridico_Preliminar.pdf",
    tipo: "pdf",
    tamanho: "1.2 MB",
    dataUpload: "20/01/2025",
    uploadPor: "Adv. Camila Rocha",
    versao: "1.0",
    status: "aprovado",
    etapa: "Aprovação do DFD",
    descricao: "Parecer jurídico sobre a demanda"
  },
  {
    id: "6",
    nome: "Fotos_Equipamentos.zip",
    tipo: "img",
    tamanho: "8.7 MB",
    dataUpload: "15/01/2025",
    uploadPor: "Téc. Roberto Silva",
    versao: "1.0",
    status: "aprovado",
    etapa: "Elaboração do DFD",
    descricao: "Imagens dos equipamentos atuais para referência"
  }
];

export default function DocumentosRelacionados({ documentos = documentosMock }: DocumentosRelacionadosProps) {
  const [filtroEtapa, setFiltroEtapa] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const getTipoIcon = (tipo: string) => {
    const icons = {
      "pdf": <FileText className="w-5 h-5 text-red-500" />,
      "doc": <FileText className="w-5 h-5 text-blue-500" />,
      "xlsx": <FileText className="w-5 h-5 text-green-500" />,
      "img": <FileText className="w-5 h-5 text-purple-500" />
    };
    return icons[tipo as keyof typeof icons] || icons.pdf;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      "aprovado": {
        className: "bg-green-100 text-green-800 border-green-300",
        icon: <CheckCircle className="w-3 h-3" />
      },
      "pendente": {
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: <Clock className="w-3 h-3" />
      },
      "rejeitado": {
        className: "bg-red-100 text-red-800 border-red-300",
        icon: <AlertTriangle className="w-3 h-3" />
      }
    };
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  // Agrupar documentos por etapa
  const documentosPorEtapa = documentos.reduce((acc, doc) => {
    if (!acc[doc.etapa]) {
      acc[doc.etapa] = [];
    }
    acc[doc.etapa].push(doc);
    return acc;
  }, {} as Record<string, Documento[]>);

  const etapas = Object.keys(documentosPorEtapa);

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    const matchEtapa = filtroEtapa === "todas" || doc.etapa === filtroEtapa;
    const matchStatus = filtroStatus === "todos" || doc.status === filtroStatus;
    return matchEtapa && matchStatus;
  });

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-blue-500" />
          Documentos Relacionados
        </CardTitle>
        <p className="text-sm text-gray-600">
          Todos os documentos organizados por etapa do processo
        </p>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={filtroEtapa} 
              onChange={(e) => setFiltroEtapa(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1 bg-white"
            >
              <option value="todas">Todas as etapas</option>
              {etapas.map(etapa => (
                <option key={etapa} value={etapa}>{etapa}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1 bg-white"
            >
              <option value="todos">Todos os status</option>
              <option value="aprovado">Aprovado</option>
              <option value="pendente">Pendente</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
          </div>
          
          <div className="ml-auto text-sm text-gray-600">
            {documentosFiltrados.length} documento{documentosFiltrados.length !== 1 ? 's' : ''} encontrado{documentosFiltrados.length !== 1 ? 's' : ''}
          </div>
        </div>

        <Tabs defaultValue="por-etapa" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="por-etapa">Por Etapa</TabsTrigger>
            <TabsTrigger value="lista-completa">Lista Completa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="por-etapa" className="mt-6">
            <div className="space-y-6">
              {etapas.map(etapa => {
                const docsEtapa = documentosPorEtapa[etapa];
                
                return (
                  <div key={etapa} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-blue-500" />
                        {etapa}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {docsEtapa.length} documento{docsEtapa.length !== 1 ? 's' : ''}
                        </Badge>
                      </h3>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {docsEtapa.map(doc => {
                        const statusConfig = getStatusConfig(doc.status);
                        
                        return (
                          <div key={doc.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                {getTipoIcon(doc.tipo)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-medium text-gray-900 text-sm truncate">
                                      {doc.nome}
                                    </h4>
                                    {doc.descricao && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        {doc.descricao}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <Badge className={`${statusConfig.className} border text-xs ml-4 flex-shrink-0`}>
                                    {statusConfig.icon}
                                    <span className="ml-1 capitalize">{doc.status}</span>
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {doc.dataUpload}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {doc.uploadPor}
                                  </div>
                                  <div>
                                    v{doc.versao} • {doc.tamanho}
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs">
                                    <Eye className="w-3 h-3" />
                                    Visualizar
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs">
                                    <Download className="w-3 h-3" />
                                    Baixar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="lista-completa" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {documentosFiltrados.map(doc => {
                const statusConfig = getStatusConfig(doc.status);
                
                return (
                  <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        {getTipoIcon(doc.tipo)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-2 leading-tight">
                          {doc.nome}
                        </h4>
                        {doc.descricao && (
                          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                            {doc.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {doc.etapa}
                      </Badge>
                      <Badge className={`${statusConfig.className} border text-xs`}>
                        {statusConfig.icon}
                        <span className="ml-1 capitalize">{doc.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{doc.dataUpload}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{doc.uploadPor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        <span>v{doc.versao} • {doc.tamanho}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 flex items-center justify-center gap-1 text-xs">
                        <Eye className="w-3 h-3" />
                        Visualizar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 flex items-center justify-center gap-1 text-xs">
                        <Download className="w-3 h-3" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 