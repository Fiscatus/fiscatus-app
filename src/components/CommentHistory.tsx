import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, ArrowUpDown, Clock, MessageSquareText } from 'lucide-react';

interface CommentItem {
  id: string;
  initials: string;
  name: string;
  role?: string;
  message: string;
  datetime: string;
}

interface CommentHistoryProps {
  items: CommentItem[];
  onSortChange?: (sortOrder: 'newest' | 'oldest') => void;
}

export default function CommentHistory({
  items,
  onSortChange
}: CommentHistoryProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Obter iniciais do nome
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Gerar cor do avatar baseada no nome
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-cyan-600',
      'bg-gradient-to-br from-purple-500 to-pink-600',
      'bg-gradient-to-br from-green-500 to-emerald-600',
      'bg-gradient-to-br from-orange-500 to-red-600',
      'bg-gradient-to-br from-indigo-500 to-purple-600',
      'bg-gradient-to-br from-teal-500 to-cyan-600',
      'bg-gradient-to-br from-rose-500 to-pink-600',
      'bg-gradient-to-br from-amber-500 to-orange-600'
    ];
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ordenar comentários
  const sortedItems = [...items].sort((a, b) => {
    const dateA = new Date(a.datetime).getTime();
    const dateB = new Date(b.datetime).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Alterar ordenação
  const handleSortChange = (value: string) => {
    const newSortOrder = value as 'newest' | 'oldest';
    setSortOrder(newSortOrder);
    onSortChange?.(newSortOrder);
  };

  return (
    <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
      {/* Cabeçalho dentro do balão */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
            <History className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Histórico de Comentários
            <span className="ml-2 text-sm font-normal text-slate-500">({items.length})</span>
          </h3>
        </div>
        
        {/* Seletor de ordenação elegante */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger className="w-44 h-9 text-sm border-slate-300 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de comentários com design moderno */}
      <div className="space-y-0">
        {sortedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100">
                <MessageSquareText className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-sm text-slate-500">
                Nenhum comentário encontrado
              </div>
            </div>
          </div>
        ) : (
          sortedItems.map((item, index) => (
            <div
              key={item.id}
              className={`group py-4 transition-all duration-200 hover:bg-slate-50 rounded-lg px-3 -mx-3 ${
                index < sortedItems.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              {/* Layout responsivo */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Avatar com cores automáticas */}
                <div className="flex-shrink-0 self-start">
                  <Avatar className="w-10 h-10 ring-2 ring-white shadow-sm">
                    <AvatarImage src="" />
                    <AvatarFallback className={`${getAvatarColor(item.name)} text-white text-sm font-semibold`}>
                      {item.initials || getInitials(item.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Conteúdo principal */}
                <div className="flex-1 min-w-0">
                  {/* Header do comentário */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {item.name}
                      </span>
                      {item.role && (
                        <>
                          <span className="text-slate-300 hidden sm:inline">•</span>
                          <span className="text-xs text-slate-500 truncate">
                            {item.role}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(item.datetime)}</span>
                    </div>
                  </div>

                  {/* Mensagem do comentário */}
                  <div className="text-sm text-slate-700 leading-relaxed">
                    {item.message}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
