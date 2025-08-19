import { useState, useEffect } from 'react';

export function useScrollProgress(element: HTMLElement | null) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!element) return;

    const handleScroll = () => {
      const scrollWidth = element.scrollWidth - element.clientWidth;
      const progress = scrollWidth > 0 ? (element.scrollLeft / scrollWidth) : 0;
      setProgress(progress);
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [element]);

  return progress;
}