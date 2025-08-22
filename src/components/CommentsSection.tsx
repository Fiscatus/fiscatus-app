import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import CommentComposer from './CommentComposer';
import CommentHistory from './CommentHistory';

interface Mention {
  userId: string;
  display: string;
  start: number;
  end: number;
}

interface CommentItem {
  id: string;
  initials: string;
  name: string;
  role?: string;
  message: string;
  datetime: string;
}

interface CommentsSectionProps {
  processoId: string;
  etapaId?: string;
  cardId?: string;
  title?: string;
  className?: string;
}

// Mock de comentários para demonstração
const mockComments: CommentItem[] = [
  {
    id: '1',
    initials: 'JS',
    name: 'João Silva',
    role: 'Analista Técnico',
    message: 'DFD enviado para análise técnica da GSP.',
    datetime: '2024-01-15T07:00:00Z'
  },
  {
    id: '2',
    initials: 'MS',
    name: 'Maria Santos',
    role: 'Gerente de Projetos',
    message: 'Revisão concluída. Documento aprovado para próxima etapa.',
    datetime: '2024-01-16T10:30:00Z'
  },
  {
    id: '3',
    initials: 'PL',
    name: 'Pedro Lima',
    role: 'Coordenador',
    message: 'Solicitando esclarecimentos sobre os requisitos técnicos.',
    datetime: '2024-01-14T14:15:00Z'
  }
];

export default function CommentsSection({
  processoId,
  etapaId,
  cardId,
  title = "Comentários",
  className = ""
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(mockComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Obter iniciais do nome
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Enviar novo comentário
  const handleSubmitComment = async (message: string, mentions: Mention[]) => {
    setIsSubmitting(true);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar novo comentário
      const newComment: CommentItem = {
        id: Date.now().toString(),
        initials: 'VC', // Iniciais do usuário atual (mock)
        name: 'Você', // Nome do usuário atual (mock)
        role: 'Usuário', // Cargo do usuário atual (mock)
        message,
        datetime: new Date().toISOString()
      };
      
      // Adicionar à lista
      setComments(prev => [newComment, ...prev]);
      
      // Toast de sucesso moderno
      toast({
        title: "✅ Comentário adicionado",
        description: "Seu comentário foi enviado com sucesso e aparecerá no histórico.",
      });
      
    } catch (error) {
      // Toast de erro
      toast({
        title: "Erro",
        description: "Erro ao enviar comentário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alterar ordenação
  const handleSortChange = (sortOrder: 'newest' | 'oldest') => {
    // A ordenação é feita internamente no CommentHistory
    console.log('Ordenação alterada para:', sortOrder);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Seção 1: Adicionar Novo Comentário */}
      <CommentComposer
        onSubmit={handleSubmitComment}
        isSubmitting={isSubmitting}
      />

      {/* Seção 2: Histórico de Comentários */}
      <CommentHistory
        items={comments}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
