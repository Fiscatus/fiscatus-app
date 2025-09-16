import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, ArrowRight, CheckCircle } from "lucide-react";

export default function AboutCard() {
  const topics = [
    "Planejamento",
    "Execução", 
    "Monitoramento",
    "Relatórios",
    "Integração"
  ];

  const handleVerDocumentacao = () => {
    window.open("/docs", "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="h-full"
    >
      <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
        <CardHeader className="px-6 pt-6 pb-3 md:pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900">
              Sobre o Sistema
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pb-6 text-gray-600 space-y-6">
          <p className="text-[15px] md:text-base leading-7">
            O Fiscatus integra planejamento, execução e monitoramento de 
            contratações públicas em uma plataforma unificada, oferecendo 
            transparência, eficiência e conformidade legal.
          </p>

          {/* Chips de tópicos */}
          <div className="space-y-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Principais funcionalidades
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {topic}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={handleVerDocumentacao}
            variant="outline"
            className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all duration-300 hover:scale-105"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver documentação completa
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
