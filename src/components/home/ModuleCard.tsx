import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, ArrowRight, ExternalLink, FolderOpen, Users, ClipboardList, Gavel, BarChart3, Settings, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Module } from "@/hooks/useHomeData";

interface ModuleCardProps {
  module: Module;
  index: number;
  onToggleFavorite: (moduleId: string) => void;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    border: "border-blue-200",
    button: "border-blue-200 text-blue-700 hover:bg-blue-50",
    ring: "ring-blue-500/30"
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600", 
    border: "border-green-200",
    button: "border-green-200 text-green-700 hover:bg-green-50",
    ring: "ring-green-500/30"
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    border: "border-purple-200", 
    button: "border-purple-200 text-purple-700 hover:bg-purple-50",
    ring: "ring-purple-500/30"
  },
  teal: {
    bg: "bg-teal-50",
    icon: "text-teal-600",
    border: "border-teal-200",
    button: "border-teal-200 text-teal-700 hover:bg-teal-50", 
    ring: "ring-teal-500/30"
  },
  indigo: {
    bg: "bg-indigo-50",
    icon: "text-indigo-600",
    border: "border-indigo-200",
    button: "border-indigo-200 text-indigo-700 hover:bg-indigo-50",
    ring: "ring-indigo-500/30"
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    border: "border-amber-200",
    button: "border-amber-200 text-amber-700 hover:bg-amber-50",
    ring: "ring-amber-500/30"
  }
};

const iconMap = {
  FolderOpen,
  Users,
  ClipboardList,
  Gavel,
  BarChart3,
  Settings
};

export default function ModuleCard({ module, index, onToggleFavorite }: ModuleCardProps) {
  const navigate = useNavigate();
  const colors = colorClasses[module.color as keyof typeof colorClasses] || colorClasses.blue;
  const IconComponent = iconMap[module.iconName as keyof typeof iconMap] || FolderOpen;
  const isEnabled = module.id === "planejamento";

  const handleModuleClick = () => {
    if (!isEnabled) return;
    navigate(module.href);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(module.id);
  };

  const handleVerMaterial = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(module.tutorialHref, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card 
        className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 hover:ring-1 ${colors.ring} cursor-pointer min-h-[180px]`}
        onClick={handleModuleClick}
      >
        <CardContent className="p-6 h-full flex flex-col relative">
          {/* Botão de favoritar */}
          <button
            onClick={handleFavoriteToggle}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            aria-label={module.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star 
              className={`w-4 h-4 ${module.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
            />
          </button>

          {/* Ícone no topo */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${colors.bg} mb-4`}>
            <div className={colors.icon}>
              <IconComponent className="w-6 h-6" />
            </div>
          </div>
          
          {/* Conteúdo do card */}
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {module.name}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {module.description}
            </p>
          </div>
          
          {/* Rodapé com ações */}
          <div className="mt-6 space-y-3">
            {isEnabled ? (
              <Button
                variant="outline"
                size="sm"
                className={`w-full ${colors.button} transition-all duration-300`}
              >
                Abrir
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="w-full inline-flex">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        aria-disabled
                        className={`w-full ${colors.button} transition-all duration-300 opacity-60 cursor-not-allowed`}
                      >
                        Em breve
                        <Info className="w-4 h-4 ml-2" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Este módulo estará disponível em breve.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-600 hover:text-gray-900 p-0 h-auto font-medium"
              onClick={handleVerMaterial}
            >
              Ver material
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
