import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FolderOpen, 
  Users, 
  ClipboardList, 
  Gavel, 
  BarChart3, 
  Settings,
  Star,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Module {
  id: string;
  nome: string;
  descricao: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgColor: string;
  iconColor: string;
}

interface ModuleCardProps {
  module: Module;
  index: number;
  className?: string;
}

const moduleColors = [
  { color: "blue", bgColor: "bg-blue-50", iconColor: "text-blue-600", borderColor: "border-blue-200" },
  { color: "green", bgColor: "bg-green-50", iconColor: "text-green-600", borderColor: "border-green-200" },
  { color: "purple", bgColor: "bg-purple-50", iconColor: "text-purple-600", borderColor: "border-purple-200" },
  { color: "teal", bgColor: "bg-teal-50", iconColor: "text-teal-600", borderColor: "border-teal-200" },
  { color: "indigo", bgColor: "bg-indigo-50", iconColor: "text-indigo-600", borderColor: "border-indigo-200" },
  { color: "orange", bgColor: "bg-orange-50", iconColor: "text-orange-600", borderColor: "border-orange-200" }
];

export default function ModuleCard({ module, index, className = "" }: ModuleCardProps) {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const colors = moduleColors[index % moduleColors.length];

  useEffect(() => {
    // Carregar favoritos do localStorage
    const favorites = JSON.parse(localStorage.getItem('favoriteModules') || '[]');
    setIsFavorited(favorites.includes(module.id));
  }, [module.id]);

  const handleModuleClick = () => {
    navigate(module.path);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('favoriteModules') || '[]');
    const newFavorites = isFavorited 
      ? favorites.filter((id: string) => id !== module.id)
      : [...favorites, module.id];
    
    localStorage.setItem('favoriteModules', JSON.stringify(newFavorites));
    setIsFavorited(!isFavorited);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={className}
    >
      <Card 
        className={`bg-white border border-gray-200 rounded-2xl cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-gray-300 h-full ${colors.borderColor}`}
        onClick={handleModuleClick}
      >
        <CardContent className="p-6 h-full flex flex-col relative">
          {/* Botão de favoritar */}
          <button
            onClick={handleFavoriteToggle}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star 
              className={`w-4 h-4 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
            />
          </button>

          {/* Ícone no topo */}
          <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${colors.bgColor} mb-4`}>
            <div className={colors.iconColor}>
              {module.icon}
            </div>
          </div>
          
          {/* Conteúdo do card */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {module.nome}
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {module.descricao}
            </p>
          </div>
          
          {/* Botão de ação */}
          <div className="flex justify-between items-center mt-auto">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 p-0 h-auto font-medium"
            >
              Abrir
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente para a seção de módulos
export function ModuleSection() {
  const modules: Module[] = [
    {
      id: "planejamento",
      nome: "Planejamento da Contratação",
      descricao: "Organize todas as fases da contratação: da demanda inicial à publicação do edital.",
      icon: <FolderOpen className="w-8 h-8" />,
      path: "/planejamento-da-contratacao"
    },
    {
      id: "gestao",
      nome: "Gestão Contratual",
      descricao: "Gerencie contratos e documentos de forma centralizada.",
      icon: <Users className="w-8 h-8" />,
      path: "/gestao-contratual"
    },
    {
      id: "execucao",
      nome: "Execução Contratual",
      descricao: "Monitore a execução do contrato com controle de entregas, fiscalizações e aditivos.",
      icon: <ClipboardList className="w-8 h-8" />,
      path: "/execucao-contratual"
    },
    {
      id: "licitatorio",
      nome: "Processo Licitatório",
      descricao: "Acompanhe o processo licitatório desde a abertura até a homologação.",
      icon: <Gavel className="w-8 h-8" />,
      path: "/processo-licitatorio"
    },
    {
      id: "relatorios",
      nome: "Relatórios",
      descricao: "Visualize dados estratégicos em relatórios automáticos e dashboards personalizáveis.",
      icon: <BarChart3 className="w-8 h-8" />,
      path: "/relatorios"
    },
    {
      id: "configuracoes",
      nome: "Configurações do Fluxo",
      descricao: "Personalize o fluxo de trabalho e os modelos padrão conforme a instituição.",
      icon: <Settings className="w-8 h-8" />,
      path: "/configuracoes-fluxo"
    }
  ];

  // Ordenar módulos: favoritos primeiro
  const [sortedModules, setSortedModules] = useState(modules);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favoriteModules') || '[]');
    const sorted = [...modules].sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id);
      const bIsFavorite = favorites.includes(b.id);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return 0;
    });
    
    setSortedModules(sorted);
  }, []);

  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Comece por aqui
        </h2>
        <p className="text-gray-600">
          Acesse rapidamente os módulos principais do sistema
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedModules.map((module, index) => (
          <ModuleCard
            key={module.id}
            module={module}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
