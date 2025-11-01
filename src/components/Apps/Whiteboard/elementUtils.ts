import { DrawingElement, Point, ElementType } from './types';

export function createUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createPathElement(
  points: Point[],
  strokeColor: string,
  strokeWidth: number,
  opacity: number,
  zIndex: number
): DrawingElement {
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));

  return {
    id: createUniqueId(),
    type: 'path',
    points: points.map(p => ({ x: p.x - minX, y: p.y - minY })),
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    strokeColor,
    fillColor: 'transparent',
    strokeWidth,
    opacity,
    rotation: 0,
    zIndex,
    locked: false
  };
}

export function createShapeElement(
  type: ElementType,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeColor: string,
  fillColor: string,
  strokeWidth: number,
  opacity: number,
  zIndex: number
): DrawingElement {
  return {
    id: createUniqueId(),
    type,
    points: [],
    x,
    y,
    width,
    height,
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
    rotation: 0,
    zIndex,
    locked: false
  };
}

export function createTextElement(
  text: string,
  x: number,
  y: number,
  strokeColor: string,
  fontSize: number,
  fontFamily: string,
  opacity: number,
  zIndex: number
): DrawingElement {
  return {
    id: createUniqueId(),
    type: 'text',
    points: [],
    x,
    y,
    width: 100,
    height: fontSize * 1.2,
    strokeColor,
    fillColor: 'transparent',
    strokeWidth: 1,
    opacity,
    text,
    fontSize,
    fontFamily,
    rotation: 0,
    zIndex,
    locked: false
  };
}

export function isPointInElement(point: Point, element: DrawingElement): boolean {
  const { x, y, width, height, rotation } = element;

  const minX = width >= 0 ? x : x + width;
  const maxX = width >= 0 ? x + width : x;
  const minY = height >= 0 ? y : y + height;
  const maxY = height >= 0 ? y + height : y;

  if (rotation === 0) {
    return (
      point.x >= minX &&
      point.x <= maxX &&
      point.y >= minY &&
      point.y <= maxY
    );
  }

  // Pour les rotations, on pourrait implémenter une détection plus sophistiquée
  // Pour l'instant, on utilise la bounding box
  return (
    point.x >= minX &&
    point.x <= maxX &&
    point.y >= minY &&
    point.y <= maxY
  );
}

export function getBoundingBox(element: DrawingElement): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const minX = element.width >= 0 ? element.x : element.x + element.width;
  const minY = element.height >= 0 ? element.y : element.y + element.height;
  return {
    x: minX,
    y: minY,
    width: Math.abs(element.width),
    height: Math.abs(element.height)
  };
}

export function updateElementPosition(
  element: DrawingElement,
  deltaX: number,
  deltaY: number
): DrawingElement {
  return {
    ...element,
    x: element.x + deltaX,
    y: element.y + deltaY
  };
}

export function updateElementSize(
  element: DrawingElement,
  width: number,
  height: number
): DrawingElement {
  return {
    ...element,
    width: Math.max(1, width),
    height: Math.max(1, height)
  };
}

export function duplicateElement(element: DrawingElement, zIndex: number): DrawingElement {
  return {
    ...element,
    id: createUniqueId(),
    x: element.x + 20,
    y: element.y + 20,
    zIndex
  };
}

export function getMaxZIndex(elements: DrawingElement[]): number {
  if (elements.length === 0) return 0;
  return Math.max(...elements.map(el => el.zIndex));
}

export function getMinZIndex(elements: DrawingElement[]): number {
  if (elements.length === 0) return 0;
  return Math.min(...elements.map(el => el.zIndex));
}

export function bringToFront(elements: DrawingElement[], elementId: string): DrawingElement[] {
  const maxZ = getMaxZIndex(elements);
  return elements.map(el =>
    el.id === elementId ? { ...el, zIndex: maxZ + 1 } : el
  );
}

export function sendToBack(elements: DrawingElement[], elementId: string): DrawingElement[] {
  const minZ = getMinZIndex(elements);
  return elements.map(el =>
    el.id === elementId ? { ...el, zIndex: minZ - 1 } : el
  );
}

export function bringForward(elements: DrawingElement[], elementId: string): DrawingElement[] {
  const element = elements.find(el => el.id === elementId);
  if (!element) return elements;

  const elementsAbove = elements.filter(el => el.zIndex > element.zIndex);
  if (elementsAbove.length === 0) return elements;

  const nextZIndex = Math.min(...elementsAbove.map(el => el.zIndex));

  return elements.map(el => {
    if (el.id === elementId) return { ...el, zIndex: nextZIndex + 0.5 };
    return el;
  });
}

export function sendBackward(elements: DrawingElement[], elementId: string): DrawingElement[] {
  const element = elements.find(el => el.id === elementId);
  if (!element) return elements;

  const elementsBelow = elements.filter(el => el.zIndex < element.zIndex);
  if (elementsBelow.length === 0) return elements;

  const prevZIndex = Math.max(...elementsBelow.map(el => el.zIndex));

  return elements.map(el => {
    if (el.id === elementId) return { ...el, zIndex: prevZIndex - 0.5 };
    return el;
  });
}
