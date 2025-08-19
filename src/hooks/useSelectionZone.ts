import { useState, useCallback } from 'react';

interface SelectionZone {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

export function useSelectionZone() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionZone, setSelectionZone] = useState<SelectionZone | null>(null);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const handleSelectionStart = useCallback((e: React.MouseEvent) => {
    // Vérifier si on clique sur une zone vide (pas sur une carte)
    if (e.button !== 0 || (e.target as HTMLElement).closest('.card')) return;
    
    const boardRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const startX = e.clientX + (e.currentTarget as HTMLElement).scrollLeft - boardRect.left;
    const startY = e.clientY + (e.currentTarget as HTMLElement).scrollTop - boardRect.top;
    
    setIsSelecting(true);
    setStartPosition({ x: startX, y: startY });
    setSelectionZone({
      startX,
      startY,
      width: 0,
      height: 0
    });
  }, []);

  const handleSelectionMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionZone) return;

    const boardRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentX = e.clientX + (e.currentTarget as HTMLElement).scrollLeft - boardRect.left;
    const currentY = e.clientY + (e.currentTarget as HTMLElement).scrollTop - boardRect.top;

    const width = currentX - startPosition.x;
    const height = currentY - startPosition.y;

    setSelectionZone({
      startX: width > 0 ? startPosition.x : currentX,
      startY: height > 0 ? startPosition.y : currentY,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  }, [isSelecting, selectionZone, startPosition]);

  const handleSelectionEnd = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionZone) return null;

    const finalZone = {
      x: selectionZone.startX,
      y: selectionZone.startY,
      width: selectionZone.width,
      height: selectionZone.height
    };

    setIsSelecting(false);
    setSelectionZone(null);

    return finalZone;
  }, [isSelecting, selectionZone]);

  return {
    isSelecting,
    selectionZone,
    handleSelectionStart,
    handleSelectionMove,
    handleSelectionEnd
  };
}