import React, { useState } from 'react';
import { GripVertical, Trash2, Edit2, Check, X } from 'lucide-react';
import { Video } from './YouTubePlayer';
import { useTheme } from '../../../contexts/ThemeContext';

interface PlaylistItemProps {
  video: Video;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onRemove: () => void;
  onUpdateTitle: (title: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export function PlaylistItem({
  video,
  index,
  isActive,
  onClick,
  onRemove,
  onUpdateTitle,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging
}: PlaylistItemProps) {
  const { themeColors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(video.title);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdateTitle(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(video.title);
    setIsEditing(false);
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onClick={!isEditing ? onClick : undefined}
      className={`
        group relative rounded-lg overflow-hidden cursor-pointer transition-all
        ${isActive ? 'ring-2' : 'hover:bg-gray-700/30'}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      style={{
        backgroundColor: isActive ? `${themeColors.primary}20` : 'transparent',
        '--tw-ring-color': themeColors.primary
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 p-2">
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Thumbnail */}
        <div className="relative flex-shrink-0">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-20 h-12 object-cover rounded"
          />
          {isActive && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded"
            >
              <div
                className="w-0 h-0 border-l-8 border-t-4 border-b-4 border-l-white border-t-transparent border-b-transparent"
              />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              autoFocus
            />
          ) : (
            <p className="text-sm text-white truncate">{video.title}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveTitle();
                }}
                className="p-1 hover:bg-gray-600 rounded"
                title="Save"
              >
                <Check className="w-4 h-4 text-green-500" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
                className="p-1 hover:bg-gray-600 rounded"
                title="Cancel"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1 hover:bg-gray-600 rounded"
                title="Edit title"
              >
                <Edit2 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="p-1 hover:bg-gray-600 rounded"
                title="Remove"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
