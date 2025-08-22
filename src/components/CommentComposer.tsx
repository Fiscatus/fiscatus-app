import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageSquareText, Send, Loader2, AtSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface CommentComposerProps {
  onSubmit: (message: string, mentions: Mention[]) => void;
  isSubmitting?: boolean;
  users?: User[];
}

// Mock de usuários para demonstração
const mockUsers: User[] = [
  {
    id: '1',
    nome: 'Lucas Moreira Brito',
    cargo: 'Gerente de Recursos Humanos',
    gerencia: 'GRH - Gerência de Recursos Humanos',
    email: 'lucas.brito@hospital.gov.br'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    cargo: 'Gerente de Projetos',
    gerencia: 'GSP - Gerência de Soluções e Projetos',
    email: 'maria.santos@hospital.gov.br'
  },
  {
    id: '3',
    nome: 'Pedro Lima',
    cargo: 'Coordenador',
    gerencia: 'GLC - Gerência de Licitações e Contratos',
    email: 'pedro.lima@hospital.gov.br'
  }
];

export default function CommentComposer({
  onSubmit,
  isSubmitting = false,
  users = mockUsers
}: CommentComposerProps) {
  const [text, setText] = useState('');
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Filtrar usuários para menções
  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.cargo.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Detectar menção @ no texto
  const detectMention = useCallback((text: string, cursorPos: number) => {
    const beforeCursor = text.slice(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setShowMentions(true);
      setSelectedMentionIndex(0);
      
      // Calcular posição do popover
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        const lineHeight = 20; // altura aproximada da linha
        const lines = beforeCursor.split('\n').length;
        setMentionPosition({
          top: rect.top + (lines * lineHeight) + 20,
          left: rect.left + (mentionMatch[0].length * 8) // largura aproximada do caractere
        });
      }
    } else {
      setShowMentions(false);
    }
  }, []);

  // Atualizar posição do cursor
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setText(newText);
    setCursorPosition(cursorPos);
    detectMention(newText, cursorPos);
  };

  // Inserir menção
  const insertMention = (user: User) => {
    const beforeMention = text.slice(0, cursorPosition - mentionQuery.length - 1);
    const afterMention = text.slice(cursorPosition);
    const newText = `${beforeMention}@${user.nome} ${afterMention}`;
    
    setText(newText);
    setShowMentions(false);
    
    // Adicionar à lista de menções
    const newMention: Mention = {
      userId: user.id,
      display: user.nome,
      start: beforeMention.length,
      end: beforeMention.length + user.nome.length + 1
    };
    
    setMentions(prev => [...prev, newMention]);
    
    // Focar no textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Navegação por teclado nas menções
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev < filteredUsers.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev > 0 ? prev - 1 : filteredUsers.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredUsers[selectedMentionIndex]) {
            insertMention(filteredUsers[selectedMentionIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowMentions(false);
          break;
      }
    }
    
    // Atalho Ctrl/Cmd + Enter para enviar
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Enviar comentário
  const handleSubmit = () => {
    if (!text.trim()) {
      toast({
        title: "Comentário vazio",
        description: "Digite um comentário antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    onSubmit(text, mentions);
    setText('');
    setMentions([]);
    setShowMentions(false);
  };

  return (
    <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
      {/* Cabeçalho dentro do balão */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100">
          <MessageSquareText className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-indigo-900">Adicionar Novo Comentário</h3>
      </div>

      {/* Textarea com design moderno */}
      <div className="relative mb-4">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Escreva um comentário… use @ para mencionar usuários"
          className="min-h-[80px] max-h-[200px] resize-none border-slate-300 rounded-xl p-4 text-sm leading-relaxed shadow-inner bg-slate-50/30 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
          style={{ minHeight: '80px', maxHeight: '200px' }}
        />
        
        {/* Popover de menções com design melhorado */}
        {showMentions && (
          <Popover open={showMentions} onOpenChange={setShowMentions}>
            <PopoverContent 
              className="w-80 p-0 shadow-xl border-slate-200" 
              style={{ 
                position: 'absolute',
                top: mentionPosition.top,
                left: mentionPosition.left
              }}
            >
              <div className="max-h-48 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500 text-center">
                    <AtSign className="w-4 h-4 mx-auto mb-2 text-slate-400" />
                    Nenhum usuário encontrado
                  </div>
                ) : (
                  filteredUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className={`p-3 cursor-pointer transition-all duration-150 ${
                        index === selectedMentionIndex 
                          ? 'bg-indigo-50 border-l-2 border-indigo-500' 
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => insertMention(user)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 ring-2 ring-slate-200">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-semibold">
                            {getUserInitials(user.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-slate-900 truncate">
                            {user.nome}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {user.cargo}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Ações com design moderno */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 px-6 py-2.5 font-medium shadow-sm transition-all duration-200 hover:shadow-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Adicionar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
