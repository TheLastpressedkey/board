import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  color: string;
  isTerminalTheme: boolean;
}

export function StatCard({ icon: Icon, title, value, color, isTerminalTheme }: StatCardProps) {
  const bgCard = isTerminalTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(31, 41, 55, 0.5)';
  const bgIcon = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : `${color}20`;
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'transparent';

  return (
    <div
      className="rounded-lg p-4"
      style={{
        backgroundColor: bgCard,
        border: isTerminalTheme ? `1px solid ${borderColor}` : 'none'
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: bgIcon }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <h3 className="text-sm font-medium" style={{ color: textMuted }}>{title}</h3>
      </div>
      <div className="text-2xl font-semibold" style={{ color: textColor }}>{value}</div>
    </div>
  );
}