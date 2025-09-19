import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import ModelsSidebar from "@/components/ui/flow/ModelsSidebar";
import ModelInfoBar from "@/components/ui/flow/ModelInfoBar";
import CanvasToolbar from "@/components/ui/flow/CanvasToolbar";
import StagesGrid from "@/components/ui/flow/StagesGrid";
import StagesTable from "@/components/ui/flow/StagesTable";
import StageEditWorkspace from "@/components/ui/flow/StageEditWorkspace";
import { Plus, PanelLeft } from "lucide-react";
import { useFlowStore } from "@/stores/flowStore";
import { ModelStage } from "@/types/flow";

export default function ModelosFluxo() {
  // Store do fluxo
  const { 
    getStagesByModel, 
    getStage,
    activeModelId 
  } = useFlowStore();
  const [nomeModelo, setNomeModelo] = useState("Modelo Fiscatus");
  const [descricaoModelo, setDescricaoModelo] = useState("Fluxo completo para contratações públicas com todas as etapas necessárias para licitação e contratação.");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [zoom, setZoom] = useState(100);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Estado do workspace
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [isEditWorkspaceOpen, setIsEditWorkspaceOpen] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<'details' | 'edit'>('edit');

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

  // Obter etapas do store
  const etapas = getStagesByModel(activeModelId || 'modelo-fiscatus');
  const totalEtapas = etapas.length;
  const totalDias = etapas.reduce((sum, etapa) => sum + (etapa.days || 0), 0);
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


  const handleEditStage = (stageId: string) => {
    console.log('Editar etapa:', stageId);
  };

  const handleDelete = (stageId: string) => {
    console.log('Excluir etapa:', stageId);
  };

  const handleView = (stageId: string) => {
    setSelectedStageId(stageId);
    setWorkspaceMode('details');
    setIsEditWorkspaceOpen(true);
  };

  const handleEdit = (stageId: string) => {
    setSelectedStageId(stageId);
    setWorkspaceMode('edit');
    setIsEditWorkspaceOpen(true);
  };

  const handleCloseEditWorkspace = () => {
    setIsEditWorkspaceOpen(false);
    setSelectedStageId(null);
  };


  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  // Usar todas as etapas (sem filtro de status)
  const etapasFiltradas = etapas;

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
          />

          {/* Conteúdo baseado no modo de visualização */}
          {viewMode === 'grid' ? (
            <StagesGrid
              etapas={etapasFiltradas}
              zoom={zoom}
              editable={true}
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
                Adicione a primeira etapa ao seu modelo
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

      {/* Workspace de edição da etapa */}
      <StageEditWorkspace
        stage={selectedStageId ? getStage(selectedStageId) : null}
        isOpen={isEditWorkspaceOpen}
        onClose={handleCloseEditWorkspace}
        mode={workspaceMode}
      />
    </div>
  );
}
