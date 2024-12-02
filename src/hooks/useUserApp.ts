import { useState, useEffect } from 'react';

export function useUserApp(htmlContent: string) {
  const [renderedContent, setRenderedContent] = useState('');

  useEffect(() => {
    // Basic sanitization and rendering
    const sanitizedContent = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/on\w+="[^"]*"/g, ''); // Remove inline event handlers
    
    setRenderedContent(sanitizedContent);
  }, [htmlContent]);

  return {
    renderedContent
  };
}