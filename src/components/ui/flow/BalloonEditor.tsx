import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  GripVertical,
  Edit2,
  Trash2,
  Plus,
  Palette,
  Save,
  X,
  Check,
  AlertCircle,
  FileText,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Tag,
  Star,
  Heart,
  Bookmark,
  Flag,
  Target,
  Zap,
  Shield,
  Lock,
  Send,
} from 'lucide-react';
import { BalloonArea, BalloonItem } from '@/types/flow';
import { useFlowStore } from '@/stores/flowStore';

// Cores disponíveis
const BALLOON_COLORS = [
  { name: 'slate', label: 'Cinza', class: 'border-slate-200 bg-slate-50 text-slate-700' },
  { name: 'indigo', label: 'Azul', class: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
  { name: 'emerald', label: 'Verde', class: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { name: 'amber', label: 'Âmbar', class: 'border-amber-200 bg-amber-50 text-amber-700' },
  { name: 'rose', label: 'Rosa', class: 'border-rose-200 bg-rose-50 text-rose-700' },
  { name: 'purple', label: 'Roxo', class: 'border-purple-200 bg-purple-50 text-purple-700' },
];

// Ícones disponíveis
const BALLOON_ICONS = [
  { name: 'FileText', icon: FileText, emoji: '📄' },
  { name: 'CheckCircle', icon: CheckCircle, emoji: '✅' },
  { name: 'AlertCircle', icon: AlertCircle, emoji: '⚠️' },
  { name: 'Clock', icon: Clock, emoji: '🕐' },
  { name: 'User', icon: User, emoji: '👤' },
  { name: 'Mail', icon: Mail, emoji: '📧' },
  { name: 'Phone', icon: Phone, emoji: '📞' },
  { name: 'Calendar', icon: Calendar, emoji: '📅' },
  { name: 'MapPin', icon: MapPin, emoji: '📍' },
  { name: 'Tag', icon: Tag, emoji: '🏷️' },
  { name: 'Star', icon: Star, emoji: '⭐' },
  { name: 'Heart', icon: Heart, emoji: '❤️' },
  { name: 'Bookmark', icon: Bookmark, emoji: '🔖' },
  { name: 'Flag', icon: Flag, emoji: '🚩' },
  { name: 'Target', icon: Target, emoji: '🎯' },
  { name: 'Zap', icon: Zap, emoji: '⚡' },
  { name: 'Shield', icon: Shield, emoji: '🛡️' },
  { name: 'Lock', icon: Lock, emoji: '🔒' },
  { name: 'Send', icon: Send, emoji: '📤' },
];

// Tipos de ação para stage_actions
const ACTION_TYPES = [
  { value: 'send', label: 'Enviar' },
  { value: 'finish', label: 'Concluir' },
  { value: 'generate_doc', label: 'Gerar documento' },
  { value: 'custom', label: 'Personalizado' },
];

type BalloonEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageId: string;
  area: BalloonArea;
  title: string;
  description?: string;
  items: BalloonItem[];
  allowIcon?: boolean;
  allowColor?: boolean;
};

interface SortableBalloonItemProps {
  item: BalloonItem;
  onRename: (id: string, newLabel: string) => void;
  onRemove: (id: string) => void;
  onIconChange: (id: string, icon: string) => void;
  onColorChange: (id: string, color: string) => void;
  allowIcon: boolean;
  allowColor: boolean;
  isEditing: boolean;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
}

const SortableBalloonItem: React.FC<SortableBalloonItemProps> = ({
  item,
  onRename,
  onRemove,
  onIconChange,
  onColorChange,
  allowIcon,
  allowColor,
  isEditing,
  onStartEdit,
  onCancelEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const [editLabel, setEditLabel] = useState(item.label);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRename = () => {
    const trimmedLabel = editLabel.trim();
    
    if (trimmedLabel.length < 1) {
      setValidationError('Nome muito curto');
      return;
    }
    
    if (trimmedLabel.length > 32) {
      setValidationError('Nome muito longo (máximo 32 caracteres)');
      return;
    }

    onRename(item.id, trimmedLabel);
    onCancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditLabel(item.label);
      setValidationError('');
      onCancelEdit();
    }
  };

  const getColorClass = (color?: string) => {
    const colorConfig = BALLOON_COLORS.find(c => c.name === color) || BALLOON_COLORS[0];
    return colorConfig.class;
  };

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    const iconConfig = BALLOON_ICONS.find(i => i.name === iconName);
    return iconConfig ? <span className="text-xs">{iconConfig.emoji}</span> : null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${
        isDragging ? 'opacity-50 shadow-lg' : 'hover:bg-slate-50'
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="p-1 hover:bg-slate-200 rounded cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-slate-400" />
      </div>

      {/* Preview do chip */}
      <div className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${getColorClass(item.color)}`}>
        {item.icon && allowIcon && getIconComponent(item.icon)}
        <span>{item.label}</span>
      </div>

      {/* Input de edição ou label estático */}
      <div className="flex-1">
        {isEditing ? (
          <div>
            <Input
              ref={inputRef}
              value={editLabel}
              onChange={(e) => {
                setEditLabel(e.target.value);
                setValidationError('');
              }}
              onKeyDown={handleKeyDown}
              onBlur={handleRename}
              className={`text-sm ${validationError ? 'border-red-500' : ''}`}
              placeholder="Nome do balão"
            />
            {validationError && (
              <p className="text-xs text-red-500 mt-1">{validationError}</p>
            )}
          </div>
        ) : (
          <span className="text-sm font-medium text-slate-900">{item.label}</span>
        )}
      </div>

      {/* Ações */}
      {!isEditing && (
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onStartEdit(item.id)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Renomear</p>
            </TooltipContent>
          </Tooltip>

          {allowIcon && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Palette className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Ícone</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {BALLOON_ICONS.map((iconConfig) => (
                      <Button
                        key={iconConfig.name}
                        variant={item.icon === iconConfig.name ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onIconChange(item.id, iconConfig.name)}
                      >
                        <span className="text-xs">{iconConfig.emoji}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {allowColor && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Palette className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Cor</Label>
                  <div className="flex flex-wrap gap-2">
                    {BALLOON_COLORS.map((color) => (
                      <Button
                        key={color.name}
                        variant={item.color === color.name ? "default" : "outline"}
                        size="sm"
                        className={`h-6 px-2 text-xs ${color.class}`}
                        onClick={() => onColorChange(item.id, color.name)}
                      >
                        {color.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir balão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir "{item.label}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onRemove(item.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default function BalloonEditor({
  open,
  onOpenChange,
  stageId,
  area,
  title,
  description,
  items,
  allowIcon = true,
  allowColor = true,
}: BalloonEditorProps) {
  const {
    addBalloon,
    renameBalloon,
    removeBalloon,
    reorderBalloons,
    setBalloonIcon,
    setBalloonColor,
  } = useFlowStore();

  const [localItems, setLocalItems] = useState<BalloonItem[]>(items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemIcon, setNewItemIcon] = useState<string>('');
  const [newItemColor, setNewItemColor] = useState<string>('slate');
  const [newItemActionType, setNewItemActionType] = useState<string>('custom');
  const [validationError, setValidationError] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar com items externos
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Focar no input quando abrir
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleSave = () => {
    // Aplicar todas as mudanças locais para o store
    localItems.forEach((item, index) => {
      const originalItem = items[index];
      if (!originalItem || originalItem.id !== item.id) {
        // Item foi reordenado ou modificado
        return;
      }
    });

    // Aplicar reordenação se necessário
    const currentOrder = items.map(item => item.id);
    const newOrder = localItems.map(item => item.id);
    
    if (JSON.stringify(currentOrder) !== JSON.stringify(newOrder)) {
      reorderBalloons(stageId, area, newOrder);
    }

    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalItems(items);
    setEditingId(null);
    setNewItemLabel('');
    setNewItemIcon('');
    setNewItemColor('slate');
    setNewItemActionType('custom');
    setValidationError('');
    onOpenChange(false);
  };

  const handleRename = (id: string, newLabel: string) => {
    // Verificar duplicatas
    const exists = localItems.some(item => 
      item.id !== id && item.label.toLowerCase() === newLabel.toLowerCase()
    );
    
    if (exists) {
      setValidationError('Já existe um balão com este nome');
      return;
    }

    setLocalItems(prev => prev.map(item => 
      item.id === id ? { ...item, label: newLabel } : item
    ));
    
    renameBalloon(stageId, area, id, newLabel);
  };

  const handleRemove = (id: string) => {
    setLocalItems(prev => prev.filter(item => item.id !== id));
    removeBalloon(stageId, area, id);
  };

  const handleIconChange = (id: string, icon: string) => {
    setLocalItems(prev => prev.map(item => 
      item.id === id ? { ...item, icon } : item
    ));
    setBalloonIcon(stageId, area, id, icon);
  };

  const handleColorChange = (id: string, color: string) => {
    setLocalItems(prev => prev.map(item => 
      item.id === id ? { ...item, color } : item
    ));
    setBalloonColor(stageId, area, id, color);
  };

  const handleAdd = () => {
    if (!newItemLabel.trim()) {
      setValidationError('Nome é obrigatório');
      return;
    }
    
    const trimmedLabel = newItemLabel.trim();
    
    if (trimmedLabel.length < 1) {
      setValidationError('Nome muito curto');
      return;
    }
    
    if (trimmedLabel.length > 32) {
      setValidationError('Nome muito longo (máximo 32 caracteres)');
      return;
    }
    
    const exists = localItems.some(item => 
      item.label.toLowerCase() === trimmedLabel.toLowerCase()
    );
    
    if (exists) {
      setValidationError('Já existe um balão com este nome');
      return;
    }

    const newItem: BalloonItem = {
      id: crypto.randomUUID(),
      label: trimmedLabel,
      icon: newItemIcon || undefined,
      color: newItemColor,
      meta: area === 'stage_actions.catalog' ? { actionType: newItemActionType } : undefined,
    };

    setLocalItems(prev => [...prev, newItem]);
    addBalloon(stageId, area, newItem);

    setNewItemLabel('');
    setNewItemIcon('');
    setNewItemColor('slate');
    setNewItemActionType('custom');
    setValidationError('');
    
    // Focar no input novamente
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over || active.id === over.id) return;

    const oldIndex = localItems.findIndex(item => item.id === active.id);
    const newIndex = localItems.findIndex(item => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(newItems);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  return (
    <TooltipProvider>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[500px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>{title}</span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </SheetTitle>
            {description && (
              <SheetDescription>{description}</SheetDescription>
            )}
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Lista de balões */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Balões ({localItems.length})
              </Label>
              
              {localItems.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={localItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2" role="list">
                      {localItems.map((item) => (
                        <SortableBalloonItem
                          key={item.id}
                          item={item}
                          onRename={handleRename}
                          onRemove={handleRemove}
                          onIconChange={handleIconChange}
                          onColorChange={handleColorChange}
                          allowIcon={allowIcon}
                          allowColor={allowColor}
                          isEditing={editingId === item.id}
                          onStartEdit={setEditingId}
                          onCancelEdit={() => setEditingId(null)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  
                  <DragOverlay>
                    {activeId ? (
                      <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-lg">
                        <GripVertical className="w-4 h-4 text-slate-400" />
                        <div className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs bg-slate-50">
                          {localItems.find(item => item.id === activeId)?.label}
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">Nenhum balão adicionado</p>
                  <p className="text-xs mt-1">Use o formulário abaixo para adicionar o primeiro</p>
                </div>
              )}
            </div>

            {/* Formulário de adicionar */}
            <div className="border-t pt-6">
              <Label className="text-sm font-medium mb-3 block">
                Adicionar balão
              </Label>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newLabel" className="text-sm text-slate-700 mb-1 block">
                    Nome
                  </Label>
                  <Input
                    ref={inputRef}
                    id="newLabel"
                    value={newItemLabel}
                    onChange={(e) => {
                      setNewItemLabel(e.target.value);
                      setValidationError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAdd();
                      }
                    }}
                    placeholder="Nome do balão"
                    className={`text-sm ${validationError ? 'border-red-500' : ''}`}
                  />
                  {validationError && (
                    <p className="text-xs text-red-500 mt-1">{validationError}</p>
                  )}
                </div>

                {area === 'stage_actions.catalog' && (
                  <div>
                    <Label htmlFor="actionType" className="text-sm text-slate-700 mb-1 block">
                      Tipo de ação
                    </Label>
                    <Select value={newItemActionType} onValueChange={setNewItemActionType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {allowIcon && (
                  <div>
                    <Label className="text-sm text-slate-700 mb-2 block">
                      Ícone (opcional)
                    </Label>
                    <div className="grid grid-cols-6 gap-2">
                      {BALLOON_ICONS.map((iconConfig) => (
                        <Button
                          key={iconConfig.name}
                          variant={newItemIcon === iconConfig.name ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setNewItemIcon(newItemIcon === iconConfig.name ? '' : iconConfig.name)}
                        >
                          <span className="text-xs">{iconConfig.emoji}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {allowColor && (
                  <div>
                    <Label className="text-sm text-slate-700 mb-2 block">
                      Cor
                    </Label>
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

                <Button
                  onClick={handleAdd}
                  disabled={!newItemLabel.trim()}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar balão
                </Button>
              </div>
            </div>

            {/* Dicas */}
            <div className="border-t pt-4">
              <p className="text-xs text-slate-500">
                💡 <strong>Dicas:</strong> Arraste para reordenar • Enter confirma • Esc cancela • Ctrl/Cmd+S salva
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
