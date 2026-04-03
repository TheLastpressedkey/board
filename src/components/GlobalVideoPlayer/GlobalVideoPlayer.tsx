import React from 'react';
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

  const currentVideo = activePlaylist?.videos[currentIndex];

  if (!activePlaylist || !currentVideo) {
    return null;
  }

  // Le player est caché en z-index négatif, mais reste dans le DOM pour continuer à jouer
  // YouPlay affichera son propre conteneur par-dessus en mode fullscreen
  return (
    <div className="fixed bottom-0 left-0" style={{ width: '1px', height: '1px', zIndex: -999, opacity: 0, pointerEvents: 'none' }}>
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
