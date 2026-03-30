import React, { useState } from 'react';
import { GripVertical, X, Edit2, Check } from 'lucide-react';
import { Video } from '../../../../services/youtubePlaylistStorage';

interface VideoListProps {
  videos: Video[];
  currentVideoIndex?: number;
  onVideoSelect?: (index: number) => void;
  onVideoRemove?: (index: number) => void;
  onVideoEdit?: (index: number, title: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  editable?: boolean;
  themeColor: string;
}

export function VideoList({
  videos,
  currentVideoIndex,
  onVideoSelect,
  onVideoRemove,
  onVideoEdit,
  onReorder,
  editable = false,
  themeColor
}: VideoListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (!editable) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!editable || draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (!editable || draggedIndex === null || !onReorder) return;

    if (draggedIndex !== toIndex) {
      onReorder(draggedIndex, toIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const startEdit = (index: number, currentTitle: string) => {
    setEditingIndex(index);
    setEditTitle(currentTitle);
  };

  const saveEdit = (index: number) => {
    if (editTitle.trim() && onVideoEdit) {
      onVideoEdit(index, editTitle.trim());
    }
    setEditingIndex(null);
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-lg">No videos yet</p>
        <p className="text-sm">Add some videos to your playlist</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {videos.map((video, index) => {
        const isPlaying = currentVideoIndex === index;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;
        const isEditing = editingIndex === index;

        return (
          <div
            key={video.id + index}
            draggable={editable}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={`group flex items-center gap-3 p-3 rounded-lg transition-all ${
              isDragging ? 'opacity-50' : ''
            } ${
              isDragOver ? 'ring-2' : ''
            } ${
              isPlaying
                ? 'bg-white/10'
                : 'hover:bg-white/5'
            }`}
            style={isDragOver ? { '--tw-ring-color': themeColor } as React.CSSProperties : {}}
          >
            {/* Drag Handle */}
            {editable && (
              <div className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-gray-500" />
              </div>
            )}

            {/* Index/Playing Indicator */}
            <div className="w-6 text-center flex-shrink-0">
              {isPlaying ? (
                <div className="flex items-center justify-center gap-0.5">
                  <div className="w-0.5 h-3 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
                  <div className="w-0.5 h-4 rounded-full animate-pulse" style={{ backgroundColor: themeColor, animationDelay: '0.2s' }} />
                  <div className="w-0.5 h-3 rounded-full animate-pulse" style={{ backgroundColor: themeColor, animationDelay: '0.4s' }} />
                </div>
              ) : (
                <span className="text-xs text-gray-500 font-medium">{index + 1}</span>
              )}
            </div>

            {/* Thumbnail */}
            <img
              src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
              alt={video.title}
              className="w-20 h-12 object-cover rounded flex-shrink-0 cursor-pointer"
              onClick={() => onVideoSelect?.(index)}
            />

            {/* Title */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit(index)}
                    className="flex-1 px-2 py-1 bg-gray-800 text-white text-sm rounded focus:outline-none focus:ring-1"
                    style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(index)}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Check className="w-4 h-4 text-green-400" />
                  </button>
                </div>
              ) : (
                <p
                  className={`text-sm truncate cursor-pointer ${
                    isPlaying ? 'text-white font-medium' : 'text-gray-300'
                  }`}
                  onClick={() => onVideoSelect?.(index)}
                >
                  {video.title}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {editable && onVideoEdit && !isEditing && (
                <button
                  onClick={() => startEdit(index, video.title)}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  title="Edit title"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              )}
              {editable && onVideoRemove && (
                <button
                  onClick={() => onVideoRemove(index)}
                  className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
