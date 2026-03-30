import React, { useState, useEffect } from 'react';
import { AppHeader } from '../../Common/Headers/AppHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { Playlist } from '../../../services/youtubePlaylistStorage';
import { LibraryView } from './views/LibraryView';
import { PlaylistEditorView } from './views/PlaylistEditorView';
import { PlayerView } from './views/PlayerView';
import { Music2 } from 'lucide-react';

interface YouPlayProps {
  onClose: () => void;
  metadata?: any;
  onDataChange?: (data: any) => void;
  onDragStart?: (e: React.MouseEvent) => void;
  cardId?: string;
  onTogglePin?: () => void;
  isPinned?: boolean;
}

type ViewMode = 'library' | 'playlist-editor' | 'player';

export function YouPlay({
  onClose,
  metadata,
  onDataChange,
  onDragStart,
  cardId,
  onTogglePin,
  isPinned
}: YouPlayProps) {
  const { themeColors, theme, setTheme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [previousTheme, setPreviousTheme] = useState(theme);

  // Switch to YouPlay theme on mount, restore on unmount
  useEffect(() => {
    setPreviousTheme(theme);
    if (theme !== 'youplay') {
      setTheme('youplay');
    }

    return () => {
      // Restore previous theme when closing the app
      if (theme === 'youplay') {
        setTheme(previousTheme);
      }
    };
  }, []);

  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setViewMode('player');
  };

  const handlePlaylistEdit = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setViewMode('playlist-editor');
  };

  const handleLoadInPlayer = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setViewMode('player');
  };

  const handleBackToLibrary = () => {
    setViewMode('library');
    setSelectedPlaylist(null);
  };

  const getHeaderTitle = () => {
    switch (viewMode) {
      case 'library':
        return 'YouPlay+';
      case 'playlist-editor':
        return selectedPlaylist?.name || 'Edit Playlist';
      case 'player':
        return 'Now Playing';
      default:
        return 'YouPlay+';
    }
  };

  const getHeaderSubtitle = () => {
    switch (viewMode) {
      case 'library':
        return 'Your YouTube Playlists';
      case 'playlist-editor':
        return 'Edit & Manage';
      case 'player':
        return selectedPlaylist?.name || '';
      default:
        return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white/5 to-transparent text-white/90 overflow-hidden">
      {/* Header */}
      {viewMode === 'library' && (
        <AppHeader
          title={getHeaderTitle()}
          subtitle={getHeaderSubtitle()}
          icon={Music2}
          onClose={onClose}
          onDragStart={onDragStart}
          onTogglePin={onTogglePin}
          isPinned={isPinned}
          backgroundColor="transparent"
          textColor="rgba(255,255,255,0.7)"
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'library' && (
          <LibraryView
            onPlaylistSelect={handlePlaylistSelect}
            onPlaylistEdit={handlePlaylistEdit}
            themeColor={themeColors.primary}
          />
        )}

        {viewMode === 'playlist-editor' && selectedPlaylist && (
          <PlaylistEditorView
            playlist={selectedPlaylist}
            onBack={handleBackToLibrary}
            onLoadInPlayer={handleLoadInPlayer}
            themeColor={themeColors.primary}
          />
        )}

        {viewMode === 'player' && selectedPlaylist && (
          <PlayerView
            playlist={selectedPlaylist}
            onBack={handleBackToLibrary}
            themeColor={themeColors.primary}
          />
        )}
      </div>
    </div>
  );
}
