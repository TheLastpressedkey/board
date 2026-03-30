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
}

const CATEGORY_ICONS = {
  music: Music,
  education: GraduationCap,
  entertainment: Film,
  sports: Trophy,
  other: Music
};

export function PlaylistCard({ playlist, onPlay, onEdit, onDelete, onDuplicate, layoutSize }: PlaylistCardProps) {
  const Icon = CATEGORY_ICONS[playlist.category];

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Adaptive sizing
  const iconContainerSize = layoutSize === 'compact' ? 'w-16 h-16' : 'w-20 h-20';
  const iconSize = layoutSize === 'compact' ? 'w-8 h-8' : 'w-10 h-10';
  const playButtonSize = layoutSize === 'compact' ? 'w-12 h-12' : 'w-16 h-16';
  const playIconSize = layoutSize === 'compact' ? 'w-5 h-5' : 'w-7 h-7';
  const padding = layoutSize === 'compact' ? 'p-3' : layoutSize === 'normal' ? 'p-4' : 'p-5';
  const titleSize = layoutSize === 'compact' ? 'text-base' : 'text-lg';
  const descriptionSize = layoutSize === 'compact' ? 'text-xs' : 'text-sm';
  const badgePadding = layoutSize === 'compact' ? 'px-2 py-1' : 'px-3 py-1.5';
  const badgePosition = layoutSize === 'compact' ? 'top-2 left-2' : 'top-3 left-3';
  const actionIconSize = layoutSize === 'compact' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div
      onClick={() => onPlay(playlist)}
      className="group relative rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white/10 backdrop-blur-sm"
      style={{
        boxShadow: `0 4px 16px ${playlist.color}10, 0 2px 8px ${playlist.color}08`
      }}
    >
      {/* Thumbnail or Icon */}
      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
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
              style={{ backgroundColor: `${playlist.color}15` }}
            >
              <Icon className={`${iconSize} transition-colors duration-200`} style={{ color: playlist.color }} />
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className={`${playButtonSize} bg-white rounded-full shadow-xl flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-200`}>
            <Play className={`${playIconSize} ml-1`} style={{ color: playlist.color }} fill="currentColor" />
          </div>
        </div>

        {/* Category Badge */}
        <div
          className={`absolute ${badgePosition} ${badgePadding} rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200`}
          style={{
            backgroundColor: `${playlist.color}95`,
            color: 'white',
            boxShadow: `0 2px 8px ${playlist.color}30`
          }}
        >
          {playlist.category}
        </div>
      </div>

      {/* Info */}
      <div className={padding}>
        <div className="flex items-start justify-between mb-2">
          <h3 className={`text-white/90 font-bold ${titleSize} truncate flex-1 leading-tight`}>{playlist.name}</h3>
        </div>

        {playlist.description && layoutSize !== 'compact' && (
          <p className={`text-white/60 ${descriptionSize} mb-4 line-clamp-2 leading-relaxed`}>{playlist.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-medium text-white/50">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: playlist.color }} />
              {playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''}
            </span>
            {playlist.totalDuration > 0 && layoutSize !== 'compact' && (
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: playlist.color }} />
                {formatDuration(playlist.totalDuration)}
              </span>
            )}
          </div>

          {/* Action Buttons - Progressive Disclosure */}
          {layoutSize !== 'compact' && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(playlist);
                }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                title="Edit"
              >
                <Settings className={actionIconSize} style={{ color: playlist.color }} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(playlist);
                }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                title="Duplicate"
              >
                <Copy className={actionIconSize} style={{ color: playlist.color }} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(playlist);
                }}
                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors duration-200 cursor-pointer"
                title="Delete"
              >
                <Trash2 className={`${actionIconSize} text-red-400`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Play Count Badge (if > 0) */}
      {playlist.playCount > 0 && layoutSize !== 'compact' && (
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold shadow-md" style={{ color: playlist.color }}>
          {playlist.playCount} play{playlist.playCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
