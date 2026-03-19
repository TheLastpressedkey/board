import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Annuler',
  onConfirm,
  showCancel = false
}: AlertDialogProps) {
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  if (!isOpen) return null;

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgCard = isTerminalTheme ? 'rgb(20, 20, 20)' : 'rgb(31, 41, 55)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 65, 81, 0.5)';

  const getIcon = () => {
    const iconClass = 'w-6 h-6';
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

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all"
          style={{ backgroundColor: bgMain, border: `1px solid ${borderColor}` }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec icône */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-full" style={{ backgroundColor: getIconBg() }}>
                {getIcon()}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: textMuted }}>
                  {description}
                </p>
              </div>
            </div>
          </div>

          {/* Footer avec boutons */}
          <div className="px-6 pb-6">
            <div className="flex gap-3 justify-end">
              {showCancel && (
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg transition-colors font-medium text-sm"
                  style={{
                    backgroundColor: bgCard,
                    color: textMuted,
                  }}
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={handleConfirm}
                className="px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90 font-medium text-sm"
                style={{
                  backgroundColor: themeColors.primary,
                  color: 'white',
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
