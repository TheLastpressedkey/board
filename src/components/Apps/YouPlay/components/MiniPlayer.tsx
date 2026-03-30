import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Maximize2, X } from 'lucide-react';
import { Playlist } from '../../../../services/youtubePlaylistStorage';

interface MiniPlayerProps {
  playlist: Playlist;
  currentIndex: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onExpand: () => void;
  onClose: () => void;
  themeColor: string;
}

export function MiniPlayer({
  playlist,
  currentIndex,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onExpand,
  onClose,
  themeColor
}: MiniPlayerProps) {
  const currentVideo = playlist.videos[currentIndex];

  if (!currentVideo) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900/98 backdrop-blur-xl border-t border-white/10 z-40 flex items-center px-4 gap-4 animate-in slide-in-from-bottom duration-300"
      style={{ boxShadow: `0 -4px 20px ${themeColor}20` }}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0">
        <img
          src={currentVideo.thumbnail || `https://img.youtube.com/vi/${currentVideo.id}/default.jpg`}
          alt={currentVideo.title}
          className="w-14 h-14 rounded-lg object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-semibold text-sm truncate">{currentVideo.title}</h4>
        <p className="text-white/60 text-xs truncate">{playlist.name}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onPrevious}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title="Previous"
        >
          <SkipBack className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={onPlayPause}
          className="p-3 rounded-full transition-all duration-200 cursor-pointer hover:scale-110"
          style={{
            backgroundColor: themeColor,
            boxShadow: `0 4px 12px ${themeColor}40`
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" fill="white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          )}
        </button>

        <button
          onClick={onNext}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title="Next"
        >
          <SkipForward className="w-5 h-5 text-white" />
        </button>

        <div className="w-px h-8 bg-white/10 mx-2" />

        <button
          onClick={onExpand}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title="Expand player"
        >
          <Maximize2 className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={onClose}
          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
          title="Stop playback"
        >
          <X className="w-5 h-5 text-white/70 hover:text-red-400" />
        </button>
      </div>
    </div>
  );
}
