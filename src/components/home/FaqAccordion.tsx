import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronDown } from "lucide-react";
import { FAQ } from "@/hooks/useHomeData";

interface FaqAccordionProps {
  faq: FAQ[];
}

export default function FaqAccordion({ faq }: FaqAccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (faq.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            FAQ / Documentação
          </h3>
          <p className="text-[15px] md:text-base text-gray-600 leading-7">
            Encontre respostas rápidas para suas dúvidas
          </p>
        </div>
        
        <Card className="bg-gray-50 border border-gray-200 rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❓</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              FAQ em construção
            </h4>
            <p className="text-gray-600 mb-4">
              As perguntas frequentes estarão disponíveis em breve.
            </p>
            <Button variant="outline" onClick={() => window.open("/docs", "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver documentação
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          FAQ / Documentação
        </h3>
        <p className="text-[15px] md:text-base text-gray-600 leading-7">
          Encontre respostas rápidas para suas dúvidas
        </p>
      </div>

      <div className="space-y-3">
        {faq.map((item, index) => {
          const isOpen = openItems.includes(item.id);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${item.id}`}
                  >
                    <h4 className="text-lg font-semibold text-gray-900 pr-4">
                      {item.question}
                    </h4>
                    <div className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </div>
                  </button>
                  
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      id={`faq-${item.id}`}
                      className="px-6 pb-6"
                    >
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {item.answer}
                        </p>
                        
                        {item.links.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-500">
                              Links úteis:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.links.map((link, linkIndex) => (
                                <Button
                                  key={linkIndex}
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                                  onClick={() => window.open(link.href, "_blank")}
                                >
                                  {link.text}
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
