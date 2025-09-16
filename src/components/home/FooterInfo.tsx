import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, FileText, HelpCircle } from "lucide-react";
import logo from "@/assets/logo_fiscatus.png";

export default function FooterInfo() {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (link: string) => {
    // Implementar navegação ou abertura de links
    console.log(`Abrindo: ${link}`);
    window.open(link, "_blank");
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-12 md:mt-16"
    >
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informações Institucionais */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo Fiscatus" className="w-10 h-10" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Fiscatus
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gestão inteligente e integrada para contratações públicas
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                Transformando a gestão pública através de tecnologia inovadora, 
                transparência e eficiência nos processos de contratação.
              </p>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Sistema ativo e operacional</span>
              </div>
            </div>

            {/* Links Úteis */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Links Úteis
              </h4>
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start p-0 h-auto text-gray-600 hover:text-gray-900"
                  onClick={() => handleLinkClick("/politica-privacidade")}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Política de Privacidade
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start p-0 h-auto text-gray-600 hover:text-gray-900"
                  onClick={() => handleLinkClick("/termos-uso")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Termos de Uso
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start p-0 h-auto text-gray-600 hover:text-gray-900"
                  onClick={() => handleLinkClick("/suporte")}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Suporte Técnico
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            {/* Informações da Versão */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Informações
              </h4>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Versão:</span> v1.0.0
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Ano:</span> {currentYear}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Ambiente:</span>{" "}
                  <span className="text-green-600 font-medium">Produção</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="text-green-600 font-medium">Ativo</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Desenvolvido para transformar a gestão pública brasileira.
                </p>
              </div>
            </div>
          </div>

          {/* Linha de separação e copyright */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500 text-center md:text-left">
                © {currentYear} Fiscatus. Todos os direitos reservados.
              </p>
              <p className="text-sm text-gray-500 text-center md:text-right">
                Desenvolvido com ❤️ para a administração pública
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.footer>
  );
}
