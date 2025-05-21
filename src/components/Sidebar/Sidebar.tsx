import React, { useState } from 'react';
import { Layout, LogOut, X, Search, Bot } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { SearchModal } from './SearchModal';
import { Chatbot } from '../Chatbot/Chatbot';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  boards: { id: string; name: string; isMainBoard?: boolean }[];
  currentBoard: string;
  onBoardSelect: (id: string) => void;
  onBoardDelete?: (id: string) => void;
  user: User;
  onSignOut: () => void;
  onCreateCard?: (position: { x: number; y: number }, type: string, content: string) => void;
}

export function Sidebar({ 
  boards, 
  currentBoard, 
  onBoardSelect, 
  onBoardDelete,
  user, 
  onSignOut,
  onCreateCard
}: SidebarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const { themeColors } = useTheme();

  const activeButtonStyle = `bg-[${themeColors.primary}] text-white`;
  const inactiveButtonStyle = 'text-gray-400 hover:text-gray-200';

  const handleChatbotToggle = () => {
    setShowChatbot(!showChatbot);
  };

  return (
    <>
      <div className="fixed left-4 top-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => setShowSearch(true)}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
          title="Search cards"
        >
          <Search className="w-4 h-4" />
        </button>

        {boards.map((board) => (
          <div key={board.id} className="relative group">
            <button
              onClick={() => onBoardSelect(board.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all
                ${currentBoard === board.id ? activeButtonStyle : inactiveButtonStyle}`}
              style={{
                backgroundColor: currentBoard === board.id ? themeColors.primary : undefined
              }}
            >
              <Layout className="w-4 h-4" />
            </button>
            
            {!board.isMainBoard && onBoardDelete && (
              <button
                onClick={() => onBoardDelete(board.id)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2 h-2 text-white" />
              </button>
            )}
          </div>
        ))}

        {/* AI Chatbot Button */}
        <button
          onClick={handleChatbotToggle}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
          title="AI Assistant"
          style={{
            backgroundColor: showChatbot ? themeColors.primary : undefined,
            color: showChatbot ? 'white' : undefined
          }}
        >
          <Bot className="w-4 h-4" />
        </button>

        <button
          onClick={onSignOut}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-200 mt-auto"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {showSearch && (
        <SearchModal
          boards={boards}
          currentBoard={currentBoard}
          onClose={() => setShowSearch(false)}
          onBoardSelect={onBoardSelect}
        />
      )}

      {showChatbot && (
        <Chatbot 
          onClose={handleChatbotToggle}
          onCreateCard={onCreateCard}
        />
      )}
    </>
  );
}
