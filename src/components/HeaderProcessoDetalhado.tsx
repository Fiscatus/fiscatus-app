import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  User, 
  Building2, 
  Clock,
  AlertTriangle,
  CheckCircle,
  PlayCircle
} from "lucide-react";

interface HeaderProcessoDetalhadoProps {
  processo: {
    id: string;
    numeroProcesso: string;
    objeto: string;
    status: "em_andamento" | "concluido" | "atrasado" | "pendente";
    prazoFinal: string;
    gerenciaResponsavel: string;
    dataCriacao: string;
    criador: string;
    situacaoAtual: string;
    etapaAtual: string;
    diasUteisConsumidos: number;
  };
}

export default function HeaderProcessoDetalhado({ processo }: HeaderProcessoDetalhadoProps) {
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

  const statusConfig = getStatusConfig(processo.status);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Título principal */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {processo.numeroProcesso}
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            {processo.objeto}
          </p>
          
          {/* Status e informações principais */}
          <div className="flex flex-wrap items-center gap-4">
            <Badge className={`${statusConfig.className} border text-sm font-medium px-3 py-1`}>
              {statusConfig.icon}
              <span className="ml-2">{statusConfig.label}</span>
            </Badge>
            
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">Prazo: {processo.prazoFinal}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Building2 className="w-4 h-4 mr-2" />
              <span className="text-sm">{processo.gerenciaResponsavel}</span>
            </div>
          </div>
        </div>

        {/* Cards de informações gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Data de Criação</p>
                  <p className="text-sm font-semibold text-gray-900">{processo.dataCriacao}</p>
                </div>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Criador</p>
                  <p className="text-sm font-semibold text-gray-900">{processo.criador}</p>
                </div>
                <User className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Etapa Atual</p>
                  <p className="text-sm font-semibold text-gray-900">{processo.etapaAtual}</p>
                </div>
                <PlayCircle className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Dias Úteis</p>
                  <p className="text-sm font-semibold text-gray-900">{processo.diasUteisConsumidos} dias</p>
                </div>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 