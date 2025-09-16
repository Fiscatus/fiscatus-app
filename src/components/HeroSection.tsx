import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, ArrowRight, BookOpen } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className = "" }: HeroSectionProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const handleExplorarModulos = () => {
    navigate("/planejamento-da-contratacao");
  };

  const handleAssistirGuia = () => {
    setVideoModalOpen(true);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`${className}`}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Conteúdo Principal */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    Bem-vindo ao{" "}
                    <span className="text-blue-600">Fiscatus</span>,{" "}
                    <span className="text-indigo-600">
                      {user?.nome?.split(" ")[0] || "Usuário"}
                    </span>
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-lg md:text-xl text-gray-600 leading-relaxed"
                >
                  Sua central para gerenciar contratações públicas de forma
                  inteligente e integrada.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button
                    onClick={handleExplorarModulos}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Explorar Módulos
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <Button
                    onClick={handleAssistirGuia}
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-3 text-lg font-medium transition-all duration-300"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Assistir Guia Rápido
                  </Button>
                </motion.div>
              </div>

              {/* Ilustração/Ícone */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex justify-center lg:justify-end"
              >
                <div className="relative">
                  <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center">
                    <div className="text-white text-8xl font-bold opacity-90">
                      F
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Modal de Vídeo Tutorial */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Guia Rápido do Fiscatus</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <Play className="w-16 h-16 text-gray-400 mx-auto" />
              <p className="text-gray-600">
                Vídeo tutorial será implementado aqui
              </p>
              <p className="text-sm text-gray-500">
                Em breve: guia completo de como usar o sistema
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
