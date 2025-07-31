import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  User,
  FileText,
  Send,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  MessageSquare,
  ArrowRight
} from "lucide-react";

interface HistoricoItem {
  id: string;
  data: string;
  hora: string;
  usuario: string;
  cargo: string;
  acao: "criacao" | "envio" | "analise" | "aprovacao" | "correcao" | "assinatura" | "comentario" | "visualizacao";
  descricao: string;
  detalhes?: string;
  documento?: string;
  etapa?: string;
}

interface HistoricoProcessoProps {
  historico: HistoricoItem[];
}

const historicoMock: HistoricoItem[] = [
  {
    id: "1",
    data: "25/01/2025",
    hora: "14:30",
    usuario: "Gabriel Miranda",
    cargo: "Analista de Contratos",
    acao: "visualizacao",
    descricao: "Visualizou os detalhes do processo",
    etapa: "Elaboração do ETP"
  },
  {
    id: "2",
    data: "24/01/2025",
    hora: "16:45",
    usuario: "Leticia Bonfim Guilherme",
    cargo: "Engenheiro",
    acao: "envio",
    descricao: "Enviou ETP para análise",
    documento: "ETP_012_2025_v2.pdf",
    etapa: "Elaboração do ETP"
  },
  {
    id: "3",
    data: "23/01/2025",
    hora: "10:15",
    usuario: "Dr. Maria Silva",
    cargo: "Coordenadora",
    acao: "comentario",
    descricao: "Adicionou comentário sobre especificações técnicas",
    detalhes: "Necessário revisar as especificações do item 3.2 conforme norma ABNT NBR 15943.",
    etapa: "Elaboração do ETP"
  },
  {
    id: "4",
    data: "20/01/2025",
    hora: "09:20",
    usuario: "Andressa Sterfany Santos da Silva",
    cargo: "Diretora",
    acao: "aprovacao",
    descricao: "Aprovou o DFD",
    documento: "DFD_012_2025_v1.pdf",
    etapa: "Aprovação do DFD"
  },
  {
    id: "5",
    data: "18/01/2025",
    hora: "15:30",
    usuario: "Eng. João Santos",
    cargo: "Engenheiro Sênior",
    acao: "analise",
    descricao: "Concluiu análise técnica do DFD",
    detalhes: "Análise aprovada. Documento está em conformidade com os requisitos técnicos.",
    etapa: "Análise do DFD"
  },
  {
    id: "6",
    data: "15/01/2025",
    hora: "11:00",
    usuario: "Lucas Moreira Brito",
    cargo: "Médico Coordenador",
    acao: "correcao",
    descricao: "Solicitou correções no DFD",
    detalhes: "Ajustar quantidades dos itens 2.1 e 2.3 conforme demanda atualizada.",
    etapa: "Elaboração do DFD"
  },
  {
    id: "7",
    data: "10/01/2025",
    hora: "08:45",
    usuario: "Dr. Maria Silva",
    cargo: "Coordenadora",
    acao: "envio",
    descricao: "Enviou DFD para análise",
    documento: "DFD_012_2025_v1.pdf",
    etapa: "Elaboração do DFD"
  },
  {
    id: "8",
    data: "05/01/2025",
    hora: "14:00",
    usuario: "Dr. Maria Silva",
    cargo: "Coordenadora",
    acao: "criacao",
    descricao: "Criou o processo DFD 012/2025",
    detalhes: "Processo criado para aquisição de equipamentos médicos para UTI.",
    etapa: "Elaboração do DFD"
  }
];

export default function HistoricoProcesso({ historico = historicoMock }: HistoricoProcessoProps) {
  const getAcaoConfig = (acao: string) => {
    const configs = {
      "criacao": {
        icon: <FileText className="w-4 h-4" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        label: "Criação"
      },
      "envio": {
        icon: <Send className="w-4 h-4" />,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        label: "Envio"
      },
      "analise": {
        icon: <Eye className="w-4 h-4" />,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        label: "Análise"
      },
      "aprovacao": {
        icon: <CheckCircle className="w-4 h-4" />,
        color: "text-green-600",
        bgColor: "bg-green-100",
        label: "Aprovação"
      },
      "correcao": {
        icon: <AlertTriangle className="w-4 h-4" />,
        color: "text-red-600",
        bgColor: "bg-red-100",
        label: "Correção"
      },
      "assinatura": {
        icon: <Edit className="w-4 h-4" />,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        label: "Assinatura"
      },
      "comentario": {
        icon: <MessageSquare className="w-4 h-4" />,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        label: "Comentário"
      },
      "visualizacao": {
        icon: <Eye className="w-4 h-4" />,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        label: "Visualização"
      }
    };
    return configs[acao as keyof typeof configs] || configs.visualizacao;
  };

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-500" />
          Histórico de Ações
        </CardTitle>
        <p className="text-sm text-gray-600">
          Acompanhe todas as movimentações e ações realizadas no processo
        </p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {historico.map((item, index) => {
            const acaoConfig = getAcaoConfig(item.acao);
            const isFirst = index === 0;
            
            return (
              <div key={item.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                {/* Cabeçalho do card */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Ícone da ação */}
                  <div className={`
                    w-12 h-12 rounded-full ${acaoConfig.bgColor} 
                    flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0
                    ${isFirst ? 'ring-2 ring-blue-200' : ''}
                  `}>
                    <div className={acaoConfig.color}>
                      {acaoConfig.icon}
                    </div>
                  </div>
                  
                  {/* Data e hora */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{item.data}</p>
                    <p className="text-xs text-gray-500">{item.hora}</p>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`${acaoConfig.bgColor} ${acaoConfig.color} border-0 text-xs font-medium`}>
                    {acaoConfig.label}
                  </Badge>
                  {item.etapa && (
                    <Badge variant="outline" className="text-xs">
                      {item.etapa}
                    </Badge>
                  )}
                </div>
                
                {/* Descrição */}
                <p className="font-medium text-gray-900 text-sm mb-3">
                  {item.descricao}
                </p>
                
                {/* Usuário */}
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">{item.usuario}</span>
                    <br />
                    <span className="text-gray-500 text-xs">{item.cargo}</span>
                  </span>
                </div>
                
                {/* Detalhes */}
                {item.detalhes && (
                  <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      "{item.detalhes}"
                    </p>
                  </div>
                )}
                
                {/* Documento */}
                {item.documento && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-700 truncate">
                      {item.documento}
                    </span>
                    <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Rodapé */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Mostrando {historico.length} ações • Última atualização: {historico[0]?.data} às {historico[0]?.hora}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 