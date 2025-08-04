import React, { useRef } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GradientCard } from "@/components/ui/gradient-card";
import { AnimatedBeam } from "@/components/ui/animated-beam";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);
  const card5Ref = useRef<HTMLDivElement>(null);
  const card6Ref = useRef<HTMLDivElement>(null);

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
    <div className="h-screen w-full overflow-hidden" ref={containerRef}>
      <AuroraBackground>
        {/* Layout principal com logo central e cards ao redor */}
        <div className="relative h-screen w-full flex items-center justify-center">
          
                               {/* Logo central */}
          <div 
            ref={logoRef}
            className="absolute z-30 flex flex-col items-center justify-center"
          >
            {/* Título principal */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-center bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-transparent bg-clip-text mb-4">
              Fiscatus
            </h1>
            
            {/* Subtítulo 1 */}
            <p className="text-base md:text-lg lg:text-xl text-black text-center mb-2 font-medium">
              Sistema de Gestão Contratual
            </p>
            
            {/* Subtítulo 2 */}
            <p className="text-sm md:text-base lg:text-lg text-black/80 text-center mb-6 font-light">
              Gestão inteligente e integrada para contratações públicas
            </p>
            
            {/* Logo central */}
            <div className="mb-8">
              <img
                src={logoFiscatus}
                alt="Logo Fiscatus"
                className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 object-contain drop-shadow-2xl"
              />
            </div>
          </div>

                                 {/* Cards posicionados ao redor da logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Coluna Esquerda */}
              <div className="absolute left-0 md:left-4 lg:left-8 xl:left-12 flex flex-col justify-center h-full gap-16 md:gap-20 lg:gap-24 z-20">
                {/* Card 1 - Superior Esquerdo */}
                <div ref={card1Ref} className="w-56 h-40">
                  <GradientCard
                    title={modulos[0].nome}
                    description={modulos[0].descricao}
                    icon={modulos[0].icon}
                    onClick={() => handleModuloClick(modulos[0].path)}
                    gradientColors={modulos[0].gradientColors}
                    size="sm"
                    className="w-full h-full transform hover:scale-105 transition-all duration-300"
                  />
                </div>

                {/* Card 3 - Meio Esquerda */}
                <div ref={card3Ref} className="w-56 h-40">
                  <GradientCard
                    title={modulos[2].nome}
                    description={modulos[2].descricao}
                    icon={modulos[2].icon}
                    onClick={() => handleModuloClick(modulos[2].path)}
                    gradientColors={modulos[2].gradientColors}
                    size="sm"
                    className="w-full h-full transform hover:scale-105 transition-all duration-300"
                  />
                </div>

                {/* Card 5 - Inferior Esquerdo */}
                <div ref={card5Ref} className="w-56 h-40">
                  <GradientCard
                    title={modulos[4].nome}
                    description={modulos[4].descricao}
                    icon={modulos[4].icon}
                    onClick={() => handleModuloClick(modulos[4].path)}
                    gradientColors={modulos[4].gradientColors}
                    size="sm"
                    className="w-full h-full transform hover:scale-105 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Coluna Direita */}
              <div className="absolute right-0 md:right-4 lg:right-8 xl:right-12 flex flex-col justify-center h-full gap-16 md:gap-20 lg:gap-24 z-20">
                {/* Card 2 - Superior Direito */}
                <div ref={card2Ref} className="w-56 h-40">
                  <GradientCard
                    title={modulos[1].nome}
                    description={modulos[1].descricao}
                    icon={modulos[1].icon}
                    onClick={() => handleModuloClick(modulos[1].path)}
                    gradientColors={modulos[1].gradientColors}
                    size="sm"
                    className="w-full h-full transform hover:scale-105 transition-all duration-300"
                  />
                </div>

                {/* Card 4 - Meio Direita */}
                <div ref={card4Ref} className="w-56 h-40">
                  <GradientCard
                    title={modulos[3].nome}
                    description={modulos[3].descricao}
                    icon={modulos[3].icon}
                    onClick={() => handleModuloClick(modulos[3].path)}
                    gradientColors={modulos[3].gradientColors}
                    size="sm"
                    className="w-full h-full transform hover:scale-105 transition-all duration-300"
                  />
                </div>

                {/* Card 6 - Inferior Direito */}
                <div ref={card6Ref} className="w-56 h-40">
                  <GradientCard
                    title={modulos[5].nome}
                    description={modulos[5].descricao}
                    icon={modulos[5].icon}
                    onClick={() => handleModuloClick(modulos[5].path)}
                    gradientColors={modulos[5].gradientColors}
                    size="sm"
                    className="w-full h-full transform hover:scale-105 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

          {/* Feixes animados conectando a logo aos cards */}
          <div className="absolute inset-0 z-10">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               <AnimatedBeam
                     containerRef={containerRef}
                     fromRef={logoRef}
                     toRef={card1Ref}
                     curvature={-6}
                     delay={0}
                     gradientStartColor="#6b7280"
                     gradientStopColor="#9ca3af"
                     startXOffset={-120}
                     endXOffset={-60}
                     endYOffset={0}
                   />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               <AnimatedBeam
                     containerRef={containerRef}
                     fromRef={logoRef}
                     toRef={card2Ref}
                     curvature={6}
                     delay={0.2}
                     gradientStartColor="#6b7280"
                     gradientStopColor="#9ca3af"
                     startXOffset={120}
                     endXOffset={60}
                     endYOffset={0}
                   />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               <AnimatedBeam
                     containerRef={containerRef}
                     fromRef={logoRef}
                     toRef={card3Ref}
                     curvature={-6}
                     delay={0.4}
                     gradientStartColor="#6b7280"
                     gradientStopColor="#9ca3af"
                     startXOffset={-120}
                     endXOffset={-60}
                     endYOffset={0}
                   />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               <AnimatedBeam
                     containerRef={containerRef}
                     fromRef={logoRef}
                     toRef={card4Ref}
                     curvature={6}
                     delay={0.6}
                     gradientStartColor="#6b7280"
                     gradientStopColor="#9ca3af"
                     startXOffset={120}
                     endXOffset={60}
                     endYOffset={0}
                   />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               <AnimatedBeam
                      containerRef={containerRef}
                      fromRef={logoRef}
                      toRef={card5Ref}
                      curvature={-6}
                      delay={0.8}
                      gradientStartColor="#6b7280"
                      gradientStopColor="#9ca3af"
                      startXOffset={-120}
                      endXOffset={-40}
                      endYOffset={0}
                    />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               <AnimatedBeam
                       containerRef={containerRef}
                       fromRef={logoRef}
                       toRef={card6Ref}
                       curvature={6}
                       delay={1.0}
                       gradientStartColor="#6b7280"
                       gradientStopColor="#9ca3af"
                       startXOffset={120}
                       endXOffset={20}
                       endYOffset={0}
                     />
          </div>
        </div>
      </AuroraBackground>
    </div>
  );
} 