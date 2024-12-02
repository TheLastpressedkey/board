import { Card, ContentType } from '../types';

export function generateCardId(): string {
  return crypto.randomUUID();
}

export function formatCardTitle(type: ContentType, id: string): string {
  return `${type}-${id.slice(0, 8)}`;
}

export function createCard(
  type: ContentType, 
  position: { x: number; y: number }, 
  content: string = '',
  dimensions?: { width: number; height: number }
): Card {
  const id = generateCardId();
  return {
    id,
    type,
    position,
    content,
    dimensions: dimensions || { width: 300, height: 200 }
  };
}