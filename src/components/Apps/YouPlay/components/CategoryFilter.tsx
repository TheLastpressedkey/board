import React from 'react';
import { Music, GraduationCap, Film, Trophy, MoreHorizontal, Grid } from 'lucide-react';
import { Playlist } from '../../../../services/youtubePlaylistStorage';

interface CategoryFilterProps {
  selected: Playlist['category'] | 'all';
  onSelect: (category: Playlist['category'] | 'all') => void;
  counts?: Record<Playlist['category'] | 'all', number>;
  themeColor: string;
}

const CATEGORIES: Array<{ value: Playlist['category'] | 'all'; label: string; icon: React.ElementType }> = [
  { value: 'all', label: 'All', icon: Grid },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'entertainment', label: 'Entertainment', icon: Film },
  { value: 'sports', label: 'Sports', icon: Trophy },
  { value: 'other', label: 'Other', icon: MoreHorizontal }
];

export function CategoryFilter({ selected, onSelect, counts, themeColor }: CategoryFilterProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isSelected = selected === category.value;
        const count = counts?.[category.value] || 0;

        return (
          <button
            key={category.value}
            onClick={() => onSelect(category.value)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl whitespace-nowrap transition-all duration-200 font-semibold cursor-pointer ${
              isSelected ? 'text-white scale-105' : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
            style={isSelected ? {
              background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`,
              boxShadow: `0 4px 12px ${themeColor}40`
            } : {}}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{category.label}</span>
            {count > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                isSelected ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
