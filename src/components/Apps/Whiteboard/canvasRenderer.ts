import { DrawingElement, Point } from './types';

export function renderElement(
  ctx: CanvasRenderingContext2D,
  element: DrawingElement,
  isSelected: boolean = false
): void {
  ctx.save();

  ctx.globalAlpha = element.opacity / 100;
  ctx.strokeStyle = element.strokeColor;
  ctx.fillStyle = element.fillColor;
  ctx.lineWidth = element.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Appliquer la rotation si nécessaire
  if (element.rotation !== 0) {
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  switch (element.type) {
    case 'path':
      renderPath(ctx, element);
      break;
    case 'rectangle':
      renderRectangle(ctx, element);
      break;
    case 'diamond':
      renderDiamond(ctx, element);
      break;
    case 'circle':
      renderCircle(ctx, element);
      break;
    case 'arrow':
      renderArrow(ctx, element);
      break;
    case 'line':
      renderLine(ctx, element);
      break;
    case 'text':
      renderText(ctx, element);
      break;
    case 'image':
      renderImage(ctx, element);
      break;
  }

  ctx.restore();

  // Dessiner la sélection si l'élément est sélectionné
  if (isSelected) {
    renderSelection(ctx, element);
  }
}

function renderPath(ctx: CanvasRenderingContext2D, element: DrawingElement): void {
  if (element.points.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(element.x + element.points[0].x, element.y + element.points[0].y);

  for (let i = 1; i < element.points.length; i++) {
    ctx.lineTo(element.x + element.points[i].x, element.y + element.points[i].y);
  }

  ctx.stroke();
}

function renderRectangle(ctx: CanvasRenderingContext2D, element: DrawingElement): void {
  if (element.fillColor !== 'transparent') {
    ctx.fillRect(element.x, element.y, element.width, element.height);
  }
  ctx.strokeRect(element.x, element.y, element.width, element.height);
}

function renderDiamond(ctx: CanvasRenderingContext2D, element: DrawingElement): void {
  const { x, y, width, height } = element;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  ctx.beginPath();
  ctx.moveTo(centerX, y);
  ctx.lineTo(x + width, centerY);
  ctx.lineTo(centerX, y + height);
  ctx.lineTo(x, centerY);
  ctx.closePath();

  if (element.fillColor !== 'transparent') {
    ctx.fill();
  }
  ctx.stroke();
}

function renderCircle(ctx: CanvasRenderingContext2D, element: DrawingElement): void {
  const { x, y, width, height } = element;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radiusX = width / 2;
  const radiusY = height / 2;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

  if (element.fillColor !== 'transparent') {
    ctx.fill();
  }
  ctx.stroke();
}

function renderArrow(ctx: CanvasRenderingContext2D, element: DrawingElement): void {
  const { x, y, width, height } = element;
  const startX = x;
  const startY = y + height / 2;
  const endX = x + width;
  const endY = y + height / 2;

  // Ligne principale
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Flèche
  const headLength = Math.min(20, width / 4);
  const angle = Math.atan2(endY - startY, endX - startX);

  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLength * Math.cos(angle - Math.PI / 6),
    endY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLength * Math.cos(angle + Math.PI / 6),
    endY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

function renderLine(ctx: CanvasRenderingContext2D, element: DrawingElement): void {
  const { x, y, width, height } = element;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y + height);
  ctx.stroke();
}

function renderText(ctx: CanvasRenderingContext2D, element: DrawingElement): void {
  if (!element.text) return;

  const fontSize = element.fontSize || 16;
  const fontFamily = element.fontFamily || 'Arial';

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = element.strokeColor;
  ctx.textBaseline = 'top';

  const lines = element.text.split('\n');
  lines.forEach((line, index) => {
    ctx.fillText(line, element.x, element.y + index * fontSize * 1.2);
  });
}

function renderImage(ctx: CanvasRenderingContext2D, element: DrawingElement): void {
  // TODO: Implémenter le rendu d'image
  // Pour l'instant, on dessine un placeholder
  ctx.strokeRect(element.x, element.y, element.width, element.height);
  ctx.strokeStyle = '#999';
  ctx.beginPath();
  ctx.moveTo(element.x, element.y);
  ctx.lineTo(element.x + element.width, element.y + element.height);
  ctx.moveTo(element.x + element.width, element.y);
  ctx.lineTo(element.x, element.y + element.height);
  ctx.stroke();
}

function renderSelection(ctx: CanvasRenderingContext2D, element: DrawingElement): void {
  const { x, y, width, height } = element;

  ctx.save();
  ctx.globalAlpha = 1;

  // Rectangle de sélection
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
  ctx.setLineDash([]);

  // Poignées de redimensionnement
  const handleSize = 8;
  const handles = [
    { x: x, y: y },
    { x: x + width / 2, y: y },
    { x: x + width, y: y },
    { x: x + width, y: y + height / 2 },
    { x: x + width, y: y + height },
    { x: x + width / 2, y: y + height },
    { x: x, y: y + height },
    { x: x, y: y + height / 2 }
  ];

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;

  handles.forEach(handle => {
    ctx.fillRect(
      handle.x - handleSize / 2,
      handle.y - handleSize / 2,
      handleSize,
      handleSize
    );
    ctx.strokeRect(
      handle.x - handleSize / 2,
      handle.y - handleSize / 2,
      handleSize,
      handleSize
    );
  });

  ctx.restore();
}

export function renderAllElements(
  ctx: CanvasRenderingContext2D,
  elements: DrawingElement[],
  selectedIds: string[]
): void {
  // Trier par zIndex
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  sortedElements.forEach(element => {
    const isSelected = selectedIds.includes(element.id);
    renderElement(ctx, element, isSelected);
  });
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor: string
): void {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
}
