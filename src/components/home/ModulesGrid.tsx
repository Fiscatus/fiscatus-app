import React from "react";
import { motion } from "framer-motion";
import { Module, useHomeData } from "@/hooks/useHomeData";
import ModuleCard from "./ModuleCard";

export default function ModulesGrid() {
  const { modules, toggleFavorite } = useHomeData();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12 md:mb-16"
    >
      {/* Header da seção */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
          Comece por aqui
        </h2>
        <p className="text-[15px] md:text-base text-gray-600 leading-7">
          Acesse rapidamente os módulos principais do sistema. 
          Marque seus favoritos para acesso ainda mais rápido.
        </p>
      </motion.div>

      {/* Grid de módulos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <ModuleCard
            key={module.id}
            module={module}
            index={index}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {/* Dica sobre favoritos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200"
      >
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-sm">💡</span>
          </div>
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">
              Dica: Marque seus módulos favoritos
            </p>
            <p className="text-sm text-blue-700">
              Clique na estrela para favoritar módulos e vê-los sempre no topo da lista.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
