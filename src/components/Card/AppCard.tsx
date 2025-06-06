import React from 'react';
import { X } from 'lucide-react';
import { Calculator } from '../Apps/Calculator/Calculator';
import { Clock } from '../Apps/Clock/Clock';
import { TodoList } from '../Apps/TodoList/TodoList';
import { Calendar } from '../Apps/Calendar/Calendar';
import { RSSReader } from '../Apps/RSS/RSSReader';
import { Analytics } from '../Apps/Analytics/Analytics';
import { KanbanApp } from '../Apps/Kanban/KanbanApp';
import { EmailApp } from '../Apps/Email/EmailApp';
import { DocumentManager } from '../Apps/DocumentEditor/DocumentManager';
import { useTheme } from '../../contexts/ThemeContext';

interface AppCardContentProps {
  appType: string;
  onClose: () => void;
  isMobile?: boolean;
  metadata?: any;
  onDataChange?: (data: any) => void;
  onDragStart?: (e: React.MouseEvent) => void;
}

export function AppCardContent({ 
  appType, 
  onClose, 
  isMobile = false,
  metadata,
  onDataChange,
  onDragStart
}: AppCardContentProps) {
  const { themeColors } = useTheme();

  const containerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: themeColors.menuBg,
    borderRadius: '0.5rem',
    overflow: 'hidden'
  };

  const renderApp = () => {
    switch (appType) {
      case 'calculator':
        return <Calculator onClose={onClose} />;
      case 'clock':
        return <Clock onClose={onClose} />;
      case 'todolist':
        return <TodoList onClose={onClose} metadata={metadata} onDataChange={onDataChange} />;
      case 'calendar':
        return <Calendar onClose={onClose} metadata={metadata} onDataChange={onDataChange} />;
      case 'rss':
        return <RSSReader onClose={onClose} metadata={metadata} onDataChange={onDataChange} />;
      case 'analytics':
        return <Analytics onClose={onClose} onDragStart={onDragStart} />;
      case 'kanban':
        return <KanbanApp onClose={onClose} onDragStart={onDragStart} metadata={metadata} onDataChange={onDataChange} />;
      case 'email':
        return <EmailApp onClose={onClose} onDragStart={onDragStart} />;
      case 'document-editor':
        return <DocumentManager onClose={onClose} onDragStart={onDragStart} />;
      default:
        return (
          <div className="h-full flex items-center justify-center text-gray-500">
            App not found
          </div>
        );
    }
  };

  return (
    <div style={containerStyle}>
      <div className="h-full">
        {renderApp()}
      </div>
    </div>
  );
}
