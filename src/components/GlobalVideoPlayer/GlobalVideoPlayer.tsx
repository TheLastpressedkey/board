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

  // Hidden mode: invisible player for background playback
  // Fullscreen mode: fixed position covering the whole viewport
  const isHidden = displayMode === 'hidden';

  if (isHidden) {
    // Hidden background player
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-[200]"
        style={{ width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
      >
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

  // Fullscreen mode: fixed position covering viewport behind YouPlay app
  return (
    <div className="fixed inset-0 z-[150] bg-black" style={{ pointerEvents: 'none' }}>
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
