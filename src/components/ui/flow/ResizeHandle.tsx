import React, { useState, useCallback, useEffect } from 'react';

interface ResizeHandleProps {
  onResize: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export default function ResizeHandle({ 
  onResize, 
  minWidth = 0.3, 
  maxWidth = 0.8 
}: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(parseFloat(localStorage.getItem('stage.ws.split') || '0.62'));
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const containerWidth = window.innerWidth;
    const deltaPercent = deltaX / containerWidth;
    
    let newWidth = startWidth + deltaPercent;
    
    // Aplicar limites
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    onResize(newWidth);
  }, [isResizing, startX, startWidth, onResize, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`
        w-3 cursor-col-resize bg-transparent hover:bg-slate-200 rounded
        transition-colors duration-150 flex items-center justify-center
        ${isResizing ? 'bg-slate-300' : ''}
      `}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-label="Redimensionar painéis"
      aria-orientation="vertical"
    >
      <div className="w-0.5 h-8 bg-slate-300 rounded-full opacity-60" />
    </div>
  );
}
