import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ChartCardProps {
  icon: LucideIcon;
  title: string;
  data: Record<string, number>;
  type: 'pie' | 'bar';
  color: string;
  isTerminalTheme: boolean;
}

export function ChartCard({ icon: Icon, title, data, type, color, isTerminalTheme }: ChartCardProps) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  const bgCard = isTerminalTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(31, 41, 55, 0.5)';
  const bgIcon = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : `${color}20`;
  const bgBar = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgb(55, 65, 81)';
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
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: bgIcon }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <h3 className="text-sm font-medium" style={{ color: textMuted }}>{title}</h3>
      </div>

      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span style={{ color: textMuted }}>{key}</span>
              <span className="font-medium" style={{ color: textColor }}>{value}</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: bgBar }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(value / total) * 100}%`,
                  backgroundColor: color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}