import React, { useEffect, useRef } from 'react';
import { useGlobalMusicPlayer } from '../../contexts/GlobalMusicPlayerContext';
import { VideoPlayer } from '../Apps/YouTubePlayer/VideoPlayer';

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
    handleTimeUpdate
  } = useGlobalMusicPlayer();

  const containerRef = useRef<HTMLDivElement>(null);
  const currentVideo = activePlaylist?.videos[currentIndex];

  // Repositionner le container en fonction du displayMode
  useEffect(() => {
    if (!containerRef.current) return;

    if (displayMode === 'fullscreen') {
      // Trouver le container YouPlay
      const youplayContainer = document.getElementById('youplay-video-container');
      if (youplayContainer) {
        const rect = youplayContainer.getBoundingClientRect();

        // Positionner le player pour couvrir exactement le container YouPlay
        containerRef.current.style.position = 'fixed';
        containerRef.current.style.top = `${rect.top}px`;
        containerRef.current.style.left = `${rect.left}px`;
        containerRef.current.style.width = `${rect.width}px`;
        containerRef.current.style.height = `${rect.height}px`;
        containerRef.current.style.zIndex = '10';
        containerRef.current.style.opacity = '1';
        containerRef.current.style.pointerEvents = 'none'; // Les contrôles sont gérés par PlayerView
      }
    } else {
      // Mode caché
      containerRef.current.style.position = 'fixed';
      containerRef.current.style.bottom = '0';
      containerRef.current.style.left = '0';
      containerRef.current.style.width = '1px';
      containerRef.current.style.height = '1px';
      containerRef.current.style.zIndex = '-999';
      containerRef.current.style.opacity = '0';
      containerRef.current.style.pointerEvents = 'none';
    }

    // Mettre à jour la position si la fenêtre est redimensionnée
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
      // Vérifier la position régulièrement au cas où la carte bouge
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
    <div ref={containerRef} className="fixed bottom-0 left-0" style={{ width: '1px', height: '1px', zIndex: -999, opacity: 0, pointerEvents: 'none' }}>
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
  );
}
