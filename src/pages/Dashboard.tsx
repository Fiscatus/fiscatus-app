import React from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GradientCard } from "@/components/ui/gradient-card";
import { 
  FolderOpen,
  ClipboardList,
  Gavel,
  BarChart2,
  SlidersHorizontal,
  Users,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoFiscatus from "@/assets/logo_fiscatus.png";

export default function Dashboard() {
  const navigate = useNavigate();

  // Módulos do sistema com design moderno e tecnológico
  const modulos = [
    {
      nome: "Planejamento da Contratação",
      descricao: "Coordene desde o DFD até a publicação do edital com controle total do fluxo.",
      icon: <FolderOpen className="w-6 h-6" />,
      path: "/planejamento-da-contratacao",
      gradientColors: {
        primary: "rgba(59, 130, 246, 0.7)", // Blue
        secondary: "rgba(37, 99, 235, 0.7)", // Indigo
        accent: "rgba(29, 78, 216, 0.7)" // Dark Blue
      }
    },
    {
      nome: "Execução Contratual",
      descricao: "Monitore a execução dos contratos com rastreio de entregas, aditivos e recebimentos.",
      icon: <ClipboardList className="w-6 h-6" />,
      path: "/execucao-contratual",
      gradientColors: {
        primary: "rgba(16, 185, 129, 0.7)", // Emerald
        secondary: "rgba(5, 150, 105, 0.7)", // Green
        accent: "rgba(4, 120, 87, 0.7)" // Dark Green
      }
    },
    {
      nome: "Pregão e Jurídico",
      descricao: "Gerencie as fases pós-publicação com foco em pareceres jurídicos e atuação do pregoeiro.",
      icon: <Gavel className="w-6 h-6" />,
      path: "/pregao-juridico",
      gradientColors: {
        primary: "rgba(139, 92, 246, 0.7)", // Violet
        secondary: "rgba(124, 58, 237, 0.7)", // Purple
        accent: "rgba(109, 40, 217, 0.7)" // Dark Purple
      }
    },
    {
      nome: "Relatórios",
      descricao: "Visualize dados estratégicos com relatórios e painéis personalizados.",
      icon: <BarChart2 className="w-6 h-6" />,
      path: "/relatorios",
      gradientColors: {
        primary: "rgba(99, 102, 241, 0.7)", // Indigo
        secondary: "rgba(79, 70, 229, 0.7)", // Purple
        accent: "rgba(67, 56, 202, 0.7)" // Dark Indigo
      }
    },
    {
      nome: "Configurações do Fluxo",
      descricao: "Configure fluxos, etapas e padrões conforme as diretrizes da sua instituição.",
      icon: <SlidersHorizontal className="w-6 h-6" />,
      path: "/configuracoes-fluxo",
      gradientColors: {
        primary: "rgba(100, 116, 139, 0.7)", // Slate
        secondary: "rgba(71, 85, 105, 0.7)", // Gray
        accent: "rgba(51, 65, 85, 0.7)" // Dark Gray
      }
    },
    {
      nome: "Administração do Sistema",
      descricao: "Administre usuários, perfis de acesso e dados institucionais com segurança.",
      icon: <Users className="w-6 h-6" />,
      path: "/administracao",
      gradientColors: {
        primary: "rgba(107, 114, 128, 0.7)", // Gray
        secondary: "rgba(75, 85, 99, 0.7)", // Dark Gray
        accent: "rgba(55, 65, 81, 0.7)" // Darker Gray
      }
    }
  ];

  const handleModuloClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      <AuroraBackground>
        {/* Layout principal com flex responsivo */}
        <div className="flex flex-col md:flex-row h-screen w-full">
          
          {/* Coluna da logo à esquerda */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center h-full">
            {/* Título principal */}
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-center bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-transparent bg-clip-text mb-4">
              Fiscatus
            </h1>
            
            {/* Subtítulo 1 */}
            <p className="text-lg md:text-xl text-black text-center mb-2 font-medium">
              Sistema de Gestão Contratual
            </p>
            
            {/* Subtítulo 2 */}
            <p className="text-sm md:text-base text-black/80 text-center mb-8 font-light">
              Gestão inteligente e integrada para contratações públicas
            </p>
            
            <img
              src={logoFiscatus}
              alt="Logo Fiscatus"
              className="w-80 h-80 md:w-96 md:h-96 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Coluna da direita: apenas cards */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 md:px-12 py-4">
            
            {/* Grid de Módulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-xl">
              {modulos.map((modulo, index) => (
                <GradientCard
                  key={index}
                  title={modulo.nome}
                  description={modulo.descricao}
                  icon={modulo.icon}
                  onClick={() => handleModuloClick(modulo.path)}
                  gradientColors={modulo.gradientColors}
                  size="sm"
                  className="transform hover:scale-105 transition-all duration-300"
                />
              ))}
            </div>
          </div>
        </div>
      </AuroraBackground>
    </div>
  );
} 