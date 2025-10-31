import { useRef, useState, useEffect } from 'react';
import { GripHorizontal, X, Palette, Eraser, Trash2, Download, Pencil } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

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

      ctx.fillStyle = '#1f2937';
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

    ctx.strokeStyle = tool === 'eraser' ? '#1f2937' : color;
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

    ctx.fillStyle = '#1f2937';
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

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      <div
        className="p-3 border-b border-gray-700/50 flex items-center justify-between"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <div
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
          onMouseDown={onDragStart}
        >
          <GripHorizontal className="w-5 h-5 text-gray-500" />
          <Pencil
            className="w-5 h-5"
            style={{ color: themeColors.primary }}
          />
          <h2 className="text-lg font-semibold text-white">Whiteboard</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'pen' ? 'bg-gray-700' : 'hover:bg-gray-700/50'
            }`}
            onMouseDown={(e) => e.stopPropagation()}
            title="Pen"
          >
            <Pencil className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'eraser' ? 'bg-gray-700' : 'hover:bg-gray-700/50'
            }`}
            onMouseDown={(e) => e.stopPropagation()}
            title="Eraser"
          >
            <Eraser className="w-4 h-4 text-gray-300" />
          </button>

          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors flex items-center gap-2"
              onMouseDown={(e) => e.stopPropagation()}
              title="Color"
            >
              <Palette className="w-4 h-4 text-gray-300" />
              <div
                className="w-5 h-5 rounded border-2 border-gray-600"
                style={{ backgroundColor: color }}
              />
            </button>

            {showColorPicker && (
              <div
                className="absolute left-0 top-full mt-1 p-2 rounded-lg shadow-xl border border-gray-700 flex gap-1.5 z-50"
                style={{ backgroundColor: themeColors.menuBg }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setShowColorPicker(false);
                    }}
                    className={`w-7 h-7 rounded transition-all hover:scale-110 ${
                      color === c ? 'ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: c }}
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
                '--slider-color': themeColors.primary
              } as React.CSSProperties}
              onMouseDown={(e) => e.stopPropagation()}
              title="Line width"
            />
            <span className="text-xs text-gray-400 w-6 text-center">{lineWidth}</span>
          </div>

          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
            title="Clear canvas"
          >
            <Trash2 className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={downloadDrawing}
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
            title="Download"
          >
            <Download className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-4 h-4 text-gray-400" />
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
