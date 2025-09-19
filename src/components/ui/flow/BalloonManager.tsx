import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  GripVertical, 
  Edit2, 
  X, 
  MoreHorizontal,
  Check,
  Palette,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BalloonArea, BalloonItem } from '@/types/flow';
import { useFlowStore } from '@/stores/flowStore';

// Cores disponíveis para os balões
const BALLOON_COLORS = [
  { name: 'slate', label: 'Cinza', class: 'border-slate-200 bg-slate-50 text-slate-700' },
  { name: 'indigo', label: 'Azul', class: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
  { name: 'emerald', label: 'Verde', class: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { name: 'amber', label: 'Âmbar', class: 'border-amber-200 bg-amber-50 text-amber-700' },
  { name: 'rose', label: 'Rosa', class: 'border-rose-200 bg-rose-50 text-rose-700' },
  { name: 'purple', label: 'Roxo', class: 'border-purple-200 bg-purple-50 text-purple-700' },
];

// Ícones disponíveis (lucide icons)
const BALLOON_ICONS = [
  'FileText', 'CheckCircle', 'AlertCircle', 'Clock', 'User', 'Mail',
  'Phone', 'Calendar', 'MapPin', 'Tag', 'Star', 'Heart',
  'Bookmark', 'Flag', 'Target', 'Zap', 'Shield', 'Lock'
];

type BalloonManagerProps = {
  stageId: string;
  area: BalloonArea;
  items: BalloonItem[];
  title?: string;
  placeholderAdd?: string;
  allowIcon?: boolean;
  allowColor?: boolean;
  allowReorder?: boolean;
  onItemsChange?: (items: BalloonItem[]) => void;
};

export default function BalloonManager({
  stageId,
  area,
  items,
  title,
  placeholderAdd = "Adicionar item...",
  allowIcon = true,
  allowColor = true,
  allowReorder = true,
  onItemsChange
}: BalloonManagerProps) {
  const { addBalloon, renameBalloon, removeBalloon, reorderBalloons, setBalloonIcon, setBalloonColor } = useFlowStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemIcon, setNewItemIcon] = useState<string>('');
  const [newItemColor, setNewItemColor] = useState<string>('slate');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focar no input quando abrir
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleAdd = () => {
    if (!newItemLabel.trim()) {
      setValidationError('Nome é obrigatório');
      return;
    }
    
    const trimmedLabel = newItemLabel.trim();
    
    // Validações
    if (trimmedLabel.length < 1) {
      setValidationError('Nome muito curto');
      return;
    }
    
    if (trimmedLabel.length > 32) {
      setValidationError('Nome muito longo (máximo 32 caracteres)');
      return;
    }
    
    // Verificar se já existe um item com o mesmo nome (case-insensitive)
    const exists = items.some(item => 
      item.label.toLowerCase() === trimmedLabel.toLowerCase()
    );
    
    if (exists) {
      setValidationError('Já existe um balão com este nome');
      return;
    }

    addBalloon(stageId, area, {
      label: trimmedLabel,
      icon: newItemIcon || undefined,
      color: newItemColor,
    });

    setNewItemLabel('');
    setNewItemIcon('');
    setNewItemColor('slate');
    setValidationError('');
    setIsAdding(false);
  };

  const handleRename = (itemId: string, newLabel: string) => {
    if (!newLabel.trim()) return;
    
    const trimmedLabel = newLabel.trim();
    
    // Validações
    if (trimmedLabel.length < 1) {
      return;
    }
    
    if (trimmedLabel.length > 32) {
      return;
    }
    
    // Verificar se já existe outro item com o mesmo nome
    const exists = items.some(item => 
      item.id !== itemId && item.label.toLowerCase() === trimmedLabel.toLowerCase()
    );
    
    if (exists) return;

    renameBalloon(stageId, area, itemId, trimmedLabel);
    setEditingId(null);
  };

  const handleRemove = (itemId: string) => {
    removeBalloon(stageId, area, itemId);
  };

  const handleIconChange = (itemId: string, icon: string) => {
    setBalloonIcon(stageId, area, itemId, icon || undefined);
  };

  const handleColorChange = (itemId: string, color: string) => {
    setBalloonColor(stageId, area, itemId, color);
  };

  const handleDuplicate = (item: BalloonItem) => {
    addBalloon(stageId, area, {
      ...item,
      label: `${item.label} (cópia)`,
    });
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedId(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = items.findIndex(item => item.id === draggedId);
    const targetIndex = items.findIndex(item => item.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    
    const newOrderIds = newItems.map(item => item.id);
    reorderBalloons(stageId, area, newOrderIds);
    
    setDraggedId(null);
  };

  const getColorClass = (color?: string) => {
    const colorConfig = BALLOON_COLORS.find(c => c.name === color) || BALLOON_COLORS[0];
    return colorConfig.class;
  };

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    
    // Importar ícone dinamicamente (simplificado)
    const iconMap: Record<string, React.ComponentType<any>> = {
      FileText: () => <span className="text-xs">📄</span>,
      CheckCircle: () => <span className="text-xs">✅</span>,
      AlertCircle: () => <span className="text-xs">⚠️</span>,
      Clock: () => <span className="text-xs">🕐</span>,
      User: () => <span className="text-xs">👤</span>,
      Mail: () => <span className="text-xs">📧</span>,
      Phone: () => <span className="text-xs">📞</span>,
      Calendar: () => <span className="text-xs">📅</span>,
      MapPin: () => <span className="text-xs">📍</span>,
      Tag: () => <span className="text-xs">🏷️</span>,
      Star: () => <span className="text-xs">⭐</span>,
      Heart: () => <span className="text-xs">❤️</span>,
      Bookmark: () => <span className="text-xs">🔖</span>,
      Flag: () => <span className="text-xs">🚩</span>,
      Target: () => <span className="text-xs">🎯</span>,
      Zap: () => <span className="text-xs">⚡</span>,
      Shield: () => <span className="text-xs">🛡️</span>,
      Lock: () => <span className="text-xs">🔒</span>,
    };
    
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {title && (
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-900">{title}</h4>
            <span className="text-xs text-slate-500">{items.length} itens</span>
          </div>
        )}

        {/* Lista de balões */}
        <div className="flex flex-wrap gap-2" role="list">
          {items.map((item) => (
            <div
              key={item.id}
              role="listitem"
              draggable={allowReorder}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}
              className={`
                inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs
                hover:bg-opacity-80 transition-all cursor-move
                ${getColorClass(item.color)}
                ${draggedId === item.id ? 'opacity-50' : ''}
              `}
            >
              {/* Drag handle */}
              {allowReorder && (
                <GripVertical className="w-3 h-3 opacity-50" />
              )}

              {/* Ícone */}
              {item.icon && allowIcon && (
                <span className="flex-shrink-0">
                  {getIconComponent(item.icon)}
                </span>
              )}

              {/* Label */}
              {editingId === item.id ? (
                <Input
                  ref={editInputRef}
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRename(item.id, newItemLabel);
                    } else if (e.key === 'Escape') {
                      setEditingId(null);
                      setNewItemLabel('');
                    }
                  }}
                  onBlur={() => {
                    handleRename(item.id, newItemLabel);
                  }}
                  className="h-5 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                  placeholder="Nome do item"
                />
              ) : (
                <span 
                  className="flex-1 cursor-pointer"
                  onDoubleClick={() => {
                    setEditingId(item.id);
                    setNewItemLabel(item.label);
                  }}
                >
                  {item.label}
                </span>
              )}

              {/* Ações */}
              {editingId !== item.id && (
                <div className="flex items-center gap-1">
                  {/* Botão de editar */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-slate-200"
                        onClick={() => {
                          setEditingId(item.id);
                          setNewItemLabel(item.label);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Renomear</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Menu de opções */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-slate-200"
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {allowIcon && (
                        <DropdownMenuItem onClick={() => {
                          // Abrir seletor de ícone
                          const currentIndex = BALLOON_ICONS.indexOf(item.icon || '');
                          const nextIndex = (currentIndex + 1) % BALLOON_ICONS.length;
                          handleIconChange(item.id, BALLOON_ICONS[nextIndex]);
                        }}>
                          <Palette className="w-4 h-4 mr-2" />
                          Mudar ícone
                        </DropdownMenuItem>
                      )}
                      {allowColor && (
                        <DropdownMenuItem onClick={() => {
                          // Ciclar entre cores
                          const currentIndex = BALLOON_COLORS.findIndex(c => c.name === item.color);
                          const nextIndex = (currentIndex + 1) % BALLOON_COLORS.length;
                          handleColorChange(item.id, BALLOON_COLORS[nextIndex].name);
                        }}>
                          <Palette className="w-4 h-4 mr-2" />
                          Mudar cor
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDuplicate(item)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <X className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir item</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir "{item.label}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemove(item.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botão de adicionar */}
        {!isAdding ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar
          </Button>
        ) : (
          <Popover 
            open={isAdding} 
            onOpenChange={(open) => {
              setIsAdding(open);
              if (!open) {
                setValidationError('');
                setNewItemLabel('');
                setNewItemIcon('');
                setNewItemColor('slate');
              }
            }}
          >
            <PopoverTrigger asChild>
              <div />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Nome do item
                  </label>
                  <Input
                    ref={inputRef}
                    value={newItemLabel}
                    onChange={(e) => {
                      setNewItemLabel(e.target.value);
                      setValidationError(''); // Limpar erro ao digitar
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAdd();
                      } else if (e.key === 'Escape') {
                        setIsAdding(false);
                        setNewItemLabel('');
                        setValidationError('');
                      }
                    }}
                    placeholder={placeholderAdd}
                    className={`text-sm ${validationError ? 'border-red-500' : ''}`}
                  />
                  {validationError && (
                    <p className="text-xs text-red-500 mt-1">{validationError}</p>
                  )}
                </div>

                {allowIcon && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Ícone (opcional)
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {BALLOON_ICONS.map((iconName) => (
                        <Button
                          key={iconName}
                          variant={newItemIcon === iconName ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setNewItemIcon(newItemIcon === iconName ? '' : iconName)}
                        >
                          {getIconComponent(iconName)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {allowColor && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Cor
                    </label>
                    <div className="flex gap-2">
                      {BALLOON_COLORS.map((color) => (
                        <Button
                          key={color.name}
                          variant={newItemColor === color.name ? "default" : "outline"}
                          size="sm"
                          className={`h-6 px-2 text-xs ${color.class}`}
                          onClick={() => setNewItemColor(color.name)}
                        >
                          {color.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false);
                      setNewItemLabel('');
                      setNewItemIcon('');
                      setNewItemColor('slate');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAdd}
                    disabled={!newItemLabel.trim()}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </TooltipProvider>
  );
}
