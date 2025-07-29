import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface FilterBarProps {
  searchTerm: string;
  statusFilter: string;
  prazoFilter: string;
  tipoFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPrazoChange: (value: string) => void;
  onTipoChange: (value: string) => void;
}

export default function FilterBar({
  searchTerm,
  statusFilter,
  prazoFilter,
  tipoFilter,
  onSearchChange,
  onStatusChange,
  onPrazoChange,
  onTipoChange
}: FilterBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 w-full">
      <div className="flex flex-col lg:flex-row gap-3 w-full">
        {/* Busca */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por número ou nome do documento"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200 w-full"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-shrink-0">
          {/* Status */}
          <div>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="border-gray-200 focus:border-blue-300 focus:ring-blue-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendentes">Pendentes</SelectItem>
                <SelectItem value="assinados">Assinados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prazo */}
          <div>
            <Select value={prazoFilter} onValueChange={onPrazoChange}>
              <SelectTrigger className="border-gray-200 focus:border-blue-300 focus:ring-blue-200">
                <SelectValue placeholder="Prazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="vencendo">Vencendo em 3 dias</SelectItem>
                <SelectItem value="vencidos">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo */}
          <div>
            <Select value={tipoFilter} onValueChange={onTipoChange}>
              <SelectTrigger className="border-gray-200 focus:border-blue-300 focus:ring-blue-200">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="dfd">DFD</SelectItem>
                <SelectItem value="etp">ETP</SelectItem>
                <SelectItem value="termo">Termo de Referência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
} 