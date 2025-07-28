import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Building2, 
  Clock,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  FileText
} from "lucide-react";
import Topbar from "@/components/Topbar";
import FluxoProcessoCompleto from "@/components/FluxoProcessoCompleto";
import CardInfoProcesso from "@/components/CardInfoProcesso";
import UserSelector from "@/components/UserSelector";
import HistoricoProcesso from "@/components/HistoricoProcesso";
import DocumentosRelacionados from "@/components/DocumentosRelacionados";

// Dados mockados do processo
const processoMock = {
  id: "1",
  numeroProcesso: "DFD 012/2025",
  objeto: "Aquisição de Equipamentos Médicos para UTI",
  status: "em_andamento" as const,
  prazoFinal: "30/01/2025",
  gerenciaResponsavel: "Gerência de Suprimentos",
  dataCriacao: "05/01/2025",
  criador: "Dr. Maria Silva",
  situacaoAtual: "Aguardando elaboração do ETP",
  etapaAtual: "Elaboração do ETP",
  diasUteisConsumidos: 15
};

// Pendências do usuário atual
const pendenciasUsuario = [
  {
    id: "1",
    tipo: "analisar" as const,
    descricao: "Analisar ETP enviado para aprovação",
    prazo: "28/01/2025",
    prioridade: "alta" as const
  },
  {
    id: "2",
    tipo: "assinar" as const,
    descricao: "Assinar documento de consolidação da demanda",
    prazo: "30/01/2025",
    prioridade: "media" as const
  }
];

// Próximas etapas
const proximasEtapas = [
  {
    id: "1",
    nome: "Análise do ETP",
    responsavel: "Arq. Fernanda Martins",
    previsao: "29/01/2025"
  },
  {
    id: "2",
    nome: "Aprovação do ETP",
    responsavel: "Dir. Roberto Alves",
    previsao: "02/02/2025"
  },
  {
    id: "3",
    nome: "Elaboração da Matriz de Risco",
    responsavel: "Dr. Luiza Santos",
    previsao: "05/02/2025"
  }
];

// Etapas do fluxo completo do processo
const etapasFluxo = [
  {
    id: 1,
    nome: "Consolidação da Demanda",
    status: "concluido" as const,
    prazoPrevisao: "10 dias úteis",
    responsavel: "Dr. Maria Silva",
    gerencia: "Gerência Médica"
  },
  {
    id: 2,
    nome: "Elaboração do ETP",
    status: "andamento" as const,
    prazoPrevisao: "15 dias úteis",
    responsavel: "Eng. Carlos Santos",
    gerencia: "Gerência de Engenharia"
  },
  {
    id: 3,
    nome: "Análise do ETP",
    status: "pendente" as const,
    prazoPrevisao: "7 dias úteis",
    responsavel: "Arq. Fernanda Martins",
    gerencia: "Gerência de Projetos"
  },
  {
    id: 4,
    nome: "Aprovação do ETP",
    status: "pendente" as const,
    prazoPrevisao: "5 dias úteis",
    responsavel: "Dir. Roberto Alves",
    gerencia: "Diretoria Executiva"
  }
];

interface Etapa {
  id: number;
  titulo: string;
  icone: React.ReactNode;
  status: "concluido" | "em_andamento" | "pendente" | "atrasado";
  dataInicio?: string;
  dataConclusao?: string;
  responsavel?: string;
  gerencia?: string;
  prazo?: string;
  documento?: string;
  observacoes?: string;
}

export default function ProcessoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleVoltarProcessos = () => {
    navigate("/processos");
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      "em_andamento": {
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <PlayCircle className="w-4 h-4" />,
        label: "Em Andamento"
      },
      "concluido": {
        className: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Concluído"
      },
      "atrasado": {
        className: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertTriangle className="w-4 h-4" />,
        label: "Atrasado"
      },
      "pendente": {
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock className="w-4 h-4" />,
        label: "Pendente"
      }
    };
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  const statusConfig = getStatusConfig(processoMock.status);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.5
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Topbar />
      
      <div className="pt-20">
        {/* Cabeçalho Moderno */}
        <motion.div 
          className="bg-white shadow-sm border-b border-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-full px-8 py-6">
            {/* Botão Voltar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="ghost"
                onClick={handleVoltarProcessos}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Meus Processos
              </Button>
            </motion.div>

            {/* Título Principal */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {processoMock.numeroProcesso}
                  </h1>
                  <p className="text-xl text-gray-700 mb-4">
                    {processoMock.objeto}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${statusConfig.className} border text-sm font-medium px-4 py-2`}>
                    {statusConfig.icon}
                    <span className="ml-2">{statusConfig.label}</span>
                  </Badge>
                </div>
              </div>

              {/* Informações Principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
                <motion.div 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Prazo Final</p>
                      <p className="text-sm font-semibold text-gray-900">{processoMock.prazoFinal}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Gerência</p>
                      <p className="text-sm font-semibold text-gray-900">{processoMock.gerenciaResponsavel}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500">Criador</p>
                      <p className="text-sm font-semibold text-gray-900">{processoMock.criador}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Etapa Atual</p>
                      <p className="text-sm font-semibold text-gray-900">{processoMock.etapaAtual}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs text-gray-500">Dias Úteis</p>
                      <p className="text-sm font-semibold text-gray-900">{processoMock.diasUteisConsumidos} dias</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Data Criação</p>
                      <p className="text-sm font-semibold text-gray-900">{processoMock.dataCriacao}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Conteúdo Principal */}
        <div className="w-full px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Coluna Principal */}
            <motion.div 
              className="xl:col-span-4 space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Seletor de Usuário para Teste */}
              <UserSelector />

              {/* Fluxo Completo do Processo */}
              <FluxoProcessoCompleto />

              {/* Histórico de Ações */}
              <HistoricoProcesso historico={[]} />

              {/* Documentos Relacionados */}
              <DocumentosRelacionados documentos={[]} />
            </motion.div>

            {/* Sidebar */}
            <motion.div 
              className="xl:col-span-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="sticky top-24">
                <CardInfoProcesso 
                  processo={processoMock}
                  pendenciasUsuario={pendenciasUsuario}
                  proximasEtapas={proximasEtapas}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 