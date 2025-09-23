import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroWithMockup } from "@/components/ui/hero-with-mockup";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ScrollEffects } from "@/components/interactive/ScrollEffects";
import { 
  FolderOpen,
  ClipboardList,
  Gavel,
  BarChart3,
  Settings,
  Users,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Play,
  Headphones,
  X,
  Send,
  Bot,
  User,
  MessageSquare,
  LifeBuoy,
  Mail,
  Clock
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import Topbar from "@/components/Topbar";
import logo from "@/assets/logo_fiscatus.png";

// Topbar do Dashboard passa a reutilizar o componente Topbar padrão do sistema

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();

  // Ativar scroll reveals
  useScrollReveal();

  const modulosSectionRef = React.useRef<HTMLDivElement | null>(null);
  const tutoriaisSectionRef = React.useRef<HTMLDivElement | null>(null);

  // Estado do chatbot - lazy loading
  const [chatbotOpen, setChatbotOpen] = React.useState(false);
  const [chatMessages, setChatMessages] = React.useState<Array<{
    id: number;
    role: 'bot' | 'user';
    text: string;
    timestamp: Date;
  }>>(() => [
    {
      id: 1,
      role: 'bot',
      text: 'Olá! Sou o assistente Fiscatus. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const chatRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  React.useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Respostas automáticas do bot
  const getBotResponse = React.useCallback((userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('dfd') || message.includes('planejamento')) {
      return 'Para iniciar um DFD, acesse o módulo "Planejamento da Contratação" no painel principal. Lá você encontrará todas as ferramentas para organizar sua demanda.';
    }
    
    if (message.includes('fluxo') || message.includes('configurar')) {
      return 'Os fluxos podem ser personalizados em "Configurações do Fluxo". Você pode definir etapas, responsáveis e regras específicas para sua instituição.';
    }
    
    if (message.includes('relatório') || message.includes('dados')) {
      return 'No módulo "Relatórios" você tem acesso a dashboards personalizáveis e relatórios automáticos. Que tipo de informação você precisa?';
    }
    
    if (message.includes('assinatura') || message.includes('documento')) {
      return 'As assinaturas digitais estão integradas em todo o sistema. Acesse "Minhas Assinaturas" para gerenciar documentos pendentes.';
    }
    
    if (message.includes('ajuda') || message.includes('suporte')) {
      return 'Posso ajudar com dúvidas sobre o sistema. Você também pode acessar a documentação completa ou falar com nossa equipe de suporte.';
    }
    
    return 'Entendi sua pergunta. Para uma resposta mais específica, posso conectar você com nossa equipe de suporte especializada. Deseja que eu faça isso?';
  }, []);

  const sendMessage = React.useCallback(() => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user' as 'user',
      text: inputValue.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simular resposta do bot
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        role: 'bot' as 'bot',
        text: getBotResponse(inputValue),
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  }, [inputValue, getBotResponse]);

  const handleKeyPress = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Indicadores removidos conforme solicitação

  // Módulos do sistema com design limpo e moderno
  const modulos = React.useMemo(() => [
    {
      nome: "Planejamento da Contratação",
      descricao: "Organize todas as fases da contratação: da demanda inicial à publicação do edital.",
      icon: <FolderOpen className="w-6 h-6" />,
      path: "/planejamento-da-contratacao"
    },
    {
      nome: "Gestão Contratual",
      descricao: "Gerencie contratos e documentos de forma centralizada.",
      icon: <Users className="w-6 h-6" />,
      path: "/gestao-contratual"
    },
    {
      nome: "Execução Contratual",
      descricao: "Monitore a execução do contrato com controle de entregas, fiscalizações e aditivos.",
      icon: <ClipboardList className="w-6 h-6" />,
      path: "/execucao-contratual"
    },
    {
      nome: "Processo Licitatório",
      descricao: "Acompanhe o processo licitatório desde a abertura até a homologação.",
      icon: <Gavel className="w-6 h-6" />,
      path: "/processo-licitatorio"
    },
    {
      nome: "Relatórios",
      descricao: "Visualize dados estratégicos em relatórios automáticos e dashboards personalizáveis.",
      icon: <BarChart3 className="w-6 h-6" />,
      path: "/relatorios"
    },
    {
      nome: "Configurações do Fluxo",
      descricao: "Personalize o fluxo de trabalho e os modelos padrão conforme a instituição.",
      icon: <Settings className="w-6 h-6" />,
      path: "/configuracoes-fluxo"
    }
  ], []);


  const handleModuloClick = React.useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="read-progress" />
      <ScrollEffects />
      
      <Topbar />
      
      {/* Botões flutuantes de suporte */}
      <div className="fixed right-3 md:right-5 bottom-4 md:bottom-6 z-40 flex flex-col gap-2 md:gap-3">
        <button
          onClick={() => setChatbotOpen(true)}
          aria-label="Abrir chatbot de suporte"
          className="w-10 h-10 md:w-11 md:h-11 rounded-full shadow-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
        >
          <Headphones aria-label="Suporte" className="w-5 h-5 md:w-5 md:h-5 text-blue-600" />
        </button>
      </div>
      
      <main className="pt-16 md:pt-20 px-6 py-8 flex-1">

        {/* 1. Hero de boas-vindas */}
        <div data-reveal>
          <HeroWithMockup
            title={`Bem-vindo, ${user?.nome?.split(' ')[0] || 'Usuário'}`}
            description="Sua central para gerenciar contratações públicas de forma inteligente e integrada."
            primaryCta={{ 
              text: "Explorar Módulos", 
              onClick: React.useCallback(() => modulosSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), [])
            }}
            secondaryCta={{ 
              text: "Assistir Guia Rápido", 
              onClick: React.useCallback(() => tutoriaisSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), [])
            }}
            mockupImage={{
              alt: "Painel do Fiscatus",
              width: 1248,
              height: 765,
              src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=60"
            }}
            glowVariant="above"
            glowSize="xl"
            glowColor="brand"
          />
          </div>

        {/* Seção de indicadores foi removida */}

        {/* 2. Módulos do Sistema */}
        <section ref={modulosSectionRef} className="mb-12">
          <header data-reveal className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
            Módulos do Sistema
          </h2>
          </header>
          <div data-reveal-stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulos.map((modulo, index) => (
              <div key={index} className="group relative h-48 rounded-2xl p-[1px] bg-gradient-to-br from-gray-200/60 to-transparent hover:from-blue-200/60 hover:to-purple-200/60 transition-all duration-200">
                <div className="h-full rounded-2xl bg-white border border-gray-200 shadow-sm group-hover:shadow-md overflow-hidden">
                  <div className="p-5 relative flex flex-col h-full">
                    {/* canto de acento */}
                    <div className="pointer-events-none absolute -right-6 -top-6 w-20 h-20 bg-blue-100/40 rounded-full blur-2xl group-hover:bg-blue-200/60" />
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 ring-1 ring-blue-100">
                          {modulo.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[17px] font-semibold text-gray-900 leading-snug truncate">{modulo.nome}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 line-clamp-2">{modulo.descricao}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-start">
                      {(() => {
                        const isEnabled = modulo.path === "/planejamento-da-contratacao";
                        if (isEnabled) {
                          return (
                            <button
                              onClick={() => handleModuloClick(modulo.path)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 shadow-sm"
                            >
                              Abrir
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          );
                        }
                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <button
                                    disabled
                                    aria-disabled
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-500 text-sm cursor-not-allowed shadow-sm"
                                  >
                                    Em breve
                                    <Info className="w-4 h-4" />
                                  </button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Este módulo estará disponível em breve.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Suporte & Documentação */}
        <section className="mb-12">
          <div className="grid grid-cols-12 gap-6">
            <div data-reveal className="col-span-12 lg:col-span-6">
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                {/* Decoração de fundo */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl" />
                <div className="absolute -left-16 -bottom-16 w-52 h-52 bg-indigo-200/30 rounded-full blur-3xl" />
                <div className="absolute top-4 right-4 w-20 h-20 bg-purple-100/40 rounded-full blur-2xl" />
                
                {/* Conteúdo */}
                <div className="relative p-6 md:p-7 lg:p-8 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <img src={logo} alt="Logo Fiscatus" className="w-12 h-12" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">Sobre o Sistema</h3>
                      <p className="text-sm text-blue-600 font-medium">Plataforma unificada para contratações públicas</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <p className="text-black leading-relaxed">
                      O Fiscatus foi criado para apoiar gestores públicos na condução das contratações, reunindo em uma única plataforma todas as etapas do processo, do planejamento à execução contratual. Nasceu da prática e do olhar atento de profissionais que conhecem de perto os desafios da administração, oferecendo uma ferramenta que alia simplicidade, inovação e segurança para tornar cada etapa mais clara e acessível.
                    </p>
                    <p className="text-black leading-relaxed">
                      Com dashboards intuitivos, fluxos flexíveis e recursos de automação, o sistema ajuda a reduzir a burocracia e a dar mais agilidade às rotinas, permitindo que as equipes foquem no que realmente importa: resultados. O Fiscatus inspira confiança, fortalece a transparência e se apresenta como um parceiro de trabalho diário, trazendo tranquilidade e eficiência para quem lida com as contratações públicas.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Fluxos Personalizados','Assinaturas Digitais','Notificações','Relatórios Inteligentes','Multi-Órgão'].map((chip) => (
                      <span key={chip} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 text-gray-700 border border-gray-200 shadow-sm">
                        {chip}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-auto">
                    <button
                      onClick={() => navigate('/historia')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
                    >
                      Conhecer a história completa
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div data-reveal className="col-span-12 lg:col-span-6">
              <Card className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                {/* Header */}
                <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-indigo-50 via-white to-white">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                      <Headphones className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Suporte</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <Badge variant="secondary" className="bg-green-50 text-green-700 ring-1 ring-green-200 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                          Online agora
                        </Badge>
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Clock className="h-4 w-4 flex-shrink-0" /> 
                          <span>Tempo médio: 3 min</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Welcome message */}
                <div className="px-6 py-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src="https://randomuser.me/api/portraits/women/65.jpg" alt="Agente" />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
                        <p className="text-[15px] text-gray-800 leading-relaxed">
                          Olá! Precisa de ajuda para iniciar um DFD ou configurar seu fluxo?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information cards */}
                <div className="px-6 pb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Canais de atendimento</h4>
                      <ul className="space-y-2.5">
                        <li className="flex items-center gap-3 text-[15px] text-gray-600">
                          <MessageSquare className="h-4 w-4 flex-shrink-0 text-indigo-600" /> 
                          <span>Chat em tempo real</span>
                        </li>
                        <li className="flex items-center gap-3 text-[15px] text-gray-600">
                          <Mail className="h-4 w-4 flex-shrink-0 text-indigo-600" /> 
                          <span>suporte@fiscatus.gov.br</span>
                        </li>
                        <li className="flex items-center gap-3 text-[15px] text-gray-600">
                          <LifeBuoy className="h-4 w-4 flex-shrink-0 text-indigo-600" /> 
                          <span>Central de ajuda</span>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">SLA e horário</h4>
                      <ul className="space-y-2.5">
                        <li className="flex items-center gap-3 text-[15px] text-gray-600">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" /> 
                          <span>Suporte instantâneo</span>
                        </li>
                        <li className="flex items-center gap-3 text-[15px] text-gray-600">
                          <Clock className="h-4 w-4 flex-shrink-0 text-indigo-600" /> 
                          <span>Atendimento: 8h–18h (dias úteis)</span>
                        </li>
                        <li className="flex items-center gap-3 text-[15px] text-gray-600">
                          <LifeBuoy className="h-4 w-4 flex-shrink-0 text-indigo-600" /> 
                          <span>Incidentes 24/7</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50/50">
                  <Button 
                    className="w-full h-11 gap-2 font-medium" 
                    onClick={() => setChatbotOpen(true)}
                  >
                    <MessageSquare className="h-5 w-5" /> Abrir suporte
                  </Button>
                  <p className="mt-3 text-xs text-gray-500 text-center leading-relaxed">
                    Horário comercial: 8h às 18h — suporte 24/7 para incidentes.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>


        {/* 4. Tutoriais & Recursos */}
        <section ref={tutoriaisSectionRef} className="mb-12">
          <div data-reveal className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Tutoriais & Recursos</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700" onClick={() => navigate('/tutoriais')}>Ver todos os tutoriais</button>
          </div>
          <div data-reveal-stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {React.useMemo(() => [
              { titulo: 'Introdução ao Fiscatus', tempo: '4:32', thumb: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1200&q=60' },
              { titulo: 'Modelando Fluxos', tempo: '7:18', thumb: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=60' },
              { titulo: 'Relatórios Inteligentes', tempo: '5:05', thumb: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=60' }
            ], []).map((v, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="relative aspect-video bg-gray-100">
                  <img 
                    src={v.thumb} 
                    alt={`Capa do vídeo: ${v.titulo}`} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    decoding="async"
                  />
                  <button className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:bg-white">
                    <Play className="w-6 h-6 text-blue-600" />
                  </button>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 text-xs rounded bg-gray-900/80 text-white">{v.tempo}</span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900">{v.titulo}</p>
                </div>
              </div>
            ))}
          </div>
          {/* FAQ */}
          <div data-reveal="zoom" className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            {React.useMemo(() => [
              { q: 'Como personalizar o fluxo?', a: 'Acesse Configurações do Fluxo para editar etapas, responsáveis e regras.' },
              { q: 'Onde vejo minhas pendências?', a: 'Abra Notificações ou o módulo Minhas Pendências no topo do painel.' },
              { q: 'Como gerar relatórios?', a: 'No módulo Relatórios, selecione um template e ajuste os filtros desejados.' }
            ], []).map((faq, idx) => (
              <AccordionItem key={idx} pergunta={faq.q} resposta={faq.a} />
            ))}
          </div>
        </section>

        {/* 5. Depoimentos & Treinamento */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feedbacks de Usuários */}
            <div data-reveal>
            <TestimonialsCarousel title="Feedback de Usuários" />
            </div>
            {/* Feedbacks de Administrações Públicas */}
            <div data-reveal>
            <PublicTestimonialsCarousel title="Feedback de Administrações Públicas" />
            </div>
            {/* Card Treinamento */}
            <div data-reveal className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Treinamento Personalizado</h3>
                <p className="text-gray-600 mb-4">Capacite sua equipe com um plano de adoção sob medida.</p>
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1 mb-6">
                  <li>Workshops práticos</li>
                  <li>Onboarding guiado</li>
                  <li>Materiais exclusivos</li>
                </ul>
              </div>
              <button onClick={() => navigate('/treinamento')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                Agendar Treinamento
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Chatbot Drawer */}
      {chatbotOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => setChatbotOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              <div>
                  <h3 className="font-semibold text-gray-900">Assistente Fiscatus</h3>
                  <p className="text-sm text-gray-600">Online agora</p>
                </div>
              </div>
              <button
                onClick={() => setChatbotOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={chatRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-gray-200'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    
                    {/* Message */}
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim()}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 6. Rodapé Premium */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-6 md:py-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src={logo} alt="Logo Fiscatus" className="w-8 h-8" />
              <span className="font-semibold text-gray-900">Fiscatus</span>
            </div>
            <p className="text-sm text-gray-600">Gestão moderna e integrada para contratações públicas.</p>
          </div>
          <div>
            <p className="uppercase text-xs text-gray-500 mb-2">Status do sistema</p>
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online
            </span>
          </div>
          <div>
            <p className="uppercase text-xs text-gray-500 mb-2">Links úteis</p>
            <ul className="space-y-2 text-sm">
              <li><a className="text-gray-700 hover:text-blue-700" href="#">Política de Privacidade</a></li>
              <li><a className="text-gray-700 hover:text-blue-700" href="#">Termos de Uso</a></li>
              <li><button onClick={() => navigate('/suporte')} className="text-left text-gray-700 hover:text-blue-700">Suporte</button></li>
            </ul>
          </div>
          <div>
            <p className="uppercase text-xs text-gray-500 mb-2">Informações técnicas</p>
            <ul className="text-sm text-gray-700">
              <li>Versão: v1.0.0</li>
              <li>Ano: 2025</li>
              <li>Ambiente: Produção</li>
            </ul>
          </div>
        </div>
        <div className="py-3 text-center text-xs text-gray-600">
          © 2025 Fiscatus — Feito com dedicação para a administração pública brasileira
        </div>
      </footer>
    </div>
  );
} 

// Componentes auxiliares locais
function AccordionItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="px-4 py-3">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between py-2">
        <span className="text-sm font-medium text-gray-900">{pergunta}</span>
        <ChevronRight className={"w-4 h-4 text-gray-400 transition-transform " + (open ? "rotate-90" : "")} />
      </button>
      {open && (
        <p className="text-sm text-gray-600 pb-3">{resposta}</p>
      )}
      <div className="h-px bg-gray-100" />
    </div>
  );
}

const TestimonialsCarousel = React.memo(({ title }: { title?: string }) => {
  const items = React.useMemo(() => [
    { nome: 'Carla Nunes', cargo: 'Gestora de Compras', frase: 'O Fiscatus simplificou nosso processo de ponta a ponta.', foto: 'https://randomuser.me/api/portraits/women/68.jpg', estrelas: 5 },
    { nome: 'Rafael Lima', cargo: 'Coordenador de TI', frase: 'Integração fluida e relatórios que fazem diferença.', foto: 'https://randomuser.me/api/portraits/men/32.jpg', estrelas: 5 },
    { nome: 'Mariana Alves', cargo: 'Analista Sênior', frase: 'Onboarding rápido e suporte excelente.', foto: 'https://randomuser.me/api/portraits/women/44.jpg', estrelas: 4 }
  ], []);
  
  const [index, setIndex] = React.useState(0);
  const next = React.useCallback(() => setIndex((index + 1) % items.length), [index, items.length]);
  const prev = React.useCallback(() => setIndex((index - 1 + items.length) % items.length), [index, items.length]);
  
  React.useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  const current = items[index];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      <div className="flex items-center gap-3 mb-4">
        <img 
          src={current.foto} 
          alt={current.nome} 
          className="w-10 h-10 rounded-full object-cover" 
          loading="lazy"
          decoding="async"
        />
        <div>
          <p className="text-sm font-medium text-gray-900">{current.nome}</p>
          <p className="text-xs text-gray-500">{current.cargo}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={"w-4 h-4 " + (i < current.estrelas ? "text-yellow-500" : "text-gray-300")}>
            ★
          </div>
        ))}
      </div>
      <p className="text-gray-700 mb-6">“{current.frase}”</p>
      <div className="mt-auto flex items-center justify-center">
        <div className="flex gap-2">
          {items.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={"w-2.5 h-2.5 rounded-full transition-colors " + (i === index ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400")} aria-label={`Ir para depoimento ${i+1}`} />
          ))}
        </div>
      </div>
    </div>
  );
});

const PublicTestimonialsCarousel = React.memo(({ title }: { title?: string }) => {
  const base = (import.meta as any).env?.BASE_URL || '/';
  const brasaoPrefeitura = React.useMemo(() => `${base}logos/brasao-generico.svg`, [base]);
  
  const items = React.useMemo(() => [
    { nome: 'Secretaria de Saúde', cargo: 'Governo Estadual', logo: brasaoPrefeitura, frase: 'A adoção da plataforma trouxe transparência e agilidade às contratações.', estrelas: 5 },
    { nome: 'Prefeitura Municipal', cargo: 'Administração Pública', logo: brasaoPrefeitura, frase: 'Padronizamos fluxos e reduzimos retrabalho significativamente.', estrelas: 5 },
    { nome: 'Hospital Público', cargo: 'Instituição de Saúde', logo: brasaoPrefeitura, frase: 'Relatórios e notificações facilitaram nosso controle interno.', estrelas: 4 }
  ], [brasaoPrefeitura]);
  
  const [index, setIndex] = React.useState(0);
  const next = React.useCallback(() => setIndex((index + 1) % items.length), [index, items.length]);
  const prev = React.useCallback(() => setIndex((index - 1 + items.length) % items.length), [index, items.length]);
  
  React.useEffect(() => {
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [next]);

  const current = items[index];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-md overflow-hidden ring-1 ring-gray-200 bg-white flex items-center justify-center">
          <img 
            src={items[index].logo} 
            alt={current.nome} 
            className="w-full h-full object-contain p-1" 
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="w-6 h-6 text-gray-400"><svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
              }
            }}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{current.nome}</p>
          <p className="text-xs text-gray-500">{current.cargo}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={"w-4 h-4 " + (i < current.estrelas ? "text-yellow-500" : "text-gray-300")}>
            ★
          </div>
        ))}
      </div>
      <p className="text-gray-700 mb-6">“{current.frase}”</p>
      <div className="mt-auto flex items-center justify-center">
        <div className="flex gap-2">
          {items.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={"w-2.5 h-2.5 rounded-full transition-colors " + (i === index ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400")} aria-label={`Ir para depoimento público ${i+1}`} />
          ))}
        </div>
      </div>
    </div>
  );
});