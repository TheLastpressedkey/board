import React from 'react';
import { Play, Settings, Trash2, Copy, Music, GraduationCap, Film, Trophy } from 'lucide-react';
import { Playlist } from '../../../../services/youtubePlaylistStorage';
import { LayoutSize } from '../hooks/useContainerSize';

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: (playlist: Playlist) => void;
  onEdit: (playlist: Playlist) => void;
  onDelete: (playlist: Playlist) => void;
  onDuplicate: (playlist: Playlist) => void;
  layoutSize: LayoutSize;
  themeColor: string;
}

const CATEGORY_ICONS = {
  music: Music,
  education: GraduationCap,
  entertainment: Film,
  sports: Trophy,
  other: Music
};

export function PlaylistCard({ playlist, onPlay, onEdit, onDelete, onDuplicate, layoutSize, themeColor }: PlaylistCardProps) {
  const Icon = CATEGORY_ICONS[playlist.category];

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Adaptive sizing - more compact
  const iconContainerSize = layoutSize === 'compact' ? 'w-12 h-12' : 'w-14 h-14';
  const iconSize = layoutSize === 'compact' ? 'w-6 h-6' : 'w-7 h-7';
  const playButtonSize = layoutSize === 'compact' ? 'w-8 h-8' : 'w-10 h-10';
  const playIconSize = layoutSize === 'compact' ? 'w-4 h-4' : 'w-5 h-5';
  const padding = layoutSize === 'compact' ? 'p-2' : layoutSize === 'normal' ? 'p-2.5' : 'p-3';
  const titleSize = layoutSize === 'compact' ? 'text-xs' : 'text-sm';
  const descriptionSize = 'text-xs';
  const badgePadding = 'px-1.5 py-0.5';
  const badgePosition = 'top-1.5 left-1.5';
  const actionIconSize = 'w-3 h-3';

  return (
    <div
      onClick={() => onPlay(playlist)}
      className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.03] cursor-pointer bg-white/5 backdrop-blur-sm border border-white/5"
      style={{
        boxShadow: `0 2px 8px ${themeColor}08`
      }}
    >
      {/* Thumbnail or Icon */}
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
        {playlist.thumbnail ? (
          <>
            <img
              src={playlist.thumbnail}
              alt={playlist.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className={`${iconContainerSize} rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110`}
              style={{ backgroundColor: `${themeColor}15` }}
            >
              <Icon className={`${iconSize} transition-colors duration-200`} style={{ color: themeColor }} />
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className={`${playButtonSize} bg-white/95 rounded-full shadow-lg flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-200`}>
            <Play className={`${playIconSize} ml-0.5`} style={{ color: themeColor }} fill="currentColor" />
          </div>
        </div>

        {/* Category Badge */}
        <div
          className={`absolute ${badgePosition} ${badgePadding} rounded text-[9px] font-semibold backdrop-blur-md transition-all duration-200 uppercase tracking-wide`}
          style={{
            backgroundColor: `${themeColor}80`,
            color: 'white'
          }}
        >
          {playlist.category}
        </div>
      </div>

      {/* Info */}
      <div className={padding}>
        <h3 className={`text-white/90 font-semibold ${titleSize} truncate mb-1 leading-tight`}>{playlist.name}</h3>

        <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/40">
          <span>{playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Action Buttons - On hover */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(playlist);
            }}
            className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors duration-200 cursor-pointer"
            title="Edit"
          >
            <Settings className={actionIconSize} style={{ color: themeColor }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(playlist);
            }}
            className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-red-500/40 transition-colors duration-200 cursor-pointer"
            title="Delete"
          >
            <Trash2 className={`${actionIconSize} text-red-400`} />
          </button>
        </div>
      </div>
    </div>
  );
}
