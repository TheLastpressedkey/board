import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, MoreVertical, Download, Upload, Filter } from 'lucide-react';
import { Playlist, youtubePlaylistStorage } from '../../../../services/youtubePlaylistStorage';
import { PlaylistGrid } from '../components/PlaylistGrid';
import { VideoSearchBar } from '../components/VideoSearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { CreatePlaylistModal } from '../components/CreatePlaylistModal';
import { MiniPlayer } from '../components/MiniPlayer';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useContainerSize } from '../hooks/useContainerSize';

interface LibraryViewProps {
  onPlaylistSelect: (playlist: Playlist) => void;
  onPlaylistEdit: (playlist: Playlist) => void;
  themeColor: string;
  activePlaylist: Playlist | null;
  currentIndex: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onExpandPlayer: () => void;
  onStopPlayback: () => void;
}

export function LibraryView({
  onPlaylistSelect,
  onPlaylistEdit,
  activePlaylist,
  currentIndex,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onExpandPlayer,
  onStopPlayback
}: LibraryViewProps) {
  const { themeColors } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { layoutSize } = useContainerSize(containerRef);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Playlist['category'] | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    filterPlaylists();
  }, [playlists, searchQuery, selectedCategory]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const data = await youtubePlaylistStorage.getPlaylists();
      setPlaylists(data);
      updateCategoryCounts(data);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryCounts = (playlistList: Playlist[]) => {
    const counts: Record<string, number> = {
      all: playlistList.length,
      music: 0,
      education: 0,
      entertainment: 0,
      sports: 0,
      other: 0
    };

    playlistList.forEach(playlist => {
      counts[playlist.category] = (counts[playlist.category] || 0) + 1;
    });

    setCategoryCounts(counts);
  };

  const filterPlaylists = () => {
    let filtered = [...playlists];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    setFilteredPlaylists(filtered);
  };

  const handleCreatePlaylist = async (
    name: string,
    description: string,
    category: Playlist['category'],
    color: string
  ) => {
    try {
      await youtubePlaylistStorage.createPlaylist(name, description, category, color);
      await loadPlaylists();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    if (!confirm(`Delete "${playlist.name}"? This cannot be undone.`)) return;

    try {
      await youtubePlaylistStorage.deletePlaylist(playlist.id);
      await loadPlaylists();
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  const handleDuplicatePlaylist = async (playlist: Playlist) => {
    try {
      await youtubePlaylistStorage.duplicatePlaylist(playlist.id);
      await loadPlaylists();
    } catch (error) {
      console.error('Failed to duplicate playlist:', error);
    }
  };

  const handleExport = async () => {
    try {
      const json = await youtubePlaylistStorage.exportPlaylists();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `youplay-playlists-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to export playlists:', error);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const count = await youtubePlaylistStorage.importPlaylists(text);
        await loadPlaylists();
        alert(`Imported ${count} playlist(s) successfully!`);
        setShowMenu(false);
      } catch (error) {
        console.error('Failed to import playlists:', error);
        alert('Failed to import playlists. Please check the file format.');
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center h-full bg-gradient-to-br from-white/5 to-transparent"
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-white/20"
          style={{ borderTopColor: themeColors.primary }}
        />
      </div>
    );
  }

  // Adaptive layout based on container size
  const hasMiniPlayer = activePlaylist !== null;
  const headerPadding = layoutSize === 'compact' ? 'px-3 pt-3 pb-2' : layoutSize === 'normal' ? 'px-4 pt-4 pb-3' : 'px-6 pt-6 pb-4';
  const contentPadding = layoutSize === 'compact'
    ? (hasMiniPlayer ? 'px-3 pb-24' : 'px-3 pb-16')
    : layoutSize === 'normal'
    ? (hasMiniPlayer ? 'px-4 pb-24' : 'px-4 pb-16')
    : (hasMiniPlayer ? 'px-6 pb-28' : 'px-6 pb-20');
  const titleSize = layoutSize === 'compact' ? 'text-lg' : layoutSize === 'normal' ? 'text-xl' : 'text-2xl';
  const iconSize = layoutSize === 'compact' ? 'w-4 h-4' : 'w-5 h-5';
  const buttonPadding = layoutSize === 'compact' ? 'p-2' : 'p-2.5';
  const fabSize = layoutSize === 'compact' ? 'w-12 h-12' : 'w-14 h-14';
  const fabPosition = hasMiniPlayer
    ? (layoutSize === 'compact' ? 'bottom-24 right-4' : 'bottom-28 right-6')
    : (layoutSize === 'compact' ? 'bottom-4 right-4' : 'bottom-6 right-6');

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-white/5 to-transparent"
    >
      {/* Minimal Header */}
      <div className={`flex-shrink-0 ${headerPadding}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className={`${titleSize} font-bold text-white/90 truncate`}>My Playlists</h1>
            {layoutSize !== 'compact' && (
              <p className="text-white/60 text-sm font-medium mt-0.5">
                {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
              </p>
            )}
          </div>

          {/* Minimal Actions - only icons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`${buttonPadding} rounded-xl transition-all duration-200 cursor-pointer`}
              style={{
                backgroundColor: showSearch ? themeColors.primary : 'transparent',
                color: showSearch ? 'white' : 'rgba(255,255,255,0.7)',
                boxShadow: showSearch ? `0 4px 12px ${themeColors.primary}30` : 'none'
              }}
              onMouseEnter={(e) => {
                if (!showSearch) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showSearch) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              title="Search"
            >
              <Search className={iconSize} />
            </button>

            {layoutSize !== 'compact' && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`${buttonPadding} rounded-xl transition-all duration-200 cursor-pointer`}
                style={{
                  backgroundColor: showFilters ? themeColors.primary : 'transparent',
                  color: showFilters ? 'white' : 'rgba(255,255,255,0.7)',
                  boxShadow: showFilters ? `0 4px 12px ${themeColors.primary}30` : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!showFilters) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showFilters) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title="Filters"
              >
                <Filter className={iconSize} />
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`${buttonPadding} rounded-xl transition-all duration-200 cursor-pointer`}
                style={{ color: 'rgba(255,255,255,0.7)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="More options"
              >
                <MoreVertical className={iconSize} />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 z-20 overflow-hidden">
                    <button
                      onClick={handleImport}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-white/50 transition-colors duration-200 flex items-center gap-3 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Import
                    </button>
                    <button
                      onClick={handleExport}
                      disabled={playlists.length === 0}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-white/50 transition-colors duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar - Progressive Disclosure */}
        {showSearch && (
          <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
            <VideoSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search playlists..."
              themeColor={themeColors.primary}
            />
          </div>
        )}

        {/* Category Filter - Progressive Disclosure */}
        {showFilters && layoutSize !== 'compact' && (
          <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
            <CategoryFilter
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              counts={categoryCounts}
              themeColor={themeColors.primary}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto card-scrollbar ${contentPadding}`}>
        <PlaylistGrid
          playlists={filteredPlaylists}
          onPlaylistSelect={onPlaylistSelect}
          onPlaylistEdit={onPlaylistEdit}
          onPlaylistDelete={handleDeletePlaylist}
          onPlaylistDuplicate={handleDuplicatePlaylist}
          onCreateNew={() => setShowCreateModal(true)}
          themeColor={themeColors.primary}
          layoutSize={layoutSize}
        />
      </div>

      {/* FAB - Modern with shadow */}
      <button
        onClick={() => setShowCreateModal(true)}
        className={`absolute ${fabPosition} ${fabSize} text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center z-30 cursor-pointer`}
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primary}dd 100%)`,
          boxShadow: `0 8px 24px ${themeColors.primary}40`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 12px 32px ${themeColors.primary}60`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 8px 24px ${themeColors.primary}40`;
        }}
        title="Create new playlist"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePlaylist}
          layoutSize={layoutSize}
        />
      )}

      {/* Mini Player */}
      {activePlaylist && (
        <MiniPlayer
          playlist={activePlaylist}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrevious={onPrevious}
          onExpand={onExpandPlayer}
          onClose={onStopPlayback}
          themeColor={themeColors.primary}
        />
      )}
    </div>
  );
}
