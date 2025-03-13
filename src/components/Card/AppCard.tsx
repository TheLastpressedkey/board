import React from 'react';
import { X } from 'lucide-react';
import { Calculator } from '../Apps/Calculator/Calculator';
import { Clock } from '../Apps/Clock/Clock';
import { TodoList } from '../Apps/TodoList/TodoList';
import { Calendar } from '../Apps/Calendar/Calendar';
import { RSSReader } from '../Apps/RSS/RSSReader';
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

  React.useEffect(() => {
    window.cardMetadata = metadata;
    window.onCardDataChange = onDataChange;
    return () => {
      window.cardMetadata = undefined;
      window.onCardDataChange = undefined;
    };
  }, [metadata, onDataChange]);

  const containerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: themeColors.menuBg,
    borderRadius: '0.5rem',
    overflow: 'hidden'
  };

  const renderHeader = () => (
    <div 
      className="flex justify-between items-center px-4 py-2 cursor-grab"
      style={{ backgroundColor: themeColors.menuBg }}
      onMouseDown={onDragStart}
    >
      <span className="text-sm font-medium text-gray-300">
        {appType.charAt(0).toUpperCase() + appType.slice(1)}
      </span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-gray-700 rounded-full"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );

  const renderApp = () => {
    switch (appType) {
      case 'calculator':
        return <Calculator onClose={onClose} />;
      case 'clock':
        return <Clock onClose={onClose} />;
      case 'todolist':
        return <TodoList onClose={onClose} />;
      case 'calendar':
        return <Calendar onClose={onClose} metadata={metadata} onDataChange={onDataChange} />;
      case 'rss':
        return <RSSReader onClose={onClose} metadata={metadata} onDataChange={onDataChange} />;
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
      {renderHeader()}
      <div className="h-[calc(100%-40px)]">
        {renderApp()}
      </div>
    </div>
  );
}
