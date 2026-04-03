import React, { useEffect, useRef, useState } from 'react';
import { useGlobalMusicPlayer } from '../../contexts/GlobalMusicPlayerContext';
import { VideoPlayer } from '../Apps/YouTubePlayer/VideoPlayer';
import { VideoControls } from '../Apps/YouTubePlayer/VideoControls';
import { ArrowLeft, List, X } from 'lucide-react';
import { youtubePlaylistStorage } from '../../services/youtubePlaylistStorage';
import { VideoList } from '../Apps/YouPlay/components/VideoList';
import { useTheme } from '../../contexts/ThemeContext';

export function GlobalVideoPlayer() {
  const {
    activePlaylist,
    currentIndex,
    isPlaying,
    volume,
    playMode,
    initialSeekTime,
    displayMode,
    handleVideoEnd,
    setIsPlaying,
    setCurrentIndex,
    setVolume,
    setPlayMode,
    handleTimeUpdate,
    currentTime,
    duration,
    setDisplayMode
  } = useGlobalMusicPlayer();

  const containerRef = useRef<HTMLDivElement>(null);
  const currentVideo = activePlaylist?.videos[currentIndex];
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { themeColors } = useTheme();

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

  const handleNext = () => {
    if (!activePlaylist) return;
    const nextIndex = (currentIndex + 1) % activePlaylist.videos.length;
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!activePlaylist) return;
    const prevIndex = (currentIndex - 1 + activePlaylist.videos.length) % activePlaylist.videos.length;
    setCurrentIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleBackToLibrary = () => {
    setDisplayMode('hidden');
  };

  // Repositionner le container en fonction du displayMode
  useEffect(() => {
    if (!containerRef.current) return;

    if (displayMode === 'fullscreen') {
      const youplayContainer = document.getElementById('youplay-video-container');
      if (youplayContainer) {
        const rect = youplayContainer.getBoundingClientRect();
        containerRef.current.style.position = 'fixed';
        containerRef.current.style.top = `${rect.top}px`;
        containerRef.current.style.left = `${rect.left}px`;
        containerRef.current.style.width = `${rect.width}px`;
        containerRef.current.style.height = `${rect.height}px`;
        containerRef.current.style.zIndex = '50';
        containerRef.current.style.opacity = '1';
        containerRef.current.style.pointerEvents = 'auto';
      }
    } else {
      containerRef.current.style.position = 'fixed';
      containerRef.current.style.bottom = '0';
      containerRef.current.style.left = '0';
      containerRef.current.style.width = '1px';
      containerRef.current.style.height = '1px';
      containerRef.current.style.zIndex = '-999';
      containerRef.current.style.opacity = '0';
      containerRef.current.style.pointerEvents = 'none';
    }

    if (displayMode === 'fullscreen') {
      const updatePosition = () => {
        const youplayContainer = document.getElementById('youplay-video-container');
        if (youplayContainer && containerRef.current) {
          const rect = youplayContainer.getBoundingClientRect();
          containerRef.current.style.top = `${rect.top}px`;
          containerRef.current.style.left = `${rect.left}px`;
          containerRef.current.style.width = `${rect.width}px`;
          containerRef.current.style.height = `${rect.height}px`;
        }
      };

      window.addEventListener('resize', updatePosition);
      const interval = setInterval(updatePosition, 100);

      return () => {
        window.removeEventListener('resize', updatePosition);
        clearInterval(interval);
      };
    }
  }, [displayMode]);

  if (!activePlaylist || !currentVideo) {
    return null;
  }

  return (
    <div ref={containerRef} className="fixed bg-black">
      {/* Video Player */}
      <div className="absolute inset-0 z-0">
        <VideoPlayer
          videoId={currentVideo.id}
          isPlaying={isPlaying}
          volume={volume}
          onEnded={handleVideoEnd}
          onPlayStateChange={setIsPlaying}
          playMode={playMode}
          onTimeUpdate={handleTimeUpdate}
          onSeek={(time) => {}}
          initialSeekTime={initialSeekTime}
        />
      </div>

      {/* Controls Overlay (only in fullscreen mode) */}
      {displayMode === 'fullscreen' && (
        <>
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToLibrary}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-xs text-white/50">Now Playing</p>
                  <p className="font-semibold">{activePlaylist.name}</p>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-white/50 text-sm">
                  {currentIndex + 1} / {activePlaylist.videos.length}
                </span>
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <List className="w-5 h-5" style={{ color: showPlaylist ? themeColors.primary : 'rgba(255,255,255,0.7)' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Video Controls */}
          <div
            className="absolute inset-0 flex items-end z-20"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <VideoControls
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onNext={handleNext}
              onPrevious={handlePrevious}
              playMode={playMode}
              onPlayModeChange={setPlayMode}
              volume={volume}
              onVolumeChange={setVolume}
              currentVideo={currentVideo}
              hasNext={activePlaylist.videos.length > 1}
              hasPrevious={activePlaylist.videos.length > 1}
              isVisible={isHovering}
              currentTime={currentTime}
              duration={duration}
              immersiveMode={true}
              onLike={handleLike}
              isLiked={isLiked}
            />
          </div>

          {/* Playlist Sidebar */}
          {showPlaylist && (
            <div className="absolute right-0 top-0 bottom-0 w-80 md:w-96 bg-gray-900/98 backdrop-blur-xl z-30 flex flex-col border-l border-white/10 shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">{activePlaylist.name}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{activePlaylist.videos.length} videos</p>
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
                  videos={activePlaylist.videos}
                  currentVideoIndex={currentIndex}
                  onVideoSelect={(index) => {
                    setCurrentIndex(index);
                    setIsPlaying(true);
                    setShowPlaylist(false);
                  }}
                  themeColor={themeColors.primary}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
