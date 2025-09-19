import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  Star, 
  StarOff,
  Search,
  Workflow,
  MoreHorizontal,
  PanelLeftClose
} from 'lucide-react';

interface Modelo {
  id: string;
  nome: string;
  descricao: string;
  etapas: number;
  tipo: 'sistema' | 'pessoal';
  isAtivo: boolean;
  isPadrao: boolean;
  ultimoUpdate: string;
}

const modelosMock: Modelo[] = [
  {
    id: '1',
    nome: 'Modelo Fiscatus',
    descricao: 'Fluxo completo para contratações públicas com todas as etapas necessárias para licitação e contratação.',
    etapas: 21,
    tipo: 'sistema',
    isAtivo: true,
    isPadrao: true,
    ultimoUpdate: '2 dias atrás'
  },
  {
    id: '2',
    nome: 'Contratação Rápida',
    descricao: 'Processo simplificado para contratações de baixo valor com etapas essenciais.',
    etapas: 8,
    tipo: 'pessoal',
    isAtivo: false,
    isPadrao: false,
    ultimoUpdate: '1 semana atrás'
  },
  {
    id: '3',
    nome: 'Aquisição de TI',
    descricao: 'Fluxo específico para aquisições de tecnologia da informação com análise técnica.',
    etapas: 15,
    tipo: 'pessoal',
    isAtivo: false,
    isPadrao: false,
    ultimoUpdate: '3 dias atrás'
  }
];

interface ModelsSidebarProps {
  onToggleCollapse?: () => void;
}

export default function ModelsSidebar({ onToggleCollapse }: ModelsSidebarProps) {
  const [modelos, setModelos] = useState<Modelo[]>(modelosMock);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const handleNovoModelo = () => {
    // Toast: "Em breve"
    console.log('Novo modelo - Em breve');
  };

  const handleDuplicarFiscatus = () => {
    // Toast: "Em breve"
    console.log('Duplicar Fiscatus - Em breve');
  };

  const handleEditar = (id: string) => {
    // Toast: "Em breve"
    console.log('Editar modelo - Em breve');
  };

  const handleDuplicar = (id: string) => {
    // Toast: "Em breve"
    console.log('Duplicar modelo - Em breve');
  };

  const handleExcluir = (id: string) => {
    // Toast: "Em breve"
    console.log('Excluir modelo - Em breve');
  };

  const handleDefinirPadrao = (id: string) => {
    // Toast: "Em breve"
    console.log('Definir como padrão - Em breve');
  };

  const handleSelecionarModelo = (id: string) => {
    setModelos(prev => prev.map(m => ({ ...m, isAtivo: m.id === id })));
  };

  const modelosFiltrados = modelos.filter(modelo => {
    const matchBusca = modelo.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      modelo.descricao.toLowerCase().includes(busca.toLowerCase());
    const matchFiltro = filtro === 'todos' || 
                       (filtro === 'sistema' && modelo.tipo === 'sistema') ||
                       (filtro === 'pessoais' && modelo.tipo === 'pessoal');
    return matchBusca && matchFiltro;
  });

  return (
    <nav className="space-y-4">
      <div className="sticky top-[calc(var(--safe-top)+12px)]">
      {/* Header compacto */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Modelos</h2>
            <p className="text-sm text-slate-600">Fluxos de trabalho</p>
          </div>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700"
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* CTAs */}
        <div className="space-y-2">
          <Button onClick={handleNovoModelo} className="w-full text-sm h-9">
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </Button>
          <Button onClick={handleDuplicarFiscatus} variant="outline" className="w-full text-sm h-9">
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </Button>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar modelos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-8 h-9 text-sm rounded-lg"
        />
      </div>

      {/* Filtros rápidos */}
      <ToggleGroup type="single" value={filtro} onValueChange={setFiltro} className="justify-start">
        <ToggleGroupItem value="todos" className="rounded-full px-3 py-1 text-sm h-7">
          Todos
        </ToggleGroupItem>
        <ToggleGroupItem value="sistema" className="rounded-full px-3 py-1 text-sm h-7">
          Sistema
        </ToggleGroupItem>
        <ToggleGroupItem value="pessoais" className="rounded-full px-3 py-1 text-sm h-7">
          Meus
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Lista de modelos */}
      <div className="space-y-2">
        {modelosFiltrados.map((modelo) => (
          <div
            key={modelo.id}
            onClick={() => handleSelecionarModelo(modelo.id)}
            className={`group p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
              modelo.isAtivo 
                ? 'ring-2 ring-indigo-200 border-indigo-300 bg-white' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-slate-900 text-sm truncate">{modelo.nome}</h4>
                  {modelo.tipo === 'sistema' && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0 px-2 py-0">Sistema</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{modelo.etapas} etapas</span>
                  <span>•</span>
                  <span>{modelo.ultimoUpdate}</span>
                </div>
              </div>

              {/* Ações on-hover */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditar(modelo.id);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicar(modelo.id);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExcluir(modelo.id);
                  }}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDefinirPadrao(modelo.id);
                  }}
                  className="h-6 w-6 p-0"
                >
                  {modelo.isPadrao ? (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  ) : (
                    <StarOff className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </nav>
  );
}
