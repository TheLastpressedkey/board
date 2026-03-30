import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Play, Trash2, Plus, Settings, Globe, Lock } from 'lucide-react';
import { Playlist, Video, youtubePlaylistStorage } from '../../../../services/youtubePlaylistStorage';
import { VideoList } from '../components/VideoList';
import { VideoSearchBar } from '../components/VideoSearchBar';
import { getYoutubeVideoId, fetchYouTubeTitle } from '../../../../utils/youtubeUtils';

interface PlaylistEditorViewProps {
  playlist: Playlist;
  onBack: () => void;
  onLoadInPlayer: (playlist: Playlist) => void;
  themeColor: string;
}

export function PlaylistEditorView({ playlist: initialPlaylist, onBack, onLoadInPlayer, themeColor }: PlaylistEditorViewProps) {
  const [playlist, setPlaylist] = useState<Playlist>(initialPlaylist);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVideos, setFilteredVideos] = useState<Video[]>(playlist.videos);
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    filterVideos();
  }, [playlist.videos, searchQuery]);

  const filterVideos = () => {
    if (!searchQuery) {
      setFilteredVideos(playlist.videos);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = playlist.videos.filter(v =>
      v.title.toLowerCase().includes(query) ||
      v.url.toLowerCase().includes(query)
    );
    setFilteredVideos(filtered);
  };

  const handleAddVideo = async () => {
    if (!urlInput.trim()) return;

    setAdding(true);
    try {
      const videoId = getYoutubeVideoId(urlInput.trim());
      if (!videoId) {
        alert('Invalid YouTube URL');
        return;
      }

      const title = await fetchYouTubeTitle(urlInput.trim());
      const newVideo: Video = {
        id: videoId,
        url: urlInput.trim(),
        title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        addedAt: Date.now()
      };

      await youtubePlaylistStorage.addVideoToPlaylist(playlist.id, newVideo);

      const updated = await youtubePlaylistStorage.getPlaylist(playlist.id);
      if (updated) setPlaylist(updated);

      setUrlInput('');
      setShowAddUrl(false);
    } catch (error) {
      console.error('Failed to add video:', error);
      alert('Failed to add video');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveVideo = async (index: number) => {
    const video = playlist.videos[index];
    try {
      await youtubePlaylistStorage.removeVideoFromPlaylist(playlist.id, video.id);

      const updated = await youtubePlaylistStorage.getPlaylist(playlist.id);
      if (updated) setPlaylist(updated);
    } catch (error) {
      console.error('Failed to remove video:', error);
    }
  };

  const handleEditVideo = async (index: number, newTitle: string) => {
    const video = playlist.videos[index];
    try {
      await youtubePlaylistStorage.updateVideo(playlist.id, video.id, { title: newTitle });

      const updated = await youtubePlaylistStorage.getPlaylist(playlist.id);
      if (updated) setPlaylist(updated);
    } catch (error) {
      console.error('Failed to update video:', error);
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newVideos = [...playlist.videos];
    const [removed] = newVideos.splice(fromIndex, 1);
    newVideos.splice(toIndex, 0, removed);

    try {
      await youtubePlaylistStorage.reorderVideos(playlist.id, newVideos);

      const updated = await youtubePlaylistStorage.getPlaylist(playlist.id);
      if (updated) setPlaylist(updated);
    } catch (error) {
      console.error('Failed to reorder videos:', error);
    }
  };

  const handleUpdatePlaylist = async (updates: Partial<Playlist>) => {
    try {
      await youtubePlaylistStorage.updatePlaylist(playlist.id, updates);

      const updated = await youtubePlaylistStorage.getPlaylist(playlist.id);
      if (updated) {
        setPlaylist(updated);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to update playlist:', error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm(`Delete "${playlist.name}"? This cannot be undone.`)) return;

    try {
      await youtubePlaylistStorage.deletePlaylist(playlist.id);
      onBack();
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Library</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onLoadInPlayer(playlist)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
              style={{ backgroundColor: themeColor }}
              disabled={playlist.videos.length === 0}
            >
              <Play className="w-5 h-5" />
              Load in Player
            </button>
            <button
              onClick={handleDeletePlaylist}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              title="Delete playlist"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>

        {/* Playlist Info */}
        <div className="flex items-start gap-4">
          <div
            className="w-32 h-32 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${playlist.color}40` }}
          >
            {playlist.thumbnail ? (
              <img
                src={playlist.thumbnail}
                alt={playlist.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-4xl">{playlist.category === 'music' ? '🎵' : '📹'}</div>
            )}
          </div>

          <div className="flex-1">
            <input
              type="text"
              value={playlist.name}
              onChange={(e) => {
                setPlaylist({ ...playlist, name: e.target.value });
                setHasChanges(true);
              }}
              onBlur={() => hasChanges && handleUpdatePlaylist({ name: playlist.name })}
              className="text-3xl font-bold text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-white/20 rounded px-2 -mx-2 w-full"
            />

            <textarea
              value={playlist.description}
              onChange={(e) => {
                setPlaylist({ ...playlist, description: e.target.value });
                setHasChanges(true);
              }}
              onBlur={() => hasChanges && handleUpdatePlaylist({ description: playlist.description })}
              placeholder="Add a description..."
              className="text-gray-400 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-white/20 rounded px-2 -mx-2 w-full mt-2 resize-none"
              rows={2}
            />

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>{playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''}</span>
              {playlist.totalDuration > 0 && (
                <>
                  <span>•</span>
                  <span>{formatDuration(playlist.totalDuration)}</span>
                </>
              )}
              <span>•</span>
              <span className="capitalize">{playlist.category}</span>
              <span>•</span>
              <button
                onClick={() => handleUpdatePlaylist({ isPublic: !playlist.isPublic })}
                className="flex items-center gap-1 hover:text-gray-300"
              >
                {playlist.isPublic ? (
                  <>
                    <Globe className="w-4 h-4" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Private
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 p-4 border-b border-gray-800 flex items-center gap-3">
        <VideoSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search in playlist..."
          themeColor={themeColor}
        />
        <button
          onClick={() => setShowAddUrl(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-white font-medium whitespace-nowrap transition-all hover:scale-105"
          style={{ backgroundColor: themeColor }}
        >
          <Plus className="w-5 h-5" />
          Add Video
        </button>
      </div>

      {/* Videos List */}
      <div className="flex-1 overflow-y-auto card-scrollbar p-4">
        <VideoList
          videos={filteredVideos}
          onVideoRemove={handleRemoveVideo}
          onVideoEdit={handleEditVideo}
          onReorder={handleReorder}
          editable
          themeColor={themeColor}
        />
      </div>

      {/* Add URL Modal */}
      {showAddUrl && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowAddUrl(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 rounded-xl shadow-2xl z-50 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Add YouTube Video</h3>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddVideo()}
              placeholder="Paste YouTube URL here..."
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 mb-4"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              autoFocus
              disabled={adding}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddUrl(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-750 transition-colors"
                disabled={adding}
              >
                Cancel
              </button>
              <button
                onClick={handleAddVideo}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: themeColor }}
                disabled={adding || !urlInput.trim()}
              >
                {adding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
