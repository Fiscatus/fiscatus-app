import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import DFDDashboard from "./pages/DFDDashboard";
import NovoDFD from "./pages/NovoDFD";
import MinhasAssinaturas from "./pages/MinhasAssinaturas";
import MeusProcessos from "./pages/MeusProcessos";
import ProcessoDetalhes from "./pages/ProcessoDetalhes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/UserContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dfd" replace />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dfd" element={<DFDDashboard />} />
            <Route path="/dfd/novo" element={<NovoDFD />} />
            <Route path="/assinaturas" element={<MinhasAssinaturas />} />
            <Route path="/assinaturas/:id" element={<MinhasAssinaturas />} />
            <Route path="/processos" element={<MeusProcessos />} />
            <Route path="/processos/:id" element={<ProcessoDetalhes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
