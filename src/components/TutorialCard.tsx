import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, ArrowRight } from "lucide-react";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: string;
}

interface TutorialCardProps {
  tutorial: Tutorial;
  index: number;
  className?: string;
}

export default function TutorialCard({ tutorial, index, className = "" }: TutorialCardProps) {
  const handlePlay = () => {
    // Implementar abertura do vídeo
    console.log(`Reproduzir tutorial: ${tutorial.title}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={className}
    >
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20"></div>
            <Button
              onClick={handlePlay}
              size="lg"
              className="bg-white/90 hover:bg-white text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Play className="w-6 h-6 mr-2" />
              Assistir
            </Button>
            <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {tutorial.duration}
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            <div className="mb-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {tutorial.category}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {tutorial.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {tutorial.description}
            </p>

            <Button
              onClick={handlePlay}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
            >
              Assistir tutorial
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente para FAQ
export function FaqAccordion() {
  const faqs = [
    {
      id: "1",
      question: "Como criar meu primeiro processo de contratação?",
      answer: "Para criar um processo, acesse o módulo 'Planejamento da Contratação' e clique em 'Novo Processo'. Preencha as informações básicas e siga o fluxo guiado do sistema."
    },
    {
      id: "2", 
      question: "Posso personalizar os fluxos de trabalho?",
      answer: "Sim! No módulo 'Configurações do Fluxo', você pode personalizar etapas, aprovações e modelos conforme as necessidades da sua instituição."
    },
    {
      id: "3",
      question: "Como acompanhar o progresso dos processos?",
      answer: "Use o módulo 'Relatórios' para visualizar dashboards em tempo real, ou acesse 'Meus Processos' para acompanhar cada processo individualmente."
    },
    {
      id: "4",
      question: "O sistema funciona offline?",
      answer: "O Fiscatus é uma aplicação web que requer conexão com a internet para funcionar. Recomendamos uma conexão estável para melhor experiência."
    },
    {
      id: "5",
      question: "Como obter suporte técnico?",
      answer: "Você pode usar o chatbot no canto inferior direito, abrir um chamado de suporte ao vivo, ou consultar nossa documentação completa."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-4"
    >
      {faqs.map((faq, index) => (
        <motion.div
          key={faq.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 * index }}
        >
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-6">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-gray-900 group-open:text-blue-600">
                    {faq.question}
                  </h3>
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center group-open:bg-blue-100 transition-colors">
                    <span className="text-gray-600 group-open:text-blue-600 text-sm">+</span>
                  </div>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Componente principal da seção de tutoriais
export function TutorialSection() {
  const tutorials: Tutorial[] = [
    {
      id: "1",
      title: "Como criar um processo de contratação",
      description: "Aprenda o passo a passo completo para criar seu primeiro processo no sistema.",
      duration: "8:30",
      thumbnail: "/tutorial-1.jpg",
      category: "Básico"
    },
    {
      id: "2",
      title: "Emitir relatórios personalizados",
      description: "Descubra como gerar relatórios detalhados e personalizar dashboards.",
      duration: "12:15",
      thumbnail: "/tutorial-2.jpg",
      category: "Intermediário"
    },
    {
      id: "3",
      title: "Configurar fluxos de aprovação",
      description: "Configure aprovações automáticas e fluxos de trabalho personalizados.",
      duration: "15:45",
      thumbnail: "/tutorial-3.jpg",
      category: "Avançado"
    }
  ];

  return (
    <section className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Tutoriais & Recursos
        </h2>
        <p className="text-gray-600">
          Aprenda a usar o sistema com nossos tutoriais e encontre respostas rápidas
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tutoriais em Vídeo */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Tutoriais em Vídeo
          </h3>
          <div className="space-y-4">
            {tutorials.map((tutorial, index) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* FAQ / Documentação */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            FAQ / Documentação
          </h3>
          <FaqAccordion />
        </div>
      </div>
    </section>
  );
}
