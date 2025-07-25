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
    hasUnsavedChanges
  } = useBoards();
  
  const { contextMenu, setContextMenu, handleContextMenu } = useContextMenu();
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [showLinkInput, setShowLinkInput] = React.useState(false);

  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user, loadBoards]);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      const activeElement = document.activeElement;
      const isInputActive = activeElement instanceof HTMLInputElement || 
                          activeElement instanceof HTMLTextAreaElement;

      if (text && isValidUrl(text) && !isInputActive) {
        const rect = document.querySelector('.bg-dots')?.getBoundingClientRect();
        if (rect) {
          const position = {
            x: window.scrollX + rect.width / 2 - 150,
            y: window.scrollY + rect.height / 2 - 100
          };
          addLinkCard(position, text);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addLinkCard]);

  const handleCardTypeSelect = (type: ContentType, position?: { x: number; y: number }, dimensions?: { width: number; height: number }) => {
    if (type === 'link' && contextMenu) {
      setShowLinkInput(true);
    } else if (position) {
      addCard(position, type, dimensions);
      setContextMenu(null);
    } else if (contextMenu) {
      addCard(contextMenu, type);
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
              addLinkCard(contextMenu, url);
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
        />
      </div>
    </ThemeProvider>
  );
}
