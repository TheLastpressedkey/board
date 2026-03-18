import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle } from 'lucide-react';
import { Video } from './YouTubePlayer';
import { useTheme } from '../../../contexts/ThemeContext';

interface VideoControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  playMode: 'sequential' | 'loop' | 'loop-one' | 'shuffle';
  onPlayModeChange: (mode: 'sequential' | 'loop' | 'loop-one' | 'shuffle') => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  currentVideo: Video | null;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function VideoControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  playMode,
  onPlayModeChange,
  volume,
  onVolumeChange,
  currentVideo,
  hasNext,
  hasPrevious
}: VideoControlsProps) {
  const { themeColors } = useTheme();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const cyclePlayMode = () => {
    const modes: Array<'sequential' | 'loop' | 'loop-one' | 'shuffle'> = ['sequential', 'loop', 'loop-one', 'shuffle'];
    const currentIndex = modes.indexOf(playMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    onPlayModeChange(nextMode);
  };

  const getPlayModeIcon = () => {
    switch (playMode) {
      case 'loop':
        return <Repeat className="w-5 h-5" style={{ color: themeColors.primary }} />;
      case 'loop-one':
        return <Repeat1 className="w-5 h-5" style={{ color: themeColors.primary }} />;
      case 'shuffle':
        return <Shuffle className="w-5 h-5" style={{ color: themeColors.primary }} />;
      default:
        return <Repeat className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPlayModeLabel = () => {
    switch (playMode) {
      case 'loop':
        return 'Loop All';
      case 'loop-one':
        return 'Loop One';
      case 'shuffle':
        return 'Shuffle';
      default:
        return 'Sequential';
    }
  };

  return (
    <div
      className="p-2 sm:p-3 md:p-4 border-t"
      style={{ borderColor: `${themeColors.primary}40`, backgroundColor: themeColors.menuBg }}
    >
      {/* Current Video Title */}
      {currentVideo && (
        <div className="mb-2 sm:mb-3 text-center">
          <p className="text-white text-sm sm:text-base font-medium truncate px-2">{currentVideo.title}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
        {/* Play Mode */}
        <button
          onClick={cyclePlayMode}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors group relative"
          title={getPlayModeLabel()}
        >
          {getPlayModeIcon()}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {getPlayModeLabel()}
          </span>
        </button>

        {/* Previous */}
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous"
        >
          <SkipBack className="w-6 h-6 text-white" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="p-3 rounded-full transition-colors"
          style={{ backgroundColor: themeColors.primary }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" fill="white" />
          ) : (
            <Play className="w-6 h-6 text-white" fill="white" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next"
        >
          <SkipForward className="w-6 h-6 text-white" />
        </button>

        {/* Volume */}
        <div
          className="relative"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            onClick={() => onVolumeChange(volume > 0 ? 0 : 100)}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            title={`Volume: ${volume}%`}
          >
            {volume === 0 ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Volume Slider */}
          {showVolumeSlider && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-900 rounded-lg shadow-lg">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${themeColors.primary} 0%, ${themeColors.primary} ${volume}%, rgb(55, 65, 81) ${volume}%, rgb(55, 65, 81) 100%)`
                }}
              />
              <div className="text-center text-white text-xs mt-1">{volume}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
