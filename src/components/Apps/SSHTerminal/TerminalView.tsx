import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io, Socket } from 'socket.io-client';
import '@xterm/xterm/css/xterm.css';
import { Loader2 } from 'lucide-react';

interface TerminalViewProps {
  host: {
    id: string;
    name: string;
    host: string;
    port: number;
    username: string;
    password?: string;
    privateKey?: string;
    authType: 'password' | 'key';
  };
  backendUrl: string;
  onDisconnect: () => void;
  themeColors: any;
  bgMain: string;
  textColor: string;
  textMuted: string;
}

export function TerminalView({
  host,
  backendUrl,
  onDisconnect,
  themeColors,
  bgMain,
  textColor,
  textMuted
}: TerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const socket = useRef<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Créer le terminal
    terminal.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: bgMain,
        foreground: textColor,
        cursor: themeColors.primary,
        selection: `${themeColors.primary}40`,
      },
      cols: 80,
      rows: 24,
    });

    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);
    terminal.current.open(terminalRef.current);

    // Ajuster la taille initiale
    setTimeout(() => {
      if (fitAddon.current) {
        fitAddon.current.fit();
      }
    }, 100);

    // Connexion WebSocket
    socket.current = io(backendUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.current.on('connect', () => {
      console.log('Connected to backend');

      // Envoyer config SSH
      const config = {
        host: host.host,
        port: host.port,
        username: host.username,
        ...(host.authType === 'password'
          ? { password: host.password }
          : { privateKey: host.privateKey }
        ),
        rows: terminal.current?.rows || 24,
        cols: terminal.current?.cols || 80,
      };

      socket.current?.emit('ssh-connect', config);
    });

    socket.current.on('ssh-status', (data) => {
      if (data.status === 'connected') {
        setIsConnecting(false);
        terminal.current?.writeln(`\r\n✓ Connected to ${host.name}\r\n`);
      } else if (data.status === 'disconnected') {
        terminal.current?.writeln('\r\n✗ Disconnected from server\r\n');
        onDisconnect();
      }
    });

    socket.current.on('ssh-data', (data) => {
      terminal.current?.write(data);
    });

    socket.current.on('ssh-error', (data) => {
      setError(data.message);
      setIsConnecting(false);
      terminal.current?.writeln(`\r\n✗ Error: ${data.message}\r\n`);
    });

    // Envoyer input au serveur
    terminal.current.onData((data) => {
      socket.current?.emit('ssh-input', data);
    });

    // Gérer le redimensionnement avec ResizeObserver
    const handleResize = () => {
      if (fitAddon.current && terminal.current) {
        fitAddon.current.fit();
        socket.current?.emit('ssh-resize', {
          rows: terminal.current.rows,
          cols: terminal.current.cols,
        });
      }
    };

    // Observer les changements de taille du conteneur
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    // Aussi écouter window resize pour les changements de fenêtre
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      socket.current?.disconnect();
      terminal.current?.dispose();
    };
  }, [host, backendUrl]);

  // Mettre à jour le thème quand il change
  useEffect(() => {
    if (terminal.current) {
      terminal.current.options.theme = {
        background: bgMain,
        foreground: textColor,
        cursor: themeColors.primary,
        selection: `${themeColors.primary}40`,
      };
    }
  }, [bgMain, textColor, themeColors]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
            Erreur de connexion
          </h3>
          <p className="text-sm mb-4" style={{ color: textMuted }}>
            {error}
          </p>
          <button
            onClick={onDisconnect}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: themeColors.primary, color: 'white' }}
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col relative"
      onContextMenu={(e) => e.stopPropagation()}
    >
      {/* Loading overlay */}
      {isConnecting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backgroundColor: `${bgMain}CC` }}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: themeColors.primary }} />
            <p className="text-sm" style={{ color: textMuted }}>
              Connexion à {host.name}...
            </p>
          </div>
        </div>
      )}

      {/* Terminal */}
      <div
        ref={terminalRef}
        className="flex-1 p-2"
        style={{ backgroundColor: bgMain }}
      />
    </div>
  );
}
