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
  isMobile: boolean;
}

export function Card({ 
  card, 
  onDelete, 
  onPositionChange, 
  onContentChange,
  onDimensionsChange,
  isMobile
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
  
  const displayTitle = card.type === 'link' && card.metadata?.title 
    ? card.metadata.title 
    : formatCardTitle(card.type, card.id);

  const handleContentChange = (content: string) => {
    onContentChange(card.id, content);
  };

  const cardStyle = isMobile ? {
    width: '80%',
    height: card.type === 'link' ? 'auto' : '150px'
  } : {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: dimensions.width,
    height: dimensions.height,
    transform: isDragging ? 'translate(0, 0) scale(1.02)' : 'translate(0, 0)',
    transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  return (
    <div
      className={`card bg-white rounded-lg shadow-lg select-none flex flex-col overflow-hidden
        ${!isMobile && isDragging ? 'cursor-grabbing shadow-xl scale-[1.02] z-50' : 'cursor-grab shadow-lg z-10'}
        ${!isMobile && isResizing ? 'cursor-nwse-resize' : ''}`}
      style={cardStyle as any}
      onMouseDown={!isMobile ? handleMouseDown : undefined}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-600 truncate flex-1 mr-2">
          {displayTitle}
        </div>
        <button
          onClick={() => onDelete(card.id)}
          className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0 transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
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

      {/* Resize handles - only show on desktop */}
      {!isMobile && (
        <>
          <div
            className="resize-handle se"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div
            className="resize-handle sw"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="resize-handle ne"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="resize-handle nw"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
        </>
      )}
    </div>
  );
}
