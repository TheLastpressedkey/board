import React from 'react';
import { Layout, LogOut, X } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface SidebarProps {
  boards: { id: string; name: string; isMainBoard?: boolean }[];
  currentBoard: string;
  onBoardSelect: (id: string) => void;
  onBoardDelete?: (id: string) => void;
  user: User;
  onSignOut: () => void;
}

export function Sidebar({ 
  boards, 
  currentBoard, 
  onBoardSelect, 
  onBoardDelete,
  user, 
  onSignOut 
}: SidebarProps) {
  return (
    <div className="fixed left-4 top-4 z-50 flex flex-col gap-2">
      <div className="mb-4 p-2 bg-gray-800 rounded-lg">
        <div className="text-gray-300 text-sm truncate max-w-[120px]">
          {user.email?.split('@')[0]}
        </div>
      </div>

      {boards.map((board) => (
        <div key={board.id} className="relative group">
          <button
            onClick={() => onBoardSelect(board.id)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all
              ${currentBoard === board.id 
                ? 'bg-pink-500 text-white' 
                : 'text-gray-400 hover:text-gray-200'
              }`}
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

      <button
        onClick={onSignOut}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-200 mt-auto"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}