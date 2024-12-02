import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { Card as CardType } from '../../types';
import { useDraggable } from '../../hooks/useDraggable';
import { useResizable } from '../../hooks/useResizable';
import { TextCardContent } from './TextCard';
import { LinkCardContent } from './LinkCard';
import { formatCardTitle } from '../../utils/cardUtils';

interface CardProps {
  card: CardType;
  onDelete: (id: string) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onContentChange: (id: string, content: string) => void;
  onDimensionsChange?: (id: string, dimensions: { width: number; height: number }) => void;
}

export function Card({ 
  card, 
  onDelete, 
  onPositionChange, 
  onContentChange,
  onDimensionsChange 
}: CardProps) {
  const defaultPosition = useMemo(() => ({ x: 0, y: 0 }), []);
  const defaultDimensions = useMemo(() => ({ width: 300, height: 200 }), []);

  const { position, isDragging, handleMouseDown } = useDraggable(
    card.position || defaultPosition,
    onPositionChange
  );

  const { isResizing, dimensions, handleResizeStart } = useResizable(
    card.dimensions || defaultDimensions,
    (newDimensions) => onDimensionsChange?.(card.id, newDimensions)
  );
  
  const title = formatCardTitle(card.type, card.id);

  const handleContentChange = (content: string) => {
    onContentChange(card.id, content);
  };

  return (
    <div
      className={`card absolute bg-white rounded-lg shadow-lg select-none flex flex-col
        ${isDragging ? 'cursor-grabbing shadow-xl' : 'cursor-grab shadow-lg'}
        ${isResizing ? 'cursor-nwse-resize' : ''}`}
      style={{ 
        left: position.x,
        top: position.y,
        width: dimensions.width,
        height: dimensions.height,
        transform: 'translate(0, 0)',
        zIndex: isDragging || isResizing ? 50 : 10
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex justify-between items-start p-3 border-b border-gray-100">
        <div className="text-sm text-gray-500 truncate flex-1 mr-2">
          <span className="capitalize">{card.type}</span>
          <span className="mx-2">•</span>
          <span className="font-medium">{title}</span>
        </div>
        <button
          onClick={() => onDelete(card.id)}
          className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {card.type === 'text' && (
          <TextCardContent
            content={card.content}
            onChange={handleContentChange}
          />
        )}
        {card.type === 'link' && (
          <LinkCardContent
            content={card.content}
            metadata={card.metadata}
          />
        )}
      </div>

      {/* Resize handles */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={(e) => handleResizeStart(e, 'se')}
      />
      <div
        className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
      />
      <div
        className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
      />
      <div
        className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
      />
    </div>
  );
}