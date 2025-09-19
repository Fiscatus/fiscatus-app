import React from 'react';
import { BalloonItem } from '@/types/flow';

interface BalloonChipProps {
  item: BalloonItem;
  className?: string;
}

export default function BalloonChip({ item, className = '' }: BalloonChipProps) {
  const getColorClass = (color?: string) => {
    switch (color) {
      case 'indigo':
        return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      case 'emerald':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'amber':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'rose':
        return 'border-rose-200 bg-rose-50 text-rose-700';
      case 'purple':
        return 'border-purple-200 bg-purple-50 text-purple-700';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-700';
    }
  };

  const getIconEmoji = (iconName?: string) => {
    const iconMap: Record<string, string> = {
      FileText: '📄',
      AlertCircle: '⚠️',
      CheckCircle: '✅',
      Clock: '🕐',
      User: '👤',
      Mail: '📧',
      Phone: '📞',
      Calendar: '📅',
      MapPin: '📍',
      Tag: '🏷️',
      Star: '⭐',
      Heart: '❤️',
      Bookmark: '🔖',
      Flag: '🚩',
      Target: '🎯',
      Zap: '⚡',
      Shield: '🛡️',
      Lock: '🔒',
      Send: '📤',
    };
    
    return iconMap[iconName || ''] || '📄';
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${getColorClass(item.color)} ${className}`}
    >
      {item.icon && (
        <span className="text-xs">
          {getIconEmoji(item.icon)}
        </span>
      )}
      <span>{item.label}</span>
    </div>
  );
}
