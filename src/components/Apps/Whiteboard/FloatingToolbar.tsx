import React from 'react';
import {
  Lock,
  Hand,
  MousePointer2,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Image,
  Eraser,
  Zap
} from 'lucide-react';
import { Tool } from './types';

interface FloatingToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  isLocked: boolean;
  onLockToggle: () => void;
  bgColor: string;
  textColor: string;
  textMuted: string;
  borderColor: string;
  hoverBg: string;
  activeBg: string;
  primaryColor: string;
}

interface ToolItem {
  id: Tool | 'lock';
  icon: React.ElementType;
  label: string;
}

export function FloatingToolbar({
  currentTool,
  onToolChange,
  isLocked,
  onLockToggle,
  bgColor,
  textColor,
  textMuted,
  borderColor,
  hoverBg,
  activeBg,
  primaryColor
}: FloatingToolbarProps) {
  const tools: ToolItem[] = [
    { id: 'lock', icon: Lock, label: 'Lock' },
    { id: 'hand', icon: Hand, label: 'Hand' },
    { id: 'select', icon: MousePointer2, label: 'Selection' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'diamond', icon: Diamond, label: 'Diamond' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'pen', icon: Pencil, label: 'Pen' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'image', icon: Image, label: 'Image' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'laser', icon: Zap, label: 'Laser' }
  ];

  const handleToolClick = (toolId: Tool | 'lock') => {
    if (toolId === 'lock') {
      onLockToggle();
    } else {
      onToolChange(toolId as Tool);
    }
  };

  const isToolActive = (toolId: Tool | 'lock') => {
    if (toolId === 'lock') return isLocked;
    return currentTool === toolId;
  };

  return (
    <div
      className="flex items-center gap-1 px-2 py-2 rounded-xl shadow-2xl backdrop-blur-sm"
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`
      }}
    >
      {tools.map((tool, index) => {
        const Icon = tool.icon;
        const isActive = isToolActive(tool.id as any);

        return (
          <React.Fragment key={tool.id}>
            {/* Separator after Lock, Hand, and Image */}
            {(index === 1 || index === 2 || index === 10) && (
              <div
                className="mx-1"
                style={{
                  width: '1px',
                  height: '24px',
                  backgroundColor: borderColor
                }}
              />
            )}

            <button
              onClick={() => handleToolClick(tool.id as any)}
              className="p-2.5 rounded-lg transition-all relative group"
              style={{
                backgroundColor: isActive ? activeBg : 'transparent',
                color: isActive ? primaryColor : textMuted
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = hoverBg;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              title={tool.label}
            >
              <Icon className="w-5 h-5" />

              {/* Tooltip */}
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  color: textColor
                }}
              >
                {tool.label}
              </div>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
