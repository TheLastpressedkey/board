import React from 'react';
import { Calculator } from '../Apps/Calculator/Calculator';
import { Clock } from '../Apps/Clock/Clock';
import { TodoList } from '../Apps/TodoList/TodoList';
import { Calendar } from '../Apps/Calendar/Calendar';
import { RSSReader } from '../Apps/RSS/RSSReader';
import { Analytics } from '../Apps/Analytics/Analytics';
import { KanbanApp } from '../Apps/Kanban/KanbanApp';
import { EmailApp } from '../Apps/Email/EmailApp';
import { DocumentManager } from '../Apps/DocumentEditor/DocumentManager';
import { FileManager } from '../Apps/FileManager/FileManager';
import { Whiteboard } from '../Apps/Whiteboard/Whiteboard';
import { useTheme } from '../../contexts/ThemeContext';
import { GripHorizontal, X, AlertCircle } from 'lucide-react';

interface AppCardContentProps {
  appType: string;
  onClose: () => void;
  isMobile?: boolean;
  metadata?: any;
  onDataChange?: (data: any) => void;
  onDragStart?: (e: React.MouseEvent) => void;
  cardId?: string;
}

export function AppCardContent({ 
  appType, 
  onClose, 
  isMobile = false,
  metadata,
  onDataChange,
  onDragStart,
  cardId
}: AppCardContentProps) {
  const { themeColors } = useTheme();

  const getContainerStyle = () => {
    if (appType === 'clock') {
      return {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        borderRadius: '0.5rem',
        overflow: 'hidden'
      };
    }
    return {
      width: '100%',
      height: '100%',
      backgroundColor: themeColors.menuBg,
      borderRadius: '0.5rem',
      overflow: 'hidden'
    };
  };

  const renderApp = () => {
    switch (appType) {
      case 'calculator':
        return <Calculator onClose={onClose} />;
      case 'clock':
        return <Clock onClose={onClose} onDragStart={onDragStart} />;
      case 'todolist':
        return <TodoList onClose={onClose} metadata={metadata} onDataChange={onDataChange} cardId={cardId} onDragStart={onDragStart} />;
      case 'calendar':
        return <Calendar onClose={onClose} metadata={metadata} onDataChange={onDataChange} cardId={cardId} onDragStart={onDragStart} />;
      case 'rss':
        return <RSSReader onClose={onClose} metadata={metadata} onDataChange={onDataChange} onDragStart={onDragStart} />;
      case 'analytics':
        return <Analytics onClose={onClose} onDragStart={onDragStart} />;
      case 'kanban':
        return <KanbanApp onClose={onClose} onDragStart={onDragStart} metadata={metadata} onDataChange={onDataChange} />;
      case 'email':
        return <EmailApp onClose={onClose} onDragStart={onDragStart} />;
      case 'document-editor':
        return <DocumentManager onClose={onClose} onDragStart={onDragStart} />;
      case 'file-manager':
        return <FileManager onClose={onClose} onDragStart={onDragStart} />;
      case 'whiteboard':
        return <Whiteboard onClose={onClose} onDragStart={onDragStart} metadata={metadata} onDataChange={onDataChange} cardId={cardId} />;
      default:
        return (
          <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
            {/* Header avec drag & drop */}
            <div
              className="p-4 border-b border-gray-700/50"
              style={{ backgroundColor: themeColors.menuBg }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
                  onMouseDown={onDragStart}
                >
                  <GripHorizontal className="w-5 h-5 text-gray-500" />
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="h-full flex items-center justify-center text-gray-500">
              App not found
            </div>
          </div>
        );
    }
  };

  return (
    <div style={getContainerStyle()}>
      <div className="h-full">
        {renderApp()}
      </div>
    </div>
  );
}
