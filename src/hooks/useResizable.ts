import { useState, useCallback, useRef, useEffect } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

interface ResizeState {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  direction: ResizeDirection;
}

export function useResizable(
  initialDimensions: Dimensions,
  onDimensionsChange: (dimensions: Dimensions) => void,
  minWidth = 200,
  minHeight = 100
) {
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState(initialDimensions);
  const resizeState = useRef<ResizeState | null>(null);
  const rafId = useRef<number>();

  // Update dimensions when initialDimensions changes
  useEffect(() => {
    setDimensions(initialDimensions);
  }, [initialDimensions]);

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    resizeState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: dimensions.width,
      startHeight: dimensions.height,
      direction
    };

    document.body.style.cursor = `${direction}-resize`;
  }, [dimensions]);

  const handleResize = useCallback((e: MouseEvent) => {
    if (!resizeState.current) return;

    const { startX, startY, startWidth, startHeight, direction } = resizeState.current;
    
    // Calculate deltas
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Calculate new dimensions based on direction
    let newWidth = startWidth;
    let newHeight = startHeight;

    if (direction.includes('e')) newWidth = Math.max(minWidth, startWidth + dx);
    if (direction.includes('w')) newWidth = Math.max(minWidth, startWidth - dx);
    if (direction.includes('s')) newHeight = Math.max(minHeight, startHeight + dy);
    if (direction.includes('n')) newHeight = Math.max(minHeight, startHeight - dy);

    // Use requestAnimationFrame for smooth updates
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      const newDimensions = { width: newWidth, height: newHeight };
      setDimensions(newDimensions);
      onDimensionsChange(newDimensions);
    });
  }, [minWidth, minHeight, onDimensionsChange]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    resizeState.current = null;
    document.body.style.cursor = '';

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [isResizing, handleResize, handleResizeEnd]);

  return {
    isResizing,
    dimensions,
    handleResizeStart
  };
}