import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { PlaylistItem } from './PlaylistItem';
import { Video } from './YouTubePlayer';
import { useTheme } from '../../../contexts/ThemeContext';

interface PlaylistManagerProps {
  playlist: Video[];
  currentIndex: number;
  onVideoSelect: (index: number) => void;
  onAddVideo: (url: string, title?: string) => void;
  onRemoveVideo: (index: number) => void;
  onMoveVideo: (fromIndex: number, toIndex: number) => void;
  onUpdateTitle: (index: number, title: string) => void;
}

export function PlaylistManager({
  playlist,
  currentIndex,
  onVideoSelect,
  onAddVideo,
  onRemoveVideo,
  onMoveVideo,
  onUpdateTitle
}: PlaylistManagerProps) {
  const { themeColors } = useTheme();
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddVideo = () => {
    if (newVideoUrl.trim()) {
      onAddVideo(newVideoUrl.trim());
      setNewVideoUrl('');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onMoveVideo(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const filteredPlaylist = playlist.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="w-64 sm:w-72 md:w-80 flex flex-col border-l"
      style={{ borderColor: `${themeColors.primary}40`, backgroundColor: themeColors.menuBg }}
    >
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: `${themeColors.primary}40` }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search playlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-700/50 text-white text-sm rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Add Video Form */}
      <div className="p-3 border-b" style={{ borderColor: `${themeColors.primary}40` }}>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste YouTube URL..."
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddVideo()}
            className="flex-1 px-3 py-2 bg-gray-700/50 text-white text-sm rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
          />
          <button
            onClick={handleAddVideo}
            className="px-3 py-2 rounded-lg text-white transition-colors"
            style={{ backgroundColor: themeColors.primary }}
            title="Add"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-y-auto card-scrollbar">
        {filteredPlaylist.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchQuery ? 'No videos match your search' : 'No videos in playlist'}
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredPlaylist.map((video, index) => {
              const originalIndex = playlist.indexOf(video);
              return (
                <PlaylistItem
                  key={video.id + originalIndex}
                  video={video}
                  index={originalIndex}
                  isActive={originalIndex === currentIndex}
                  onClick={() => onVideoSelect(originalIndex)}
                  onRemove={() => onRemoveVideo(originalIndex)}
                  onUpdateTitle={(title) => onUpdateTitle(originalIndex, title)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedIndex === originalIndex}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
