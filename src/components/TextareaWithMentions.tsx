import React, { useState, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { AtSign } from 'lucide-react';
import MentionAutocomplete from './MentionAutocomplete';

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

interface TextareaWithMentionsProps {
  value: string;
  onChange: (value: string, mentions?: Mention[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  minHeight?: string;
  processoId?: string;
  etapaId?: string;
  cardId?: string;
}

export default function TextareaWithMentions({
  value,
  onChange,
  placeholder = "Digite seu texto... Use @ para mencionar usuários",
  className = "",
  disabled = false,
  maxLength,
  minHeight = "120px",
  processoId,
  etapaId,
  cardId
}: TextareaWithMentionsProps) {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUser();

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
    
    // Verificar se há @ antes do cursor
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      // Verificar se não há espaço entre @ e o cursor
      const afterAt = beforeCursor.slice(atIndex + 1);
      
      if (afterAt.includes(' ')) {
        // Se há espaço, não é uma menção válida
        setShowAutocomplete(false);
        return null;
      }
      
      const query = afterAt.trim();
      const startPos = atIndex;
      
      // Calcular posição do autocomplete
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const textareaRect = textarea.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        const newPosition = {
          top: textareaRect.bottom + scrollTop + 5,
          left: textareaRect.left + scrollLeft
        };
        
        setAutocompletePosition(newPosition);
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
    
    setCursorPosition(newCursorPos);
    
    // Detectar menção
    const mentionResult = detectMention(newText, newCursorPos);
    
    // Chamar onChange do componente pai
    onChange(newText, mentions);
  };

  // Selecionar usuário do autocomplete
  const handleUserSelect = (selectedUser: User) => {
    const beforeCursor = value.slice(0, cursorPosition);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const beforeMention = value.slice(0, atIndex);
      const afterMention = value.slice(cursorPosition);
      // Usar apenas o primeiro nome para ficar mais limpo
      const firstName = selectedUser.nome.split(' ')[0];
      const mentionText = `@${firstName}`;
      const newText = beforeMention + mentionText + ' ' + afterMention;
      
      // Criar menção
      const newMention: Mention = {
        userId: selectedUser.id,
        display: selectedUser.nome, // Guardar nome completo para referência
        start: atIndex,
        end: atIndex + mentionText.length
      };
      
      const newMentions = [...mentions, newMention];
      setMentions(newMentions);
      setShowAutocomplete(false);
      
      // Chamar onChange do componente pai
      onChange(newText, newMentions);
      
      // Focar no textarea e posicionar cursor após a menção
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = atIndex + mentionText.length + 1; // +1 para incluir o espaço
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

  // Manipular teclas especiais
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Não interferir se o autocomplete estiver aberto
    if (showAutocomplete) {
      return;
    }
  };

  return (
    <div className="relative">
      {/* Campo de texto */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`resize-none ${className}`}
        style={{ minHeight }}
        maxLength={maxLength}
        disabled={disabled}
      />
      
      {/* Contador de caracteres */}
      {maxLength && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {value.length}/{maxLength}
        </div>
      )}

      {/* Autocomplete de menções */}
      {showAutocomplete && !disabled && (
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
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <AtSign className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Usuários mencionados ({mentions.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {mentions.map((mention, index) => (
              <Badge
                key={index}
                variant="outline"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Avatar className="w-4 h-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                    {getUserInitials(mention.display)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{mention.display}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
