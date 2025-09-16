import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, ArrowRight, Bot, Clock } from "lucide-react";

export default function SupportCard() {
  const handleAbrirChatbot = () => {
    // Implementar abertura do chatbot
    console.log("Abrir chatbot");
  };

  const handleSuporteAoVivo = () => {
    window.open("/suporte", "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="h-full"
    >
      <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
        <CardHeader className="px-6 pt-6 pb-3 md:pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900">
              Chatbot & Suporte
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pb-6 text-gray-600 space-y-6">
          <p className="text-[15px] md:text-base leading-7">
            Fale com nosso chatbot inteligente ou abra um chamado. 
            Nossa equipe está disponível 24/7 para esclarecer suas dúvidas 
            e oferecer suporte técnico especializado.
          </p>

          {/* Chat teaser */}
          <div className="space-y-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Chat em tempo real
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {/* Mensagem do bot */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
                  <p className="text-sm text-gray-700">
                    Olá! Como posso ajudá-lo hoje?
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-gray-500">Online agora</span>
                  </div>
                </div>
              </div>

              {/* Mensagem do usuário */}
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-blue-600 text-white rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm">
                    Preciso de ajuda com um processo
                  </p>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">U</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              onClick={handleAbrirChatbot}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Abrir chatbot
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              onClick={handleSuporteAoVivo}
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-300"
            >
              <Users className="w-4 h-4 mr-2" />
              Suporte ao vivo
              <Clock className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
