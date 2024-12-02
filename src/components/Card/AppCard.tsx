import React from 'react';
import { Calculator } from '../Apps/Calculator/Calculator';

interface AppCardContentProps {
  appType: string;
  onClose: () => void;
  isMobile?: boolean;
}

export function AppCardContent({ appType, onClose, isMobile = false }: AppCardContentProps) {
  switch (appType) {
    case 'calculator':
      return <Calculator onClose={onClose} />;
    default:
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          App not found
        </div>
      );
  }
}
