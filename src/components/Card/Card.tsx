import React, { useMemo, useState, useCallback } from 'react';
import { X, Code, Eye, Pencil, Settings } from 'lucide-react';
import { Card as CardType } from '../../types';
import { useDraggable } from '../../hooks/useDraggable';
import { useResizable } from '../../hooks/useResizable';
import { useCardTheme } from '../../contexts/CardThemeContext';
import { TextCardContent } from './TextCard';
import { LinkCardContent } from './LinkCard';
import { AppCardContent } from './AppCard';
import { UserAppContent } from './UserAppContent';
import { WebEmbedContent } from './WebEmbedContent';
import { WebEmbedSettings } from './WebEmbedSettings';
import { CardEditForm } from './CardEditForm';
import { Analytics } from '../Apps/Analytics/Analytics';
import { KanbanApp } from '../Apps/Kanban/KanbanApp';

interface CardProps {
  card: CardType;
  onDelete: (id: string) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onContentChange: (id: string, content: string) => void;
  onDimensionsChange?: (id: string, dimensions: { width: number; height: number }) => void;
  onMetadataChange?: (id: string, metadata: any) => void;
  isMobile?: boolean;
}

export function Card({ 
  card, 
  onDelete, 
  onPositionChange, 
  onContentChange,
  onDimensionsChange,
  onMetadataChange,
  isMobile = false
}: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [showWebEmbedSettings, setShowWebEmbedSettings] = useState(false);
  const { currentCardTheme } = useCardTheme();
  
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

  const isAppCard = card.type.startsWith('app-');
  const isUserApp = card.type === 'userapp';
  const isLinkCard = card.type === 'link';
  const isTextCard = card.type === 'text';
  const isWebEmbed = card.type === 'embed';
  const isClockApp = card.type === 'app-clock';

  const handleContentChange = useCallback((content: string) => {
    onContentChange(card.id, content);
  }, [card.id, onContentChange]);

  const handleMetadataSubmit = useCallback((metadata: any) => {
    if (onMetadataChange) {
      onMetadataChange(card.id, metadata);
    }
  }, [card.id, onMetadataChange]);

  const handleDataChange = useCallback((data: any) => {
    if (onMetadataChange) {
      onMetadataChange(card.id, data);
    }
  }, [card.id, onMetadataChange]);

  const cardStyle = isMobile ? {
    width: '80%',
    height: isAppCard || isUserApp ? '400px' : card.type === 'link' ? 'auto' : '150px',
    margin: '0 auto'
  } : {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: dimensions.width,
    height: dimensions.height,
    transform: isDragging ? 'translate(0, 0) scale(1.02)' : 'translate(0, 0)',
    transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  // Apply card theme styles
  const headerStyle = {
    ...currentCardTheme.headerStyle,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const bodyStyle = currentCardTheme.bodyStyle ? {
    ...currentCardTheme.bodyStyle,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  const renderContent = () => {
    if (isAppCard) {
      const appType = card.type.replace('app-', '');
      
      if (appType === 'analytics') {
        return <Analytics onClose={() => onDelete(card.id)} onDragStart={handleMouseDown} />;
      }

      if (appType === 'kanban') {
        return (
          <KanbanApp 
            onClose={() => onDelete(card.id)} 
            onDragStart={handleMouseDown}
            metadata={card.metadata}
            onDataChange={handleDataChange}
          />
        );
      }

      return (
        <AppCardContent
          appType={appType}
          onClose={() => onDelete(card.id)}
          isMobile={isMobile}
          metadata={card.metadata}
          onDataChange={handleDataChange}
          onDragStart={handleMouseDown}
          cardId={card.id}
        />
      );
    }

    switch (card.type) {
      case 'text':
        return (
          <TextCardContent
            content={card.content}
            onChange={handleContentChange}
          />
        );
      case 'link':
        return (
          <LinkCardContent
            content={card.content}
            metadata={card.metadata}
          />
        );
      case 'userapp':
        return (
          <UserAppContent
            content={card.content}
            onChange={handleContentChange}
            isEditing={isEditing}
          />
        );
      case 'embed':
        return (
          <WebEmbedContent
            url={card.content}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={`card ${isClockApp ? '' : isTextCard ? 'bg-black' : 'bg-white'} select-none flex flex-col overflow-hidden
          ${!isMobile && isDragging ? 'cursor-grabbing shadow-xl z-50' : 'cursor-default shadow-lg z-10'}
          ${!isMobile && isResizing ? 'cursor-nwse-resize' : ''}
          ${isAppCard || isUserApp ? 'app-card' : ''}
          ${isTextCard ? 'border border-white/30' : 'rounded-lg shadow-lg'}`}
        style={{
          ...cardStyle as any,
          ...(currentCardTheme.bodyStyle && !isTextCard && bodyStyle),
          ...(isClockApp && { backgroundColor: 'transparent', boxShadow: 'none' }),
          ...(isTextCard && { boxShadow: 'none' })
        }}
        onMouseDown={!isMobile && !isAppCard ? handleMouseDown : undefined}
      >
        {!isAppCard && (
          <div
            className={`flex-shrink-0 flex justify-between items-center px-3 py-2 ${
              isTextCard ? 'border-b border-white/30' : 'border-b border-gray-200'
            }`}
            style={isTextCard ? { backgroundColor: 'black' } : headerStyle}
            onMouseDown={!isMobile ? handleMouseDown : undefined}
          >
            <div
              className="text-xs truncate flex-1 mr-2"
              style={{ color: isTextCard ? 'white' : (headerStyle.textColor || 'rgb(75, 85, 99)') }}
            >
              {(isTextCard || isLinkCard || isWebEmbed) && card.metadata?.title
                ? card.metadata.title
                : card.type === 'userapp'
                ? 'Custom App'
                : isWebEmbed
                ? 'Web Embed'
                : `${card.id.slice(0, 8)}`}
            </div>
            <div className="flex items-center gap-1">
              {isUserApp && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-1 rounded flex-shrink-0 transition-colors ${
                    isTextCard ? 'hover:bg-white/10' : 'hover:bg-black/10'
                  }`}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {isEditing ? (
                    <Eye
                      className="w-3.5 h-3.5"
                      style={{ color: isTextCard ? 'white' : (headerStyle.iconColor || 'rgb(107, 114, 128)') }}
                    />
                  ) : (
                    <Code
                      className="w-3.5 h-3.5"
                      style={{ color: isTextCard ? 'white' : (headerStyle.iconColor || 'rgb(107, 114, 128)') }}
                    />
                  )}
                </button>
              )}
              {(isLinkCard || isTextCard || isWebEmbed) && (
                <button
                  onClick={() => setIsEditingMetadata(true)}
                  className={`p-1 rounded flex-shrink-0 transition-colors ${
                    isTextCard ? 'hover:bg-white/10' : 'hover:bg-black/10'
                  }`}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Pencil
                    className="w-3.5 h-3.5"
                    style={{ color: isTextCard ? 'white' : (headerStyle.iconColor || 'rgb(107, 114, 128)') }}
                  />
                </button>
              )}
              {isWebEmbed && (
                <button
                  onClick={() => setShowWebEmbedSettings(true)}
                  className={`p-1 rounded flex-shrink-0 transition-colors ${
                    isTextCard ? 'hover:bg-white/10' : 'hover:bg-black/10'
                  }`}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Settings
                    className="w-3.5 h-3.5"
                    style={{ color: isTextCard ? 'white' : (headerStyle.iconColor || 'rgb(107, 114, 128)') }}
                  />
                </button>
              )}
              <button
                onClick={() => onDelete(card.id)}
                className={`p-1 rounded flex-shrink-0 transition-colors ${
                  isTextCard ? 'hover:bg-white/10' : 'hover:bg-black/10'
                }`}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <X
                  className="w-3.5 h-3.5"
                  style={{ color: isTextCard ? 'white' : (headerStyle.iconColor || 'rgb(107, 114, 128)') }}
                />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden min-h-0">
          {renderContent()}
        </div>

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

      {isEditingMetadata && (
        <CardEditForm
          type={card.type}
          metadata={card.metadata}
          onSubmit={handleMetadataSubmit}
          onClose={() => setIsEditingMetadata(false)}
        />
      )}

      {showWebEmbedSettings && (
        <WebEmbedSettings
          currentUrl={card.content}
          currentTitle={card.metadata?.title}
          onSubmit={(url, title) => {
            handleContentChange(url);
            if (onMetadataChange) {
              onMetadataChange(card.id, { ...card.metadata, title });
            }
            setShowWebEmbedSettings(false);
          }}
          onClose={() => setShowWebEmbedSettings(false)}
        />
      )}
    </>
  );
}