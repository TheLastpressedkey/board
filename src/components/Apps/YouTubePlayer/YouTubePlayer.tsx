import React, { useState, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { PlaylistManager } from './PlaylistManager';
import { VideoControls } from './VideoControls';
import { X, GripHorizontal, List, Settings, Plus } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useYouTubePlayer } from './useYouTubePlayer';
import { getYoutubeVideoId, fetchYouTubeTitle } from '../../../utils/youtubeUtils';

export interface Video {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  duration?: string;
}

interface YouTubePlayerProps {
  onClose: () => void;
  metadata?: any;
  onDataChange?: (data: any) => void;
  onDragStart?: (e: React.MouseEvent) => void;
  cardId?: string;
}

export function YouTubePlayer({ onClose, metadata, onDataChange, onDragStart, cardId }: YouTubePlayerProps) {
  const { themeColors } = useTheme();
  const {
    playlist,
    currentIndex,
    playMode,
    volume,
    setPlaylist,
    setCurrentIndex,
    setPlayMode,
    setVolume
  } = useYouTubePlayer(
    metadata?.playlist,
    metadata?.currentIndex,
    metadata?.playMode,
    metadata?.volume
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddUrl, setQuickAddUrl] = useState('');

  const addVideo = async (url: string, title?: string) => {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return;

    // Si pas de titre fourni, récupérer depuis YouTube
    let videoTitle = title;
    if (!videoTitle) {
      videoTitle = await fetchYouTubeTitle(url);
    }

    const newVideo: Video = {
      id: videoId,
      url,
      title: videoTitle,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    };

    const newPlaylist = [...playlist, newVideo];
    setPlaylist(newPlaylist);

    if (onDataChange) {
      onDataChange({
        playlist: newPlaylist,
        currentIndex,
        playMode,
        volume
      });
    }

    // Si c'est la première vidéo, la lire automatiquement
    if (playlist.length === 0) {
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  };

  const handleQuickAdd = async () => {
    if (quickAddUrl.trim()) {
      await addVideo(quickAddUrl.trim());
      setQuickAddUrl('');
      setShowQuickAdd(false);
    }
  };

  const removeVideo = (index: number) => {
    const newPlaylist = playlist.filter((_, i) => i !== index);
    const newIndex = currentIndex >= newPlaylist.length ? Math.max(0, newPlaylist.length - 1) : currentIndex;

    setPlaylist(newPlaylist);
    setCurrentIndex(newIndex);

    if (onDataChange) {
      onDataChange({
        playlist: newPlaylist,
        currentIndex: newIndex,
        playMode,
        volume
      });
    }
  };

  const moveVideo = (fromIndex: number, toIndex: number) => {
    const newPlaylist = [...playlist];
    const [removed] = newPlaylist.splice(fromIndex, 1);
    newPlaylist.splice(toIndex, 0, removed);
    setPlaylist(newPlaylist);

    // Ajuster currentIndex si nécessaire
    let newIndex = currentIndex;
    if (currentIndex === fromIndex) {
      newIndex = toIndex;
      setCurrentIndex(toIndex);
    } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
      newIndex = currentIndex - 1;
      setCurrentIndex(currentIndex - 1);
    } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
      newIndex = currentIndex + 1;
      setCurrentIndex(currentIndex + 1);
    }

    if (onDataChange) {
      onDataChange({
        playlist: newPlaylist,
        currentIndex: newIndex,
        playMode,
        volume
      });
    }
  };

  const updateVideoTitle = (index: number, newTitle: string) => {
    const newPlaylist = [...playlist];
    newPlaylist[index] = { ...newPlaylist[index], title: newTitle };
    setPlaylist(newPlaylist);

    if (onDataChange) {
      onDataChange({
        playlist: newPlaylist,
        currentIndex,
        playMode,
        volume
      });
    }
  };

  const handleVideoEnd = () => {
    let newIndex = currentIndex;

    switch (playMode) {
      case 'loop-one':
        setIsPlaying(true);
        return;
      case 'loop':
        newIndex = (currentIndex + 1) % playlist.length;
        setCurrentIndex(newIndex);
        setIsPlaying(true);
        break;
      case 'shuffle':
        newIndex = Math.floor(Math.random() * playlist.length);
        setCurrentIndex(newIndex);
        setIsPlaying(true);
        break;
      case 'sequential':
        if (currentIndex < playlist.length - 1) {
          newIndex = currentIndex + 1;
          setCurrentIndex(newIndex);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
          return;
        }
        break;
    }

    if (onDataChange) {
      onDataChange({
        playlist,
        currentIndex: newIndex,
        playMode,
        volume
      });
    }
  };

  const handleNext = () => {
    const newIndex = playMode === 'shuffle'
      ? Math.floor(Math.random() * playlist.length)
      : (currentIndex + 1) % playlist.length;

    setCurrentIndex(newIndex);
    setIsPlaying(true);

    if (onDataChange) {
      onDataChange({
        playlist,
        currentIndex: newIndex,
        playMode,
        volume
      });
    }
  };

  const handlePrevious = () => {
    const newIndex = playMode === 'shuffle'
      ? Math.floor(Math.random() * playlist.length)
      : (currentIndex - 1 + playlist.length) % playlist.length;

    setCurrentIndex(newIndex);
    setIsPlaying(true);

    if (onDataChange) {
      onDataChange({
        playlist,
        currentIndex: newIndex,
        playMode,
        volume
      });
    }
  };

  const handlePlayModeChange = (newMode: 'sequential' | 'loop' | 'loop-one' | 'shuffle') => {
    setPlayMode(newMode);
    if (onDataChange) {
      onDataChange({
        playlist,
        currentIndex,
        playMode: newMode,
        volume
      });
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (onDataChange) {
      onDataChange({
        playlist,
        currentIndex,
        playMode,
        volume: newVolume
      });
    }
  };

  const handleVideoSelect = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
    if (onDataChange) {
      onDataChange({
        playlist,
        currentIndex: index,
        playMode,
        volume
      });
    }
  };

  const currentVideo = playlist[currentIndex];

  return (
    <div className="h-full flex flex-col bg-black relative overflow-hidden rounded-lg">
      {/* Top Bar - Minimal */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2 bg-gradient-to-b from-black/80 to-transparent">
        <div
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-white/10"
          onMouseDown={onDragStart}
        >
          <GripHorizontal className="w-5 h-5 text-white/70" />
        </div>
        <div className="flex items-center gap-2">
          {playlist.length > 0 && (
            <>
              <button
                onClick={() => setShowQuickAdd(true)}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Add video"
              >
                <Plus className="w-5 h-5 text-white/70" />
              </button>
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                style={showPlaylist ? { color: themeColors.primary } : {}}
                title="Playlist"
              >
                <List className="w-5 h-5" style={{ color: showPlaylist ? themeColors.primary : 'rgba(255,255,255,0.7)' }} />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player - Fullscreen */}
        <div className="flex-1 flex flex-col">
          {currentVideo ? (
            <>
              <VideoPlayer
                videoId={currentVideo.id}
                isPlaying={isPlaying}
                volume={volume}
                onEnded={handleVideoEnd}
                onPlayStateChange={setIsPlaying}
                playMode={playMode}
              />
              <VideoControls
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onNext={handleNext}
                onPrevious={handlePrevious}
                playMode={playMode}
                onPlayModeChange={handlePlayModeChange}
                volume={volume}
                onVolumeChange={handleVolumeChange}
                currentVideo={currentVideo}
                hasNext={playlist.length > 1}
                hasPrevious={playlist.length > 1}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/50">
              <button
                onClick={() => setShowQuickAdd(true)}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-6 sm:p-8 rounded-full transition-all hover:scale-110"
                style={{ backgroundColor: `${themeColors.primary}40` }}
                title="Add your first video"
              >
                <Plus className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: themeColors.primary }} />
              </button>
            </div>
          )}
        </div>

        {/* Playlist Sidebar - Toggle */}
        {showPlaylist && playlist.length > 0 && (
          <PlaylistManager
            playlist={playlist}
            currentIndex={currentIndex}
            onVideoSelect={handleVideoSelect}
            onAddVideo={addVideo}
            onRemoveVideo={removeVideo}
            onMoveVideo={moveVideo}
            onUpdateTitle={updateVideoTitle}
          />
        )}
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 rounded-lg"
            onClick={() => setShowQuickAdd(false)}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md rounded-lg shadow-2xl z-50 p-4 sm:p-6"
            style={{ backgroundColor: themeColors.menuBg }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Add YouTube Video</h3>
            <input
              type="text"
              placeholder="Paste YouTube URL here..."
              value={quickAddUrl}
              onChange={(e) => setQuickAddUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 text-white text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 mb-3 sm:mb-4"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowQuickAdd(false)}
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-700 text-white text-sm sm:text-base rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickAdd}
                className="flex-1 px-3 sm:px-4 py-2 text-white text-sm sm:text-base rounded-lg transition-colors"
                style={{ backgroundColor: themeColors.primary }}
              >
                Add
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
