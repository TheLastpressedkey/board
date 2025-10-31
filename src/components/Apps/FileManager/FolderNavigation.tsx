import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface FolderNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isTerminalTheme: boolean;
  textColor: string;
  textMuted: string;
  primaryColor: string;
}

export const FolderNavigation: React.FC<FolderNavigationProps> = ({ currentPath, onNavigate, isTerminalTheme, textColor, textMuted, primaryColor }) => {
  // Diviser le chemin en segments
  const pathSegments = currentPath === '/' ? [] : currentPath.split('/').filter(Boolean);
  
  const bgHover = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgb(55, 65, 81)';
  const bgActive = isTerminalTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgb(55, 65, 81)';

  return (
    <div className="flex items-center space-x-1 text-sm">
      {/* Bouton Home */}
      <button
        onClick={() => onNavigate('/')}
        className="flex items-center px-2 py-1 rounded transition-colors"
        style={{
          backgroundColor: currentPath === '/' ? bgActive : 'transparent',
          color: currentPath === '/' ? textColor : textMuted
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgHover}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentPath === '/' ? bgActive : 'transparent'}
      >
        <Home className="w-4 h-4" />
      </button>

      {/* Segments du chemin */}
      {pathSegments.map((segment, index) => {
        const segmentPath = '/' + pathSegments.slice(0, index + 1).join('/');
        const isLast = index === pathSegments.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4" style={{ color: textMuted }} />
            <button
              onClick={() => onNavigate(segmentPath)}
              className="px-2 py-1 rounded transition-colors"
              style={{
                backgroundColor: isLast ? bgActive : 'transparent',
                color: isLast ? textColor : textMuted,
                fontWeight: isLast ? 500 : 400
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isLast ? bgActive : 'transparent'}
            >
              {segment}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};
