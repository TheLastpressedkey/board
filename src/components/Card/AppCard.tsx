import React from 'react';
import { Calculator } from '../Apps/Calculator/Calculator';
import { Clock } from '../Apps/Clock/Clock';

interface AppCardContentProps {
  appType: string;
  onClose: () => void;
  isMobile?: boolean;
}

export function AppCardContent({ appType, onClose, isMobile = false }: AppCardContentProps) {
  const containerStyle = {
    width: '100%',
    height: '100%',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
  };

  const renderApp = () => {
    switch (appType) {
      case 'calculator':
        return <Calculator onClose={onClose} />;
      case 'clock':
        return <Clock onClose={onClose} />;
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
