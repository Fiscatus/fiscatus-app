import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { AtSign, Search, User } from 'lucide-react';

interface User {
  id: string;
  nome: string;
  cargo: string;
  gerencia: string;
  email: string;
}

interface MentionAutocompleteProps {
  query: string;
  onSelect: (user: User) => void;
  onClose: () => void;
  isVisible: boolean;
  position: { top: number; left: number };
}

// Mock de usuários com acesso ao processo (em produção viria da API)
const mockUsersWithAccess: User[] = [
  {
    id: '1',
    nome: 'Lara Rubia Vaz Diniz Fraguas',
    cargo: 'Supervisão contratual',
    gerencia: 'Comissão de Implantação',
    email: 'lara.fraguas@hospital.gov.br'
  },
  {
    id: '2',
    nome: 'Diran Rodrigues de Souza Filho',
    cargo: 'Secretário Executivo',
    gerencia: 'SE - Secretaria Executiva',
    email: 'diran.rodrigues@hospital.gov.br'
  },
  {
    id: '3',
    nome: 'Georgia Guimaraes Pereira',
    cargo: 'Controladora Interna',
    gerencia: 'OUV - Ouvidoria',
    email: 'georgia.guimaraes@hospital.gov.br'
  },
  {
    id: '4',
    nome: 'Yasmin Pissolati Mattos Bretz',
    cargo: 'Gerente de Soluções e Projetos',
    gerencia: 'GSP - Gerência de Soluções e Projetos',
    email: 'yasmin.pissolati@hospital.gov.br'
  },
  {
    id: '5',
    nome: 'Guilherme de Carvalho Silva',
    cargo: 'Gerente Suprimentos e Logistica',
    gerencia: 'GSL - Gerência de Suprimentos e Logística',
    email: 'guilherme.carvalho@hospital.gov.br'
  },
  {
    id: '6',
    nome: 'Lucas Moreira Brito',
    cargo: 'GERENTE DE RH',
    gerencia: 'GRH - Gerência de Recursos Humanos',
    email: 'lucas.moreira@hospital.gov.br'
  },
  {
    id: '7',
    nome: 'Andressa Sterfany Santos da Silva',
    cargo: 'Assessora Técnica de Saúde',
    gerencia: 'GUE - Gerência de Urgência e Emergência',
    email: 'andressa.sterfany@hospital.gov.br'
  },
  {
    id: '8',
    nome: 'Leticia Bonfim Guilherme',
    cargo: 'Gerente de Licitações e Contratos',
    gerencia: 'GLC - Gerência de Licitações e Contratos',
    email: 'leticia.bonfim@hospital.gov.br'
  }
];

export default function MentionAutocomplete({
  query,
  onSelect,
  onClose,
  isVisible,
  position
}: MentionAutocompleteProps) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useUser();

  // Filtrar usuários baseado na query
  useEffect(() => {
    if (!query) {
      setFilteredUsers(mockUsersWithAccess.slice(0, 8));
      return;
    }

    const filtered = mockUsersWithAccess
      .filter(user => 
        user.nome.toLowerCase().includes(query.toLowerCase()) ||
        user.cargo.toLowerCase().includes(query.toLowerCase()) ||
        user.gerencia.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8);

    setFilteredUsers(filtered);
    setSelectedIndex(0);
  }, [query, isVisible]);

  // Navegação por teclado
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isVisible) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filteredUsers[selectedIndex]) {
          onSelect(filteredUsers[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [isVisible, filteredUsers, selectedIndex, onSelect, onClose]);

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

  // Obter iniciais do usuário
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isVisible || filteredUsers.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm w-80 max-h-64 overflow-hidden"
      style={{
        top: position.top,
        left: position.left
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AtSign className="w-4 h-4" />
          <span>Mencionar usuário</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Lista de usuários */}
      <div 
        ref={listRef}
        className="max-h-48 overflow-y-auto"
      >
        {filteredUsers.map((user, index) => (
          <div
            key={user.id}
            className={`px-3 py-2 cursor-pointer transition-colors ${
              index === selectedIndex 
                ? 'bg-blue-50 border-l-2 border-blue-500' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect(user)}
            role="option"
            aria-selected={index === selectedIndex}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                  {getUserInitials(user.nome)}
                </AvatarFallback>
              </Avatar>

              {/* Informações do usuário */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {user.nome}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.cargo} • {user.gerencia}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {user.email}
                </div>
              </div>

              {/* Indicador de seleção */}
              {index === selectedIndex && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer com instruções */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>↑↓ navegar • Enter/Tab selecionar • Esc fechar</span>
          <span className="text-gray-400">
            {selectedIndex + 1} de {filteredUsers.length}
          </span>
        </div>
      </div>
    </div>
  );
}
