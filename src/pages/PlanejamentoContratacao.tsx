import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Topbar from "@/components/Topbar";
import { 
  BarChart3, 
  PieChart, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Bell, 
  History,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  FolderOpen
} from "lucide-react";

// Função para criar path do donut chart
function createDonutPath(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const startX = cx + outerRadius * Math.cos(startAngle * Math.PI / 180);
  const startY = cy + outerRadius * Math.sin(startAngle * Math.PI / 180);
  const endX = cx + outerRadius * Math.cos(endAngle * Math.PI / 180);
  const endY = cy + outerRadius * Math.sin(endAngle * Math.PI / 180);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  
  const outerArc = `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  const lineToInner = `L ${cx + innerRadius * Math.cos(endAngle * Math.PI / 180)} ${cy + innerRadius * Math.sin(endAngle * Math.PI / 180)}`;
  const innerArc = `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${cx + innerRadius * Math.cos(startAngle * Math.PI / 180)} ${cy + innerRadius * Math.sin(startAngle * Math.PI / 180)}`;
  const closePath = 'Z';
  
  return `M ${startX} ${startY} ${outerArc} ${lineToInner} ${innerArc} ${closePath}`;
}

// Função para obter cor baseada na prioridade
function getPrioridadeColor(prioridade: string) {
  switch (prioridade.toLowerCase()) {
    case 'alta': return 'bg-red-100 text-red-800';
    case 'média': return 'bg-yellow-100 text-yellow-800';
    case 'baixa': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Função para obter cor baseada no status
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'em andamento': return 'bg-blue-100 text-blue-800';
    case 'concluído': return 'bg-green-100 text-green-800';
    case 'pendente': return 'bg-yellow-100 text-yellow-800';
    case 'cancelado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function PlanejamentoContratacao() {
  // Dados dos KPIs
  const kpis = [
    {
      label: "Total de Processos",
      value: "1.247",
      trend: "+12% este mês",
      icon: <FileText className="w-4 h-4" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      label: "Em Andamento",
      value: "342",
      trend: "+8% este mês",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-green-100 text-green-600"
    },
    {
      label: "Concluídos",
      value: "856",
      trend: "+15% este mês",
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      label: "Pendentes",
      value: "49",
      trend: "-5% este mês",
      icon: <Clock className="w-4 h-4" />,
      color: "bg-orange-100 text-orange-600"
    },
    {
      label: "Usuários Ativos",
      value: "89",
      trend: "+3% este mês",
      icon: <Users className="w-4 h-4" />,
      color: "bg-purple-100 text-purple-600"
    },
    {
      label: "Alertas",
      value: "12",
      trend: "-2% este mês",
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "bg-red-100 text-red-600"
    }
  ];

  // Dados do gráfico de pizza - Status dos Processos
  const statusData = [
    { label: "Em Andamento", value: 342, percentage: 27, color: "#3B82F6", icon: "🔄" },
    { label: "Concluído", value: 856, percentage: 69, color: "#10B981", icon: "✅" },
    { label: "Pendente", value: 49, percentage: 4, color: "#F59E0B", icon: "⏳" }
  ];

  // Dados do gráfico de barras - Processos por Etapa
  const etapasData = [
    { label: "Análise", value: 45, color: "bg-blue-500" },
    { label: "Aprovação", value: 32, color: "bg-green-500" },
    { label: "Execução", value: 28, color: "bg-yellow-500" },
    { label: "Finalização", value: 15, color: "bg-purple-500" }
  ];

  // Dados das pendências
  const pendencias = [
    {
      id: 1,
      descricao: "Aprovação de DFD pendente",
      processo: "DFD-2024-001",
      prazo: "2 dias",
      prioridade: "alta",
      link: "/processo/1"
    },
    {
      id: 2,
      descricao: "Revisão de documentação",
      processo: "DFD-2024-015",
      prazo: "5 dias",
      prioridade: "média",
      link: "/processo/2"
    }
  ];

  // Dados das notificações
  const notificacoes = [
    {
      id: 1,
      titulo: "Novo processo criado",
      texto: "DFD-2024-020 foi criado e aguarda sua análise",
      data: "há 2 horas",
      lida: false
    },
    {
      id: 2,
      titulo: "Processo aprovado",
      texto: "DFD-2024-018 foi aprovado com sucesso",
      data: "há 4 horas",
      lida: true
    },
    {
      id: 3,
      titulo: "Prazo vencendo",
      texto: "DFD-2024-012 vence em 3 dias",
      data: "há 1 dia",
      lida: false
    }
  ];

  // Dados do histórico
  const historico = [
    {
      id: 1,
      numero: "DFD-2024-019",
      tipo: "DFD",
      status: "em andamento",
      ultimoAcesso: "há 2 horas",
      link: "/processo/1"
    },
    {
      id: 2,
      numero: "DFD-2024-018",
      tipo: "DFD",
      status: "concluído",
      ultimoAcesso: "há 4 horas",
      link: "/processo/2"
    },
    {
      id: 3,
      numero: "DFD-2024-017",
      tipo: "DFD",
      status: "pendente",
      ultimoAcesso: "há 1 dia",
      link: "/processo/3"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      
      <main className="pt-20 px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Planejamento da Contratação</h1>
          </div>
          <p className="text-gray-600">Acompanhe todos os processos de contratação em andamento</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index} className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    <p className="text-xs text-green-600">{kpi.trend}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${kpi.color}`}>
                    {kpi.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Pizza - Status dos Processos */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status dos Processos</h2>
              <div className="flex items-center justify-center">
                <svg width="200" height="200" className="mx-auto">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#E5E7EB" strokeWidth="16" />
                  {statusData.map((item, index) => {
                    const startAngle = index === 0 ? 0 : 
                      statusData.slice(0, index).reduce((acc, curr) => acc + (curr.percentage * 3.6), 0);
                    const endAngle = startAngle + (item.percentage * 3.6);
                    
                    return (
                      <path
                        key={item.label}
                        d={createDonutPath(100, 100, 64, 80, startAngle, endAngle)}
                        fill={item.color}
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="mt-4 space-y-2">
                {statusData.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{item.icon}</span>
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Barras - Processos por Etapa */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Processos por Etapa</h2>
              <div className="space-y-4">
                {etapasData.map((item) => (
                  <div key={item.label} className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 w-20">{item.label}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${(item.value / Math.max(...etapasData.map(e => e.value))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards Laterais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pendências */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Pendências</h2>
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              {pendencias.length > 0 ? (
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
              ) : (
                <p className="text-sm text-gray-500">Nenhuma pendência encontrada</p>
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
              <div className="space-y-2">
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