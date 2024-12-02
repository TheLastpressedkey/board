import React, { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
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

export default function App() {
  const { user, loading, signOut } = useAuth();
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
    currentBoardData,
    updateCardDimensions,
    loadBoards,
    saveBoards,
    hasUnsavedChanges
  } = useBoards();
  
  const { contextMenu, setContextMenu, handleContextMenu } = useContextMenu();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showLinkInput, setShowLinkInput] = useState(false);

  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user, loadBoards]);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text && isValidUrl(text)) {
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

  if (loading) {
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
    <div className="min-h-screen bg-gray-900" onContextMenu={handleContextMenu}>
      <Sidebar
        boards={boards}
        currentBoard={currentBoard || ''}
        onBoardSelect={setCurrentBoard}
        onBoardDelete={deleteBoard}
        user={user}
        onSignOut={signOut}
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
        username={user.email?.split('@')[0] || 'User'}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
}