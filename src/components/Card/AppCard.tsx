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
import { Form } from '../Apps/Form/Form';
import { FileManager } from '../Apps/FileManager/FileManager';
import { WhiteboardNew } from '../Apps/Whiteboard/WhiteboardNew';
import { YouTubePlayer } from '../Apps/YouTubePlayer/YouTubePlayer';
import { YouPlay } from '../Apps/YouPlay/YouPlay';
import { DrivePlus } from '../Apps/DrivePlus/DrivePlus';
import { SSHTerminal } from '../Apps/SSHTerminal/SSHTerminal';
import { useTheme } from '../../contexts/ThemeContext';
import { useCardTheme } from '../../contexts/CardThemeContext';
import { GripHorizontal, X, AlertCircle } from 'lucide-react';

interface AppCardContentProps {
  appType: string;
  onClose: () => void;
  isMobile?: boolean;
  metadata?: any;
  onDataChange?: (data: any) => void;
  onDragStart?: (e: React.MouseEvent) => void;
  cardId?: string;
  onTogglePin?: () => void;
  isPinned?: boolean;
}

export function AppCardContent({
  appType,
  onClose,
  isMobile = false,
  metadata,
  onDataChange,
  onDragStart,
  cardId,
  onTogglePin,
  isPinned
}: AppCardContentProps) {
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

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

    const bgColor = isTerminalTheme
      ? currentCardTheme.bodyStyle?.background || 'rgb(0, 0, 0)'
      : themeColors.menuBg;

    return {
      width: '100%',
      height: '100%',
      backgroundColor: bgColor,
      borderRadius: '0.5rem',
      overflow: 'hidden'
    };
  };

  const renderApp = () => {
    switch (appType) {
      case 'calculator':
        return <Calculator onClose={onClose} onDragStart={onDragStart} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'clock':
        return <Clock onClose={onClose} onDragStart={onDragStart} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'todolist':
        return <TodoList onClose={onClose} metadata={metadata} onDataChange={onDataChange} cardId={cardId} onDragStart={onDragStart} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'calendar':
        return <Calendar onClose={onClose} metadata={metadata} onDataChange={onDataChange} cardId={cardId} onDragStart={onDragStart} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'rss':
        return <RSSReader onClose={onClose} metadata={metadata} onDataChange={onDataChange} onDragStart={onDragStart} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'analytics':
        return <Analytics onClose={onClose} onDragStart={onDragStart} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'kanban':
        return <KanbanApp onClose={onClose} onDragStart={onDragStart} metadata={metadata} onDataChange={onDataChange} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'email':
        return <EmailApp onClose={onClose} onDragStart={onDragStart} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'document-editor':
        return <DocumentManager onClose={onClose} onDragStart={onDragStart} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'file-manager':
        return <FileManager onClose={onClose} onDragStart={onDragStart} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'whiteboard':
        return <WhiteboardNew onClose={onClose} onDragStart={onDragStart} metadata={metadata} onDataChange={onDataChange} cardId={cardId} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'youtube-player':
        return <YouTubePlayer onClose={onClose} metadata={metadata} onDataChange={onDataChange} onDragStart={onDragStart} cardId={cardId} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'youplay-plus':
        return <YouPlay onClose={onClose} metadata={metadata} onDataChange={onDataChange} onDragStart={onDragStart} cardId={cardId} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'driveplus':
        return <DrivePlus onClose={onClose} onDragStart={onDragStart} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'ssh-terminal':
        return <SSHTerminal onClose={onClose} onDragStart={onDragStart} onTogglePin={onTogglePin} isPinned={isPinned} />;
      case 'form':
        return <Form onClose={onClose} onDragStart={onDragStart} onTogglePin={onTogglePin} isPinned={isPinned} metadata={metadata} onDataChange={onDataChange} />;
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
