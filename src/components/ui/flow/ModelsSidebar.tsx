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
    <nav className="h-full flex flex-col">
      <div className="sticky top-[calc(var(--safe-top)+var(--toolbar-h)+52px)] flex flex-col h-full">
        {/* Header com melhor espaçamento */}
        <div className="pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-1">Modelos</h2>
              <p className="text-sm text-slate-500">Fluxos de trabalho</p>
            </div>
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* CTAs com melhor espaçamento */}
          <div className="space-y-2">
            <Button onClick={handleNovoModelo} className="w-full h-9 text-sm font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Novo Modelo
            </Button>
            <Button onClick={handleDuplicarFiscatus} variant="outline" className="w-full h-9 text-sm">
              <Copy className="w-4 h-4 mr-2" />
              Duplicar Fiscatus
            </Button>
          </div>
        </div>

        {/* Seção de busca e filtros */}
        <div className="py-4 space-y-4">
          {/* Busca com melhor design */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar modelos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-9 text-sm rounded-lg border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
            />
          </div>

          {/* Filtros com melhor espaçamento */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">Filtros</p>
            <ToggleGroup type="single" value={filtro} onValueChange={setFiltro} className="justify-start">
              <ToggleGroupItem value="todos" className="rounded-full px-3 py-1.5 text-sm h-8 data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700">
                Todos
              </ToggleGroupItem>
              <ToggleGroupItem value="sistema" className="rounded-full px-3 py-1.5 text-sm h-8 data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700">
                Sistema
              </ToggleGroupItem>
              <ToggleGroupItem value="pessoais" className="rounded-full px-3 py-1.5 text-sm h-8 data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700">
                Meus
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Lista de modelos com scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2.5 pb-4">
            {modelosFiltrados.map((modelo) => (
              <div
                key={modelo.id}
                onClick={() => handleSelecionarModelo(modelo.id)}
                className={`group relative p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                  modelo.isAtivo 
                    ? 'ring-1 ring-indigo-200 border-indigo-300 bg-indigo-50/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/30'
                }`}
              >
                {/* Indicador de seleção */}
                {modelo.isAtivo && (
                  <div className="absolute -left-0.5 top-3 w-0.5 h-6 bg-indigo-500 rounded-r-full" />
                )}
                
                {/* Conteúdo principal */}
                <div className="space-y-2">
                  {/* Header com título e badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 text-sm leading-tight mb-1">
                        {modelo.nome}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {modelo.tipo === 'sistema' && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 h-5">
                            Sistema
                          </Badge>
                        )}
                        {modelo.isPadrao && (
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                    
                    {/* Ações on-hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditar(modelo.id);
                        }}
                        className="h-6 w-6 p-0 hover:bg-slate-100"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicar(modelo.id);
                        }}
                        className="h-6 w-6 p-0 hover:bg-slate-100"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExcluir(modelo.id);
                        }}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Informações do modelo */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Workflow className="w-3 h-3 flex-shrink-0" />
                      <span>{modelo.etapas} etapas</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full flex-shrink-0" />
                    <span className="truncate">{modelo.ultimoUpdate}</span>
                  </div>
                  
                  {/* Descrição */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {modelo.descricao}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Estado vazio */}
            {modelosFiltrados.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 mb-1">Nenhum modelo encontrado</p>
                <p className="text-xs text-slate-400">
                  {busca ? 'Tente ajustar os filtros de busca' : 'Crie seu primeiro modelo'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
