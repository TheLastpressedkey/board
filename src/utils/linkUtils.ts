const DEFAULT_LINK_IMAGE = 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=400&q=80';

export async function fetchLinkMetadata(url: string) {
  try {
    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        title: data.data.title || 'Untitled',
        description: data.data.description || 'No description available',
        image: data.data.image?.url || DEFAULT_LINK_IMAGE
      };
    }
    return {
      title: 'Untitled',
      description: 'No description available',
      image: DEFAULT_LINK_IMAGE
    };
  } catch (error) {
    console.error('Error fetching link metadata:', error);
    return {
      title: 'Untitled',
      description: 'No description available',
      image: DEFAULT_LINK_IMAGE
    };
  }
}

export function isValidUrl(str: string) {
  try {
    // Add protocol if missing
    const urlString = str.match(/^https?:\/\//) ? str : `https://${str}`;
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}