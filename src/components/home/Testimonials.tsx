import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Maria Silva",
    role: "Coordenadora de Licitações",
    organization: "Prefeitura de São Paulo",
    content: "O Fiscatus revolucionou nossa gestão de contratações. A integração entre módulos e a facilidade de uso são impressionantes. Reduzimos o tempo de processos em 40%.",
    rating: 5
  },
  {
    id: "2",
    name: "João Santos",
    role: "Diretor de Compras",
    organization: "Governo do Estado",
    content: "A transparência e controle que o sistema oferece nos permitiu otimizar nossos processos significativamente. Recomendo fortemente para qualquer órgão público.",
    rating: 5
  },
  {
    id: "3",
    name: "Ana Costa",
    role: "Gerente de Contratos",
    organization: "Universidade Federal",
    content: "Interface intuitiva e funcionalidades completas. O suporte técnico também é excepcional, sempre disponível quando precisamos. Excelente ferramenta!",
    rating: 5
  }
];

export default function Testimonials() {
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
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Depoimentos
        </h3>
        <p className="text-[15px] md:text-base text-gray-600 leading-7">
          Veja o que nossos usuários dizem sobre o Fiscatus
        </p>
      </div>

      <div className="space-y-4">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Quote icon */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Quote className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {renderStars(testimonial.rating)}
                    </div>

                    {/* Content */}
                    <blockquote className="text-gray-700 leading-relaxed">
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
