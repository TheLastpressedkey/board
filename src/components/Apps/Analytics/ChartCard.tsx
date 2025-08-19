import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ChartCardProps {
  icon: LucideIcon;
  title: string;
  data: Record<string, number>;
  type: 'pie' | 'bar';
  color: string;
}

export function ChartCard({ icon: Icon, title, data, type, color }: ChartCardProps) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      </div>

      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{key}</span>
              <span className="text-white font-medium">{value}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
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