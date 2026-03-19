const CROSS_PLAY_KEY = 'youtube_player_cross_play';

export interface CrossPlayState {
  playlist: any[];
  currentIndex: number;
  playMode: 'sequential' | 'loop' | 'loop-one' | 'shuffle';
  volume: number;
  isPlaying: boolean;
  currentTime: number;
  cardId: string;
}

export function saveCrossPlayState(state: CrossPlayState): void {
  try {
    localStorage.setItem(CROSS_PLAY_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving cross-play state:', error);
  }
}

export function loadCrossPlayState(): CrossPlayState | null {
  try {
    const data = localStorage.getItem(CROSS_PLAY_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading cross-play state:', error);
    return null;
  }
}

export function clearCrossPlayState(): void {
  try {
    localStorage.removeItem(CROSS_PLAY_KEY);
  } catch (error) {
    console.error('Error clearing cross-play state:', error);
  }
}
