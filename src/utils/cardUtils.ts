import { Card, ContentType } from '../types';

// Constants pour éviter la sidebar
const MIN_CARD_X = 150; // Position X minimale pour les cartes
const MIN_CARD_Y = 50; // Position Y minimale pour les cartes

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
  
  // Forcer la position pour éviter la sidebar
  const adjustedPosition = {
    x: position.x < MIN_CARD_X ? MIN_CARD_X : position.x,
    y: position.y < MIN_CARD_Y ? MIN_CARD_Y : position.y
  };
  
  return {
    id,
    type,
    position: adjustedPosition,
    content,
    dimensions: dimensions || { width: 300, height: 200 }
  };
}