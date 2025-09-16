import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ArrowRight, BookOpen } from "lucide-react";

export default function TrainingCTA() {
  const handleAgendarTreinamento = () => {
    // Implementar abertura do modal ou redirecionamento
    console.log("Agendar treinamento");
    window.open("/treinamento", "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="h-full"
    >
      <Card className="bg-gradient-to-br from-pink-50 to-orange-100 border-0 shadow-lg h-full">
        <CardContent className="p-8 text-center h-full flex flex-col justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Treinamento Personalizado
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Agende um treinamento personalizado com nossa equipe para sua instituição. 
            Aprenda as melhores práticas e otimize o uso do sistema.
          </p>

          {/* Features do treinamento */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <BookOpen className="w-4 h-4 text-pink-500" />
              <span>Curso personalizado</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-pink-500" />
              <span>Equipe especializada</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-pink-500" />
              <span>Agendamento flexível</span>
            </div>
          </div>

          <Button
            onClick={handleAgendarTreinamento}
            className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar treinamento
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
