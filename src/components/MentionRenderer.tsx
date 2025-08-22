import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AtSign } from 'lucide-react';

interface Mention {
  userId: string;
  display: string;
  start: number;
  end: number;
}

interface MentionRendererProps {
  text: string;
  mentions: Mention[];
  className?: string;
}

export default function MentionRenderer({ text, mentions, className = "" }: MentionRendererProps) {
  // Obter iniciais do usuário
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Encontrar usuário por ID
  const findUserById = (userId: string) => {
    // Mock de usuários - em produção viria de um contexto ou prop
    const mockUsers = [
      { id: '1', nome: 'Lara Rubia Vaz Diniz Fraguas' },
      { id: '2', nome: 'Diran Rodrigues de Souza Filho' },
      { id: '3', nome: 'Georgia Guimaraes Pereira' },
      { id: '4', nome: 'Yasmin Pissolati Mattos Bretz' },
      { id: '5', nome: 'Guilherme de Carvalho Silva' },
      { id: '6', nome: 'Lucas Moreira Brito' },
      { id: '7', nome: 'Andressa Sterfany Santos da Silva' },
      { id: '8', nome: 'Leticia Bonfim Guilherme' }
    ];
    return mockUsers.find(user => user.id === userId);
  };

  // Renderizar texto com menções destacadas
  const renderTextWithMentions = () => {
    if (mentions.length === 0) {
      return <span>{text}</span>;
    }

    // Ordenar menções por posição
    const sortedMentions = [...mentions].sort((a, b) => a.start - b.start);
    
    const parts = [];
    let lastIndex = 0;

    sortedMentions.forEach((mention, index) => {
      // Adicionar texto antes da menção
      if (mention.start > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, mention.start)}
          </span>
        );
      }

      // Adicionar menção destacada
      const user = findUserById(mention.userId);
      const displayName = user ? user.nome : mention.display;
      const firstName = displayName.split(' ')[0];

      parts.push(
        <Badge
          key={`mention-${index}`}
          variant="outline"
          className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 text-sm bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <AtSign className="w-3 h-3" />
          <Avatar className="w-3 h-3">
            <AvatarImage src="" />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
              {getUserInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{firstName}</span>
        </Badge>
      );

      lastIndex = mention.end;
    });

    // Adicionar texto restante
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className={`whitespace-pre-wrap break-words ${className}`}>
      {renderTextWithMentions()}
    </div>
  );
}
