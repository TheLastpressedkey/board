import { useState, useCallback, useMemo } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

export function useResizable(
  initialDimensions: Dimensions,
  onDimensionsChange: (dimensions: Dimensions) => void,
  minWidth = 200,
  minHeight = 100
) {
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDimensions, setStartDimensions] = useState(initialDimensions);
  const [currentDimensions, setCurrentDimensions] = useState(initialDimensions);

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartDimensions(currentDimensions);

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;

      let newWidth = startDimensions.width;
      let newHeight = startDimensions.height;

      switch (direction) {
        case 'se':
          newWidth = Math.max(minWidth, startDimensions.width + dx);
          newHeight = Math.max(minHeight, startDimensions.height + dy);
          break;
        case 'sw':
          newWidth = Math.max(minWidth, startDimensions.width - dx);
          newHeight = Math.max(minHeight, startDimensions.height + dy);
          break;
        case 'ne':
          newWidth = Math.max(minWidth, startDimensions.width + dx);
          newHeight = Math.max(minHeight, startDimensions.height - dy);
          break;
        case 'nw':
          newWidth = Math.max(minWidth, startDimensions.width - dx);
          newHeight = Math.max(minHeight, startDimensions.height - dy);
          break;
      }

      const newDimensions = { width: newWidth, height: newHeight };
      setCurrentDimensions(newDimensions);
      onDimensionsChange(newDimensions);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [startPos, startDimensions, currentDimensions, minWidth, minHeight, onDimensionsChange]);

  return {
    isResizing,
    dimensions: currentDimensions,
    handleResizeStart
  };
}