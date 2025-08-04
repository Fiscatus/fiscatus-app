import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  Building2,
  FolderOpen,
  ClipboardList,
  Gavel,
  BarChart3,
  Settings,
  Users,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  // Dados globais do sistema
  const dadosGlobais = [
    {
      label: "Total de Processos Criados",
      value: "2.847",
      descricao: "Processos no sistema",
      icon: <FileText className="w-8 h-8" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      label: "Processos Ativos",
      value: "1.234",
      descricao: "Em andamento",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "bg-green-100 text-green-600"
    },
    {
      label: "Processos Concluídos",
      value: "1.456",
      descricao: "Finalizados",
      icon: <CheckCircle2 className="w-8 h-8" />,
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      label: "Entidades Públicas",
      value: "156",
      descricao: "Atendidas",
      icon: <Building2 className="w-8 h-8" />,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  // Módulos do sistema
  const modulos = [
    {
      nome: "Planejamento da Contratação",
      descricao: "Gerencie DFD, ETP, TR, Edital e todo o fluxo",
      icon: <FolderOpen className="w-8 h-8" />,
      path: "/planejamento-da-contratacao",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
    },
    {
      nome: "Execução Contratual",
      descricao: "Acompanhe entregas, aditivos, fiscalizações e recebimentos",
      icon: <ClipboardList className="w-8 h-8" />,
      path: "/execucao-contratual",
      color: "bg-green-50 border-green-200 hover:bg-green-100"
    },
    {
      nome: "Pregão e Jurídico",
      descricao: "Para pregoeiros e pareceres jurídicos após a publicação",
      icon: <Gavel className="w-8 h-8" />,
      path: "/pregao-juridico",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100"
    },
    {
      nome: "Relatórios",
      descricao: "Gere relatórios e dashboards customizados",
      icon: <BarChart3 className="w-8 h-8" />,
      path: "/relatorios",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
    },
    {
      nome: "Configurações do Fluxo",
      descricao: "Edite modelos e cards padrão por instituição",
      icon: <Settings className="w-8 h-8" />,
      path: "/configuracoes-fluxo",
      color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
    },
    {
      nome: "Administração do Sistema",
      descricao: "Controle usuários, permissões e entidades",
      icon: <Users className="w-8 h-8" />,
      path: "/administracao",
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100"
    }
  ];

  const handleModuloClick = (path: string) => {
    navigate(path);
  };

    return (
    <div className="h-screen w-full bg-gray-50 flex flex-col">
      {/* Header Institucional */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Fiscatus
                  </h1>
                  <p className="text-sm text-gray-600">
                    Sistema de Gestão Contratual
                  </p>
                </div>
              </div>
              <div className="hidden md:block ml-8">
                <p className="text-sm text-gray-600 italic">
                  Gestão inteligente e integrada para contratações públicas.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-500">v1.0.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full px-6 py-8 overflow-y-auto">
        {/* Cards de Dados Globais */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Visão Geral do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dadosGlobais.map((dado, index) => (
              <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${dado.color}`}>
                      {dado.icon}
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {dado.value}
                    </p>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {dado.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {dado.descricao}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Módulos do Sistema */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Módulos do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulos.map((modulo, index) => (
              <Card 
                key={index} 
                className={`bg-white border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${modulo.color}`}
                onClick={() => handleModuloClick(modulo.path)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-gray-100">
                      {modulo.icon}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {modulo.nome}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {modulo.descricao}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Institucional */}
      <footer className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="w-full px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm font-medium text-gray-900">
                Fiscatus
              </p>
              <p className="text-xs text-gray-500">
                Desenvolvido para transformar a gestão pública.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-500">
                Fiscatus v1.0.0 – 2025
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 