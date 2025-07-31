import React from "react";
import { 
  BarChart3, 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  PenLine, 
  Users, 
  Bell, 
  History, 
  PieChart,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ChevronRight
} from "lucide-react";
import Topbar from "@/components/Topbar";
import { Card, CardContent } from "@/components/ui/card";

export default function DFDDashboard() {
  // Dados dos indicadores principais
  const kpis = [
    { 
      icon: <Users className="w-5 h-5" />, 
      label: "Processos da Gerência", 
      value: 7,
      color: "bg-blue-50 text-blue-600",
      trend: "+2 este mês"
    },
    { 
      icon: <PenLine className="w-5 h-5" />, 
      label: "DFDs Aguardando", 
      value: 3,
      color: "bg-emerald-50 text-emerald-600",
      trend: "Pendentes"
    },
    { 
      icon: <FileText className="w-5 h-5" />, 
      label: "ETPs em Elaboração", 
      value: 2,
      color: "bg-amber-50 text-amber-600",
      trend: "Em progresso"
    },
    { 
      icon: <Clock className="w-5 h-5" />, 
      label: "Assinaturas Pendentes", 
      value: 2,
      color: "bg-orange-50 text-orange-600",
      trend: "Urgente"
    },
    { 
      icon: <AlertTriangle className="w-5 h-5" />, 
      label: "Prazos Vencidos", 
      value: 1,
      color: "bg-red-50 text-red-600",
      trend: "Atenção"
    },
    { 
      icon: <CheckCircle className="w-5 h-5" />, 
      label: "Ressalvas Pendentes", 
      value: 4,
      color: "bg-purple-50 text-purple-600",
      trend: "Para correção"
    }
  ];

  const pendencias = [
    { 
      id: 1, 
      tipo: "assinatura",
      descricao: "Assinar DFD 010/2025", 
      processo: "DFD 010/2025",
      prazo: "Hoje",
      prioridade: "alta",
      link: "/processos/10"
    },
    { 
      id: 2, 
      tipo: "analise",
      descricao: "Analisar ETP 011/2025", 
      processo: "ETP 011/2025",
      prazo: "2 dias",
      prioridade: "media",
      link: "/processos/11"
    },
    { 
      id: 3, 
      tipo: "ressalva",
      descricao: "Corrigir documento devolvido", 
      processo: "TR 012/2025",
      prazo: "5 dias",
      prioridade: "baixa",
      link: "/processos/12"
    }
  ];

  const notificacoes = [
    { 
      id: 1, 
      tipo: "status",
      titulo: "Processo atualizado",
      texto: "DFD 010/2025 movido para 'Em andamento'", 
      data: "há 2 horas",
      lida: false
    },
    { 
      id: 2, 
      tipo: "assinatura",
      titulo: "Assinatura solicitada",
      texto: "ETP 011/2025 aguarda sua assinatura", 
      data: "há 5 horas",
      lida: false
    },
    { 
      id: 3, 
      tipo: "ressalva",
      titulo: "Documento devolvido",
      texto: "TR 012/2025 possui ressalvas a corrigir", 
      data: "ontem",
      lida: true
    }
  ];

  const historico = [
    { 
      id: 1, 
      numero: "DFD 010/2025",
      tipo: "DFD", 
      status: "Em andamento",
      ultimoAcesso: "30/07/2025 14:00",
      link: "/processos/10"
    },
    { 
      id: 2, 
      numero: "ETP 011/2025",
      tipo: "ETP", 
      status: "Aguardando assinatura",
      ultimoAcesso: "29/07/2025 17:30",
      link: "/processos/11"
    },
    { 
      id: 3, 
      numero: "TR 012/2025",
      tipo: "TR", 
      status: "Com ressalvas",
      ultimoAcesso: "28/07/2025 09:15",
      link: "/processos/12"
    }
  ];

  // Dados para gráficos
  const statusData = [
    { 
      label: "Em andamento", 
      value: 5, 
      color: "#3b82f6", 
      bgColor: "bg-blue-500",
      icon: "⏳",
      percentage: 50
    },
    { 
      label: "Concluído", 
      value: 3, 
      color: "#22c55e", 
      bgColor: "bg-green-500",
      icon: "✅",
      percentage: 30
    },
    { 
      label: "Atrasado", 
      value: 2, 
      color: "#ef4444", 
      bgColor: "bg-red-500",
      icon: "⚠️",
      percentage: 20
    }
  ];

  // Função para criar os caminhos do donut chart
  const createDonutPath = (cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = cx + outerRadius * Math.cos(startAngleRad);
    const y1 = cy + outerRadius * Math.sin(startAngleRad);
    const x2 = cx + outerRadius * Math.cos(endAngleRad);
    const y2 = cy + outerRadius * Math.sin(endAngleRad);
    
    const x3 = cx + innerRadius * Math.cos(endAngleRad);
    const y3 = cy + innerRadius * Math.sin(endAngleRad);
    const x4 = cx + innerRadius * Math.cos(startAngleRad);
    const y4 = cy + innerRadius * Math.sin(startAngleRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", x1, y1,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 1, x2, y2,
      "L", x3, y3,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 0, x4, y4,
      "Z"
    ].join(" ");
  };
  
  const etapasData = [
    { label: "DFD", value: 4, color: "bg-blue-500" },
    { label: "ETP", value: 3, color: "bg-emerald-500" },
    { label: "TR", value: 2, color: "bg-amber-500" },
    { label: "Edital", value: 1, color: "bg-purple-500" }
  ];

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'text-red-600 bg-red-50';
      case 'media': return 'text-amber-600 bg-amber-50';
      case 'baixa': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em andamento': return 'text-blue-600 bg-blue-50';
      case 'Aguardando assinatura': return 'text-amber-600 bg-amber-50';
      case 'Com ressalvas': return 'text-red-600 bg-red-50';
      case 'Concluído': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <main className="pt-20 px-4 pb-4 h-screen overflow-y-auto">
        {/* 1. Cabeçalho Principal */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Painel Inicial</h1>
          <p className="text-gray-600 text-sm">Visão geral das atividades do sistema</p>
        </div>

        {/* 2. Cards de Indicadores Principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {kpis.map((kpi, idx) => (
            <Card key={idx} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${kpi.color}`}>
                    {kpi.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-1 leading-tight">{kpi.label}</p>
                    <p className="text-xl font-semibold text-gray-900">{kpi.value}</p>
                    <p className="text-xs text-gray-500">{kpi.trend}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 3. Gráficos e Análises */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Gráfico de Pizza - Status dos Processos */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Processos por Status</h2>
                <PieChart className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-6">
                {/* Donut Chart Moderno */}
                <div className="relative">
                  <svg width="160" height="160" className="transform -rotate-90">
                    {(() => {
                      let currentAngle = 0;
                      const cx = 80;
                      const cy = 80;
                      const outerRadius = 70;
                      const innerRadius = 45;
                      
                      return statusData.map((item, index) => {
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + (item.percentage * 3.6); // 360 / 100 = 3.6
                        currentAngle = endAngle;
                        
                        const path = createDonutPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle);
                        
                        return (
                          <g key={index}>
                            <path
                              d={path}
                              fill={item.color}
                              className="hover:opacity-80 transition-opacity duration-200"
                              stroke="white"
                              strokeWidth="2"
                            />
                            {/* Texto de porcentagem dentro da fatia */}
                            {item.percentage >= 15 && ( // Só mostra texto se a fatia for grande o suficiente
                              <text
                                x={cx + (outerRadius - 12) * Math.cos(((startAngle + endAngle) / 2) * Math.PI / 180)}
                                y={cy + (outerRadius - 12) * Math.sin(((startAngle + endAngle) / 2) * Math.PI / 180)}
                                fill="white"
                                fontSize="12"
                                fontWeight="600"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="transform rotate-90"
                              >
                                {item.percentage}%
                              </text>
                            )}
                          </g>
                        );
                      });
                    })()}
                  </svg>
                  
                  {/* Centro do donut com total */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {statusData.reduce((a, b) => a + b.value, 0)}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">Processos</span>
                  </div>
                </div>

                {/* Legenda Moderna */}
                <div className="space-y-3">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-lg">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                          <span className="text-sm font-bold text-gray-900">{item.value}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-300"
                              style={{ 
                                backgroundColor: item.color,
                                width: `${item.percentage}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">{item.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Barras - Processos por Etapa */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Processos por Etapa</h2>
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-3">
                {etapasData.map((etapa, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <span className="w-10 text-xs font-medium text-gray-700">{etapa.label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${etapa.color} transition-all duration-300`}
                        style={{ width: `${(etapa.value / Math.max(...etapasData.map(e => e.value))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-900 w-4">{etapa.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Seções de Informações */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Minhas Pendências */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Minhas Pendências</h2>
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              {pendencias.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhuma pendência no momento!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendencias.map((p) => (
                    <div key={p.id} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">{p.descricao}</p>
                          <p className="text-xs text-gray-500">{p.processo}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(p.prioridade)}`}>
                          {p.prazo}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Prazo: {p.prazo}</span>
                        <a
                          href={p.link}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1"
                        >
                          <span>Acessar</span>
                          <ChevronRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notificações Recentes */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Notificações</h2>
                <Bell className="w-4 h-4 text-blue-500" />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notificacoes.map((n) => (
                  <div key={n.id} className={`p-3 rounded-lg border transition-colors ${n.lida ? 'border-gray-100 bg-gray-50' : 'border-blue-100 bg-blue-50'}`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${n.lida ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">{n.titulo}</p>
                        <p className="text-xs text-gray-600 mb-2">{n.texto}</p>
                        <p className="text-xs text-gray-400">{n.data}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
      </CardContent>
    </Card>

          {/* Últimos Processos Acessados */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Acessos Recentes</h2>
                <History className="w-4 h-4 text-gray-500" />
              </div>
              <div className="space-y-2">
                {historico.map((h) => (
                  <div key={h.id} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <a
                        href={h.link}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-2"
                      >
                        <span>{h.numero}</span>
                        <ChevronRight className="w-3 h-3" />
                      </a>
                      <span className="text-xs text-gray-400">{h.tipo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(h.status)}`}>
                        {h.status}
                      </span>
                      <span className="text-xs text-gray-400">{h.ultimoAcesso}</span>
                    </div>
                  </div>
          ))}
        </div>
            </CardContent>
          </Card>
        </div>

                {/* Rodapé */}
        <footer className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>Último login: 30/07/2025 08:15</span>
            <span>•</span>
            <span>Versão 1.0.0</span>
            <span>•</span>
            <span>Suporte: suporte@fiscatus.com.br</span>
          </div>
        </footer>
      </main>
    </div>
  );
} 