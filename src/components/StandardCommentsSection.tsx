import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Plus, Clock, ArrowUpDown } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import TextareaWithMentions from './TextareaWithMentions';
import MentionRenderer from './MentionRenderer';
import { formatDateTimeBR } from '@/lib/utils';

interface Comment {
  id: string;
  autorId: string;
  autorNome: string;
  autorCargo?: string;
  criadoEm: string;
  texto: string;
  mentions?: Array<{
    userId: string;
    display: string;
    start: number;
    end: number;
  }>;
}

interface StandardCommentsSectionProps {
  processoId: string;
  etapaId: string;
  cardId: string;
  title?: string;
  className?: string;
  canAddComment?: boolean;
  maxLength?: number;
}

// Mock de comentários para demonstração
const mockComments: Comment[] = [
  {
    id: '1',
    autorId: '1',
    autorNome: 'Lucas Moreira Brito',
    autorCargo: 'Gerente de Recursos Humanos',
    criadoEm: '2024-01-15T07:00:00Z',
    texto: 'DFD enviado para análise técnica da GSP.'
  },
  {
    id: '2',
    autorId: '2',
    autorNome: 'Maria Santos',
    autorCargo: 'Gerente de Projetos',
    criadoEm: '2024-01-16T10:30:00Z',
    texto: 'Revisão concluída. Documento aprovado para próxima etapa.'
  },
  {
    id: '3',
    autorId: '3',
    autorNome: 'Pedro Lima',
    autorCargo: 'Coordenador',
    criadoEm: '2024-01-14T14:15:00Z',
    texto: 'Solicitando esclarecimentos sobre os requisitos técnicos.'
  }
];

export default function StandardCommentsSection({
  processoId,
  etapaId,
  cardId,
  title = "Comentários",
  className = "",
  canAddComment = true,
  maxLength
}: StandardCommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [newCommentMentions, setNewCommentMentions] = useState([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { user } = useUser();

  // Usar a função padronizada do utils
  const formatDate = formatDateTimeBR;

  // Obter iniciais do usuário
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Ordenar comentários baseado no filtro selecionado
  const sortedComments = useMemo(() => {
    const sorted = [...comments].sort((a, b) => {
      const dateA = new Date(a.criadoEm).getTime();
      const dateB = new Date(b.criadoEm).getTime();
      
      if (sortOrder === 'newest') {
        return dateB - dateA; // Mais recentes primeiro
      } else {
        return dateA - dateB; // Mais antigas primeiro
      }
    });
    
    return sorted;
  }, [comments, sortOrder]);

  // Adicionar novo comentário
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      autorId: user?.id || '1',
      autorNome: user?.nome || 'Usuário',
      autorCargo: user?.cargo || 'Usuário',
      criadoEm: new Date().toISOString(),
      texto: newComment.trim(),
      mentions: newCommentMentions
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    setNewCommentMentions([]);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Seção de Adicionar Comentário */}
      {canAddComment && (
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Adicionar Novo Comentário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <TextareaWithMentions
                value={newComment}
                onChange={(value, mentions) => {
                  setNewComment(value);
                  if (mentions) {
                    setNewCommentMentions(mentions);
                  }
                }}
                placeholder="Digite seu comentário aqui... Use @ para mencionar usuários"
                maxLength={maxLength}
                minHeight="120px"
                className="w-full border-gray-200 focus:border-orange-300 focus:ring-orange-300"
                processoId={processoId}
                etapaId={etapaId}
                cardId={cardId}
              />
              {maxLength && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Máx. {maxLength} caracteres</span>
                  <span className="text-xs text-gray-400">{newComment.length}/{maxLength}</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Comentário
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Seção de Histórico de Comentários */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-lg font-semibold text-gray-900">
                Histórico de Comentários ({comments.length})
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum comentário ainda</p>
              <p className="text-sm text-gray-400">Seja o primeiro a comentar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedComments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  {/* Avatar do autor */}
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-sm font-medium">
                      {getUserInitials(comment.autorNome)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Conteúdo do comentário */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{comment.autorNome}</span>
                        {comment.autorCargo && (
                          <span className="text-sm text-gray-500">• {comment.autorCargo}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDate(comment.criadoEm)}
                      </div>
                    </div>
                    
                    {/* Texto do comentário com menções */}
                    <div className="text-sm text-gray-800">
                      <MentionRenderer 
                        text={comment.texto} 
                        mentions={comment.mentions || []}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
