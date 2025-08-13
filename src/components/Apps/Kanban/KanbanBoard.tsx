import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTask, KanbanColumn as IKanbanColumn } from './types';
import { useTheme } from '../../../contexts/ThemeContext';

interface KanbanBoardProps {
  columns: IKanbanColumn[];
  onTaskMove: (taskId: string, source: IKanbanColumn['id'], destination: IKanbanColumn['id'], position: number) => void;
  onTaskEdit: (taskId: string, updates: Partial<KanbanTask>) => void;
  onTaskDelete: (taskId: string) => void;
  onAddTask: (columnId: IKanbanColumn['id'], task: Omit<KanbanTask, 'id' | 'position' | 'createdAt'>) => void;
}

export function KanbanBoard({ 
  columns, 
  onTaskMove, 
  onTaskEdit, 
  onTaskDelete,
  onAddTask 
}: KanbanBoardProps) {
  const { themeColors } = useTheme();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId as IKanbanColumn['id'];
    const destinationId = result.destination.droppableId as IKanbanColumn['id'];
    const taskId = result.draggableId;
    const newPosition = result.destination.index;

    onTaskMove(taskId, sourceId, destinationId, newPosition);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex-1 flex gap-4 p-4 overflow-x-auto min-h-0">
        {columns.map((column) => (
          <div 
            key={column.id}
            className="flex-1 min-w-[300px] max-w-[350px] flex flex-col rounded-lg"
            style={{ backgroundColor: themeColors.menuBg }}
          >
            <KanbanColumn
              column={column}
              onTaskEdit={onTaskEdit}
              onTaskDelete={onTaskDelete}
              onAddTask={onAddTask}
            />
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}