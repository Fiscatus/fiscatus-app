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
  
  // Estados do modal
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Normalizar value para array
  const responsaveis = Array.isArray(value) ? value : [];
  
  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen) {
        buscarUsuariosLista();
      }
    }, 250);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentPage, isOpen]);
  
  // Buscar usuários
  const buscarUsuariosLista = async () => {
    setIsLoading(true);
    try {
      console.log('Buscando usuários com responsáveis existentes:', responsaveis.map(r => r.id));
      const resultado = await buscarUsuarios(searchQuery, currentPage, 20, responsaveis);
      setUsuarios(resultado.usuarios);
      setTotalPages(resultado.totalPages);
      setSelectedIndex(0);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar usuários. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Abrir modal
  const handleOpenModal = () => {
    if (disabled || !canEdit || responsaveis.length >= maxResponsaveis) return;
    
    setIsOpen(true);
    setSearchQuery('');
    setSelectedUsuario(null);
    setCurrentPage(1);
    setSelectedIndex(0);
    
    // Focar no campo de busca
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };
  
  // Fechar modal
  const handleCloseModal = () => {
    setIsOpen(false);
    setSearchQuery('');
    setSelectedUsuario(null);
    setSelectedIndex(0);
  };
  
  // Selecionar usuário
  const handleSelectUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
  };
  
  // Confirmar seleção
  const handleConfirmarSelecao = async () => {
    if (!selectedUsuario) return;
    
    setIsSaving(true);
    try {
      // Salvar no backend
      await salvarResponsavel(processoId, selectedUsuario.id);
      
      // Criar objeto responsável
      const responsavel: Responsavel = {
        id: selectedUsuario.id,
        nome: selectedUsuario.nome,
        cargo: selectedUsuario.cargo,
        gerencia: selectedUsuario.gerencia,
        avatarUrl: selectedUsuario.avatarUrl
      };
      
      // Verificar se o responsável já existe na lista
      const responsavelJaExiste = responsaveis.some(r => r.id === selectedUsuario.id);
      
      console.log('Verificando duplicação:', {
        responsavelId: selectedUsuario.id,
        responsaveisExistentes: responsaveis.map(r => r.id),
        jaExiste: responsavelJaExiste
      });
      
      if (responsavelJaExiste) {
        toast({
          title: "Responsável já adicionado",
          description: `${selectedUsuario.nome} já está na lista de responsáveis.`,
          variant: "destructive"
        });
        return;
      }
      
      // Adicionar à lista de responsáveis
      const novosResponsaveis = [...responsaveis, responsavel];
      console.log('Adicionando responsável:', {
        responsavel,
        responsaveisAtuais: responsaveis,
        novosResponsaveis
      });
      onChange(novosResponsaveis);
      
      // Limpar seleção e fechar modal
      setSelectedUsuario(null);
      setSearchQuery('');
      setSelectedIndex(0);
      handleCloseModal();
      
      toast({
        title: "Responsável adicionado",
        description: `${selectedUsuario.nome} foi adicionado como responsável pela elaboração.`,
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar responsável. Tente novamente.",
        variant: "destructive"
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
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < usuarios.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : usuarios.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (usuarios[selectedIndex]) {
          handleSelectUsuario(usuarios[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        handleCloseModal();
        break;
    }
  }, [isOpen, usuarios, selectedIndex]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Scroll para o item selecionado
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);
  
  // Carregar usuários iniciais
  useEffect(() => {
    if (isOpen) {
      buscarUsuariosLista();
    }
  }, [isOpen]);
  
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
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
          <User className="w-4 h-4" />
          Responsáveis pela Elaboração * ({responsaveis.length})
        </Label>
        <div className="space-y-2">
          {responsaveis.map((responsavel, index) => (
            <div key={`${responsavel.id}-${index}`} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200 max-w-full overflow-hidden">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={responsavel.avatarUrl} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                  {getIniciais(responsavel.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="font-medium text-gray-900 text-sm truncate">{responsavel.nome}</div>
                <div className="text-xs text-gray-600 truncate">{responsavel.cargo}</div>
                <Badge variant="secondary" className="text-xs mt-1 hidden sm:inline-flex">
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
          // Lista de chips com responsáveis selecionados
          <div className="space-y-2">
            {console.log('Renderizando responsáveis:', responsaveis)}
            {responsaveis.map((responsavel, index) => (
              <div key={`${responsavel.id}-${index}`} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200 max-w-full overflow-hidden">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={responsavel.avatarUrl} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                    {getIniciais(responsavel.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="font-medium text-gray-900 text-sm truncate">{responsavel.nome}</div>
                  <div className="text-xs text-gray-600 truncate">{responsavel.cargo}</div>
                  <Badge variant="secondary" className="text-xs mt-1 hidden sm:inline-flex">
                    {responsavel.gerencia}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoverResponsavel(responsavel.id, responsavel.nome)}
                  disabled={disabled}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 ml-auto"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          // Mensagem quando não há responsáveis
          <div className="text-sm text-gray-500 text-center py-4">
            Nenhum responsável definido
          </div>
        )}
        
        {/* Botão para adicionar responsável */}
        {responsaveis.length < maxResponsaveis && (
          <Button
            variant="outline"
            onClick={handleOpenModal}
            disabled={disabled}
            className="w-full justify-start text-gray-500 hover:text-gray-700 mt-3"
          >
            <Plus className="w-4 h-4 mr-2" />
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
        <DialogContent className="sm:max-w-[600px] h-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Adicionar Responsável pela Elaboração
            </DialogTitle>
            <DialogDescription>
              Busque e selecione um usuário para adicionar como responsável pela elaboração do DFD.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col space-y-4 min-h-0">
            {/* Campo de busca */}
            <div className="space-y-2 flex-shrink-0">
              <Label htmlFor="search">Buscar usuário</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  ref={searchInputRef}
                  id="search"
                  placeholder="Buscar por nome, e-mail, cargo ou gerência..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Lista de usuários com altura fixa */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Buscando usuários...</span>
                    </div>
                  ) : usuarios.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        {searchQuery 
                          ? `Nenhum usuário encontrado para "${searchQuery}".`
                          : "Todos os usuários disponíveis já são responsáveis."
                        }
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div ref={listRef} className="space-y-1">
                      {usuarios.map((usuario, index) => (
                        <div
                          key={usuario.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedUsuario?.id === usuario.id
                              ? 'bg-blue-50 border-blue-200'
                              : index === selectedIndex
                              ? 'bg-gray-50 border-gray-200'
                              : 'hover:bg-gray-50 border-transparent'
                          }`}
                          onClick={() => handleSelectUsuario(usuario)}
                          role="option"
                          aria-selected={selectedUsuario?.id === usuario.id}
                        >
                          <div className="flex items-center gap-3">
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
                            {selectedUsuario?.id === usuario.id && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {/* Usuário selecionado */}
            {selectedUsuario && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex-shrink-0">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Responsável selecionado:
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={selectedUsuario.avatarUrl} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                      {getIniciais(selectedUsuario.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {selectedUsuario.nome}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {selectedUsuario.cargo} • {selectedUsuario.gerencia}
                    </div>
                  </div>
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
              disabled={!selectedUsuario || isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Responsável'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
