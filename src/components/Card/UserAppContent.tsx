import React, { useCallback, useRef, useEffect } from 'react';
import Editor from "@monaco-editor/react";
import { useUserApp } from '../../hooks/useUserApp';
import { useTheme } from '../../contexts/ThemeContext';

interface UserAppContentProps {
  content: string;
  onChange: (content: string) => void;
  isEditing: boolean;
}

export function UserAppContent({ content, onChange, isEditing }: UserAppContentProps) {
  const { renderedContent, error } = useUserApp(content);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { themeColors } = useTheme();

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  }, [onChange]);

  // Fonction pour créer un environnement d'exécution sécurisé
  const createSandbox = useCallback(() => {
    if (!iframeRef.current) return;

    const sandbox = iframeRef.current;
    const sandboxContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            :root {
              --theme-primary: ${themeColors.primary};
              --theme-scrollbar: ${themeColors.scrollbar};
              --theme-menu-bg: ${themeColors.menuBg};
              --theme-menu-hover: ${themeColors.menuHover};
            }
            
            body { 
              margin: 0; 
              font-family: system-ui, sans-serif;
              background: transparent;
            }
            
            #app {
              height: 100vh;
              width: 100vw;
              overflow: auto;
            }

            /* Custom Scrollbar */
            ::-webkit-scrollbar {
              width: 4px;
              height: 4px;
            }

            ::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb {
              background: var(--theme-scrollbar);
              border-radius: 4px;
            }

            ::-webkit-scrollbar-corner {
              background: transparent;
            }
          </style>
        </head>
        <body>
          <div id="app"></div>
          <script>
            // API sécurisée exposée à l'application
            window.weboardAPI = {
              theme: {
                colors: ${JSON.stringify(themeColors)},
                getCssVariable: (name) => getComputedStyle(document.documentElement).getPropertyValue(name)
              },
              storage: {
                get: (key) => localStorage.getItem(key),
                set: (key, value) => localStorage.setItem(key, value)
              },
              ui: {
                showNotification: (message) => {
                  const notification = document.createElement('div');
                  notification.textContent = message;
                  notification.style.cssText = \`
                    position: fixed;
                    top: 1rem;
                    right: 1rem;
                    padding: 1rem;
                    background: var(--theme-menu-bg);
                    color: white;
                    border: 1px solid var(--theme-primary);
                    border-radius: 0.5rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    z-index: 9999;
                  \`;
                  document.body.appendChild(notification);
                  setTimeout(() => notification.remove(), 3000);
                }
              }
            };

            // Exécution sécurisée du code utilisateur
            try {
              ${content}
            } catch (error) {
              console.error('Error in user app:', error);
              weboardAPI.ui.showNotification('Error: ' + error.message);
            }
          </script>
        </body>
      </html>
    `;

    sandbox.srcdoc = sandboxContent;
  }, [content, themeColors]);

  useEffect(() => {
    if (!isEditing) {
      createSandbox();
    }
  }, [isEditing, createSandbox]);

  return (
    <div className="h-full flex flex-col">
      {isEditing ? (
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={content}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on'
          }}
        />
      ) : (
        <div className="w-full h-full overflow-hidden">
          {error ? (
            <div className="p-4 text-red-500">
              Error: {error}
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
              title="User App Preview"
            />
          )}
        </div>
      )}
    </div>
  );
}