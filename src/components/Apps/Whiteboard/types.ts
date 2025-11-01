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

export interface DrawingElement {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  text?: string;
  points?: { x: number; y: number }[];
  imageUrl?: string;
  rotation?: number;
}

export interface WhiteboardState {
  elements: DrawingElement[];
  selectedElementIds: string[];
  tool: Tool;
  color: string;
  strokeWidth: number;
  backgroundColor: string;
}
