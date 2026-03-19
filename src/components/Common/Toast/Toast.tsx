import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  const bgCard = isTerminalTheme ? 'rgb(20, 20, 20)' : 'rgb(31, 41, 55)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 65, 81, 0.5)';

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    const iconClass = 'w-5 h-5';
    switch (type) {
      case 'success':
        return <CheckCircle className={iconClass} style={{ color: 'rgb(34, 197, 94)' }} />;
      case 'error':
        return <XCircle className={iconClass} style={{ color: 'rgb(239, 68, 68)' }} />;
      case 'warning':
        return <AlertCircle className={iconClass} style={{ color: 'rgb(251, 191, 36)' }} />;
      default:
        return <Info className={iconClass} style={{ color: themeColors.primary }} />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'rgba(34, 197, 94, 0.1)';
      case 'error':
        return 'rgba(239, 68, 68, 0.1)';
      case 'warning':
        return 'rgba(251, 191, 36, 0.1)';
      default:
        return `${themeColors.primary}20`;
    }
  };

  return (
    <div
      className="absolute top-4 right-4 z-50 min-w-[300px] max-w-md rounded-lg shadow-2xl backdrop-blur-sm animate-in slide-in-from-top-5 fade-in"
      style={{
        backgroundColor: bgCard,
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: getIconBg() }}>
          {getIcon()}
        </div>
        <p className="flex-1 text-sm" style={{ color: textColor }}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
          style={{ color: textColor }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
