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
  initialSeekTime?: number; // Timestamp to seek to after video loads
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
  onSeek,
  initialSeekTime
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const timeUpdateIntervalRef = useRef<number | null>(null);
  const previousVideoIdRef = useRef<string>(videoId);

  // Exposer la fonction seekTo pour permettre le contrôle externe
  useEffect(() => {
    if (!playerRef.current || !onSeek) return;

    const handleSeek = (time: number) => {
      try {
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(time, true);
        }
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

  // Initialiser le lecteur (une seule fois) - utilise un player global
  useEffect(() => {
    if (!isReady || !containerRef.current) return;

    // Réutiliser le player existant s'il est déjà créé
    if ((window as any).__globalYouTubePlayer && !playerRef.current) {
      playerRef.current = (window as any).__globalYouTubePlayer;
      return;
    }

    if (playerRef.current) return; // Déjà initialisé

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

    // Stocker le player globalement pour le réutiliser
    (window as any).__globalYouTubePlayer = playerRef.current;

    // NE PAS détruire le player dans le cleanup - il doit persister
    // Il sera détruit seulement quand on appelle stopPlayback()
  }, [isReady]);

  // Changer de vidéo sans recréer le player
  useEffect(() => {
    if (!playerRef.current || !isReady) return;

    // Si c'est une nouvelle vidéo (pas la première initialisation)
    if (previousVideoIdRef.current !== videoId) {
      previousVideoIdRef.current = videoId;

      try {
        // Vérifier que le player est complètement initialisé
        if (typeof playerRef.current.loadVideoById === 'function') {
          // Charger et lancer automatiquement la nouvelle vidéo
          playerRef.current.loadVideoById({
            videoId: videoId,
            startSeconds: initialSeekTime || 0
          });

          // Forcer le play après un court délai, même en arrière-plan
          setTimeout(() => {
            if (playerRef.current && isPlaying && typeof playerRef.current.playVideo === 'function') {
              playerRef.current.playVideo();
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error loading video:', error);
      }
    }
  }, [videoId, isReady, initialSeekTime]);

  // Gérer play/pause
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      if (isPlaying && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      } else if (!isPlaying && typeof playerRef.current.pauseVideo === 'function') {
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
      if (typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(volume);
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }, [volume]);

  // Mettre à jour le temps de lecture
  useEffect(() => {
    if (!playerRef.current || !onTimeUpdate) return;

    const updateTime = () => {
      try {
        if (playerRef.current &&
            typeof playerRef.current.getCurrentTime === 'function' &&
            typeof playerRef.current.getDuration === 'function') {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          if (currentTime !== undefined && duration !== undefined) {
            onTimeUpdate(currentTime, duration);
          }
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
    <div className="w-full h-full bg-black relative pointer-events-none">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
