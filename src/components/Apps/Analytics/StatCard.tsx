import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  color: string;
}

export function StatCard({ icon: Icon, title, value, color }: StatCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}