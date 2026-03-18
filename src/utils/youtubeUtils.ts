export function isYoutubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

export function getYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match?.[2] || null;
}

export async function fetchYouTubeTitle(url: string): Promise<string> {
  try {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return 'Untitled Video';

    // Utiliser l'API YouTube oEmbed (pas besoin de clé API)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch video info');
    }

    const data = await response.json();
    return data.title || 'Untitled Video';
  } catch (error) {
    console.error('Error fetching YouTube title:', error);
    return 'Untitled Video';
  }
}