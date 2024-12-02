import { useState, useEffect, useCallback, useMemo } from 'react';

interface Position {
  x: number;
  y: number;
}

export function useDraggable(
  initialPosition: Position,
  onPositionChange: (position: Position) => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState<Position>(initialPosition);

  // Memoize the handlers to prevent unnecessary re-renders
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    setIsDragging(true);
    setStartPos({
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y
    });
  }, [currentPos]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    };
    
    setCurrentPos(newPosition);
    onPositionChange(newPosition);
  }, [isDragging, startPos, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Update position when initialPosition changes
  useEffect(() => {
    setCurrentPos(initialPosition);
  }, [initialPosition]);

  return {
    isDragging,
    position: currentPos,
    handleMouseDown
  };
}