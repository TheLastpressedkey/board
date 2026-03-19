import React from 'react';
import { GripHorizontal } from 'lucide-react';

interface DragHandleProps {
  onDragStart?: (e: React.MouseEvent<HTMLDivElement>) => void;
  color?: string;
  className?: string;
}

export function DragHandle({ onDragStart, color = 'currentColor', className = '' }: DragHandleProps) {
  if (!onDragStart) return null;

  return (
    <div
      className={`cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded transition-colors ${className}`}
      onMouseDown={onDragStart}
      title="Drag to move"
    >
      <GripHorizontal className="w-5 h-5" style={{ color }} />
    </div>
  );
}
