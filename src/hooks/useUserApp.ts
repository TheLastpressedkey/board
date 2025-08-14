import { useState, useEffect } from 'react';

interface UseUserAppResult {
  renderedContent: string;
  error: string | null;
}

export function useUserApp(code: string): UseUserAppResult {
  const [error, setError] = useState<string | null>(null);
  const [renderedContent, setRenderedContent] = useState('');

  useEffect(() => {
    try {
      // Validation basique du code
      new Function(code);
      
      // Nettoyage basique du code
      const sanitizedContent = code
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/g, '');
      
      setRenderedContent(sanitizedContent);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
      setRenderedContent('');
    }
  }, [code]);

  return {
    renderedContent,
    error
  };
}