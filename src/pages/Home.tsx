import React from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { useHomeData } from "@/hooks/useHomeData";
import Hero from "@/components/home/Hero";
import AboutCard from "@/components/home/AboutCard";
import SupportCard from "@/components/home/SupportCard";
import ModulesGrid from "@/components/home/ModulesGrid";
import VideosList from "@/components/home/VideosList";
import FaqAccordion from "@/components/home/FaqAccordion";
import CapabilityCard from "@/components/home/CapabilityCard";
import Testimonials from "@/components/home/Testimonials";
import TrainingCTA from "@/components/home/TrainingCTA";
import FooterInfo from "@/components/home/FooterInfo";
import ChatbotWidget from "@/components/ChatbotWidget";
import Sidebar from "@/components/Sidebar";
import logo from "@/assets/logo_fiscatus.png";
import { Menu } from "lucide-react";

export default function Home() {
  const { user, stats, videos, faq } = useHomeData();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="fixed top-0 left-0 w-full h-14 sm:h-16 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="w-4 h-4 text-gray-600" />
          </button>
          <img src={logo} className="w-8 h-8 md:w-10 md:h-10" alt="Logo Fiscatus" />
          <span className="text-lg md:text-2xl font-bold text-gray-800">Fiscatus</span>
        </div>
        <div className="text-sm text-gray-600">
          {user?.nome ? `Olá, ${user.nome.split(" ")[0]}` : "Bem-vindo"}
        </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Conteúdo principal */}
      <main className="pt-14 sm:pt-16 md:pt-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          {/* A) Hero editorial */}
          <Hero userName={user.name} stats={stats} />

          {/* B) Sobre & Suporte */}
          <section className="mb-12 md:mb-16">
            <div className="grid grid-cols-12 gap-6 md:gap-8">
              <div className="col-span-12 lg:col-span-6">
                <AboutCard />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <SupportCard />
              </div>
            </div>
          </section>

          {/* C) Comece por aqui - Guia Rápido de Módulos */}
          <ModulesGrid />

          {/* D) Tutoriais & FAQ */}
          <section className="mb-12 md:mb-16">
            <div className="grid grid-cols-12 gap-6 md:gap-8">
              <div className="col-span-12 lg:col-span-7">
                <VideosList videos={videos} />
              </div>
              <div className="col-span-12 lg:col-span-5">
                <FaqAccordion faq={faq} />
              </div>
            </div>
          </section>

          {/* E) Permissões & Automação */}
          <section className="mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                Permissões & Automações
              </h2>
              <p className="text-[15px] md:text-base text-gray-600 leading-7">
                Recursos avançados para personalizar e otimizar seu fluxo de trabalho
              </p>
            </motion.div>
            
            <div className="grid grid-cols-12 gap-6 md:gap-8">
              <div className="col-span-12 lg:col-span-6">
                <CapabilityCard type="permissions" index={0} />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <CapabilityCard type="automation" index={1} />
              </div>
            </div>
          </section>

          {/* F) Depoimentos & Treinamento */}
          <section className="mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                Comunidade & Feedback
              </h2>
              <p className="text-[15px] md:text-base text-gray-600 leading-7">
                Veja o que nossos usuários dizem e solicite treinamento personalizado
              </p>
            </motion.div>
            
            <div className="grid grid-cols-12 gap-6 md:gap-8">
              <div className="col-span-12 lg:col-span-7">
                <Testimonials />
              </div>
              <div className="col-span-12 lg:col-span-5">
                <TrainingCTA />
              </div>
            </div>
          </section>

          {/* G) Rodapé institucional */}
          <FooterInfo />
        </div>
      </main>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
} 