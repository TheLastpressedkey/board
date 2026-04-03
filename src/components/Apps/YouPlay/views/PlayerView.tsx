import React, { useState, useEffect } from 'react';
import { ArrowLeft, List, X } from 'lucide-react';
import { Playlist, Video, youtubePlaylistStorage } from '../../../../services/youtubePlaylistStorage';
import { VideoPlayer } from '../../YouTubePlayer/VideoPlayer';
import { VideoControls } from '../../YouTubePlayer/VideoControls';
import { VideoList } from '../components/VideoList';

interface PlayerViewProps {
  playlist: Playlist;
  onBack: () => void;
  themeColor: string;
  currentIndex: number;
  isPlaying: boolean;
  onCurrentIndexChange: (index: number) => void;
  onIsPlayingChange: (playing: boolean) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  playMode: 'sequential' | 'loop' | 'loop-one' | 'shuffle';
  onPlayModeChange: (mode: 'sequential' | 'loop' | 'loop-one' | 'shuffle') => void;
  currentTime: number;
  duration: number;
  onTimeUpdate: (time: number, duration: number) => void;
}

export function PlayerView({
  playlist: initialPlaylist,
  onBack,
  themeColor,
  currentIndex,
  isPlaying,
  onCurrentIndexChange,
  onIsPlayingChange,
  volume,
  onVolumeChange,
  playMode,
  onPlayModeChange,
  currentTime,
  duration,
  onTimeUpdate
}: PlayerViewProps) {
  const [playlist, setPlaylist] = useState<Playlist>(initialPlaylist);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // Increment play count when loading playlist
    youtubePlaylistStorage.incrementPlayCount(playlist.id);
  }, [playlist.id]);

  const currentVideo = playlist.videos[currentIndex];

  // Check if current video is liked
  useEffect(() => {
    if (!currentVideo) return;

    youtubePlaylistStorage.isVideoLiked(currentVideo.id).then(setIsLiked);
  }, [currentVideo?.id]);

  const handleLike = async () => {
    if (!currentVideo) return;

    if (isLiked) {
      await youtubePlaylistStorage.unlikeVideo(currentVideo.id);
      setIsLiked(false);
    } else {
      await youtubePlaylistStorage.likeVideo(currentVideo);
      setIsLiked(true);
    }
  };

  const handleVideoEnd = () => {
    switch (playMode) {
      case 'loop-one':
        onIsPlayingChange(true);
        return;
      case 'loop':
        const nextIndex = (currentIndex + 1) % playlist.videos.length;
        onCurrentIndexChange(nextIndex);
        onIsPlayingChange(true);
        break;
      case 'shuffle':
        const randomIndex = Math.floor(Math.random() * playlist.videos.length);
        onCurrentIndexChange(randomIndex);
        onIsPlayingChange(true);
        break;
      case 'sequential':
        if (currentIndex < playlist.videos.length - 1) {
          onCurrentIndexChange(currentIndex + 1);
          onIsPlayingChange(true);
        } else {
          onIsPlayingChange(false);
        }
        break;
    }
  };

  const handleNext = () => {
    const nextIndex = playMode === 'shuffle'
      ? Math.floor(Math.random() * playlist.videos.length)
      : (currentIndex + 1) % playlist.videos.length;

    onCurrentIndexChange(nextIndex);
    onIsPlayingChange(true);
  };

  const handlePrevious = () => {
    const prevIndex = playMode === 'shuffle'
      ? Math.floor(Math.random() * playlist.videos.length)
      : (currentIndex - 1 + playlist.videos.length) % playlist.videos.length;

    onCurrentIndexChange(prevIndex);
    onIsPlayingChange(true);
  };

  const handleVideoSelect = (index: number) => {
    onCurrentIndexChange(index);
    onIsPlayingChange(true);
    setShowPlaylist(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative pointer-events-none">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[160] bg-gradient-to-b from-black/80 to-transparent p-4 pointer-events-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <div className="text-left">
              <p className="text-xs text-white/50">Now Playing</p>
              <p className="font-semibold">{playlist.name}</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">
              {currentIndex + 1} / {playlist.videos.length}
            </span>
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <List className="w-5 h-5" style={{ color: showPlaylist ? themeColor : 'rgba(255,255,255,0.7)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Controls Overlay - VideoPlayer is rendered in YouPlay.tsx */}
      <div
        className="absolute inset-0 flex items-end pointer-events-auto z-[160]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {currentVideo && (
          <VideoControls
            isPlaying={isPlaying}
            onPlayPause={() => onIsPlayingChange(!isPlaying)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            playMode={playMode}
            onPlayModeChange={onPlayModeChange}
            volume={volume}
            onVolumeChange={onVolumeChange}
            currentVideo={currentVideo}
            hasNext={playlist.videos.length > 1}
            hasPrevious={playlist.videos.length > 1}
            isVisible={isHovering}
            currentTime={currentTime}
            duration={duration}
            immersiveMode={true}
            onLike={handleLike}
            isLiked={isLiked}
          />
        )}
      </div>

      {/* Playlist Sidebar */}
      {showPlaylist && (
        <div className="absolute right-0 top-0 bottom-0 w-80 md:w-96 bg-gray-900/98 backdrop-blur-xl z-[170] flex flex-col border-l border-white/10 shadow-2xl pointer-events-auto">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-lg">{playlist.name}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{playlist.videos.length} videos</p>
            </div>
            <button
              onClick={() => setShowPlaylist(false)}
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto card-scrollbar p-2">
            <VideoList
              videos={playlist.videos}
              currentVideoIndex={currentIndex}
              onVideoSelect={handleVideoSelect}
              themeColor={themeColor}
            />
          </div>
        </div>
      )}
    </div>
  );
}
