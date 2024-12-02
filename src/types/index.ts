import { ContentType } from './ContentType';
export { ContentType } from './ContentType';

export interface Board {
  id: string;
  name: string;
  cards: Card[];
  isMainBoard?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Card {
  id: string;
  type: ContentType;
  position: { x: number; y: number };
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
  };
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface BoardState {
  boards: Board[];
  currentBoard: string;
}