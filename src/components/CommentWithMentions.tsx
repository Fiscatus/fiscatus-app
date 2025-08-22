import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { MessageCircle, Send, AtSign } from 'lucide-react';
import MentionAutocomplete from './MentionAutocomplete';
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

interface CommentWithMentionsProps {
  processoId: string;
  etapaId?: string;
  cardId?: string;
  onCommentAdded?: (comment: Comment) => void;
  className?: string;
}

// Mock de usuários com acesso ao processo
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

export default function CommentWithMentions({
  processoId,
  etapaId,
  cardId,
  onCommentAdded,
  className = ""
}: CommentWithMentionsProps) {
  const [text, setText] = useState('');
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUser();
  const { toast } = useToast();

  // Obter iniciais do usuário
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Detectar menção @ no texto
  const detectMention = useCallback((text: string, cursorPos: number) => {
    const beforeCursor = text.slice(0, cursorPos);
    // Detecta @ seguido de qualquer caractere ou no final da linha
    const mentionMatch = beforeCursor.match(/@([a-zA-ZÀ-ÿ\u00f1\u00d1\s]*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1].trim();
      const startPos = beforeCursor.lastIndexOf('@');
      
      // Calcular posição do autocomplete
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const textareaRect = textarea.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        setAutocompletePosition({
          top: textareaRect.bottom + scrollTop + 5,
          left: textareaRect.left + scrollLeft
        });
      }
      
      setAutocompleteQuery(query);
      setShowAutocomplete(true);
      return { query, startPos };
    }
    
    setShowAutocomplete(false);
    return null;
  }, []);

  // Manipular mudança no texto
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const newCursorPos = e.target.selectionStart;
    
    setText(newText);
    setCursorPosition(newCursorPos);
    
    // Detectar menção
    detectMention(newText, newCursorPos);
  };

  // Selecionar usuário do autocomplete
  const handleUserSelect = (selectedUser: User) => {
    const beforeCursor = text.slice(0, cursorPosition);
    const mentionMatch = beforeCursor.match(/@([a-zA-ZÀ-ÿ\u00f1\u00d1\s]*)$/);
    
    if (mentionMatch) {
      const startPos = beforeCursor.lastIndexOf('@');
      const beforeMention = text.slice(0, startPos);
      const afterMention = text.slice(cursorPosition);
      const mentionText = `@${selectedUser.nome}`;
      const newText = beforeMention + mentionText + ' ' + afterMention;
      
      // Criar menção
      const newMention: Mention = {
        userId: selectedUser.id,
        display: selectedUser.nome,
        start: startPos,
        end: startPos + mentionText.length
      };
      
      setText(newText);
      setMentions(prev => [...prev, newMention]);
      setShowAutocomplete(false);
      
      // Focar no textarea e posicionar cursor após a menção
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = startPos + mentionText.length + 1; // +1 para incluir o espaço
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          setCursorPosition(newCursorPos);
        }
      }, 0);
    }
  };

  // Fechar autocomplete
  const handleCloseAutocomplete = () => {
    setShowAutocomplete(false);
  };

  // Salvar comentário
  const handleSaveComment = async () => {
    if (!text.trim()) return;

    try {
      // Simular chamada para API
      const commentData = {
        text: text.trim(),
        mentions: mentions,
        processoId,
        etapaId,
        cardId
      };

      console.log('Salvando comentário:', commentData);

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Criar comentário
      const newComment: Comment = {
        id: Date.now().toString(),
        autorId: user?.id || '1',
        autorNome: user?.nome || 'Usuário',
        criadoEm: new Date().toISOString(),
        texto: text.trim(),
        mentions: mentions
      };

      // Limpar formulário
      setText('');
      setMentions([]);
      setShowAutocomplete(false);

      // Notificar componente pai
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }

      // Criar notificações para usuários mencionados
      await createMentionNotifications(mentions, newComment);

      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi salvo com sucesso.",
        variant: "default"
      });

    } catch (error) {
      console.error('Erro ao salvar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o comentário. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Criar notificações para menções
  const createMentionNotifications = async (mentions: Mention[], comment: Comment) => {
    const uniqueUserIds = [...new Set(mentions.map(m => m.userId))];
    
    for (const userId of uniqueUserIds) {
      try {
        // Simular criação de notificação
        const notificationData = {
          userId,
          type: 'mention',
          title: 'Você foi mencionado',
          description: `${comment.autorNome} mencionou você em um comentário`,
          link: `/processo/${processoId}${etapaId ? `#etapa-${etapaId}` : ''}${cardId ? `#card-${cardId}` : ''}`,
          isRead: false,
          timestamp: new Date().toISOString()
        };

        console.log('Criando notificação:', notificationData);
        
        // Em produção, aqui seria feita a chamada para a API
        // await fetch('/api/notificacoes', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(notificationData)
        // });

      } catch (error) {
        console.error('Erro ao criar notificação:', error);
      }
    }
  };

  // Manipular teclas especiais
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveComment();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Campo de texto */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite seu comentário aqui... Use @ para mencionar usuários"
          className="min-h-[120px] resize-none pr-10"
          maxLength={1000}
        />
        
        {/* Contador de caracteres */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {text.length}/1000
        </div>
      </div>

      {/* Autocomplete de menções */}
      {showAutocomplete && (
        <MentionAutocomplete
          query={autocompleteQuery}
          onSelect={handleUserSelect}
          onClose={handleCloseAutocomplete}
          isVisible={showAutocomplete}
          position={autocompletePosition}
        />
      )}

      {/* Preview das menções */}
      {mentions.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
          <div className="text-xs text-gray-600 font-medium">Menções:</div>
          {mentions.map((mention, index) => {
            const user = mockUsersWithAccess.find(u => u.id === mention.userId);
            return (
              <Badge
                key={index}
                variant="secondary"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs"
              >
                <AtSign className="w-3 h-3" />
                <Avatar className="w-3 h-3">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {user ? getUserInitials(user.nome) : '??'}
                  </AvatarFallback>
                </Avatar>
                <span>{user?.nome || mention.display}</span>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Botão de salvar */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Use @ para mencionar usuários • Ctrl+Enter para salvar
        </div>
        <Button
          onClick={handleSaveComment}
          disabled={!text.trim()}
          className="flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Adicionar Comentário
        </Button>
      </div>
    </div>
  );
}
