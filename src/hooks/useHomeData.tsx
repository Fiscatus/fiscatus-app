import { useEffect, useMemo, useState } from "react";
import { 
  FolderOpen, Users, ClipboardList, Gavel, BarChart3, Settings
} from "lucide-react";

type ModuleColor = "planejamento" | "gestao" | "execucao" | "licitacao" | "relatorios" | "configuracoes";

export interface HomeModule {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: ModuleColor;
  href: string;
  tutorialHref: string;
  favorite?: boolean;
}

export interface HomeVideo {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
}

export interface HomeFaqItem {
  q: string;
  links: { label: string; href: string }[];
}

export interface HomeStats {
  created: number;
  active: number;
  concluded: number;
  sla: number;
}

export function useHomeData() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lastVideos, setLastVideos] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(JSON.parse(localStorage.getItem("favoriteModules") || "[]"));
    setLastVideos(JSON.parse(localStorage.getItem("lastVideos") || "[]"));
  }, []);

  const modules: HomeModule[] = useMemo(() => [
    { id: "planejamento", name: "Planejamento da Contratação", description: "Demanda inicial ao edital.", icon: <FolderOpen className="w-6 h-6" />, color: "planejamento", href: "/planejamento-da-contratacao", tutorialHref: "/docs/planejamento" },
    { id: "execucao", name: "Execução Contratual", description: "Entregas, fiscalizações e aditivos.", icon: <ClipboardList className="w-6 h-6" />, color: "execucao", href: "/execucao-contratual", tutorialHref: "/docs/execucao" },
    { id: "gestao", name: "Gestão Contratual", description: "Contratos e documentos centralizados.", icon: <Users className="w-6 h-6" />, color: "gestao", href: "/gestao-contratual", tutorialHref: "/docs/gestao" },
    { id: "licitacao", name: "Processo Licitatório", description: "Abertura à homologação.", icon: <Gavel className="w-6 h-6" />, color: "licitacao", href: "/processo-licitatorio", tutorialHref: "/docs/licitacao" },
    { id: "relatorios", name: "Relatórios", description: "Dashboards e análises.", icon: <BarChart3 className="w-6 h-6" />, color: "relatorios", href: "/relatorios", tutorialHref: "/docs/relatorios" },
    { id: "configuracoes", name: "Configurações do Fluxo", description: "Fluxos e modelos.", icon: <Settings className="w-6 h-6" />, color: "configuracoes", href: "/configuracoes-fluxo", tutorialHref: "/docs/configuracoes" },
  ], []);

  const sortedModules = useMemo(() => {
    const list = modules.map(m => ({ ...m, favorite: favorites.includes(m.id) }));
    return list.sort((a, b) => Number(b.favorite) - Number(a.favorite));
  }, [modules, favorites]);

  const videos: HomeVideo[] = [
    { id: "v1", title: "Como criar um processo", duration: "08:30", thumbnail: "/placeholder.svg" },
    { id: "v2", title: "Emitir relatórios personalizados", duration: "12:15", thumbnail: "/placeholder.svg" },
    { id: "v3", title: "Configurar fluxos de aprovação", duration: "15:45", thumbnail: "/placeholder.svg" },
  ];

  const faq: HomeFaqItem[] = [
    { q: "Como criar meu primeiro processo?", links: [{ label: "Ver artigo", href: "/docs/processos/primeiro" }] },
    { q: "Posso personalizar os fluxos?", links: [{ label: "Ver artigo", href: "/docs/fluxos/personalizar" }] },
    { q: "Como acompanhar o progresso?", links: [{ label: "Ver artigo", href: "/docs/progresso" }] },
    { q: "O sistema funciona offline?", links: [{ label: "Ver artigo", href: "/docs/offline" }] },
    { q: "Como obter suporte?", links: [{ label: "Ver artigo", href: "/docs/suporte" }] },
    { q: "Modelos de documentos", links: [{ label: "Ver artigo", href: "/docs/modelos" }] },
  ];

  const stats: HomeStats = { created: 2847, active: 1234, concluded: 1456, sla: 97 };

  const persistFavorite = (id: string, fav: boolean) => {
    const next = fav ? Array.from(new Set([...favorites, id])) : favorites.filter(f => f !== id);
    setFavorites(next);
    localStorage.setItem("favoriteModules", JSON.stringify(next));
  };

  const persistWatchedVideo = (id: string) => {
    const next = Array.from(new Set([id, ...lastVideos])).slice(0, 10);
    setLastVideos(next);
    localStorage.setItem("lastVideos", JSON.stringify(next));
  };

  return { modules: sortedModules, videos, faq, stats, persistFavorite, persistWatchedVideo };
}

