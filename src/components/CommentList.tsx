import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock } from 'lucide-react';
import MentionRenderer from './MentionRenderer';

interface User {
  id: string;
  nome: string;
  cargo: string;
  gerencia: string;
  email: string;
}

interface Mention {
  userId: string;
  display: string;
  start: number;
  end: number;
}

interface Comment {
  id: string;
  autorId: string;
  autorNome: string;
  criadoEm: string;
  texto: string;
  mentions: Mention[];
}

interface CommentListProps {
  comments: Comment[];
  users: User[];
  className?: string;
}

// Mock de usuários (em produção viria da API)
const mockUsers: User[] = [
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

export default function CommentList({ 
  comments, 
  users = mockUsers, 
  className = "" 
}: CommentListProps) {
  // Obter iniciais do usuário
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `há ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `há ${diffInDays} dia${diffInDays !== 1 ? 's' : ''}`;
    }
  };

  // Encontrar usuário por ID
  const findUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  if (comments.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-sm">Nenhum comentário ainda</p>
        <p className="text-xs text-gray-400 mt-1">Seja o primeiro a comentar!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {comments.map((comment) => {
        const author = findUserById(comment.autorId);
        
        return (
          <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            {/* Header do comentário */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Avatar do autor */}
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                    {author ? getUserInitials(author.nome) : '??'}
                  </AvatarFallback>
                </Avatar>

                {/* Informações do autor */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">
                    {author?.nome || comment.autorNome}
                  </div>
                  <div className="text-xs text-gray-500">
                    {author?.cargo} • {author?.gerencia}
                  </div>
                </div>
              </div>

              {/* Data do comentário */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatDate(comment.criadoEm)}</span>
              </div>
            </div>

            {/* Conteúdo do comentário */}
            <div className="mb-3">
              <MentionRenderer
                text={comment.texto}
                mentions={comment.mentions}
                users={users}
                className="text-sm text-gray-800 leading-relaxed"
              />
            </div>

            {/* Footer com informações adicionais */}
            {comment.mentions && comment.mentions.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Mencionou {comment.mentions.length} usuário{comment.mentions.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
