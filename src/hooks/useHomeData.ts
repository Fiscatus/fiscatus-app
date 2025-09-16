import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

export interface Module {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  href: string;
  tutorialHref: string;
  favorite: boolean;
}

export interface Video {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  links: Array<{
    text: string;
    href: string;
  }>;
}

export interface Stats {
  created: number;
  active: number;
  concluded: number;
  sla: number;
}

export interface HomeData {
  user: {
    name: string;
  };
  modules: Module[];
  videos: Video[];
  faq: FAQ[];
  stats: Stats;
}

export function useHomeData(): HomeData & { toggleFavorite: (moduleId: string) => void } {
  const { user } = useUser();
  const [modules, setModules] = useState<Module[]>([]);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favoriteModules') || '[]');
    
    const defaultModules: Module[] = [
      {
        id: "planejamento",
        name: "Planejamento da Contratação",
        description: "Organize todas as fases da contratação: da demanda inicial à publicação do edital.",
        iconName: "FolderOpen",
        color: "blue",
        href: "/planejamento-da-contratacao",
        tutorialHref: "/tutorials/planejamento",
        favorite: favorites.includes("planejamento")
      },
      {
        id: "execucao",
        name: "Execução Contratual",
        description: "Monitore a execução do contrato com controle de entregas, fiscalizações e aditivos.",
        iconName: "ClipboardList",
        color: "green",
        href: "/execucao-contratual",
        tutorialHref: "/tutorials/execucao",
        favorite: favorites.includes("execucao")
      },
      {
        id: "gestao",
        name: "Gestão Contratual",
        description: "Gerencie contratos e documentos de forma centralizada.",
        iconName: "Users",
        color: "purple",
        href: "/gestao-contratual",
        tutorialHref: "/tutorials/gestao",
        favorite: favorites.includes("gestao")
      },
      {
        id: "licitatorio",
        name: "Processo Licitatório",
        description: "Acompanhe o processo licitatório desde a abertura até a homologação.",
        iconName: "Gavel",
        color: "teal",
        href: "/processo-licitatorio",
        tutorialHref: "/tutorials/licitatorio",
        favorite: favorites.includes("licitatorio")
      },
      {
        id: "relatorios",
        name: "Relatórios",
        description: "Visualize dados estratégicos em relatórios automáticos e dashboards personalizáveis.",
        iconName: "BarChart3",
        color: "indigo",
        href: "/relatorios",
        tutorialHref: "/tutorials/relatorios",
        favorite: favorites.includes("relatorios")
      },
      {
        id: "configuracoes",
        name: "Configurações do Fluxo",
        description: "Personalize o fluxo de trabalho e os modelos padrão conforme a instituição.",
        iconName: "Settings",
        color: "amber",
        href: "/configuracoes-fluxo",
        tutorialHref: "/tutorials/configuracoes",
        favorite: favorites.includes("configuracoes")
      }
    ];

    // Ordenar: favoritos primeiro
    const sortedModules = [...defaultModules].sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return 0;
    });

    setModules(sortedModules);
  }, []);

  const toggleFavorite = (moduleId: string) => {
    setModules(prev => {
      const updated = prev.map(module => 
        module.id === moduleId 
          ? { ...module, favorite: !module.favorite }
          : module
      );
      
      // Salvar no localStorage
      const favorites = updated.filter(m => m.favorite).map(m => m.id);
      localStorage.setItem('favoriteModules', JSON.stringify(favorites));
      
      // Reordenar
      return updated.sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return 0;
      });
    });
  };

  const videos: Video[] = [
    {
      id: "1",
      title: "Como criar um processo de contratação",
      duration: "8:30",
      thumbnail: "/tutorial-1.jpg",
      category: "Básico"
    },
    {
      id: "2", 
      title: "Emitir relatórios personalizados",
      duration: "12:15",
      thumbnail: "/tutorial-2.jpg",
      category: "Intermediário"
    },
    {
      id: "3",
      title: "Configurar fluxos de aprovação",
      duration: "15:45",
      thumbnail: "/tutorial-3.jpg",
      category: "Avançado"
    }
  ];

  const faq: FAQ[] = [
    {
      id: "1",
      question: "Como criar meu primeiro processo de contratação?",
      answer: "Para criar um processo, acesse o módulo 'Planejamento da Contratação' e clique em 'Novo Processo'. Preencha as informações básicas e siga o fluxo guiado do sistema.",
      links: [
        { text: "Ver guia completo", href: "/docs/primeiro-processo" }
      ]
    },
    {
      id: "2",
      question: "Posso personalizar os fluxos de trabalho?",
      answer: "Sim! No módulo 'Configurações do Fluxo', você pode personalizar etapas, aprovações e modelos conforme as necessidades da sua instituição.",
      links: [
        { text: "Documentação de configuração", href: "/docs/configuracoes" }
      ]
    },
    {
      id: "3",
      question: "Como acompanhar o progresso dos processos?",
      answer: "Use o módulo 'Relatórios' para visualizar dashboards em tempo real, ou acesse 'Meus Processos' para acompanhar cada processo individualmente.",
      links: [
        { text: "Tutorial de relatórios", href: "/tutorials/relatorios" }
      ]
    },
    {
      id: "4",
      question: "O sistema funciona offline?",
      answer: "O Fiscatus é uma aplicação web que requer conexão com a internet para funcionar. Recomendamos uma conexão estável para melhor experiência.",
      links: []
    },
    {
      id: "5",
      question: "Como obter suporte técnico?",
      answer: "Você pode usar o chatbot no canto inferior direito, abrir um chamado de suporte ao vivo, ou consultar nossa documentação completa.",
      links: [
        { text: "Central de ajuda", href: "/suporte" }
      ]
    },
    {
      id: "6",
      question: "Posso integrar com outros sistemas?",
      answer: "Sim, o Fiscatus oferece APIs e integrações com sistemas de gestão, ERPs e ferramentas de assinatura digital.",
      links: [
        { text: "Documentação de APIs", href: "/docs/apis" }
      ]
    }
  ];

  const stats: Stats = {
    created: 2847,
    active: 1234,
    concluded: 1456,
    sla: 97
  };

  return {
    user: {
      name: user?.nome || "Usuário"
    },
    modules,
    videos,
    faq,
    stats,
    toggleFavorite
  };
}
