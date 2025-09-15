import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  MessageSquarePlus,
  AtSign,
  Paperclip,
  Smile,
  Reply,
  Copy,
  Trash2,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  isCurrentUser?: boolean;
  isOptimistic?: boolean;
  attachments?: AttachmentItem[];
}

interface AttachmentItem {
  id: string;
  name: string;
  url: string;
  size?: number;
}

interface GroupedComments {
  date: string;
  comments: CommentItem[];
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
    initials: 'LM',
    name: 'Lucas Moreira Brito',
    role: 'Gerente de Recursos Humanos',
    message: 'DFD enviado para análise técnica da GSP.',
    datetime: '2025-01-15T07:00:00Z',
    isCurrentUser: false
  },
  {
    id: '2',
    initials: 'MS',
    name: 'Maria Santos',
    role: 'Gerente de Projetos',
    message: 'Revisão concluída. Documento aprovado para próxima etapa. @Lucas Moreira Brito, pode prosseguir com a próxima fase.',
    datetime: '2025-01-15T10:30:00Z',
    isCurrentUser: false
  },
  {
    id: '3',
    initials: 'PL',
    name: 'Pedro Lima',
    role: 'Coordenador',
    message: 'Solicitando esclarecimentos sobre os requisitos técnicos. Anexei o documento de referência.',
    datetime: '2025-01-14T14:15:00Z',
    isCurrentUser: false,
    attachments: [
      {
        id: 'att1',
        name: 'requisitos-tecnicos.pdf',
        url: '#'
      }
    ]
  },
  {
    id: '4',
    initials: 'VC',
    name: 'Você',
    role: 'Analista',
    message: 'Entendido, vou revisar o documento e dar continuidade ao processo.',
    datetime: '2025-01-15T16:45:00Z',
    isCurrentUser: true
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
  const [text, setText] = useState('');
  const historyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-scroll para o topo quando há novos comentários (mais recentes primeiro)
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = 0;
    }
  }, [comments]);

  // Obter iniciais do nome
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Gerar cor estável para avatar baseada no nome
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-rose-500',
      'bg-amber-500'
    ];
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Formatar data para separadores
  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatar hora
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Agrupar comentários por data (mais recentes primeiro)
  const groupCommentsByDate = (comments: CommentItem[]): GroupedComments[] => {
    const groups: { [key: string]: CommentItem[] } = {};
    
    // Ordenar comentários por data (mais recentes primeiro)
    comments
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
      .forEach(comment => {
        const dateKey = formatDateSeparator(comment.datetime);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(comment);
      });

    // Retornar grupos ordenados por data (mais recentes primeiro)
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => {
        const [dayA, monthA, yearA] = dateA.split('/').map(Number);
        const [dayB, monthB, yearB] = dateB.split('/').map(Number);
        const dateObjA = new Date(yearA, monthA - 1, dayA);
        const dateObjB = new Date(yearB, monthB - 1, dayB);
        return dateObjB.getTime() - dateObjA.getTime();
      })
      .map(([date, comments]) => ({
        date,
        comments
      }));
  };

  // Processar menções no texto
  const processMessage = (message: string) => {
    return message.replace(/@([A-Za-z\s]+)/g, '<span class="text-indigo-600 font-medium">@$1</span>');
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  // Enviar comentário
  const handleSubmit = async () => {
    if (!text.trim()) {
      toast({
        title: "Comentário vazio",
        description: "Digite um comentário antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    const optimisticComment: CommentItem = {
      id: `temp-${Date.now()}`,
      initials: 'VC',
      name: 'Você',
      role: 'Analista',
      message: text,
      datetime: new Date().toISOString(),
      isCurrentUser: true,
      isOptimistic: true
    };

    // Adicionar comentário otimista
    setComments(prev => [...prev, optimisticComment]);
    setText('');
    setIsSubmitting(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Substituir comentário otimista pelo definitivo
      const finalComment: CommentItem = {
        ...optimisticComment,
        id: Date.now().toString(),
        isOptimistic: false
      };
      
      setComments(prev => prev.map(c => 
        c.id === optimisticComment.id ? finalComment : c
      ));
      
      toast({
        title: "Comentário enviado",
        description: "Seu comentário foi adicionado com sucesso.",
      });
      
    } catch (error) {
      // Remover comentário otimista em caso de erro
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      setText(optimisticComment.message); // Restaurar texto
      
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o comentário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ações dos comentários
  const handleReply = (comment: CommentItem) => {
    setText(`@${comment.name} `);
    textareaRef.current?.focus();
  };

  const handleCopy = (comment: CommentItem) => {
    navigator.clipboard.writeText(comment.message);
    toast({
      title: "Copiado",
      description: "Texto do comentário copiado para a área de transferência.",
    });
  };

  const handleDelete = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    toast({
      title: "Comentário excluído",
      description: "O comentário foi removido com sucesso.",
    });
  };

  // Inserir menção
  const handleInsertMention = () => {
    setText(prev => prev + '@');
    textareaRef.current?.focus();
  };

  const groupedComments = groupCommentsByDate(comments);

  return (
    <div className={`${className}`}>
      {/* Subcard padrão */}
      <div className="rounded-xl border border-slate-200 shadow-sm bg-white p-4 md:p-6">
        {/* Header com ícone + título e contador */}
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Comentários</h3>
          <Badge variant="secondary" className="ml-auto">
            {comments.filter(c => !c.isOptimistic).length}
          </Badge>
        </div>

        {/* Linha divisória */}
        <div className="border-b border-slate-200 mt-2 mb-4"></div>

        {/* Histórico (lista de mensagens) */}
        <div 
          ref={historyRef}
          className="max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 mb-6"
          aria-live="polite"
        >
          {groupedComments.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100">
                  <MessageSquare className="w-6 h-6 text-slate-400" />
                </div>
                <div className="text-sm text-slate-500">
                  Ainda não há comentários neste card
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedComments.map((group, groupIndex) => (
                <div key={group.date}>
                  {/* Separador por data */}
                  <div className="text-center my-3">
                    <span className="text-xs text-slate-500 bg-white px-3">
                      — {group.date} —
                    </span>
                  </div>

                  {/* Comentários do dia */}
                  <div className="space-y-4">
                    {group.comments.map((comment) => (
                      <div key={comment.id} className="group grid grid-cols-[40px_1fr] gap-3">
                        {/* Avatar (coluna 1) */}
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(comment.name)} ${comment.isOptimistic ? 'opacity-50' : ''}`}>
                            {comment.initials}
                          </div>
                        </div>

                        {/* Conteúdo (coluna 2) */}
                        <div className="min-w-0 relative">
                          {/* Cabeçalho */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-slate-900 text-sm truncate">
                                {comment.name}
                              </span>
                              {comment.role && (
                                <>
                                  <span className="text-slate-300 hidden sm:inline">•</span>
                                  <span className="text-xs text-slate-500 truncate">
                                    {comment.role}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span>{formatTime(comment.datetime)}</span>
                            </div>
                          </div>

                          {/* Balão do texto */}
                          <div className={`p-3 rounded-lg mt-1 relative ${
                            comment.isCurrentUser 
                              ? 'bg-indigo-50 border border-indigo-200' 
                              : 'bg-slate-50 border border-slate-200'
                          } ${comment.isOptimistic ? 'opacity-70' : ''}`}>
                            {/* Ações no hover */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <TooltipProvider>
                                <div className="flex items-center gap-0.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-md p-0.5 shadow-sm">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => handleReply(comment)}
                                        className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                        aria-label="Responder"
                                      >
                                        <Reply className="w-3.5 h-3.5" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Responder</TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => handleCopy(comment)}
                                        className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                        aria-label="Copiar"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copiar</TooltipContent>
                                  </Tooltip>

                                  {comment.isCurrentUser && !comment.isOptimistic && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => handleDelete(comment.id)}
                                          className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
                                          aria-label="Excluir"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>Excluir</TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </TooltipProvider>
                            </div>

                            {/* Texto com menções destacadas */}
                            <div 
                              className="text-sm text-slate-700 leading-relaxed break-words pr-8"
                              dangerouslySetInnerHTML={{ __html: processMessage(comment.message) }}
                            />

                            {/* Status de envio */}
                            {comment.isOptimistic && (
                              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                                <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
                                <span>Enviando...</span>
                              </div>
                            )}

                            {/* Anexos pequenos */}
                            {comment.attachments && comment.attachments.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                                {comment.attachments.map((attachment) => (
                                  <div key={attachment.id} className="flex items-center gap-2 text-xs">
                                    <Paperclip className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                    <a 
                                      href={attachment.url} 
                                      className="text-indigo-600 hover:text-indigo-700 underline truncate"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {attachment.name}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campo "Adicionar Comentário" */}
        <div className="border-t border-slate-200 pt-4">
          {/* Header secundário */}
          <div className="flex items-center gap-2 mb-3">
            <MessageSquarePlus className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-semibold text-slate-900">Adicionar Comentário</h4>
          </div>

          {/* Toolbar simples */}
          <div className="flex items-center gap-1 text-slate-600 mb-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleInsertMention}
                    className="p-2 hover:bg-slate-100 rounded-md transition-colors flex items-center justify-center"
                    aria-label="Inserir menção"
                  >
                    <AtSign className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Inserir menção @</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-2 hover:bg-slate-100 rounded-md opacity-50 cursor-not-allowed transition-colors flex items-center justify-center"
                    aria-label="Anexar arquivo"
                    disabled
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Anexar arquivo (em breve)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-2 hover:bg-slate-100 rounded-md opacity-50 cursor-not-allowed transition-colors flex items-center justify-center"
                    aria-label="Emoji"
                    disabled
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Emoji (em breve)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Textarea expandível */}
          <div className="relative mb-3">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextareaChange}
              placeholder="Escreva um comentário… use @ para mencionar usuários"
              className="w-full min-h-[44px] max-h-[200px] resize-y border border-slate-300 rounded-lg p-3 text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          {/* Rodapé do composer */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Ctrl/Cmd + Enter para enviar
            </div>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 font-medium shadow-sm transition-all duration-200 hover:shadow-md flex items-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Adicionar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
