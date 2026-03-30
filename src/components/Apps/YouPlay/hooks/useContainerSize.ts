import { useState, useEffect, RefObject } from 'react';

export type LayoutSize = 'compact' | 'normal' | 'large';

export function useContainerSize(containerRef: RefObject<HTMLElement>) {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [layoutSize, setLayoutSize] = useState<LayoutSize>('normal');

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setWidth(clientWidth);
        setHeight(clientHeight);

        // Determine layout size based on container width
        if (clientWidth < 400) {
          setLayoutSize('compact');
        } else if (clientWidth < 600) {
          setLayoutSize('normal');
        } else {
          setLayoutSize('large');
        }
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return { width, height, layoutSize };
}
