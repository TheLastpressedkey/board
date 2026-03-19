import React, { ReactNode } from 'react';
import { DragHandle } from './Buttons/DragHandle';
import { PinButton } from './Buttons/PinButton';
import { CloseButton } from './Buttons/CloseButton';

interface AppHeaderProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onTogglePin?: () => void;
  isPinned?: boolean;
  title?: string;
  customButtons?: ReactNode[];
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  className?: string;
}

export function AppHeader({
  onClose,
  onDragStart,
  onTogglePin,
  isPinned = false,
  title,
  customButtons = [],
  backgroundColor = 'transparent',
  borderColor = 'rgba(255, 255, 255, 0.1)',
  textColor = 'rgba(255, 255, 255, 0.7)',
  className = ''
}: AppHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between p-2 border-b ${className}`}
      style={{ backgroundColor, borderColor }}
    >
      <div className="flex items-center gap-2">
        <DragHandle onDragStart={onDragStart} color={textColor} />
        {title && (
          <h3 className="text-sm font-medium" style={{ color: textColor }}>
            {title}
          </h3>
        )}
      </div>

      <div className="flex items-center gap-1">
        {customButtons.map((button, index) => (
          <React.Fragment key={index}>{button}</React.Fragment>
        ))}
        <PinButton onTogglePin={onTogglePin} isPinned={isPinned} color={textColor} />
        <CloseButton onClose={onClose} color={textColor} />
      </div>
    </div>
  );
}
