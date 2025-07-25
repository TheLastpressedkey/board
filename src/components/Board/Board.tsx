import React, { useRef, useEffect } from 'react';
import { Card } from '../Card/Card';
import { Board as BoardType, ContentType } from '../../types';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { useSelectionZone } from '../../hooks/useSelectionZone';
import { SelectionZone } from '../SelectionZone/SelectionZone';
import { WebEmbedInput } from '../Card/WebEmbedInput';

// Constants pour le positionnement
const SIDEBAR_WIDTH = 80; // Largeur de la sidebar
const SIDEBAR_MARGIN = 40; // Marge supplémentaire après la sidebar
const MIN_CARD_X = SIDEBAR_WIDTH + SIDEBAR_MARGIN; // Position X minimale pour les cartes (120px)
const MIN_CARD_Y = 20; // Position Y minimale pour les cartes

interface BoardProps {
  board: BoardType;
  onDeleteCard: (id: string) => void;
  onUpdateCardPosition: (id: string, position: { x: number; y: number }) => void;
  onContentChange: (id: string, content: string) => void;
  onScrollProgress: (progress: number) => void;
  onAddCard: (type: ContentType, position: { x: number; y: number }, dimensions?: { width: number; height: number }) => void;
  onUpdateCardDimensions: (id: string, dimensions: { width: number; height: number }) => void;
  onUpdateCardMetadata: (id: string, metadata: any) => void;
  onAutoArrange?: () => void;
}

export function Board({ 
  board, 
  onDeleteCard, 
  onUpdateCardPosition, 
  onContentChange, 
  onScrollProgress,
  onAddCard,
  onUpdateCardDimensions,
  onUpdateCardMetadata,
  onAutoArrange
}: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [isDraggingBoard, setIsDraggingBoard] = React.useState(false);
  const [startDragPos, setStartDragPos] = React.useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = React.useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = React.useState(false);
  const [showWebEmbedInput, setShowWebEmbedInput] = React.useState(false);
  const [contextMenuPosition, setContextMenuPosition] = React.useState({ x: 0, y: 0 });
  const [selectedZone, setSelectedZone] = React.useState<{
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
  } | null>(null);
  
  const {
    isSelecting,
    selectionZone,
    handleSelectionStart,
    handleSelectionMove,
    handleSelectionEnd
  } = useSelectionZone();
  
  const progress = useScrollProgress(boardRef.current);
  
  useEffect(() => {
    onScrollProgress(progress);
  }, [progress, onScrollProgress]);

  const handleBoardMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      setIsDraggingBoard(true);
      setStartDragPos({
        x: e.clientX + (boardRef.current?.scrollLeft || 0),
        y: e.clientY + (boardRef.current?.scrollTop || 0)
      });
      e.preventDefault();
    } else if (e.button === 0 && !e.target.closest('.card')) {
      handleSelectionStart(e);
    }
  };

  const handleBoardMouseMove = (e: MouseEvent) => {
    if (isDraggingBoard && boardRef.current) {
      const dx = startDragPos.x - e.clientX;
      const dy = startDragPos.y - e.clientY;
      
      boardRef.current.scrollLeft = dx;
      boardRef.current.scrollTop = dy;
      
      setScrollPos({
        x: boardRef.current.scrollLeft,
        y: boardRef.current.scrollTop
      });
    }
  };

  const handleBoardMouseUp = (e: React.MouseEvent) => {
    if (isDraggingBoard) {
      setIsDraggingBoard(false);
    } else if (isSelecting) {
      const finalZone = handleSelectionEnd(e);
      if (finalZone && (finalZone.width > 10 || finalZone.height > 10)) {
        setContextMenuPosition({ 
          x: e.clientX, 
          y: e.clientY 
        });
        setSelectedZone({
          position: { x: finalZone.x, y: finalZone.y },
          dimensions: { width: finalZone.width, height: finalZone.height }
        });
        setShowContextMenu(true);
      }
    }
  };

  const handleCardTypeSelect = (type: ContentType) => {
    if (selectedZone) {
      if (type === 'embed') {
        setShowWebEmbedInput(true);
        setShowContextMenu(false);
      } else {
        // Ajuster la position pour éviter la sidebar
        const adjustedPosition = {
          x: Math.max(selectedZone.position.x, MIN_CARD_X),
          y: Math.max(selectedZone.position.y, MIN_CARD_Y)
        };
        onAddCard(type, adjustedPosition, selectedZone.dimensions);
        setShowContextMenu(false);
        setSelectedZone(null);
      }
    }
  };

  const generateWebEmbedId = () => {
    const webEmbeds = board.cards.filter(card => card.type === 'embed').length + 1;
    return `Web Embed ${webEmbeds}`;
  };

  useEffect(() => {
    if (isDraggingBoard) {
      window.addEventListener('mousemove', handleBoardMouseMove);
      window.addEventListener('mouseup', handleBoardMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleBoardMouseMove);
      window.removeEventListener('mouseup', handleBoardMouseUp);
    };
  }, [isDraggingBoard, startDragPos]);

  return (
    <div
      ref={boardRef}
      className={`fixed inset-0 bg-dots overflow-auto
        ${isDraggingBoard ? 'cursor-grabbing' : isSelecting ? 'cursor-crosshair' : 'cursor-default'}`}
      onMouseDown={handleBoardMouseDown}
      onMouseMove={(e) => !isDraggingBoard && handleSelectionMove(e)}
      onMouseUp={handleBoardMouseUp}
    >
      <div className="relative md:w-[10000px] md:h-full" style={{ paddingLeft: `${MIN_CARD_X}px` }}>
        {/* Mobile Layout */}
        <div className="md:hidden min-h-screen py-20">
          <div className="flex flex-col items-center">
            {board.cards?.map(card => (
              <div key={card.id} className="w-full flex justify-center mb-4">
                <Card
                  card={card}
                  onDelete={onDeleteCard}
                  onPositionChange={(position) => onUpdateCardPosition(card.id, position)}
                  onContentChange={onContentChange}
                  onDimensionsChange={onUpdateCardDimensions}
                  onMetadataChange={onUpdateCardMetadata}
                  isMobile={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          {board.cards?.map(card => (
            <Card
              key={card.id}
              card={card}
              onDelete={onDeleteCard}
              onPositionChange={(position) => {
                const adjustedPosition = {
                  x: Math.max(position.x, MIN_CARD_X),
                  y: Math.max(position.y, MIN_CARD_Y)
                };
                onUpdateCardPosition(card.id, adjustedPosition);
              }}
              onContentChange={onContentChange}
              onDimensionsChange={onUpdateCardDimensions}
              onMetadataChange={onUpdateCardMetadata}
              isMobile={false}
            />
          ))}
        </div>

        {isSelecting && selectionZone && <SelectionZone zone={selectionZone} />}

        {showWebEmbedInput && selectedZone && (
          <WebEmbedInput
            position={contextMenuPosition}
            onSubmit={(url, title) => {
              // Ajuster la position pour éviter la sidebar
              const adjustedPosition = {
                x: Math.max(selectedZone.position.x, MIN_CARD_X),
                y: Math.max(selectedZone.position.y, MIN_CARD_Y)
              };
              onAddCard('embed', adjustedPosition, selectedZone.dimensions);
              const newCard = board.cards[board.cards.length - 1];
              onContentChange(newCard.id, url);
              onUpdateCardMetadata(newCard.id, { 
                title: title || generateWebEmbedId()
              });
              setShowWebEmbedInput(false);
              setSelectedZone(null);
            }}
            onClose={() => {
              setShowWebEmbedInput(false);
              setSelectedZone(null);
            }}
          />
        )}
      </div>
    </div>
  );
}