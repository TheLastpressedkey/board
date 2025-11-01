export type Tool =
  | 'select'
  | 'hand'
  | 'pen'
  | 'eraser'
  | 'text'
  | 'rectangle'
  | 'diamond'
  | 'circle'
  | 'arrow'
  | 'line'
  | 'image'
  | 'laser';

export type ElementType = 'path' | 'rectangle' | 'diamond' | 'circle' | 'arrow' | 'line' | 'text' | 'image';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingElement {
  id: string;
  type: ElementType;
  points: Point[];
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  imageUrl?: string;
  rotation: number;
  zIndex: number;
  locked: boolean;
}

export interface WhiteboardState {
  elements: DrawingElement[];
  selectedElementIds: string[];
  tool: Tool;
  color: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  backgroundColor: string;
  zoom: number;
  panX: number;
  panY: number;
}
