import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Shield, Zap, Users, Settings, Lock, Code } from "lucide-react";

interface CapabilityCardProps {
  type: "permissions" | "automation";
  index: number;
}

export default function CapabilityCard({ type, index }: CapabilityCardProps) {
  const isPermissions = type === "permissions";

  const permissionsData = {
    title: "Permissões & Acessos",
    description: "Controle granular de acesso com hierarquias flexíveis e papéis personalizáveis",
    icon: <Shield className="w-8 h-8" />,
    gradient: "from-purple-500 to-indigo-600",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    features: [
      "Hierarquias organizacionais flexíveis",
      "Papéis e permissões granulares", 
      "Links públicos seguros",
      "Auditoria completa de acessos",
      "Integração com sistemas externos",
      "Controle de visibilidade por módulo"
    ],
    learnMoreHref: "/docs/permissions"
  };

  const automationData = {
    title: "Automações & Fórmulas",
    description: "Regras no-code e scripts personalizados para otimizar fluxos de trabalho",
    icon: <Zap className="w-8 h-8" />,
    gradient: "from-green-500 to-teal-600", 
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    features: [
      "Regras no-code visuais",
      "Scripts JavaScript opcionais",
      "Triggers automáticos",
      "Fórmulas de cálculo dinâmicas",
      "Notificações inteligentes",
      "Integração com APIs externas"
    ],
    learnMoreHref: "/docs/automation"
  };

  const data = isPermissions ? permissionsData : automationData;

  const handleLearnMore = () => {
    window.open(data.learnMoreHref, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="h-full"
    >
      <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
        <CardHeader className="px-6 pt-6 pb-3 md:pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${data.bgColor}`}>
              <div className={data.iconColor}>
                {data.icon}
              </div>
            </div>
            <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900">
              {data.title}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pb-6 text-gray-600 space-y-6">
          <p className="text-[15px] md:text-base leading-7">
            {data.description}
          </p>

          {/* Features list */}
          <div className="space-y-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Principais funcionalidades
            </div>
            <div className="space-y-2">
              {data.features.map((feature, featureIndex) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + featureIndex * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Visual placeholder */}
          <div className="relative">
            <div className={`h-32 bg-gradient-to-br ${data.gradient} rounded-xl opacity-10 flex items-center justify-center`}>
              <div className="text-white text-4xl opacity-50">
                {isPermissions ? <Lock className="w-12 h-12" /> : <Code className="w-12 h-12" />}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/50 rounded-xl"></div>
          </div>

          {/* CTA */}
          <Button
            onClick={handleLearnMore}
            variant="outline"
            className={`w-full ${isPermissions ? 'border-purple-200 text-purple-700 hover:bg-purple-50' : 'border-green-200 text-green-700 hover:bg-green-50'} transition-all duration-300 hover:scale-105`}
          >
            Learn more
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
