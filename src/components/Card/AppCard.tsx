import React, { useEffect } from 'react';
import { Calculator } from '../Apps/Calculator/Calculator';
import { Clock } from '../Apps/Clock/Clock';
import { TodoList } from '../Apps/TodoList/TodoList';
import { Calendar } from '../Apps/Calendar/Calendar';
import { useTheme } from '../../contexts/ThemeContext';

interface AppCardContentProps {
  appType: string;
  onClose: () => void;
  isMobile?: boolean;
  metadata?: any;
  onDataChange?: (data: any) => void;
}

export function AppCardContent({ 
  appType, 
  onClose, 
  isMobile = false,
  metadata,
  onDataChange 
}: AppCardContentProps) {
  const { themeColors } = useTheme();

  // Expose metadata and change handler to app components
  useEffect(() => {
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
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'rgb(17, 24, 39)', // bg-gray-900
    borderRadius: '0.5rem', // rounded-lg
    overflow: 'hidden',
  };

  const renderApp = () => {
    switch (appType) {
      case 'calculator':
        return <Calculator onClose={onClose} />;
      case 'clock':
        return <Clock onClose={onClose} />;
      case 'todolist':
        return <TodoList onClose={onClose} />;
      case 'calendar':
        return (
          <Calendar
            onClose={onClose}
            metadata={metadata}
            onDataChange={onDataChange}
          />
        );
      default:
        return (
          <div 
            className="h-full flex items-center justify-center text-gray-500"
            style={{ backgroundColor: themeColors.menuBg }}
          >
            App not found
          </div>
        );
    }
  };

  return (
    <div style={containerStyle}>
      {renderApp()}
    </div>
  );
}