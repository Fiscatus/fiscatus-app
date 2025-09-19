import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import ModelsSidebar from "@/components/ui/flow/ModelsSidebar";
import ModelInfoBar from "@/components/ui/flow/ModelInfoBar";
import CanvasToolbar from "@/components/ui/flow/CanvasToolbar";
import StagesGrid from "@/components/ui/flow/StagesGrid";
import StagesTable from "@/components/ui/flow/StagesTable";
import { Plus, PanelLeft } from "lucide-react";

// Dados mockados para as etapas
const etapasMock = [
  { index: 1, title: "Elaboração do DFD", department: "GSP - Gerência de Soluções e Projetos", days: 5, status: "done" as const },
  { index: 2, title: "Aprovação do DFD", department: "GSL - Gerência de Suprimentos e Logística", days: 3, status: "in_progress" as const },
  { index: 3, title: "Assinatura do DFD", department: "GRH - Gerência de Recursos Humanos", days: 3, status: "pending" as const },
  { index: 4, title: "Despacho do DFD", department: "GUE - Gerência de Urgência e Emergência", days: 2, status: "pending" as const },
  { index: 5, title: "Elaboração do ETP", department: "GLC - Gerência de Licitações e Contratos", days: 10, status: "pending" as const },
  { index: 6, title: "Assinatura do ETP", department: "GFC - Gerência Financeira e Contábil", days: 2, status: "pending" as const },
  { index: 7, title: "Despacho do ETP", department: "GSP - Gerência de Soluções e Projetos", days: 5, status: "pending" as const },
  { index: 8, title: "Elaboração da Matriz de Risco", department: "GSL - Gerência de Suprimentos e Logística", days: 7, status: "pending" as const },
  { index: 9, title: "Aprovação da Matriz de Risco", department: "GRH - Gerência de Recursos Humanos", days: 2, status: "pending" as const },
  { index: 10, title: "Assinatura da Matriz de Risco", department: "GUE - Gerência de Urgência e Emergência", days: 15, status: "pending" as const },
  { index: 11, title: "Cotação", department: "GLC - Gerência de Licitações e Contratos", days: 2, status: "pending" as const },
  { index: 12, title: "Elaboração do Termo de Referência (TR)", department: "GFC - Gerência Financeira e Contábil", days: 10, status: "pending" as const },
  { index: 13, title: "Assinatura do TR", department: "GTEC - Gerência de Tecnologia da Informação", days: 5, status: "pending" as const },
  { index: 14, title: "Elaboração do Edital", department: "GAP - Gerência de Administração e Patrimônio", days: 3, status: "pending" as const },
  { index: 15, title: "Análise Jurídica Prévia", department: "NAJ - Assessoria Jurídica", days: 20, status: "pending" as const },
  { index: 16, title: "Cumprimento de Ressalvas pós Análise Jurídica Prévia", department: "GESP - Gerência de Especialidades", days: 10, status: "pending" as const },
  { index: 17, title: "Elaboração do Parecer Jurídico", department: "NAJ - Assessoria Jurídica", days: 1, status: "pending" as const },
  { index: 18, title: "Cumprimento de Ressalvas pós Parecer Jurídico", department: "GSP - Gerência de Soluções e Projetos", days: 1, status: "pending" as const },
  { index: 19, title: "Aprovação Jurídica", department: "NAJ - Assessoria Jurídica", days: 1, status: "pending" as const },
  { index: 20, title: "Assinatura do Edital", department: "GSL - Gerência de Suprimentos e Logística", days: 1, status: "pending" as const },
  { index: 21, title: "Publicação", department: "GRH - Gerência de Recursos Humanos", days: 1, status: "pending" as const }
];

export default function ModelosFluxo() {
  const [nomeModelo, setNomeModelo] = useState("Modelo Fiscatus");
  const [descricaoModelo, setDescricaoModelo] = useState("Fluxo completo para contratações públicas com todas as etapas necessárias para licitação e contratação.");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [zoom, setZoom] = useState(100);
  const [filter, setFilter] = useState('todos');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Configurar overscroll-behavior para evitar "puxão" de scroll
  useEffect(() => {
    document.body.style.overscrollBehavior = 'contain';
    return () => {
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  // Garantir que o scroll funcione após mudanças de layout
  useEffect(() => {
    // Força o recálculo do layout quando sidebar muda
    const timer = setTimeout(() => {
      document.body.style.overflow = 'auto';
    }, 50);

    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

  const totalEtapas = etapasMock.length;
  const totalDias = etapasMock.reduce((sum, etapa) => sum + etapa.days, 0);
  const linhasCriticas = 3; // Mock
  const assinaturasPendentes = 5; // Mock

  const handleSalvar = () => {
    // Toast: "Modelo salvo"
    console.log('Modelo salvo');
  };

  const handleReverter = () => {
    // Toast: "Alterações revertidas"
    console.log('Alterações revertidas');
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    // Scroll para o conteúdo quando trocar filtros
    setTimeout(() => {
      const gridAnchor = document.getElementById('grid-anchor');
      const listAnchor = document.getElementById('list-anchor');
      const target = viewMode === 'grid' ? gridAnchor : listAnchor;
      target?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 100);
  };

  const handleEdit = (index: number) => {
    console.log('Editar etapa:', index);
  };

  const handleDelete = (index: number) => {
    console.log('Excluir etapa:', index);
  };

  const handleView = (index: number) => {
    console.log('Ver detalhes da etapa:', index);
  };

  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  // Filtrar etapas baseado no filtro selecionado
  const etapasFiltradas = etapasMock.filter(etapa => {
    switch (filter) {
      case 'concluidos':
        return etapa.status === 'done';
      case 'andamento':
        return etapa.status === 'in_progress';
      case 'pendentes':
        return etapa.status === 'pending';
        default:
        return true;
    }
  });

  return (
    <div
      style={{
        ['--safe-top' as any]: '56px',      // altura da topbar global
        ['--pagebar-h' as any]: '52px',     // sub-header/breadcrumb da página
        ['--toolbar-h' as any]: '48px',     // toolbar do canvas
        ['--gutter' as any]: '20px'         // espaçamento lateral (gutter)
      }}
      className="h-screen w-screen overflow-x-hidden overflow-y-auto bg-slate-50"
    >
      <Topbar />
      
      <main className={`w-full grid grid-cols-12 gap-4 lg:gap-6 px-[var(--gutter)] pb-8 min-h-full ${sidebarCollapsed ? 'pt-[calc(var(--safe-top)+var(--toolbar-h)+80px)]' : 'pt-[calc(var(--safe-top)+var(--toolbar-h)+40px)]'}`}>
        {/* Sidebar */}
        <aside className={`col-span-12 ${sidebarCollapsed ? 'lg:hidden' : 'lg:col-span-2'} space-y-4`} id="sidebar">
          <div className="sticky top-[calc(var(--safe-top)+var(--toolbar-h)+52px)]">
            <ModelsSidebar onToggleCollapse={handleToggleSidebar} />
              </div>
        </aside>

        {/* Canvas */}
        <section className={`col-span-12 ${sidebarCollapsed ? 'lg:col-span-12' : 'lg:col-span-10'} space-y-4`} id="canvas">
          {/* Info Bar do Modelo */}
          <ModelInfoBar
            nomeModelo={nomeModelo}
            descricaoModelo={descricaoModelo}
            totalEtapas={totalEtapas}
            totalDias={totalDias}
            linhasCriticas={linhasCriticas}
            assinaturasPendentes={assinaturasPendentes}
            onNomeChange={setNomeModelo}
            onDescricaoChange={setDescricaoModelo}
            onSalvar={handleSalvar}
            onReverter={handleReverter}
          />

          {/* Toolbar do Canvas */}
          <CanvasToolbar 
            totalEtapas={totalEtapas} 
            totalDias={totalDias}
            onViewModeChange={handleViewModeChange}
            onZoomChange={handleZoomChange}
            onFilterChange={handleFilterChange}
          />

          {/* Conteúdo baseado no modo de visualização */}
          {viewMode === 'grid' ? (
            <StagesGrid
              etapas={etapasFiltradas}
              zoom={zoom}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ) : (
            <StagesTable
              etapas={etapasFiltradas}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          )}

          {/* Empty state quando não há etapas */}
          {etapasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
                            </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Nenhuma etapa encontrada
                              </h3>
              <p className="text-slate-600 mb-4">
                {filter === 'todos' 
                  ? 'Adicione a primeira etapa ao seu modelo'
                  : `Nenhuma etapa com status "${filter}" encontrada`
                }
              </p>
              <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                Adicionar primeiro card
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Botão de voltar para expandir sidebar quando recolhida */}
      {sidebarCollapsed && (
        <button
          onClick={handleToggleSidebar}
          className="fixed left-4 top-[calc(var(--safe-top)+var(--toolbar-h)+120px)] z-30 bg-white border border-slate-200 rounded-lg p-2 shadow-lg hover:shadow-xl transition-all hover:bg-slate-50"
          aria-label="Expandir sidebar"
        >
          <PanelLeft className="w-5 h-5 text-slate-600" />
        </button>
            )}
          </div>
  );
}
