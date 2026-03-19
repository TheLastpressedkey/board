import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  isPlaying: boolean;
  volume: number;
  onEnded: () => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  playMode: 'sequential' | 'loop' | 'loop-one' | 'shuffle';
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onSeek?: (time: number) => void;
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
  playMode,
  onTimeUpdate,
  onSeek
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const timeUpdateIntervalRef = useRef<number | null>(null);

  // Exposer la fonction seekTo pour permettre le contrôle externe
  useEffect(() => {
    if (!playerRef.current || !onSeek) return;

    const handleSeek = (time: number) => {
      try {
        playerRef.current.seekTo(time, true);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    };

    // Stocker la fonction dans window pour y accéder depuis VideoControls
    (window as any).youtubeSeek = handleSeek;

    return () => {
      delete (window as any).youtubeSeek;
    };
  }, [onSeek]);

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
        controls: 0,
        rel: 0,
        modestbranding: 1,
        loop: playMode === 'loop-one' ? 1 : 0,
        playlist: playMode === 'loop-one' ? videoId : undefined,
        showinfo: 0,
        iv_load_policy: 3,
        disablekb: 1
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

  // Mettre à jour le temps de lecture
  useEffect(() => {
    if (!playerRef.current || !onTimeUpdate) return;

    const updateTime = () => {
      try {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (currentTime !== undefined && duration !== undefined) {
          onTimeUpdate(currentTime, duration);
        }
      } catch (error) {
        // Ignore errors during time updates
      }
    };

    if (isPlaying) {
      timeUpdateIntervalRef.current = window.setInterval(updateTime, 500);
    } else {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [isPlaying, onTimeUpdate]);

  return (
    <div className="flex-1 bg-black relative">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
