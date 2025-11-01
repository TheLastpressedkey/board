import React, { useRef, useState, useEffect } from 'react';
import { Share2, Library } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';
import { HamburgerMenu } from './HamburgerMenu';
import { FloatingToolbar } from './FloatingToolbar';
import { SelectionPanel } from './SelectionPanel';
import { Tool, DrawingElement } from './types';

interface WhiteboardProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  metadata?: { drawing?: string; elements?: DrawingElement[] };
  onDataChange?: (data: { drawing: string; elements: DrawingElement[] }) => void;
  cardId?: string;
}

interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
  imageData?: ImageData;
  startX?: number;
  startY?: number;
}

export function WhiteboardNew({ onClose, onDragStart, metadata, onDataChange }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#ffffff');
  const [fillColor, setFillColor] = useState('transparent');
  const [lineWidth, setLineWidth] = useState(3);
  const [opacity, setOpacity] = useState(100);
  const [isLocked, setIsLocked] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [language, setLanguage] = useState('fr');
  const [zoom, setZoom] = useState(100);

  // Selection state
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [elements, setElements] = useState<DrawingElement[]>([]);

  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      let oldImageData = null;

      if (canvas.width > 0 && canvas.height > 0) {
        try {
          oldImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
          oldImageData = null;
        }
      }

      canvas.width = rect.width;
      canvas.height = rect.height;

      ctx.fillStyle = isTerminalTheme ? '#000000' : '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (metadata?.drawing) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = metadata.drawing;
      } else if (oldImageData) {
        try {
          ctx.putImageData(oldImageData, 0, 0);
        } catch (e) {
          // Ignore
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [metadata?.drawing, isTerminalTheme]);

  // Draw selection rectangle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selection) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawSelectionBox = () => {
      // Redraw canvas
      if (metadata?.drawing) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = isTerminalTheme ? '#000000' : '#1f2937';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          // Draw selection
          drawSelection(ctx);
        };
        img.src = metadata.drawing;
      } else {
        drawSelection(ctx);
      }
    };

    const drawSelection = (ctx: CanvasRenderingContext2D) => {
      // Draw selection rectangle
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
      ctx.setLineDash([]);

      // Draw resize handles
      const handleSize = 8;
      const handles = [
        { x: selection.x, y: selection.y }, // top-left
        { x: selection.x + selection.width / 2, y: selection.y }, // top-center
        { x: selection.x + selection.width, y: selection.y }, // top-right
        { x: selection.x + selection.width, y: selection.y + selection.height / 2 }, // right-center
        { x: selection.x + selection.width, y: selection.y + selection.height }, // bottom-right
        { x: selection.x + selection.width / 2, y: selection.y + selection.height }, // bottom-center
        { x: selection.x, y: selection.y + selection.height }, // bottom-left
        { x: selection.x, y: selection.y + selection.height / 2 }, // left-center
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
    };

    drawSelectionBox();
  }, [selection, metadata?.drawing, isTerminalTheme]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'select') {
      // Check if clicking inside existing selection
      if (selection &&
          x >= selection.x && x <= selection.x + selection.width &&
          y >= selection.y && y <= selection.y + selection.height) {
        setIsDraggingSelection(true);
        setDragOffset({ x: x - selection.x, y: y - selection.y });
      } else {
        // Start new selection
        setIsSelecting(true);
        setSelection({
          x,
          y,
          width: 0,
          height: 0,
          startX: x,
          startY: y
        });
      }
    } else if (tool === 'hand') {
      // Hand tool - no action for now
      return;
    } else {
      // Drawing tools
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'select') {
      if (isSelecting && selection?.startX !== undefined && selection?.startY !== undefined) {
        // Update selection rectangle
        const newWidth = x - selection.startX;
        const newHeight = y - selection.startY;

        setSelection({
          ...selection,
          x: newWidth < 0 ? x : selection.startX,
          y: newHeight < 0 ? y : selection.startY,
          width: Math.abs(newWidth),
          height: Math.abs(newHeight)
        });
      } else if (isDraggingSelection && selection) {
        // Move selection
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;

        // Save the selected area if not already saved
        if (!selection.imageData) {
          const imageData = ctx.getImageData(
            selection.x,
            selection.y,
            selection.width,
            selection.height
          );

          // Clear the original area
          const eraserColor = isTerminalTheme ? '#000000' : '#1f2937';
          ctx.fillStyle = eraserColor;
          ctx.fillRect(selection.x, selection.y, selection.width, selection.height);

          setSelection({ ...selection, imageData, x: newX, y: newY });
        } else {
          setSelection({ ...selection, x: newX, y: newY });
        }
      }
    } else if (isDrawing && !isLocked) {
      if (tool === 'pen') {
        ctx.globalAlpha = opacity / 100;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (tool === 'eraser') {
        const eraserColor = isTerminalTheme ? '#000000' : '#1f2937';
        ctx.strokeStyle = eraserColor;
        ctx.lineWidth = lineWidth * 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (tool === 'select') {
      if (isSelecting) {
        setIsSelecting(false);
        // Capture the selected area
        if (selection && selection.width > 5 && selection.height > 5) {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const imageData = ctx.getImageData(
                selection.x,
                selection.y,
                selection.width,
                selection.height
              );
              setSelection({ ...selection, imageData });
            }
          }
        } else {
          setSelection(null);
        }
      } else if (isDraggingSelection && selection?.imageData) {
        // Place the selection
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx && selection.imageData) {
            ctx.putImageData(selection.imageData, selection.x, selection.y);
            saveDrawing();
          }
        }
        setIsDraggingSelection(false);
      }
    } else {
      setIsDrawing(false);
      saveDrawing();
    }
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onDataChange) return;

    const dataUrl = canvas.toDataURL();
    onDataChange({ drawing: dataUrl, elements });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = isTerminalTheme ? '#000000' : '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSelection(null);
    saveDrawing();
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // Selection actions
  const handleDeleteSelection = () => {
    if (!selection) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const eraserColor = isTerminalTheme ? '#000000' : '#1f2937';
    ctx.fillStyle = eraserColor;
    ctx.fillRect(selection.x, selection.y, selection.width, selection.height);

    setSelection(null);
    saveDrawing();
  };

  const handleDuplicateSelection = () => {
    if (!selection || !selection.imageData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Place duplicate slightly offset
    ctx.putImageData(selection.imageData, selection.x + 20, selection.y + 20);

    setSelection({
      ...selection,
      x: selection.x + 20,
      y: selection.y + 20
    });
    saveDrawing();
  };

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgHeader = isTerminalTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(31, 41, 55, 0.95)';
  const bgButton = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 65, 81, 0.8)';
  const bgButtonActive = isTerminalTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)';
  const bgButtonHover = isTerminalTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(55, 65, 81, 0.5)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 65, 81, 0.5)';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;

  const getCursorStyle = () => {
    if (tool === 'hand') return 'grab';
    if (tool === 'select') return 'crosshair';
    if (tool === 'text') return 'text';
    if (tool === 'pen' || tool === 'eraser') return 'crosshair';
    return 'crosshair';
  };

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden relative" style={{ backgroundColor: bgMain }}>
      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full"
          style={{ cursor: getCursorStyle() }}
        />

        {/* Hamburger Menu - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <HamburgerMenu
            onOpen={() => console.log('Open')}
            onSave={() => console.log('Save')}
            onExport={downloadDrawing}
            onCollaboration={() => console.log('Collaboration')}
            onCommandPalette={() => console.log('Command Palette')}
            onFind={() => console.log('Find')}
            onHelp={() => console.log('Help')}
            onReset={clearCanvas}
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

        {/* Selection Panel - Left Side */}
        {selection && tool === 'select' && (
          <SelectionPanel
            selectedElements={[selection]}
            onStrokeColorChange={setColor}
            onFillColorChange={setFillColor}
            onStrokeWidthChange={setLineWidth}
            onOpacityChange={setOpacity}
            onBringToFront={() => console.log('Bring to front')}
            onSendToBack={() => console.log('Send to back')}
            onBringForward={() => console.log('Bring forward')}
            onSendBackward={() => console.log('Send backward')}
            onDuplicate={handleDuplicateSelection}
            onDelete={handleDeleteSelection}
            onCreateLink={() => console.log('Create link')}
            strokeColor={color}
            fillColor={fillColor}
            strokeWidth={lineWidth}
            opacity={opacity}
            bgColor={bgHeader}
            textColor={textColor}
            textMuted={textMuted}
            borderColor={borderColor}
            hoverBg={bgButtonHover}
          />
        )}

        {/* Floating Toolbar - Top Center */}
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

        {/* Right Side Buttons - Partager & Bibliothèque */}
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
            onClick={() => console.log('Share')}
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
            onClick={() => console.log('Library')}
          >
            <Library className="w-4 h-4" />
            <span className="text-sm font-medium">Bibliothèque</span>
          </button>
        </div>

        {/* Bottom Bar - Zoom & Status */}
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
              {selection ? 'Déplacez la sélection ou modifiez ses propriétés' : 'Cliquez et faites glisser, relâchez quand vous avez terminé'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
