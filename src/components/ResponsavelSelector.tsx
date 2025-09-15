import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Search, X, UserPlus, UserCheck, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

// Tipos
interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  gerencia: string;
  avatarUrl?: string;
  ativo: boolean;
}

interface Responsavel {
  id: string;
  nome: string;
  cargo: string;
  gerencia: string;
  avatarUrl?: string;
}

interface ResponsavelSelectorProps {
  value?: Responsavel[] | null;
  onChange: (responsaveis: Responsavel[] | null) => void;
  disabled?: boolean;
  canEdit?: boolean;
  processoId: string;
  className?: string;
  maxResponsaveis?: number;
}

// Mock de usuários ativos do sistema
const mockUsuariosAtivos: Usuario[] = [
  {
    id: '1',
    nome: 'Lara Rubia Vaz Diniz Fraguas',
    email: 'lara.fraguas@hospital.gov.br',
    cargo: 'Supervisão contratual',
    gerencia: 'Comissão de Implantação',
    ativo: true
  },
  {
    id: '2',
    nome: 'Diran Rodrigues de Souza Filho',
    email: 'diran.rodrigues@hospital.gov.br',
    cargo: 'Secretário Executivo',
    gerencia: 'SE - Secretaria Executiva',
    ativo: true
  },
  {
    id: '3',
    nome: 'Georgia Guimaraes Pereira',
    email: 'georgia.guimaraes@hospital.gov.br',
    cargo: 'Controladora Interna',
    gerencia: 'OUV - Ouvidoria',
    ativo: true
  },
  {
    id: '4',
    nome: 'Yasmin Pissolati Mattos Bretz',
    email: 'yasmin.pissolati@hospital.gov.br',
    cargo: 'Gerente de Soluções e Projetos',
    gerencia: 'GSP - Gerência de Soluções e Projetos',
    ativo: true
  },
  {
    id: '5',
    nome: 'Guilherme de Carvalho Silva',
    email: 'guilherme.carvalho@hospital.gov.br',
    cargo: 'Gerente Suprimentos e Logistica',
    gerencia: 'GSL - Gerência de Suprimentos e Logística',
    ativo: true
  },
  {
    id: '6',
    nome: 'Lucas Moreira Brito',
    email: 'lucas.moreira@hospital.gov.br',
    cargo: 'GERENTE DE RH',
    gerencia: 'GRH - Gerência de Recursos Humanos',
    ativo: true
  },
  {
    id: '7',
    nome: 'Andressa Sterfany Santos da Silva',
    email: 'andressa.sterfany@hospital.gov.br',
    cargo: 'Assessora Técnica de Saúde',
    gerencia: 'GUE - Gerência de Urgência e Emergência',
    ativo: true
  },
  {
    id: '8',
    nome: 'Leticia Bonfim Guilherme',
    email: 'leticia.bonfim@hospital.gov.br',
    cargo: 'Gerente de Licitações e Contratos',
    gerencia: 'GLC - Gerência de Licitações e Contratos',
    ativo: true
  },
  {
    id: '9',
    nome: 'Dallas Kelson Francisco de Souza',
    email: 'dallas.kelson@hospital.gov.br',
    cargo: 'Gerente Financeiro',
    gerencia: 'GFC - Gerência Financeira e Contábil',
    ativo: true
  },
  {
    id: '10',
    nome: 'Gabriel Radamesis Gomes Nascimento',
    email: 'gabriel.radamesis@hospital.gov.br',
    cargo: 'Assessor Jurídico',
    gerencia: 'NAJ - Assessoria Jurídica',
    ativo: true
  }
];

// Função para obter iniciais do nome
const getIniciais = (nome: string): string => {
  return nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Função para buscar usuários (mock da API)
const buscarUsuarios = async (query: string, page: number = 1, limit: number = 20, responsaveisExistentes: Responsavel[] = []): Promise<{
  usuarios: Usuario[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Filtrar usuários que já são responsáveis
  const idsResponsaveisExistentes = responsaveisExistentes.map(r => r.id);
  
  let usuariosFiltrados = mockUsuariosAtivos.filter(usuario => 
    usuario.ativo && 
    !idsResponsaveisExistentes.includes(usuario.id) && (
      usuario.nome.toLowerCase().includes(query.toLowerCase()) ||
      usuario.email.toLowerCase().includes(query.toLowerCase()) ||
      usuario.cargo.toLowerCase().includes(query.toLowerCase()) ||
      usuario.gerencia.toLowerCase().includes(query.toLowerCase())
    )
  );
  
  const total = usuariosFiltrados.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    usuarios: usuariosFiltrados.slice(startIndex, endIndex),
    total,
    page,
    totalPages
  };
};

// Função para salvar responsável (mock da API)
const salvarResponsavel = async (processoId: string, userId: string): Promise<void> => {
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock da chamada PUT /processos/:processoId/dfd/responsavel
  console.log('Salvando responsável:', { processoId, userId });
  
  // Mock da auditoria POST /auditoria
  console.log('Registrando auditoria:', {
    processoId,
    acao: 'DFD_ADD_RESPONSAVEL',
    de: null,
    para: userId
  });
};

// Função para remover responsável (mock da API)
const removerResponsavel = async (processoId: string, userId: string): Promise<void> => {
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock da chamada DELETE /processos/:processoId/dfd/responsavel/:userId
  console.log('Removendo responsável:', { processoId, userId });
  
  // Mock da auditoria POST /auditoria
  console.log('Registrando auditoria:', {
    processoId,
    acao: 'DFD_REMOVE_RESPONSAVEL',
    de: userId,
    para: null
  });
};

export default function ResponsavelSelector({
  value = [],
  onChange,
  disabled = false,
  canEdit = true,
  processoId,
  className = '',
  maxResponsaveis = 5
}: ResponsavelSelectorProps) {
  const { toast } = useToast();
  const { user: currentUser } = useUser();
  
  // Estados do modal - fonte única de verdade
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Usuario[]>([]);
  const [selected, setSelected] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Normalizar value para array
  const responsaveis = Array.isArray(value) ? value : [];
  
  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen && query.trim()) {
        buscarUsuariosLista();
      } else if (isOpen && !query.trim()) {
        setResults([]);
        setDropdownOpen(false);
      }
    }, 250);
    
    return () => clearTimeout(timeoutId);
  }, [query, isOpen]);
  
  // Buscar usuários com deduplicação
  const buscarUsuariosLista = async () => {
    setIsLoading(true);
    try {
      const resultado = await buscarUsuarios(query, 1, 20, responsaveis);
      
      // Filtrar usuários que já são responsáveis OU já estão selecionados
      const usuariosFiltrados = resultado.usuarios.filter(u => 
        !responsaveis.some(r => r.id === u.id) && 
        !selected.some(s => s.id === u.id)
      );
      
      setResults(usuariosFiltrados);
      setDropdownOpen(usuariosFiltrados.length > 0);
      setSelectedIndex(0);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar usuários. Tente novamente.",
        variant: "destructive"
      });
      setDropdownOpen(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Abrir modal
  const handleOpenModal = () => {
    if (disabled || !canEdit || responsaveis.length >= maxResponsaveis) return;
    
    // Limpar todos os estados antes de abrir
    setQuery('');
    setSelected([]);
    setResults([]);
    setSelectedIndex(0);
    setDropdownOpen(false);
    setIsOpen(true);
    
    // Focar no campo de busca
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };
  
  // Fechar modal
  const handleCloseModal = () => {
    setIsOpen(false);
    setQuery('');
    setSelected([]);
    setResults([]);
    setSelectedIndex(0);
    setDropdownOpen(false);
  };
  
  // Selecionar usuário (fonte única de verdade)
  const onSelect = (user: Usuario) => {
    setSelected(prev => prev.some(u => u.id === user.id) ? prev : [...prev, user]);
    setQuery(""); // limpa o input
    setDropdownOpen(false);
    
    // Refiltra results para remover o usuário selecionado
    setResults(prev => prev.filter(r => r.id !== user.id));
  };
  
  // Remover usuário selecionado
  const onRemove = (id: string) => {
    setSelected(prev => prev.filter(u => u.id !== id));
    
    // Se há uma query ativa, refaz a busca para incluir o usuário removido
    if (query.trim()) {
      setTimeout(() => buscarUsuariosLista(), 100);
    }
  };
  
  // Confirmar seleção (múltiplos)
  const handleConfirmarSelecao = async () => {
    if (selected.length === 0) return;
    setIsSaving(true);
    try {
      const remaining = Math.max(0, maxResponsaveis - responsaveis.length);
      
      // Filtrar apenas usuários que ainda não são responsáveis
      const toAdd = selected
        .filter(u => !responsaveis.some(r => r.id === u.id))
        .slice(0, remaining);

      if (toAdd.length === 0) {
        toast({
          title: 'Nada adicionado',
          description: remaining === 0 ? 'Limite máximo já atingido.' : 'Todos os selecionados já estavam na lista.',
          variant: remaining === 0 ? 'destructive' : undefined
        });
        handleCloseModal();
        return;
      }

      // Salvar em paralelo (mock)
      await Promise.all(toAdd.map(u => salvarResponsavel(processoId, u.id)));

      // Converter para Responsavel e adicionar à lista existente
      const novosResponsaveis: Responsavel[] = toAdd.map(u => ({
        id: u.id,
        nome: u.nome,
        cargo: u.cargo,
        gerencia: u.gerencia,
        avatarUrl: u.avatarUrl
      }));

      // Simplesmente adicionar os novos (já filtrados para não duplicar)
      const listaAtualizada = [...responsaveis, ...novosResponsaveis];
      onChange(listaAtualizada);

      toast({ 
        title: 'Responsáveis adicionados', 
        description: `${toAdd.length} responsável(is) adicionado(s) com sucesso.` 
      });

      handleCloseModal();
      
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: 'Erro ao adicionar responsáveis. Tente novamente.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Remover responsável
  const handleRemoverResponsavel = async (responsavelId: string, responsavelNome: string) => {
    try {
      // Remover do backend
      await removerResponsavel(processoId, responsavelId);
      
      // Remover da lista
      const novosResponsaveis = responsaveis.filter(r => r.id !== responsavelId);
      onChange(novosResponsaveis.length > 0 ? novosResponsaveis : null);
      
      toast({
        title: "Responsável removido",
        description: `${responsavelNome} foi removido dos responsáveis.`,
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover responsável. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Navegação por teclado
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen || !dropdownOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setDropdownOpen(false);
        break;
    }
  }, [isOpen, dropdownOpen, results, selectedIndex]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Scroll para o item selecionado
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0 && results.length > 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, results]);
  
  // Se não pode editar ou está desabilitado, mostrar apenas os chips
  if (!canEdit || disabled) {
    if (!responsaveis || responsaveis.length === 0) {
      return (
        <div className={`p-4 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <User className="w-4 h-4" />
            Responsáveis pela Elaboração *
          </Label>
          <div className="text-sm text-gray-500">
            Nenhum responsável definido
          </div>
        </div>
      );
    }
    
    return (
      <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <User className="w-4 h-4" />
          Responsáveis pela Elaboração * ({responsaveis.length})
        </Label>
        <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
          {responsaveis.map((responsavel, index) => (
            <div
              key={`${responsavel.id}-${index}`}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-blue-200 bg-blue-50"
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={responsavel.avatarUrl} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                  {getIniciais(responsavel.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-900 truncate">
                  {responsavel.nome}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-700 truncate">
                  {responsavel.cargo}
                </span>
                <Badge variant="secondary" className="ml-2 text-[10px] bg-blue-100 text-blue-700 border-blue-200 flex-shrink-0">
                  {responsavel.gerencia}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
          <User className="w-4 h-4" />
          Responsáveis pela Elaboração * ({responsaveis.length}/{maxResponsaveis})
        </Label>
        
        {responsaveis.length > 0 ? (
          // Lista melhorada de responsáveis selecionados
          <div className="flex flex-col gap-2 max-h-[220px] overflow-auto pr-1">
            {responsaveis.map((responsavel, index) => (
              <div key={`${responsavel.id}-${index}`} className="group relative p-2.5 rounded-lg border border-blue-200 bg-blue-50">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={responsavel.avatarUrl} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                      {getIniciais(responsavel.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-900 truncate">{responsavel.nome}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700 truncate">{responsavel.cargo}</span>
                    <Badge variant="secondary" className="ml-2 text-[10px] bg-blue-100 text-blue-700 border-blue-200 flex-shrink-0">
                      {responsavel.gerencia}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoverResponsavel(responsavel.id, responsavel.nome)}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Mensagem quando não há responsáveis
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">Nenhum responsável definido</p>
            <p className="text-xs text-gray-400">Adicione pelo menos um responsável pela elaboração</p>
          </div>
        )}
        
        {/* Botão para adicionar responsável */}
        {responsaveis.length < maxResponsaveis && (
          <Button
            variant="outline"
            onClick={handleOpenModal}
            disabled={disabled}
            className="w-full justify-center text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 mt-4 py-3 rounded-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Responsável
          </Button>
        )}
        
        {responsaveis.length >= maxResponsaveis && (
          <div className="text-xs text-gray-500 text-center mt-2">
            Limite máximo de {maxResponsaveis} responsáveis atingido
          </div>
        )}
      </div>
      
      {/* Modal de seleção */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] h-[650px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Adicionar Responsável pela Elaboração
            </DialogTitle>
            <DialogDescription>
              Busque e selecione usuários para adicionar como responsáveis pela elaboração do DFD.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col space-y-4 min-h-0">
            {/* Campo de busca com combobox */}
            <div className="space-y-2 flex-shrink-0">
              <Label htmlFor="search">Buscar usuário</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  ref={searchInputRef}
                  id="search"
                  placeholder="Buscar por nome, e-mail, cargo ou gerência..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.trim() && results.length > 0 && setDropdownOpen(true)}
                  className="pl-10"
                />
                
                {/* Dropdown com portal e z-index alto */}
                {dropdownOpen && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Buscando usuários...</span>
                      </div>
                    ) : results.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {query.trim() ? `Nenhum resultado para "${query}"` : 'Digite para buscar usuários'}
                      </div>
                    ) : (
                      <div ref={listRef} className="p-1">
                        {results.map((usuario, index) => (
                          <div
                            key={usuario.id}
                            className={`p-3 hover:bg-slate-50 cursor-pointer flex gap-3 items-start rounded-lg transition-colors ${
                              index === selectedIndex ? 'bg-slate-100' : ''
                            }`}
                            onClick={() => onSelect(usuario)}
                            role="option"
                            aria-selected={index === selectedIndex}
                          >
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <AvatarImage src={usuario.avatarUrl} />
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                                {getIniciais(usuario.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {usuario.nome}
                              </div>
                              <div className="text-sm text-gray-600 truncate">
                                {usuario.cargo}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {usuario.email}
                              </div>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {usuario.gerencia}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Bloco Selecionados - posição estática */}
            {selected.length > 0 && (
              <div className="mt-3 rounded-xl border border-slate-200 p-3 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">
                    Selecionados: {selected.length}
                  </span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    {selected.length} pessoa{selected.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selected.map(u => (
                    <div key={u.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={u.avatarUrl} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                          {getIniciais(u.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate text-sm">
                          {u.nome}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {u.cargo}
                        </div>
                      </div>
                      <button
                        onClick={() => onRemove(u.id)}
                        className="p-1 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                        aria-label="Remover seleção"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Separator className="flex-shrink-0" />
          
          {/* Footer com ações */}
          <div className="flex justify-end gap-3 pt-4 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarSelecao}
              disabled={selected.length === 0 || isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Selecionados'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
