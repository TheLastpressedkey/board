import React from 'react';
import { Sparkles } from 'lucide-react';
import { Playlist } from '../../../../services/youtubePlaylistStorage';
import { PlaylistCard } from './PlaylistCard';
import { LayoutSize } from '../hooks/useContainerSize';

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistSelect: (playlist: Playlist) => void;
  onPlaylistEdit: (playlist: Playlist) => void;
  onPlaylistDelete: (playlist: Playlist) => void;
  onPlaylistDuplicate: (playlist: Playlist) => void;
  onCreateNew: () => void;
  themeColor: string;
  layoutSize: LayoutSize;
}

export function PlaylistGrid({
  playlists,
  onPlaylistSelect,
  onPlaylistEdit,
  onPlaylistDelete,
  onPlaylistDuplicate,
  onCreateNew,
  themeColor,
  layoutSize
}: PlaylistGridProps) {
  // Adaptive sizing based on layout
  const iconSize = layoutSize === 'compact' ? 'w-12 h-12' : layoutSize === 'normal' ? 'w-16 h-16' : 'w-20 h-20';
  const containerSize = layoutSize === 'compact' ? 'w-24 h-24' : layoutSize === 'normal' ? 'w-28 h-28' : 'w-32 h-32';
  const titleSize = layoutSize === 'compact' ? 'text-xl' : layoutSize === 'normal' ? 'text-2xl' : 'text-3xl';
  const textSize = layoutSize === 'compact' ? 'text-sm' : 'text-base';
  const buttonPadding = layoutSize === 'compact' ? 'px-6 py-3' : 'px-8 py-4';
  const spacing = layoutSize === 'compact' ? 'mb-8' : layoutSize === 'normal' ? 'mb-10' : 'mb-12';
  const gridMinWidth = layoutSize === 'compact' ? '200px' : '280px';
  const gridGap = layoutSize === 'compact' ? 'gap-3' : layoutSize === 'normal' ? 'gap-4' : 'gap-6';

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4">
        <div className="text-center max-w-md">
          <div className={`relative ${spacing}`}>
            <div
              className={`${containerSize} rounded-full mx-auto flex items-center justify-center`}
              style={{
                background: `linear-gradient(135deg, ${themeColor}15 0%, ${themeColor}05 100%)`
              }}
            >
              <Sparkles className={iconSize} style={{ color: themeColor }} />
            </div>
            <div
              className="absolute inset-0 rounded-full blur-3xl animate-pulse"
              style={{ backgroundColor: `${themeColor}20` }}
            />
          </div>

          <h3 className={`${titleSize} font-bold text-white/90 mb-3`}>
            Create Your First Playlist
          </h3>
          <p className={`${textSize} text-white/60 ${spacing} leading-relaxed`}>
            Start building your YouTube collection.{layoutSize !== 'compact' && <br />}
            Organize, discover, and enjoy your favorite videos.
          </p>

          <button
            onClick={onCreateNew}
            className={`${buttonPadding} text-white rounded-2xl font-semibold ${textSize} transition-all duration-200 hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer`}
            style={{
              background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`,
              boxShadow: `0 8px 24px ${themeColor}40`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 12px 32px ${themeColor}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 8px 24px ${themeColor}40`;
            }}
          >
            <span className="text-xl">+</span>
            Create Playlist
          </button>
        </div>
      </div>
    );
  }

  const cardWidth = layoutSize === 'compact' ? '280px' : layoutSize === 'normal' ? '300px' : '320px';

  return (
    <div className={`flex flex-wrap ${gridGap} min-h-full`}>
      {playlists.map((playlist) => (
        <div key={playlist.id} style={{ width: cardWidth, flexShrink: 0 }}>
          <PlaylistCard
            playlist={playlist}
            onPlay={onPlaylistSelect}
            onEdit={onPlaylistEdit}
            onDelete={onPlaylistDelete}
            onDuplicate={onPlaylistDuplicate}
            layoutSize={layoutSize}
          />
        </div>
      ))}
    </div>
  );
}
