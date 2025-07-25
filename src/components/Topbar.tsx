import React from "react";
import { Menu, Bell, Settings, Plus, PenLine, FileText, Landmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Sidebar from "./Sidebar";
import logo from "@/assets/logo_fiscatus.png";

function QuickActionButton({ icon, label, color, onClick }: any) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm text-sm font-semibold whitespace-nowrap transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100 ${color}`}
      onClick={onClick}
      type="button"
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}

export default function Topbar() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <>
      <header className="fixed top-0 left-0 w-full h-auto min-h-16 bg-white shadow z-50 px-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        {/* Esquerda: menu, logo, nome do sistema */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button className="p-2 rounded hover:bg-gray-100" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu className="w-5 h-5" />
          </button>
          <img src={logo} className="w-9 h-9" alt="Logo Fiscatus" />
          <span className="text-2xl font-bold text-gray-800">Fiscatus</span>
        </div>
        {/* Centro: ações rápidas */}
        <div className="flex flex-wrap gap-2 justify-center items-center flex-1 min-w-0">
          <QuickActionButton icon={<Plus className="text-green-600" />} label={<span className="text-green-700">Novo DFD</span>} color="border-green-100" />
          <QuickActionButton icon={<PenLine className="text-blue-900" />} label={<span className="text-blue-900">Minhas Assinaturas</span>} color="border-blue-100" />
          <QuickActionButton icon={<FileText className="text-blue-600" />} label={<span className="text-blue-600">Meus Processos</span>} color="border-blue-100" />
          <QuickActionButton icon={<Landmark className="text-gray-700" />} label={<span className="text-gray-700">Processos da Gerência</span>} color="border-gray-200" />
        </div>
        {/* Direita: busca, ícones, avatar */}
        <div className="flex items-center gap-2 flex-shrink-0 mt-2 md:mt-0">
          <Input type="text" placeholder="Buscar processo..." className="w-40 md:w-64" />
          <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Notificações">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Configurações">
            <Settings className="w-5 h-5" />
          </button>
          <Avatar className="w-8 h-8">
            <AvatarImage src="/usuario.png" />
            <AvatarFallback>GM</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
} 