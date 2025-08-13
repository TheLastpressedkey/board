import { useState, useEffect, useCallback } from 'react';
import { KanbanTask, KanbanBoard, KanbanColumn } from './types';
import { supabase } from '../../../lib/supabase';

const DEFAULT_BOARD: KanbanBoard = {
  id: '',
  columns: [
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'inProgress', title: 'In Progress', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] }
  ],
  customTodoTitle: 'To Do',
  customInProgressTitle: 'In Progress',
  customDoneTitle: 'Done'
};

export function useKanban(metadata?: any, onDataChange?: (data: any) => void) {
  const [board, setBoard] = useState<KanbanBoard>(DEFAULT_BOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (metadata?.boardId) {
      loadBoard(metadata.boardId);
    } else {
      createNewBoard();
    }
  }, [metadata]);

  const loadBoard = async (boardId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: boardData, error: boardError } = await supabase
        .from('kanban_boards')
        .select('*')
        .eq('id', boardId)
        .single();

      if (boardError) throw boardError;

      const { data: tasksData, error: tasksError } = await supabase
        .from('kanban_tasks')
        .select('*')
        .eq('board_id', boardId)
        .order('position');

      if (tasksError) throw tasksError;

      // Organize tasks into columns
      const columns = DEFAULT_BOARD.columns.map(col => ({
        ...col,
        title: boardData[`custom_${col.id}_title`] || col.title,
        tasks: tasksData
          .filter(task => task.status === col.id)
          .sort((a, b) => a.position - b.position)
          .map(task => ({
            ...task,
            createdAt: new Date(task.created_at)
          }))
      }));

      setBoard({
        id: boardId,
        columns,
        customTodoTitle: boardData.custom_todo_title,
        customInProgressTitle: boardData.custom_in_progress_title,
        customDoneTitle: boardData.custom_done_title
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
      console.error('Error loading board:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewBoard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create app instance first
      const { data: appInstance, error: appError } = await supabase
        .from('app_instances')
        .insert({
          app_type: 'kanban',
          title: 'Kanban Board'
        })
        .select()
        .single();

      if (appError) throw appError;

      // Create kanban board
      const { data: board, error: boardError } = await supabase
        .from('kanban_boards')
        .insert({
          instance_id: appInstance.id,
          custom_todo_title: DEFAULT_BOARD.customTodoTitle,
          custom_in_progress_title: DEFAULT_BOARD.customInProgressTitle,
          custom_done_title: DEFAULT_BOARD.customDoneTitle
        })
        .select()
        .single();

      if (boardError) throw boardError;

      if (onDataChange) {
        onDataChange({ boardId: board.id });
      }

      setBoard({
        ...DEFAULT_BOARD,
        id: board.id
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
      console.error('Error creating board:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskMove = useCallback(async (
    taskId: string,
    sourceId: KanbanColumn['id'],
    destinationId: KanbanColumn['id'],
    newPosition: number
  ) => {
    try {
      // Update local state first for optimistic UI
      setBoard(prev => {
        const newColumns = prev.columns.map(col => ({
          ...col,
          tasks: [...col.tasks]
        }));

        // Find and remove task from source column
        const sourceColumn = newColumns.find(col => col.id === sourceId)!;
        const taskIndex = sourceColumn.tasks.findIndex(t => t.id === taskId);
        const [task] = sourceColumn.tasks.splice(taskIndex, 1);

        // Add task to destination column
        const destinationColumn = newColumns.find(col => col.id === destinationId)!;
        destinationColumn.tasks.splice(newPosition, 0, {
          ...task,
          status: destinationId
        });

        // Update positions
        destinationColumn.tasks.forEach((t, i) => {
          t.position = i;
        });

        return { ...prev, columns: newColumns };
      });

      // Update in database
      const { error } = await supabase
        .from('kanban_tasks')
        .update({
          status: destinationId,
          position: newPosition
        })
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error('Error moving task:', err);
      // Reload board to ensure consistency
      loadBoard(board.id);
    }
  }, [board.id]);

  const handleTaskEdit = useCallback(async (
    taskId: string,
    updates: Partial<KanbanTask>
  ) => {
    try {
      // Update local state first
      setBoard(prev => ({
        ...prev,
        columns: prev.columns.map(col => ({
          ...col,
          tasks: col.tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        }))
      }));

      // Update in database
      const { error } = await supabase
        .from('kanban_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating task:', err);
      loadBoard(board.id);
    }
  }, [board.id]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      // Update local state first
      setBoard(prev => ({
        ...prev,
        columns: prev.columns.map(col => ({
          ...col,
          tasks: col.tasks.filter(task => task.id !== taskId)
        }))
      }));

      // Delete from database
      const { error } = await supabase
        .from('kanban_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting task:', err);
      loadBoard(board.id);
    }
  }, [board.id]);

  const handleAddTask = useCallback(async (
    columnId: KanbanColumn['id'],
    task: Omit<KanbanTask, 'id' | 'position' | 'createdAt'>
  ) => {
    try {
      const column = board.columns.find(col => col.id === columnId)!;
      const position = column.tasks.length;

      // Insert into database
      const { data: newTask, error } = await supabase
        .from('kanban_tasks')
        .insert({
          board_id: board.id,
          ...task,
          position
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setBoard(prev => ({
        ...prev,
        columns: prev.columns.map(col =>
          col.id === columnId
            ? {
                ...col,
                tasks: [
                  ...col.tasks,
                  {
                    ...newTask,
                    createdAt: new Date(newTask.created_at)
                  }
                ]
              }
            : col
        )
      }));
    } catch (err) {
      console.error('Error adding task:', err);
      loadBoard(board.id);
    }
  }, [board.id]);

  return {
    board,
    isLoading,
    error,
    handleTaskMove,
    handleTaskEdit,
    handleTaskDelete,
    handleAddTask
  };
}