import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import CommentWithMentions from './CommentWithMentions';
import CommentList from './CommentList';

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

interface CommentsSectionProps {
  processoId: string;
  etapaId?: string;
  cardId?: string;
  title?: string;
  className?: string;
}

// Mock de comentários existentes
const mockComments: Comment[] = [
  {
    id: '1',
    autorId: '4',
    autorNome: 'Yasmin Pissolati Mattos Bretz',
    criadoEm: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    texto: 'Preciso que @Lara Rubia Vaz Diniz Fraguas revise este documento antes de prosseguirmos.',
    mentions: [
      {
        userId: '1',
        display: 'Lara Rubia Vaz Diniz Fraguas',
        start: 25,
        end: 52
      }
    ]
  },
  {
    id: '2',
    autorId: '1',
    autorNome: 'Lara Rubia Vaz Diniz Fraguas',
    criadoEm: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
    texto: 'Documento revisado e aprovado. @Guilherme de Carvalho Silva pode prosseguir com a aquisição.',
    mentions: [
      {
        userId: '5',
        display: 'Guilherme de Carvalho Silva',
        start: 35,
        end: 65
      }
    ]
  },
  {
    id: '3',
    autorId: '6',
    autorNome: 'Lucas Moreira Brito',
    criadoEm: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
    texto: 'Aguardando feedback da @Georgia Guimaraes Pereira sobre os recursos necessários.',
    mentions: [
      {
        userId: '3',
        display: 'Georgia Guimaraes Pereira',
        start: 28,
        end: 55
      }
    ]
  }
];

export default function CommentsSection({
  processoId,
  etapaId,
  cardId,
  title = "Comentários",
  className = ""
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar comentários existentes
  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      try {
        // Simular carregamento de comentários da API
        await new Promise(resolve => setTimeout(resolve, 500));
        // Em produção, aqui seria feita a chamada para a API
        // const response = await fetch(`/api/comentarios?processoId=${processoId}&etapaId=${etapaId}&cardId=${cardId}`);
        // const data = await response.json();
        // setComments(data);
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [processoId, etapaId, cardId]);

  // Adicionar novo comentário
  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <div className="ml-auto">
            <span className="text-sm text-gray-500">
              {comments.length} comentário{comments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Lista de comentários */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-full"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <CommentList 
                comments={comments}
                className="max-h-96 overflow-y-auto"
              />
            )}
          </div>

          {/* Adicionar comentário */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <CommentWithMentions
                processoId={processoId}
                etapaId={etapaId}
                cardId={cardId}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
