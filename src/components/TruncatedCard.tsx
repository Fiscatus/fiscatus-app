import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTruncationDetector } from '@/hooks/useTruncationDetector';

interface TruncatedCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBgColor: string;
  iconColor: string;
  className?: string;
}

export default function TruncatedCard({
  icon,
  label,
  value,
  iconBgColor,
  iconColor,
  className = ""
}: TruncatedCardProps) {
  const { elementRef, isTruncated } = useTruncationDetector();

  const cardContent = (
    <motion.div 
      className={`bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-200 ${className}`}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center gap-4 justify-center">
        <div className={`p-2 rounded-lg ${iconBgColor}`}>
          <div className={`w-6 h-6 ${iconColor}`}>
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p 
            ref={elementRef}
            className="text-sm font-semibold text-gray-900 truncate"
          >
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Se o texto está truncado, envolver com tooltip
  if (isTruncated) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {cardContent}
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-neutral-900 text-white px-3 py-1.5 rounded-md text-sm z-50"
          >
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Se não está truncado, retornar o card normal
  return cardContent;
} 