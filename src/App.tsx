import React, { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useUserProfile } from './hooks/useUserProfile';
import { AuthForm } from './components/Auth/AuthForm';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ContextMenu } from './components/ContextMenu/ContextMenu';
import { BottomBar } from './components/BottomBar/BottomBar';
import { Board } from './components/Board/Board';
import { useBoards } from './hooks/useBoards';
import { useContextMenu } from './hooks/useContextMenu';
import { isValidUrl } from './utils/linkUtils';
import { LinkInput } from './components/Card/LinkInput';
import { ContentType } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { CardThemeProvider } from './contexts/CardThemeContext';

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const defaultUsername = user?.email?.split('@')[0] || 'User';
  const { username, updateUsername, loading: profileLoading } = useUserProfile(defaultUsername);
  
  const { 
    boards, 
    currentBoard, 
    setCurrentBoard, 
    createBoard,
    deleteBoard,
    addCard,
    addLinkCard, 
    deleteCard, 
    updateCardPosition,
    updateCardContent,
    updateCardDimensions,
    updateCardMetadata,
    currentBoardData,
    loadBoards,
    saveBoards,
    hasUnsavedChanges,
    autoArrangeCards
  } = useBoards();
  
  const { contextMenu, setContextMenu, handleContextMenu } = useContextMenu();
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const [lastMousePosition, setLastMousePosition] = React.useState({ x: 0, y: 0 });

  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user, loadBoards]);

  // Track mouse position for paste functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setLastMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Utility function to convert global coordinates to board-relative coordinates
  const getRelativePositionFromGlobal = React.useCallback((globalX: number, globalY: number) => {
    const boardElement = document.querySelector('.bg-dots');
    if (boardElement) {
      const rect = boardElement.getBoundingClientRect();
      return {
        x: globalX - rect.left + boardElement.scrollLeft,
        y: globalY - rect.top + boardElement.scrollTop
      };
    }
    return { x: globalX, y: globalY }; // Fallback
  }, []);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      const activeElement = document.activeElement;
      const isInputActive = activeElement instanceof HTMLInputElement || 
                          activeElement instanceof HTMLTextAreaElement;

      if (text && isValidUrl(text) && !isInputActive) {
        if (contextMenu) {
          // If context menu is open, use its position
          const relativePosition = getRelativePositionFromGlobal(contextMenu.x, contextMenu.y);
          addLinkCard(relativePosition, text);
        } else {
          // Use current mouse position for paste
          const relativePosition = getRelativePositionFromGlobal(lastMousePosition.x, lastMousePosition.y);
          addLinkCard(relativePosition, text);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addLinkCard, contextMenu, lastMousePosition, getRelativePositionFromGlobal]);

  const handleCardTypeSelect = (type: ContentType, position?: { x: number; y: number }, dimensions?: { width: number; height: number }) => {
    if (type === 'link' && contextMenu) {
      setShowLinkInput(true);
    } else if (position) {
      addCard(position, type, dimensions);
      setContextMenu(null);
    } else if (contextMenu) {
      // Convert global coordinates to board-relative coordinates
      const relativePosition = getRelativePositionFromGlobal(contextMenu.x, contextMenu.y);
      addCard(relativePosition, type);
      setContextMenu(null);
    }
  };

  const handleCreateCard = (position: { x: number; y: number }, type: string, content: string) => {
    addCard(position, type as ContentType, undefined, content);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }

  return (
    <ThemeProvider>
      <CardThemeProvider>
        <div className="min-h-screen bg-gray-900" onContextMenu={handleContextMenu}>
          <Sidebar
            boards={boards}
            currentBoard={currentBoard || ''}
            onBoardSelect={setCurrentBoard}
            onBoardDelete={deleteBoard}
            user={user}
            onSignOut={signOut}
            onCreateCard={handleCreateCard}
          />

          {currentBoardData && (
            <Board
              board={currentBoardData}
              onDeleteCard={deleteCard}
              onUpdateCardPosition={updateCardPosition}
              onContentChange={updateCardContent}
              onScrollProgress={setScrollProgress}
              onAddCard={handleCardTypeSelect}
              onUpdateCardDimensions={updateCardDimensions}
              onUpdateCardMetadata={updateCardMetadata}
              onAutoArrange={autoArrangeCards}
            />
          )}

          {contextMenu && !showLinkInput && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onSelect={handleCardTypeSelect}
              onClose={() => setContextMenu(null)}
            />
          )}

          {showLinkInput && contextMenu && (
            <LinkInput
              position={contextMenu}
              onSubmit={(url) => {
                // Convert global coordinates to board-relative coordinates for link cards
                const relativePosition = getRelativePositionFromGlobal(contextMenu.x, contextMenu.y);
                addLinkCard(relativePosition, url);
                setShowLinkInput(false);
                setContextMenu(null);
              }}
              onClose={() => {
                setShowLinkInput(false);
                setContextMenu(null);
              }}
            />
          )}

          <BottomBar 
            scrollProgress={scrollProgress}
            onCreateBoard={createBoard}
            onSaveBoards={saveBoards}
            username={username}
            email={user.email || ''}
            hasUnsavedChanges={hasUnsavedChanges}
            onUpdateUsername={updateUsername}
            onAutoArrange={autoArrangeCards}
          />
        </div>
      </CardThemeProvider>
    </ThemeProvider>
  );
}
