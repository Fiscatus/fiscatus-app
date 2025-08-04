import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
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
  ArrowRight,
  ChevronRight,
  Activity,
  Database
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoFiscatus from "@/assets/logo_fiscatus.png";
import { GradientCard } from "@/components/ui/gradient-card";

export default function Dashboard() {
  const navigate = useNavigate();

  // Dados globais do sistema - reformulados com design dark
  const dadosGlobais = [
    {
      label: "Total de Processos Criados",
      value: "2.847",
      descricao: "Processos no sistema",
      icon: <FileText className="w-6 h-6" />,
      gradient: "from-slate-900 to-blue-900",
      shadow: "shadow-blue-900/30",
    },
    {
      label: "Processos Ativos",
      value: "1.234",
      descricao: "Em andamento",
      icon: <Activity className="w-6 h-6" />,
      gradient: "from-slate-900 to-green-900",
      shadow: "shadow-green-900/30",
    },
    {
      label: "Processos Concluídos",
      value: "1.456",
      descricao: "Finalizados",
      icon: <CheckCircle2 className="w-6 h-6" />,
      gradient: "from-slate-900 to-cyan-900",
      shadow: "shadow-cyan-900/30",
    },
    {
      label: "Entidades Públicas",
      value: "156",
      descricao: "Atendidas",
      icon: <Building2 className="w-6 h-6" />,
      gradient: "from-slate-900 to-purple-900",
      shadow: "shadow-purple-900/30",
    }
  ];

  // Módulos do sistema - reformulados com descrições melhoradas
  const modulos = [
    {
      nome: "Planejamento da Contratação",
      descricao: "Gerencie toda a etapa preparatória da contratação pública, incluindo DFD, ETP, TR, Edital e controle do fluxo.",
      icon: <FolderOpen className="w-6 h-6" />,
      path: "/planejamento-da-contratacao",
      color: "#3b82f6"
    },
    {
      nome: "Execução Contratual",
      descricao: "Acompanhe entregas, fiscalizações, aditivos, prazos e recebimentos com rastreabilidade total.",
      icon: <ClipboardList className="w-6 h-6" />,
      path: "/execucao-contratual",
      color: "#10b981"
    },
    {
      nome: "Pregão e Jurídico",
      descricao: "Centralize os pareceres jurídicos, análises de edital e rotinas pós-publicação voltadas aos pregoeiros.",
      icon: <Gavel className="w-6 h-6" />,
      path: "/pregao-juridico",
      color: "#f97316"
    },
    {
      nome: "Relatórios",
      descricao: "Crie relatórios customizados, indicadores de desempenho e dashboards gerenciais em tempo real.",
      icon: <BarChart3 className="w-6 h-6" />,
      path: "/relatorios",
      color: "#8b5cf6"
    },
    {
      nome: "Configurações do Fluxo",
      descricao: "Edite os modelos, cards e etapas padrão aplicados aos fluxos de contratação da sua instituição.",
      icon: <Settings className="w-6 h-6" />,
      path: "/configuracoes-fluxo",
      color: "#6366f1"
    },
    {
      nome: "Administração do Sistema",
      descricao: "Controle permissões, gerencie usuários, vincule entidades e defina os perfis de acesso ao sistema.",
      icon: <Users className="w-6 h-6" />,
      path: "/administracao",
      color: "#6b7280"
    }
  ];

  const handleModuloClick = (path: string) => {
    navigate(path);
  };

  return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in">
                    {/* Topo Institucional - Proporções Ajustadas */}
                          <header className="bg-gradient-to-br from-[#0f172a] via-[#1e1e2f] to-[#10131f] py-3 shadow-md border-b border-slate-800">
           <div className="max-w-screen-xl mx-auto px-6 flex flex-col items-center text-center">
             {/* Logo Proporcional */}
             <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl flex items-center justify-center shadow-md mb-0.5">
               <img
                 src={logoFiscatus}
                 alt="Logo Fiscatus"
                 className="w-18 h-18 lg:w-22 lg:h-22 object-contain"
               />
             </div>
             
             {/* Identidade Institucional Balanceada */}
             <div className="flex flex-col items-center gap-0">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_1px_2px_rgba(255,255,255,0.2)]" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Fiscatus
              </h1>
                             <p className="text-base lg:text-lg font-medium text-slate-300">
                 Sistema de Gestão do Processo Licitatório
               </p>
            </div>
          </div>
        </header>

             {/* Transição Suave entre Header e Conteúdo */}
       <div className="bg-gradient-to-t from-[#f8fafc] to-transparent h-8 w-full mt-6"></div>
       
       {/* Conteúdo Principal */}
       <main className="max-w-screen-xl mx-auto px-6 py-8 mt-6">
        {/* Cards de Indicadores - Grid 2x2 Reformulado */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dadosGlobais.map((dado, index) => (
              <Card 
                key={index} 
                className={`rounded-2xl bg-gradient-to-br ${dado.gradient} text-white shadow-xl ${dado.shadow} p-6 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-default animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-slate-800">
                    {dado.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">{dado.value}</span>
                    <span className="text-sm opacity-90">{dado.label}</span>
                    <span className="text-xs text-slate-400">{dado.descricao}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Módulos do Sistema - Grid 3x2 Reformulado */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Módulos do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modulos.map((modulo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GradientCard
                  title={modulo.nome}
                  description={modulo.descricao}
                  icon={modulo.icon}
                  color={modulo.color}
                  onClick={() => handleModuloClick(modulo.path)}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </main>

             {/* Rodapé Institucional - Design Moderno e Elegante */}
       <footer className="bg-gradient-to-t from-white via-slate-50 to-slate-100 border-t border-slate-200 mt-12">
         <div className="max-w-screen-xl mx-auto px-6 py-4">
           <hr className="border-t border-slate-200 mb-4" />
                       <div className="flex justify-between items-center flex-wrap text-sm">
              <div className="text-slate-600">
                <strong className="text-slate-800">Fiscatus</strong><br />
                <span className="text-slate-500 italic">Fiscatus — Gestão inteligente e integrada de todo o processo licitatório.</span>
              </div>
              <div className="text-slate-400">v1.0.0 – 2025</div>
            </div>
         </div>
       </footer>
    </div>
  );
} 