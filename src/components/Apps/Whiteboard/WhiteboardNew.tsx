import React, { useRef, useState, useEffect } from 'react';
import { Share2, Library } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';
import { HamburgerMenu } from './HamburgerMenu';
import { FloatingToolbar } from './FloatingToolbar';
import { Tool } from './types';

interface WhiteboardProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  metadata?: { drawing?: string };
  onDataChange?: (data: { drawing: string }) => void;
  cardId?: string;
}

export function WhiteboardNew({ onClose, onDragStart, metadata, onDataChange }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [language, setLanguage] = useState('fr');
  const [zoom, setZoom] = useState(100);

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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked || tool === 'hand' || tool === 'select') return;

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
    if (!isDrawing || isLocked) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      const eraserColor = isTerminalTheme ? '#000000' : '#1f2937';
      ctx.strokeStyle = eraserColor;
      ctx.lineWidth = lineWidth * 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
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
  const bgHeader = isTerminalTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(31, 41, 55, 0.95)';
  const bgButton = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 65, 81, 0.8)';
  const bgButtonActive = isTerminalTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)';
  const bgButtonHover = isTerminalTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(55, 65, 81, 0.5)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 65, 81, 0.5)';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;

  const getCursorStyle = () => {
    switch (tool) {
      case 'hand':
        return 'grab';
      case 'select':
        return 'default';
      case 'text':
        return 'text';
      case 'pen':
        return 'crosshair';
      case 'eraser':
        return 'crosshair';
      default:
        return 'crosshair';
    }
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
              Cliquez et faites glisser, relâchez quand vous avez terminé
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
