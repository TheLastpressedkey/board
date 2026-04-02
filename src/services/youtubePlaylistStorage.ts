import { supabase } from '../lib/supabase';

export interface Video {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  duration?: number; // en secondes
  addedAt?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  category: 'music' | 'education' | 'entertainment' | 'sports' | 'other';
  color: string;
  thumbnail?: string;
  videos: Video[];
  createdAt: number;
  updatedAt: number;
  playCount: number;
  totalDuration: number; // en secondes
  isPublic: boolean;
  isFavorite?: boolean; // Playlist spéciale pour les vidéos likées
}

export interface PlaybackState {
  playlistId: string;
  videoIndex: number;
  timestamp: number; // Position en secondes
  lastPlayed: number; // Timestamp de la dernière lecture
}

export interface YouPlayData {
  playlists: Playlist[];
  activePlaylistId: string | null;
  playHistory?: Array<{
    videoId: string;
    playlistId: string;
    timestamp: number;
    duration: number;
  }>;
  playbackStates?: PlaybackState[]; // État de lecture pour chaque playlist
  version: string;
}

const APP_ID = 'youplay-plus';
const DEFAULT_COLORS = [
  '#FF6B9D', '#C44569', '#F97F51', '#FEA47F',
  '#58B19F', '#3B3B98', '#182C61', '#6D214F'
];

class YouTubePlaylistStorage {
  private data: YouPlayData | null = null;
  private userId: string | null = null;

  private async ensureData(): Promise<YouPlayData> {
    if (this.data) return this.data;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    this.userId = user.id;

    const { data: appData, error } = await supabase
      .from('custom_app_data')
      .select('data')
      .eq('user_id', user.id)
      .eq('app_id', APP_ID)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!appData) {
      this.data = {
        playlists: [],
        activePlaylistId: null,
        playHistory: [],
        playbackStates: [],
        version: '1.0.0'
      };
      await this.save();
    } else {
      this.data = appData.data as YouPlayData;
      // Ensure playbackStates exists for existing data
      if (!this.data.playbackStates) {
        this.data.playbackStates = [];
      }
    }

    return this.data!;
  }

  private async save(): Promise<void> {
    if (!this.userId || !this.data) return;

    const { error } = await supabase
      .from('custom_app_data')
      .upsert({
        user_id: this.userId,
        app_id: APP_ID,
        data: this.data
      }, {
        onConflict: 'user_id,app_id'
      });

    if (error) throw error;
  }

  // ==================== CRUD Playlists ====================

  async getPlaylists(filters?: {
    category?: Playlist['category'];
    search?: string;
  }): Promise<Playlist[]> {
    const data = await this.ensureData();
    let playlists = [...data.playlists];

    if (filters?.category) {
      playlists = playlists.filter(p => p.category === filters.category);
    }

    if (filters?.search) {
      const query = filters.search.toLowerCase();
      playlists = playlists.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    return playlists;
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    const data = await this.ensureData();
    return data.playlists.find(p => p.id === id) || null;
  }

  async createPlaylist(
    name: string,
    description: string = '',
    category: Playlist['category'] = 'other',
    color?: string
  ): Promise<Playlist> {
    const data = await this.ensureData();

    const newPlaylist: Playlist = {
      id: this.generateId(),
      name,
      description,
      category,
      color: color || this.getRandomColor(),
      videos: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      playCount: 0,
      totalDuration: 0,
      isPublic: false
    };

    data.playlists.push(newPlaylist);
    await this.save();

    return newPlaylist;
  }

  async updatePlaylist(
    id: string,
    updates: Partial<Omit<Playlist, 'id' | 'createdAt' | 'videos'>>
  ): Promise<Playlist> {
    const data = await this.ensureData();
    const index = data.playlists.findIndex(p => p.id === id);

    if (index === -1) throw new Error('Playlist not found');

    data.playlists[index] = {
      ...data.playlists[index],
      ...updates,
      updatedAt: Date.now()
    };

    await this.save();
    return data.playlists[index];
  }

  async deletePlaylist(id: string): Promise<void> {
    const data = await this.ensureData();
    data.playlists = data.playlists.filter(p => p.id !== id);

    if (data.activePlaylistId === id) {
      data.activePlaylistId = null;
    }

    await this.save();
  }

  async duplicatePlaylist(id: string): Promise<Playlist> {
    const original = await this.getPlaylist(id);
    if (!original) throw new Error('Playlist not found');

    const data = await this.ensureData();

    const duplicate: Playlist = {
      ...original,
      id: this.generateId(),
      name: `${original.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      playCount: 0
    };

    data.playlists.push(duplicate);
    await this.save();

    return duplicate;
  }

  // ==================== CRUD Videos ====================

  async addVideoToPlaylist(playlistId: string, video: Video): Promise<void> {
    const data = await this.ensureData();
    const playlist = data.playlists.find(p => p.id === playlistId);

    if (!playlist) throw new Error('Playlist not found');

    const videoWithTimestamp = {
      ...video,
      addedAt: Date.now()
    };

    playlist.videos.push(videoWithTimestamp);
    playlist.totalDuration += video.duration || 0;
    playlist.updatedAt = Date.now();

    // Update thumbnail if first video
    if (playlist.videos.length === 1) {
      playlist.thumbnail = video.thumbnail;
    }

    await this.save();
  }

  async removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void> {
    const data = await this.ensureData();
    const playlist = data.playlists.find(p => p.id === playlistId);

    if (!playlist) throw new Error('Playlist not found');

    const video = playlist.videos.find(v => v.id === videoId);
    if (video) {
      playlist.totalDuration -= video.duration || 0;
    }

    playlist.videos = playlist.videos.filter(v => v.id !== videoId);
    playlist.updatedAt = Date.now();

    // Update thumbnail if removed first video
    if (playlist.videos.length > 0 && !playlist.thumbnail) {
      playlist.thumbnail = playlist.videos[0].thumbnail;
    }

    await this.save();
  }

  async reorderVideos(playlistId: string, newOrder: Video[]): Promise<void> {
    const data = await this.ensureData();
    const playlist = data.playlists.find(p => p.id === playlistId);

    if (!playlist) throw new Error('Playlist not found');

    playlist.videos = newOrder;
    playlist.updatedAt = Date.now();

    await this.save();
  }

  async updateVideo(
    playlistId: string,
    videoId: string,
    updates: Partial<Video>
  ): Promise<void> {
    const data = await this.ensureData();
    const playlist = data.playlists.find(p => p.id === playlistId);

    if (!playlist) throw new Error('Playlist not found');

    const videoIndex = playlist.videos.findIndex(v => v.id === videoId);
    if (videoIndex === -1) throw new Error('Video not found');

    playlist.videos[videoIndex] = {
      ...playlist.videos[videoIndex],
      ...updates
    };
    playlist.updatedAt = Date.now();

    await this.save();
  }

  // ==================== Search ====================

  async searchPlaylists(query: string): Promise<Playlist[]> {
    return this.getPlaylists({ search: query });
  }

  async searchVideosInPlaylist(playlistId: string, query: string): Promise<Video[]> {
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) return [];

    const lowerQuery = query.toLowerCase();
    return playlist.videos.filter(v =>
      v.title.toLowerCase().includes(lowerQuery) ||
      v.url.toLowerCase().includes(lowerQuery)
    );
  }

  // ==================== Stats ====================

  async incrementPlayCount(playlistId: string): Promise<void> {
    const data = await this.ensureData();
    const playlist = data.playlists.find(p => p.id === playlistId);

    if (!playlist) return;

    playlist.playCount += 1;
    await this.save();
  }

  async recordPlay(playlistId: string, videoId: string, duration: number): Promise<void> {
    const data = await this.ensureData();

    if (!data.playHistory) {
      data.playHistory = [];
    }

    data.playHistory.push({
      playlistId,
      videoId,
      timestamp: Date.now(),
      duration
    });

    // Keep only last 100 plays
    if (data.playHistory.length > 100) {
      data.playHistory = data.playHistory.slice(-100);
    }

    await this.save();
  }

  async getStats(playlistId: string) {
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) return null;

    const data = await this.ensureData();
    const playHistory = (data.playHistory || []).filter(h => h.playlistId === playlistId);

    return {
      totalVideos: playlist.videos.length,
      totalDuration: playlist.totalDuration,
      playCount: playlist.playCount,
      recentPlays: playHistory.length,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt
    };
  }

  // ==================== Active Playlist ====================

  async setActivePlaylist(playlistId: string | null): Promise<void> {
    const data = await this.ensureData();
    data.activePlaylistId = playlistId;
    await this.save();
  }

  async getActivePlaylist(): Promise<Playlist | null> {
    const data = await this.ensureData();
    if (!data.activePlaylistId) return null;
    return this.getPlaylist(data.activePlaylistId);
  }

  // ==================== Import/Export ====================

  async exportPlaylists(): Promise<string> {
    const data = await this.ensureData();
    return JSON.stringify(data.playlists, null, 2);
  }

  async importPlaylists(jsonData: string): Promise<number> {
    const imported = JSON.parse(jsonData) as Playlist[];
    const data = await this.ensureData();

    let count = 0;
    for (const playlist of imported) {
      const newPlaylist = {
        ...playlist,
        id: this.generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      data.playlists.push(newPlaylist);
      count++;
    }

    await this.save();
    return count;
  }

  // ==================== Utils ====================

  private generateId(): string {
    return `pl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRandomColor(): string {
    return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
  }

  // ==================== Favorites ====================

  async getFavoritesPlaylist(): Promise<Playlist | null> {
    const data = await this.ensureData();
    return data.playlists.find(p => p.isFavorite === true) || null;
  }

  private async ensureFavoritesPlaylist(): Promise<Playlist> {
    let favorites = await this.getFavoritesPlaylist();

    if (!favorites) {
      const data = await this.ensureData();
      favorites = {
        id: this.generateId(),
        name: '❤️ Favorites',
        description: 'Your liked videos',
        category: 'music',
        color: '#FF6B9D',
        videos: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        playCount: 0,
        totalDuration: 0,
        isPublic: false,
        isFavorite: true
      };
      data.playlists.unshift(favorites); // Ajouter en premier
      await this.save();
    }

    return favorites;
  }

  async likeVideo(video: Video): Promise<void> {
    const favorites = await this.ensureFavoritesPlaylist();

    // Vérifier si déjà présent
    const exists = favorites.videos.some(v => v.id === video.id);
    if (exists) return;

    await this.addVideoToPlaylist(favorites.id, video);
  }

  async unlikeVideo(videoId: string): Promise<void> {
    const favorites = await this.getFavoritesPlaylist();
    if (!favorites) return;

    await this.removeVideoFromPlaylist(favorites.id, videoId);
  }

  async isVideoLiked(videoId: string): Promise<boolean> {
    const favorites = await this.getFavoritesPlaylist();
    if (!favorites) return false;

    return favorites.videos.some(v => v.id === videoId);
  }

  // ==================== Playback State ====================

  async savePlaybackState(
    playlistId: string,
    videoIndex: number,
    timestamp: number
  ): Promise<void> {
    const data = await this.ensureData();

    if (!data.playbackStates) {
      data.playbackStates = [];
    }

    const existingIndex = data.playbackStates.findIndex(s => s.playlistId === playlistId);
    const newState: PlaybackState = {
      playlistId,
      videoIndex,
      timestamp,
      lastPlayed: Date.now()
    };

    if (existingIndex !== -1) {
      data.playbackStates[existingIndex] = newState;
    } else {
      data.playbackStates.push(newState);
    }

    await this.save();
  }

  async getPlaybackState(playlistId: string): Promise<PlaybackState | null> {
    const data = await this.ensureData();

    if (!data.playbackStates) return null;

    return data.playbackStates.find(s => s.playlistId === playlistId) || null;
  }

  async clearPlaybackState(playlistId: string): Promise<void> {
    const data = await this.ensureData();

    if (!data.playbackStates) return;

    data.playbackStates = data.playbackStates.filter(s => s.playlistId !== playlistId);
    await this.save();
  }

  // Reset for testing
  async reset(): Promise<void> {
    this.data = {
      playlists: [],
      activePlaylistId: null,
      playHistory: [],
      playbackStates: [],
      version: '1.0.0'
    };
    await this.save();
  }
}

export const youtubePlaylistStorage = new YouTubePlaylistStorage();
