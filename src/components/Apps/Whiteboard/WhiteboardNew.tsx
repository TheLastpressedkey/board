import React, { useRef, useState, useEffect } from 'react';
import { Share2, Library } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';
import { HamburgerMenu } from './HamburgerMenu';
import { FloatingToolbar } from './FloatingToolbar';
import { SelectionPanel } from './SelectionPanel';
import { Tool, DrawingElement, Point } from './types';
import {
  createPathElement,
  createShapeElement,
  isPointInElement,
  updateElementPosition,
  duplicateElement,
  getMaxZIndex,
  bringToFront,
  sendToBack,
  bringForward,
  sendBackward
} from './elementUtils';
import { renderAllElements, clearCanvas } from './canvasRenderer';

interface WhiteboardProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  metadata?: { elements?: DrawingElement[] };
  onDataChange?: (data: { elements: DrawingElement[] }) => void;
  cardId?: string;
}

export function WhiteboardNew({ onClose, onDragStart, metadata, onDataChange }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<DrawingElement[]>(metadata?.elements || []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#ffffff');
  const [fillColor, setFillColor] = useState('transparent');
  const [lineWidth, setLineWidth] = useState(3);
  const [opacity, setOpacity] = useState(100);
  const [isLocked, setIsLocked] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [language, setLanguage] = useState('fr');
  const [zoom, setZoom] = useState(100);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<Point>({ x: 0, y: 0 });

  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  const bgColor = isTerminalTheme ? '#000000' : '#1f2937';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      clearCanvas(ctx, canvas.width, canvas.height, bgColor);
      renderAllElements(ctx, elements, selectedIds);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas(ctx, canvas.width, canvas.height, bgColor);
    renderAllElements(ctx, elements, selectedIds);
  }, [elements, selectedIds, bgColor]);

  useEffect(() => {
    if (onDataChange && elements.length > 0) {
      onDataChange({ elements });
    }
  }, [elements]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point: Point = { x, y };

    if (tool === 'select') {
      const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
      const clickedElement = sortedElements.find(el => isPointInElement(point, el));

      if (clickedElement) {
        if (!e.shiftKey) {
          setSelectedIds([clickedElement.id]);
        } else {
          setSelectedIds(prev =>
            prev.includes(clickedElement.id)
              ? prev.filter(id => id !== clickedElement.id)
              : [...prev, clickedElement.id]
          );
        }
        setIsDragging(true);
        setDragStartPos(point);
      } else {
        setSelectedIds([]);
      }
    } else if (tool === 'pen') {
      setIsDrawing(true);
      setCurrentPoints([point]);
    } else if (tool === 'rectangle' || tool === 'diamond' || tool === 'circle' || tool === 'line' || tool === 'arrow') {
      setIsDrawing(true);
      setStartPoint(point);
    } else if (tool === 'eraser') {
      const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
      const clickedElement = sortedElements.find(el => isPointInElement(point, el));
      if (clickedElement) {
        setElements(prev => prev.filter(el => el.id !== clickedElement.id));
        setSelectedIds([]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point: Point = { x, y };

    if (tool === 'select' && isDragging && selectedIds.length > 0) {
      const deltaX = x - dragStartPos.x;
      const deltaY = y - dragStartPos.y;

      setElements(prev =>
        prev.map(el =>
          selectedIds.includes(el.id)
            ? updateElementPosition(el, deltaX, deltaY)
            : el
        )
      );

      setDragStartPos(point);
    } else if (isDrawing && tool === 'pen') {
      setCurrentPoints(prev => [...prev, point]);

      const ctx = canvas.getContext('2d');
      if (ctx && currentPoints.length > 0) {
        ctx.globalAlpha = opacity / 100;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const lastPoint = currentPoints[currentPoints.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    } else if (isDrawing && startPoint) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      clearCanvas(ctx, canvas.width, canvas.height, bgColor);
      renderAllElements(ctx, elements, selectedIds);

      let width = x - startPoint.x;
      let height = y - startPoint.y;

      // Si Shift est enfoncé et que c'est une forme (rectangle, circle, diamond), garder les proportions
      if (e.shiftKey && (tool === 'rectangle' || tool === 'circle' || tool === 'diamond')) {
        const size = Math.max(Math.abs(width), Math.abs(height));
        width = width < 0 ? -size : size;
        height = height < 0 ? -size : size;
      }

      const tempX = width < 0 ? startPoint.x + width : startPoint.x;
      const tempY = height < 0 ? startPoint.y + height : startPoint.y;
      const tempWidth = Math.abs(width);
      const tempHeight = Math.abs(height);

      ctx.globalAlpha = opacity / 100;
      ctx.strokeStyle = color;
      ctx.fillStyle = fillColor;
      ctx.lineWidth = lineWidth;

      if (tool === 'rectangle') {
        if (fillColor !== 'transparent') ctx.fillRect(tempX, tempY, tempWidth, tempHeight);
        ctx.strokeRect(tempX, tempY, tempWidth, tempHeight);
      } else if (tool === 'circle') {
        const centerX = tempX + tempWidth / 2;
        const centerY = tempY + tempHeight / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, tempWidth / 2, tempHeight / 2, 0, 0, 2 * Math.PI);
        if (fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
      } else if (tool === 'diamond') {
        const centerX = tempX + tempWidth / 2;
        const centerY = tempY + tempHeight / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, tempY);
        ctx.lineTo(tempX + tempWidth, centerY);
        ctx.lineTo(centerX, tempY + tempHeight);
        ctx.lineTo(tempX, centerY);
        ctx.closePath();
        if (fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        const headLength = 20;
        const angle = Math.atan2(y - startPoint.y, x - startPoint.x);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - headLength * Math.cos(angle - Math.PI / 6), y - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x, y);
        ctx.lineTo(x - headLength * Math.cos(angle + Math.PI / 6), y - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'select') {
      setIsDragging(false);
    } else if (isDrawing && tool === 'pen' && currentPoints.length > 1) {
      const maxZ = getMaxZIndex(elements);
      const newElement = createPathElement(currentPoints, color, lineWidth, opacity, maxZ + 1);
      setElements(prev => [...prev, newElement]);
      setCurrentPoints([]);
      setIsDrawing(false);
    } else if (isDrawing && startPoint) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let width = x - startPoint.x;
      let height = y - startPoint.y;

      // Si Shift est enfoncé et que c'est une forme (rectangle, circle, diamond), garder les proportions
      if (e.shiftKey && (tool === 'rectangle' || tool === 'circle' || tool === 'diamond')) {
        const size = Math.max(Math.abs(width), Math.abs(height));
        width = width < 0 ? -size : size;
        height = height < 0 ? -size : size;
      }

      if (Math.abs(width) > 5 && Math.abs(height) > 5) {
        const finalX = width < 0 ? startPoint.x + width : startPoint.x;
        const finalY = height < 0 ? startPoint.y + height : startPoint.y;
        const finalWidth = Math.abs(width);
        const finalHeight = Math.abs(height);

        const maxZ = getMaxZIndex(elements);
        let elementType: 'rectangle' | 'diamond' | 'circle' | 'line' | 'arrow' = 'rectangle';

        if (tool === 'rectangle') elementType = 'rectangle';
        else if (tool === 'diamond') elementType = 'diamond';
        else if (tool === 'circle') elementType = 'circle';
        else if (tool === 'line') elementType = 'line';
        else if (tool === 'arrow') elementType = 'arrow';

        const newElement = createShapeElement(
          elementType,
          finalX,
          finalY,
          finalWidth,
          finalHeight,
          color,
          fillColor,
          lineWidth,
          opacity,
          maxZ + 1
        );

        setElements(prev => [...prev, newElement]);
      }

      setStartPoint(null);
      setIsDrawing(false);
    }
  };

  const handleClearCanvas = () => {
    setElements([]);
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    setElements(prev => prev.filter(el => !selectedIds.includes(el.id)));
    setSelectedIds([]);
  };

  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) return;

    const maxZ = getMaxZIndex(elements);
    const newElements = elements
      .filter(el => selectedIds.includes(el.id))
      .map((el, index) => duplicateElement(el, maxZ + index + 1));

    setElements(prev => [...prev, ...newElements]);
    setSelectedIds(newElements.map(el => el.id));
  };

  const handleBringToFront = () => {
    if (selectedIds.length === 0) return;
    let updatedElements = elements;
    selectedIds.forEach(id => {
      updatedElements = bringToFront(updatedElements, id);
    });
    setElements(updatedElements);
  };

  const handleSendToBack = () => {
    if (selectedIds.length === 0) return;
    let updatedElements = elements;
    selectedIds.forEach(id => {
      updatedElements = sendToBack(updatedElements, id);
    });
    setElements(updatedElements);
  };

  const handleBringForward = () => {
    if (selectedIds.length === 0) return;
    let updatedElements = elements;
    selectedIds.forEach(id => {
      updatedElements = bringForward(updatedElements, id);
    });
    setElements(updatedElements);
  };

  const handleSendBackward = () => {
    if (selectedIds.length === 0) return;
    let updatedElements = elements;
    selectedIds.forEach(id => {
      updatedElements = sendBackward(updatedElements, id);
    });
    setElements(updatedElements);
  };

  const handleStrokeColorChange = (newColor: string) => {
    setColor(newColor);
    if (selectedIds.length > 0) {
      setElements(prev =>
        prev.map(el =>
          selectedIds.includes(el.id) ? { ...el, strokeColor: newColor } : el
        )
      );
    }
  };

  const handleFillColorChange = (newColor: string) => {
    setFillColor(newColor);
    if (selectedIds.length > 0) {
      setElements(prev =>
        prev.map(el =>
          selectedIds.includes(el.id) ? { ...el, fillColor: newColor } : el
        )
      );
    }
  };

  const handleStrokeWidthChange = (newWidth: number) => {
    setLineWidth(newWidth);
    if (selectedIds.length > 0) {
      setElements(prev =>
        prev.map(el =>
          selectedIds.includes(el.id) ? { ...el, strokeWidth: newWidth } : el
        )
      );
    }
  };

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    if (selectedIds.length > 0) {
      setElements(prev =>
        prev.map(el =>
          selectedIds.includes(el.id) ? { ...el, opacity: newOpacity } : el
        )
      );
    }
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgHeader = isTerminalTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(31, 41, 55, 0.95)';
  const bgButtonActive = isTerminalTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)';
  const bgButtonHover = isTerminalTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(55, 65, 81, 0.5)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 65, 81, 0.5)';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;

  const selectedElements = elements.filter(el => selectedIds.includes(el.id));

  const getCursorStyle = () => {
    if (tool === 'hand') return 'grab';
    if (tool === 'select') return 'default';
    if (tool === 'text') return 'text';
    return 'crosshair';
  };

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden relative" style={{ backgroundColor: bgMain }}>
      {/* Header draggable */}
      <div
        className="absolute top-0 left-0 right-0 h-12 flex items-center justify-center z-20 cursor-move"
        onMouseDown={onDragStart}
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)',
          pointerEvents: 'auto'
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: textMuted }}></div>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: textMuted }}></div>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: textMuted }}></div>
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full"
          style={{ cursor: getCursorStyle() }}
        />

        <div className="absolute top-4 left-4 z-10">
          <HamburgerMenu
            onOpen={() => console.log('Open')}
            onSave={() => console.log('Save')}
            onExport={downloadDrawing}
            onCollaboration={() => console.log('Collaboration')}
            onCommandPalette={() => console.log('Command Palette')}
            onFind={() => console.log('Find')}
            onHelp={() => console.log('Help')}
            onReset={handleClearCanvas}
            theme={theme}
            onThemeChange={setTheme}
            language={language}
            onLanguageChange={setLanguage}
            bgColor={bgHeader}
            textColor={textColor}
            textMuted={textMuted}
            borderColor={borderColor}
            hoverBg={bgButtonHover}
          />
        </div>

        {selectedElements.length > 0 && (
          <SelectionPanel
            selectedElements={selectedElements}
            onStrokeColorChange={handleStrokeColorChange}
            onFillColorChange={handleFillColorChange}
            onStrokeWidthChange={handleStrokeWidthChange}
            onOpacityChange={handleOpacityChange}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            onDuplicate={handleDuplicateSelected}
            onDelete={handleDeleteSelected}
            onCreateLink={() => console.log('Create link')}
            strokeColor={selectedElements[0]?.strokeColor || color}
            fillColor={selectedElements[0]?.fillColor || fillColor}
            strokeWidth={selectedElements[0]?.strokeWidth || lineWidth}
            opacity={selectedElements[0]?.opacity || opacity}
            bgColor={bgHeader}
            textColor={textColor}
            textMuted={textMuted}
            borderColor={borderColor}
            hoverBg={bgButtonHover}
          />
        )}

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <FloatingToolbar
            currentTool={tool}
            onToolChange={setTool}
            isLocked={isLocked}
            onLockToggle={() => setIsLocked(!isLocked)}
            bgColor={bgHeader}
            textColor={textColor}
            textMuted={textMuted}
            borderColor={borderColor}
            hoverBg={bgButtonHover}
            activeBg={bgButtonActive}
            primaryColor={primaryColor}
          />
        </div>

        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors backdrop-blur-sm"
            style={{
              backgroundColor: bgHeader,
              border: `1px solid ${borderColor}`,
              color: textColor
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = bgButtonHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = bgHeader)}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Partager</span>
          </button>

          <button
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors backdrop-blur-sm"
            style={{
              backgroundColor: bgHeader,
              border: `1px solid ${borderColor}`,
              color: textColor
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = bgButtonHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = bgHeader)}
          >
            <Library className="w-4 h-4" />
            <span className="text-sm font-medium">Bibliothèque</span>
          </button>
        </div>

        <div
          className="absolute bottom-4 left-4 right-4 flex items-center justify-between backdrop-blur-sm rounded-lg px-4 py-2"
          style={{
            backgroundColor: bgHeader,
            border: `1px solid ${borderColor}`
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(10, zoom - 10))}
                className="px-2 py-1 rounded transition-colors text-sm"
                style={{ color: textMuted }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = bgButtonHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                -
              </button>
              <span className="text-sm" style={{ color: textColor }}>
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(500, zoom + 10))}
                className="px-2 py-1 rounded transition-colors text-sm"
                style={{ color: textMuted }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = bgButtonHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: textMuted }}>
              {selectedElements.length > 0
                ? `${selectedElements.length} élément(s) sélectionné(s)`
                : 'Dessinez ou sélectionnez des éléments'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
