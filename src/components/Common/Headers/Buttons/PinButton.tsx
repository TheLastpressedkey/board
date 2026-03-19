import React from 'react';
import { Pin } from 'lucide-react';

interface PinButtonProps {
  onTogglePin?: () => void;
  isPinned?: boolean;
  color?: string;
  className?: string;
}

export function PinButton({ onTogglePin, isPinned = false, color = 'currentColor', className = '' }: PinButtonProps) {
  if (!onTogglePin) return null;

  return (
    <button
      onClick={onTogglePin}
      onMouseDown={(e) => e.stopPropagation()}
      className={`p-1 hover:bg-white/10 rounded transition-colors ${className}`}
      title={isPinned ? 'Unpin card' : 'Pin card'}
    >
      <Pin
        className="w-5 h-5"
        style={{
          color,
          fill: isPinned ? color : 'none'
        }}
      />
    </button>
  );
}
