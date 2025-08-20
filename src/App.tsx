import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import PlanejamentoContratacao from "./pages/PlanejamentoContratacao";
import MinhasAssinaturas from "./pages/MinhasAssinaturas";
import MeusProcessos from "./pages/MeusProcessos";
import ProcessoDetalhes from "./pages/ProcessoDetalhes";
import ProcessosGerencia from "./pages/ProcessosGerencia";
import NovoProcesso from "./pages/NovoProcesso";
import PastaOrganizacional from "./pages/PastaOrganizacional";
import ModelosFluxo from "./pages/ModelosFluxo";
import ConfiguracoesSistema from "./pages/ConfiguracoesSistema";
import Notificacoes from "./pages/Notificacoes";
import TubelightDemo from "./pages/TubelightDemo";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/UserContext";
import { BusinessCalendarProvider } from "@/lib/business-days/context";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <UserProvider>
          <BusinessCalendarProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename="/fiscatus-app/">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/home" element={<Home />} />
              <Route path="/dfd" element={<Navigate to="/planejamento-da-contratacao" replace />} />
              <Route path="/dfd/novo" element={<Navigate to="/planejamento-da-contratacao" replace />} />
              <Route path="/planejamento-da-contratacao" element={<PlanejamentoContratacao />} />
              <Route path="/assinaturas" element={<MinhasAssinaturas />} />
              <Route path="/assinaturas/:id" element={<MinhasAssinaturas />} />
              <Route path="/processos" element={<MeusProcessos />} />
              <Route path="/processos/:id" element={<ProcessoDetalhes />} />
              <Route path="/processo/:id" element={<ProcessoDetalhes />} />
              <Route path="/novo-processo" element={<NovoProcesso />} />
              <Route path="/processos-gerencia" element={<ProcessosGerencia />} />
              <Route path="/processos-gerencia/pasta/:pastaId" element={<PastaOrganizacional />} />
              <Route path="/modelos-de-fluxo" element={<ModelosFluxo />} />
              <Route path="/configuracoes" element={<ConfiguracoesSistema />} />
              <Route path="/notificacoes" element={<Notificacoes />} />
              <Route path="/tubelight-demo" element={<TubelightDemo />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </BusinessCalendarProvider>
        </UserProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
