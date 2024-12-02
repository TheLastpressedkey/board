import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Share2, User, PlusCircle, Save, Wifi, WifiOff, Settings } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { UserSettings } from '../UserSettings/UserSettings';

interface BottomBarProps {
  scrollProgress: number;
  onCreateBoard: () => void;
  onSaveBoards: () => Promise<void>;
  username: string;
  email: string;
  hasUnsavedChanges: boolean;
  onUpdateUsername: (newUsername: string) => void;
}

export function BottomBar({ 
  scrollProgress, 
  onCreateBoard, 
  onSaveBoards, 
  username,
  email,
  hasUnsavedChanges,
  onUpdateUsername
}: BottomBarProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const { isOnline, isSyncing, setIsSyncing } = useNetworkStatus();
  const [showSettings, setShowSettings] = useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSave = async () => {
    if (!isOnline || isSyncing) return;
    
    try {
      setIsSyncing(true);
      await onSaveBoards();
    } catch (error) {
      console.error('Error saving boards:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-green-600/20 backdrop-blur-sm px-4 py-2 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-gray-300" />
          </div>
          <span className="text-gray-300 text-xs">{username}</span>
          <button className="ml-1 px-1.5 py-0.5 text-gray-300 hover:text-gray-100 text-xs flex items-center gap-1 hidden md:flex">
            <Share2 className="w-3 h-3" />
            <span>Share</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button className="p-0.5 hover:bg-green-500/20 rounded text-gray-300 hover:text-gray-100">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <div className="text-gray-300 font-mono text-xs">
            {currentTime.toLocaleTimeString()} - {currentTime.toLocaleDateString()}
          </div>
          <button className="p-0.5 hover:bg-green-500/20 rounded text-gray-300 hover:text-gray-100">
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="w-24 h-0.5 bg-pink-500/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-pink-500 rounded-full transition-all duration-300"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className={`text-sm ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
            {isOnline ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!isOnline || isSyncing || !hasUnsavedChanges}
            className={`p-1 rounded text-gray-300 transition-all relative
              ${!isOnline || !hasUnsavedChanges ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500/20 hover:text-gray-100'}`}
            title="Save boards"
          >
            <Save className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
            {hasUnsavedChanges && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
            )}
          </button>

          <button
            onClick={onCreateBoard}
            className="p-1 hover:bg-green-500/20 rounded text-gray-300 hover:text-gray-100"
          >
            <PlusCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-1 hover:bg-green-500/20 rounded text-gray-300 hover:text-gray-100"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSettings && (
        <UserSettings
          username={username}
          email={email}
          onUpdateUsername={onUpdateUsername}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}