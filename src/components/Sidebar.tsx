import React from "react";
import { X, LayoutDashboard, FileText, BookOpen, FilePlus, Briefcase, ClipboardList, AlertCircle, Bell, Settings, Landmark } from "lucide-react";

const modules = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Contratos", icon: <FileText className="w-5 h-5" /> },
  { label: "Atas de Registro de Preço", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Aditivos", icon: <FilePlus className="w-5 h-5" /> },
  { label: "Gestão Contratual", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Execução dos Contratos", icon: <ClipboardList className="w-5 h-5" /> },
  { label: "Execução das Atas", icon: <Landmark className="w-5 h-5" /> },
  { label: "Ocorrências", icon: <AlertCircle className="w-5 h-5" /> },
  { label: "Notificações", icon: <Bell className="w-5 h-5" /> },
  { label: "Configurações", icon: <Settings className="w-5 h-5" /> },
];

export default function Sidebar({ open, onClose, active = 0 }: { open: boolean; onClose: () => void; active?: number }) {
  React.useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-900">Módulos</span>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Fechar sidebar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {modules.map((mod, idx) => (
            <button
              key={mod.label}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left text-gray-700 hover:bg-gray-100 transition font-medium ${active === idx ? "bg-gray-100 border-l-4 border-blue-600 text-blue-700" : "border-l-4 border-transparent"}`}
              tabIndex={0}
            >
              {mod.icon}
              <span className="truncate">{mod.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
} 