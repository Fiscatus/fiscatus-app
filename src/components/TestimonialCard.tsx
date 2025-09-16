import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Quote, Calendar, Users } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
  className?: string;
}

export default function TestimonialCard({ testimonial, index, className = "" }: TestimonialCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={className}
    >
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 h-full">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Quote icon */}
          <div className="flex justify-start mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Quote className="w-4 h-4 text-blue-600" />
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            {renderStars(testimonial.rating)}
          </div>

          {/* Content */}
          <blockquote className="text-gray-700 mb-6 flex-1 leading-relaxed">
            "{testimonial.content}"
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {testimonial.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">
                {testimonial.name}
              </div>
              <div className="text-xs text-gray-500">
                {testimonial.role} • {testimonial.organization}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente para solicitar treinamento
export function TrainingRequestCard() {
  const handleRequestTraining = () => {
    // Implementar abertura do modal ou redirecionamento
    console.log("Solicitar treinamento");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Solicitar Treinamento
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Agende um treinamento personalizado com nossa equipe para sua instituição. 
            Aprenda as melhores práticas e otimize o uso do sistema.
          </p>

          <Button
            onClick={handleRequestTraining}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Treinamento
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente principal da seção de comunidade
export function CommunitySection() {
  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Maria Silva",
      role: "Coordenadora de Licitações",
      organization: "Prefeitura de São Paulo",
      content: "O Fiscatus revolucionou nossa gestão de contratações. A integração entre módulos e a facilidade de uso são impressionantes.",
      rating: 5
    },
    {
      id: "2",
      name: "João Santos",
      role: "Diretor de Compras",
      organization: "Governo do Estado",
      content: "A transparência e controle que o sistema oferece nos permitiu otimizar nossos processos em 40%. Recomendo fortemente.",
      rating: 5
    },
    {
      id: "3",
      name: "Ana Costa",
      role: "Gerente de Contratos",
      organization: "Universidade Federal",
      content: "Interface intuitiva e funcionalidades completas. O suporte técnico também é excepcional, sempre disponível quando precisamos.",
      rating: 5
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
          Comunidade & Feedback
        </h2>
        <p className="text-gray-600">
          Veja o que nossos usuários dizem e solicite treinamento personalizado
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Depoimentos */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Depoimentos
          </h3>
          <div className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Solicitar Treinamento */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Treinamento Personalizado
          </h3>
          <TrainingRequestCard />
        </div>
      </div>
    </section>
  );
}
