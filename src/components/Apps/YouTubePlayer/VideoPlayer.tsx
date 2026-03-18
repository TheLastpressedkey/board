import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  isPlaying: boolean;
  volume: number;
  onEnded: () => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  playMode: 'sequential' | 'loop' | 'loop-one' | 'shuffle';
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPlayer({
  videoId,
  isPlaying,
  volume,
  onEnded,
  onPlayStateChange,
  playMode
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Charger l'API YouTube
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsReady(true);
      };
    } else {
      setIsReady(true);
    }
  }, []);

  // Initialiser le lecteur
  useEffect(() => {
    if (!isReady || !containerRef.current) return;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        loop: playMode === 'loop-one' ? 1 : 0,
        playlist: playMode === 'loop-one' ? videoId : undefined
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(volume);
          if (isPlaying) {
            event.target.playVideo();
          }
        },
        onStateChange: (event: any) => {
          // 0 = ended, 1 = playing, 2 = paused
          if (event.data === 0) {
            onEnded();
          } else if (event.data === 1) {
            onPlayStateChange(true);
          } else if (event.data === 2) {
            onPlayStateChange(false);
          }
        }
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [isReady, videoId]);

  // Gérer play/pause
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
    }
  }, [isPlaying]);

  // Gérer le volume
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      playerRef.current.setVolume(volume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }, [volume]);

  return (
    <div className="flex-1 bg-black">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
