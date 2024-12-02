import React from 'react';
import { Calculator } from '../Apps/Calculator/Calculator';
import { Clock } from '../Apps/Clock/Clock';
import { TodoList } from '../Apps/TodoList/TodoList';
import { Calendar } from '../Apps/Calendar/Calendar';

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
  // Expose metadata and change handler to app components
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
    display: 'flex',
    flexDirection: 'column' as const,
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
          <div className="h-full flex items-center justify-center text-gray-500">
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