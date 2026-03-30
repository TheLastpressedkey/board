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
}

export function PlayerView({ playlist: initialPlaylist, onBack, themeColor }: PlayerViewProps) {
  const [playlist, setPlaylist] = useState<Playlist>(initialPlaylist);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [playMode, setPlayMode] = useState<'sequential' | 'loop' | 'loop-one' | 'shuffle'>('sequential');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Increment play count when loading playlist
    youtubePlaylistStorage.incrementPlayCount(playlist.id);
  }, [playlist.id]);

  const currentVideo = playlist.videos[currentIndex];

  const handleVideoEnd = () => {
    switch (playMode) {
      case 'loop-one':
        setIsPlaying(true);
        return;
      case 'loop':
        const nextIndex = (currentIndex + 1) % playlist.videos.length;
        setCurrentIndex(nextIndex);
        setIsPlaying(true);
        break;
      case 'shuffle':
        const randomIndex = Math.floor(Math.random() * playlist.videos.length);
        setCurrentIndex(randomIndex);
        setIsPlaying(true);
        break;
      case 'sequential':
        if (currentIndex < playlist.videos.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
        break;
    }
  };

  const handleNext = () => {
    const nextIndex = playMode === 'shuffle'
      ? Math.floor(Math.random() * playlist.videos.length)
      : (currentIndex + 1) % playlist.videos.length;

    setCurrentIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    const prevIndex = playMode === 'shuffle'
      ? Math.floor(Math.random() * playlist.videos.length)
      : (currentIndex - 1 + playlist.videos.length) % playlist.videos.length;

    setCurrentIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleVideoSelect = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false);
  };

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
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
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <List className="w-5 h-5" style={{ color: showPlaylist ? themeColor : 'rgba(255,255,255,0.7)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Player */}
      <div
        className="flex-1 flex flex-col relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {currentVideo ? (
          <>
            <VideoPlayer
              videoId={currentVideo.id}
              isPlaying={isPlaying}
              volume={volume}
              onEnded={handleVideoEnd}
              onPlayStateChange={setIsPlaying}
              playMode={playMode}
              onTimeUpdate={(time, dur) => {
                setCurrentTime(time);
                setDuration(dur);
              }}
              onSeek={(time) => {
                // Fonction exposée via window pour permettre le seek
              }}
            />
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
              hasNext={playlist.videos.length > 1}
              hasPrevious={playlist.videos.length > 1}
              isVisible={isHovering}
              currentTime={currentTime}
              duration={duration}
              immersiveMode={true}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/50">No videos in playlist</p>
          </div>
        )}
      </div>

      {/* Playlist Sidebar */}
      {showPlaylist && (
        <div className="absolute right-0 top-0 bottom-0 w-80 md:w-96 bg-gray-900/98 backdrop-blur-xl z-40 flex flex-col border-l border-white/10 shadow-2xl">
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
