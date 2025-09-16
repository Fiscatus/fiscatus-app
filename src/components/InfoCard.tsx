import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  MessageCircle, 
  ArrowRight, 
  ExternalLink,
  HelpCircle,
  Users
} from "lucide-react";

interface InfoCardProps {
  type: "system" | "support";
  className?: string;
}

export default function InfoCard({ type, className = "" }: InfoCardProps) {
  const isSystem = type === "system";

  const systemContent = {
    title: "Sobre o Sistema",
    description: "O Fiscatus é uma plataforma completa para gestão de contratações públicas, oferecendo ferramentas integradas para planejamento, execução e monitoramento de processos licitatórios.",
    icon: <BookOpen className="w-8 h-8" />,
    buttonText: "Ver Documentação Completa",
    buttonIcon: <ExternalLink className="w-4 h-4" />,
    gradient: "from-emerald-50 to-teal-100",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    buttonVariant: "outline" as const,
    buttonClass: "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
  };

  const supportContent = {
    title: "Chatbot e Suporte",
    description: "Precisa de ajuda? Nossa equipe está disponível 24/7 através do chatbot inteligente ou suporte ao vivo para esclarecer suas dúvidas.",
    icon: <MessageCircle className="w-8 h-8" />,
    buttonText: "Abrir Suporte ao Vivo",
    buttonIcon: <Users className="w-4 h-4" />,
    gradient: "from-blue-50 to-indigo-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    buttonVariant: "default" as const,
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white"
  };

  const content = isSystem ? systemContent : supportContent;

  const handleButtonClick = () => {
    if (isSystem) {
      // Abrir documentação
      window.open("/docs", "_blank");
    } else {
      // Abrir suporte ao vivo
      window.open("/suporte", "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: isSystem ? 0.2 : 0.4 }}
      className={className}
    >
      <Card className={`bg-gradient-to-br ${content.gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full`}>
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header com ícone */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-xl ${content.iconBg}`}>
              <div className={content.iconColor}>
                {content.icon}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {content.title}
              </h3>
            </div>
          </div>

          {/* Descrição */}
          <p className="text-gray-600 mb-6 flex-1 leading-relaxed">
            {content.description}
          </p>

          {/* Botão de ação */}
          <Button
            onClick={handleButtonClick}
            variant={content.buttonVariant}
            className={`${content.buttonClass} transition-all duration-300 hover:scale-105`}
          >
            {content.buttonIcon}
            <span className="ml-2">{content.buttonText}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
