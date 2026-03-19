import React from 'react';
import { X } from 'lucide-react';

interface CloseButtonProps {
  onClose: () => void;
  color?: string;
  className?: string;
}

export function CloseButton({ onClose, color = 'currentColor', className = '' }: CloseButtonProps) {
  return (
    <button
      onClick={onClose}
      onMouseDown={(e) => e.stopPropagation()}
      className={`p-1 hover:bg-white/10 rounded transition-colors ${className}`}
      title="Close"
    >
      <X className="w-5 h-5" style={{ color }} />
    </button>
  );
}
