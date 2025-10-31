import { useRef, useState, useEffect } from 'react';
import { GripHorizontal, X, Palette, Eraser, Trash2, Download, Pencil } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';

interface WhiteboardProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  metadata?: { drawing?: string };
  onDataChange?: (data: { drawing: string }) => void;
  cardId?: string;
}

type Tool = 'pen' | 'eraser';

export function Whiteboard({ onClose, onDragStart, metadata, onDataChange }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  const colors = ['#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#000000'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  }, [metadata?.drawing]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const eraserColor = isTerminalTheme ? '#000000' : '#1f2937';
    ctx.strokeStyle = tool === 'eraser' ? eraserColor : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveDrawing();
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onDataChange) return;

    const dataUrl = canvas.toDataURL();
    onDataChange({ drawing: dataUrl });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = isTerminalTheme ? '#000000' : '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgHeader = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const bgButton = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgb(55, 65, 81)';
  const bgButtonHover = isTerminalTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(55, 65, 81, 0.5)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgb(209, 213, 219)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 65, 81, 0.5)';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden" style={{ backgroundColor: bgMain }}>
      <div
        className="p-3 flex items-center justify-between"
        style={{ backgroundColor: bgHeader, borderBottom: `1px solid ${borderColor}` }}
      >
        <div
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
          onMouseDown={onDragStart}
        >
          <GripHorizontal className="w-5 h-5" style={{ color: textMuted }} />
          <Pencil
            className="w-5 h-5"
            style={{ color: primaryColor }}
          />
          <h2 className="text-lg font-semibold" style={{ color: textColor }}>Whiteboard</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('pen')}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: tool === 'pen' ? bgButton : 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgButtonHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = tool === 'pen' ? bgButton : 'transparent'}
            onMouseDown={(e) => e.stopPropagation()}
            title="Pen"
          >
            <Pencil className="w-4 h-4" style={{ color: textMuted }} />
          </button>

          <button
            onClick={() => setTool('eraser')}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: tool === 'eraser' ? bgButton : 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgButtonHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = tool === 'eraser' ? bgButton : 'transparent'}
            onMouseDown={(e) => e.stopPropagation()}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" style={{ color: textMuted }} />
          </button>

          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-lg transition-colors flex items-center gap-2"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgButtonHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onMouseDown={(e) => e.stopPropagation()}
              title="Color"
            >
              <Palette className="w-4 h-4" style={{ color: textMuted }} />
              <div
                className="w-5 h-5 rounded"
                style={{ backgroundColor: color, border: `2px solid ${borderColor}` }}
              />
            </button>

            {showColorPicker && (
              <div
                className="absolute left-0 top-full mt-1 p-2 rounded-lg shadow-xl flex gap-1.5 z-50"
                style={{ backgroundColor: bgHeader, border: `1px solid ${borderColor}` }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setShowColorPicker(false);
                    }}
                    className="w-7 h-7 rounded transition-all hover:scale-110"
                    style={{
                      backgroundColor: c,
                      border: color === c ? `2px solid ${primaryColor}` : 'none'
                    }}
                    title={c}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-2">
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="brush-slider"
              style={{
                '--slider-color': primaryColor
              } as React.CSSProperties}
              onMouseDown={(e) => e.stopPropagation()}
              title="Line width"
            />
            <span className="text-xs w-6 text-center" style={{ color: textMuted }}>{lineWidth}</span>
          </div>

          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgButtonHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            onMouseDown={(e) => e.stopPropagation()}
            title="Clear canvas"
          >
            <Trash2 className="w-4 h-4" style={{ color: textMuted }} />
          </button>

          <button
            onClick={downloadDrawing}
            className="p-2 rounded-lg transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgButtonHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            onMouseDown={(e) => e.stopPropagation()}
            title="Download"
          >
            <Download className="w-4 h-4" style={{ color: textMuted }} />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgButtonHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-4 h-4" style={{ color: textMuted }} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  );
}
