import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Calendar,
  FileText,
  Building2,
  ArrowRight,
  Bell
} from "lucide-react";

interface CardInfoProcessoProps {
  processo: {
    id: string;
    numeroProcesso: string;
    dataCriacao: string;
    criador: string;
    situacaoAtual: string;
    etapaAtual: string;
    diasUteisConsumidos: number;
    gerenciaResponsavel: string;
  };
  pendenciasUsuario?: Array<{
    id: string;
    tipo: "assinar" | "analisar" | "corrigir" | "aprovar";
    descricao: string;
    prazo: string;
    prioridade: "alta" | "media" | "baixa";
  }>;
  proximasEtapas?: Array<{
    id: string;
    nome: string;
    responsavel: string;
    previsao: string;
  }>;
}

export default function CardInfoProcesso({ 
  processo, 
  pendenciasUsuario = [], 
  proximasEtapas = [] 
}: CardInfoProcessoProps) {
  const getPrioridadeConfig = (prioridade: string) => {
    const configs = {
      "alta": {
        className: "bg-red-100 text-red-800 border-red-300",
        icon: <AlertTriangle className="w-3 h-3" />
      },
      "media": {
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: <Clock className="w-3 h-3" />
      },
      "baixa": {
        className: "bg-green-100 text-green-800 border-green-300",
        icon: <CheckCircle className="w-3 h-3" />
      }
    };
    return configs[prioridade as keyof typeof configs] || configs.media;
  };

  const getTipoAcaoConfig = (tipo: string) => {
    const configs = {
      "assinar": {
        className: "bg-blue-600 hover:bg-blue-700",
        label: "Assinar"
      },
      "analisar": {
        className: "bg-purple-600 hover:bg-purple-700",
        label: "Analisar"
      },
      "corrigir": {
        className: "bg-red-600 hover:bg-red-700",
        label: "Corrigir"
      },
      "aprovar": {
        className: "bg-green-600 hover:bg-green-700",
        label: "Aprovar"
      }
    };
    return configs[tipo as keyof typeof configs] || configs.analisar;
  };

  return (
    <div className="space-y-4">
      {/* Card de Informações Gerais */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Informações do Processo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Calendar className="w-3 h-3 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Data de Criação</p>
                <p className="text-xs font-medium text-gray-900">{processo.dataCriacao}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <User className="w-3 h-3 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Criador</p>
                <p className="text-xs font-medium text-gray-900">{processo.criador}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Building2 className="w-3 h-3 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Gerência Responsável</p>
                <p className="text-xs font-medium text-gray-900">{processo.gerenciaResponsavel}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Clock className="w-3 h-3 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Dias Úteis Consumidos</p>
                <p className="text-xs font-medium text-gray-900">{processo.diasUteisConsumidos} dias</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="mb-2">
              <p className="text-xs text-gray-500">Situação Atual</p>
              <p className="text-sm font-medium text-gray-900">{processo.situacaoAtual}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Etapa Atual</p>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                {processo.etapaAtual}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Pendências do Usuário */}
      {pendenciasUsuario.length > 0 && (
        <Card className="bg-white shadow-sm border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Suas Pendências
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                {pendenciasUsuario.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendenciasUsuario.map((pendencia) => {
              const prioridadeConfig = getPrioridadeConfig(pendencia.prioridade);
              const tipoConfig = getTipoAcaoConfig(pendencia.tipo);
              
              return (
                <div key={pendencia.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {pendencia.descricao}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        Prazo: {pendencia.prazo}
                      </div>
                    </div>
                    <Badge className={`${prioridadeConfig.className} border text-xs`}>
                      {prioridadeConfig.icon}
                      <span className="ml-1 capitalize">{pendencia.prioridade}</span>
                    </Badge>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className={`w-full text-white ${tipoConfig.className} text-xs`}
                  >
                    {tipoConfig.label}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Card de Próximas Etapas */}
      {proximasEtapas.length > 0 && (
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-green-500" />
              Próximas Etapas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximasEtapas.map((etapa, index) => (
              <div key={etapa.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-green-700">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {etapa.nome}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {etapa.responsavel}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {etapa.previsao}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Card de Ações Rápidas */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Configurar Alertas
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <User className="w-4 h-4 mr-2" />
            Alterar Responsável
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 