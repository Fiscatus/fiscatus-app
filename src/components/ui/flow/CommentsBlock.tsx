import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  X, 
  User,
  Calendar,
  AtSign
} from 'lucide-react';
import { ModelStage, CommentItem } from '@/types/flow';
import { useFlowStore } from '@/stores/flowStore';
import { cn } from '@/lib/utils';

interface CommentsBlockProps {
  stage: ModelStage;
  density: 'cozy' | 'compact';
}

// Mock de usuários para menções
const mockUsers = [
  { id: '1', name: 'João Silva', role: 'Gerente' },
  { id: '2', name: 'Maria Santos', role: 'Coordenador' },
  { id: '3', name: 'Pedro Costa', role: 'Diretor' },
  { id: '4', name: 'Ana Lima', role: 'Analista' }
];

export default function CommentsBlock({ stage, density }: CommentsBlockProps) {
  const { addComment, deleteComment, updateToolConfig } = useFlowStore();
  const [newComment, setNewComment] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  
  const comments = stage.toolConfig.comments?.list || [];
  const allowMentions = stage.toolConfig.comments?.allowMentions || false;
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: CommentItem = {
      id: `c${Date.now()}`,
      author: 'Usuário Atual', // Mock
      role: 'Analista', // Mock
      text: newComment,
      createdAt: Date.now(),
      mentions: newComment.match(/@\w+/g) || []
    };
    
    addComment(stage.id, comment);
    setNewComment('');
  };
  
  const handleMentionClick = (userName: string) => {
    const mention = `@${userName}`;
    setNewComment(prev => prev + (prev ? ' ' : '') + mention + ' ');
    setShowMentions(false);
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const isCompact = density === 'compact';
  
  return (
    <div className="space-y-4">
      {/* Novo comentário */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium">Novo comentário</span>
        </div>
        
        <div className="relative">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Digite seu comentário..."
            className={cn(
              "resize-none",
              isCompact ? "h-16" : "h-20"
            )}
            rows={isCompact ? 2 : 3}
          />
          
          {allowMentions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMentions(!showMentions)}
              className="absolute top-1 right-1 h-6 w-6 p-0"
            >
              <AtSign className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        {showMentions && (
          <div className="mt-2 p-2 bg-slate-50 rounded border">
            <div className="text-xs text-slate-500 mb-2">Mencionar:</div>
            <div className="space-y-1">
              {mockUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleMentionClick(user.name)}
                  className="block w-full text-left text-xs hover:bg-slate-100 p-1 rounded"
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="text-slate-500 ml-1">({user.role})</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="h-7 px-3 text-xs"
          >
            Comentar
          </Button>
        </div>
      </div>
      
      {/* Lista de comentários */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 bg-slate-50 rounded border"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-sm font-medium">{comment.author}</span>
                    {comment.role && (
                      <span className="text-xs text-slate-500 ml-1">({comment.role})</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteComment(stage.id, comment.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              <p className="text-sm text-slate-700 mb-2">{comment.text}</p>
              
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(comment.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-sm text-slate-500">
          Nenhum comentário ainda
        </div>
      )}
      
      {/* Configurações */}
      <div className="pt-3 border-t border-slate-200">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={allowMentions}
            onChange={(e) => updateToolConfig(stage.id, {
              comments: {
                ...stage.toolConfig.comments,
                allowMentions: e.target.checked
              }
            })}
            className="rounded"
          />
          <span>Permitir menções (@)</span>
        </label>
      </div>
    </div>
  );
}
