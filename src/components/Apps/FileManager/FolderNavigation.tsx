import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface FolderNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const FolderNavigation: React.FC<FolderNavigationProps> = ({ currentPath, onNavigate }) => {
  // Diviser le chemin en segments
  const pathSegments = currentPath === '/' ? [] : currentPath.split('/').filter(Boolean);
  
  return (
    <div className="flex items-center space-x-1 text-sm">
      {/* Bouton Home */}
      <button
        onClick={() => onNavigate('/')}
        className={`
          flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
          ${currentPath === '/' ? 'bg-gray-100 dark:bg-gray-700' : ''}
        `}
      >
        <Home className="w-4 h-4" />
      </button>

      {/* Segments du chemin */}
      {pathSegments.map((segment, index) => {
        const segmentPath = '/' + pathSegments.slice(0, index + 1).join('/');
        const isLast = index === pathSegments.length - 1;
        
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => onNavigate(segmentPath)}
              className={`
                px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                ${isLast ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''}
              `}
            >
              {segment}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};
