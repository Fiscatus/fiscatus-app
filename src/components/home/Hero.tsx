import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  userName: string;
  stats: {
    created: number;
    active: number;
    concluded: number;
    sla: number;
  };
}

export default function Hero({ userName, stats }: HeroProps) {
  const navigate = useNavigate();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const handleExplorarModulos = () => {
    navigate("/planejamento-da-contratacao");
  };

  const handleAssistirGuia = () => {
    setVideoModalOpen(true);
  };

  const benefits = [
    { label: "Rápido", icon: <Zap className="w-3 h-3" /> },
    { label: "Seguro", icon: <Shield className="w-3 h-3" /> },
    { label: "Escalável", icon: <TrendingUp className="w-3 h-3" /> }
  ];

  const microStats = [
    { label: "Processos criados", value: `+${stats.created.toLocaleString()}` },
    { label: "Processos ativos", value: `+${stats.active.toLocaleString()}` },
    { label: "SLA suporte", value: `${stats.sla}%` }
  ];

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 md:mb-16"
      >
        <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            {/* Hero Principal */}
            <div className="md:grid md:grid-cols-12 gap-8 p-6 md:p-8">
              {/* Coluna A - Texto */}
              <div className="md:col-span-7 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
                    Bem-vindo ao{" "}
                    <span className="text-blue-600">Fiscatus</span>,{" "}
                    <span className="text-indigo-600">
                      {userName.split(" ")[0]}
                    </span>
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-4"
                >
                  <p className="text-[15px] md:text-base text-gray-600 leading-7">
                    Sua central para gerenciar contratações públicas de forma
                    inteligente e integrada. Planeje, execute e monitore todos os
                    processos em uma única plataforma.
                  </p>

                  {/* Mini-badges de benefícios */}
                  <div className="flex flex-wrap gap-2">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={benefit.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      >
                        <Badge 
                          variant="secondary" 
                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          {benefit.icon}
                          <span className="ml-1">{benefit.label}</span>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button
                    onClick={handleExplorarModulos}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Explorar módulos
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <Button
                    onClick={handleAssistirGuia}
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-3 text-lg font-medium transition-all duration-300 hover:scale-105"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Assistir guia rápido
                  </Button>
                </motion.div>
              </div>

              {/* Coluna B - Visual */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="md:col-span-5 flex justify-center md:justify-end"
              >
                <div className="relative">
                  <Card className="bg-gradient-to-br from-indigo-500 to-blue-600 border-0 shadow-2xl w-64 h-64 flex items-center justify-center">
                    <CardContent className="p-0 text-center">
                      <div className="text-white text-8xl font-bold opacity-90 mb-2">
                        F
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30">
                        Ativo
                      </Badge>
                    </CardContent>
                  </Card>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Apoio - Micro-estatísticas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="border-t border-gray-100 px-6 md:px-8 py-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {microStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
