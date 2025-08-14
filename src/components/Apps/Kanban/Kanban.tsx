import React from 'react';
import { KanbanBoard } from './KanbanBoard';
import { useKanban } from './useKanban';
import { useTheme } from '../../../contexts/ThemeContext';

interface KanbanProps {
  onClose: () => void;
  metadata?: any;
  onDataChange?: (data: any) => void;
}

export function Kanban({ onClose, metadata, onDataChange }: KanbanProps) {
  const { themeColors } = useTheme();
  const {
    board,
    handleTaskMove,
    handleTaskEdit,
    handleTaskDelete,
    handleAddTask,
    isLoading,
    error
  } = useKanban(metadata, onDataChange);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: themeColors.primary }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={board.columns}
          onTaskMove={handleTaskMove}
          onTaskEdit={handleTaskEdit}
          onTaskDelete={handleTaskDelete}
          onAddTask={handleAddTask}
        />
      </div>
    </div>
  );
}