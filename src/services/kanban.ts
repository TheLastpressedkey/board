import { supabase } from '../lib/supabase';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  labels: string[];
  position: number;
}

export interface KanbanBoard {
  id: string;
  boardId: string;
  customTodoTitle: string;
  customInProgressTitle: string;
  customDoneTitle: string;
  tasks: KanbanTask[];
}

export const kanban = {
  async getKanbanBoard(boardId: string): Promise<KanbanBoard | null> {
    try {
      // First check if the kanban board exists
      const { data: boards, error: boardError } = await supabase
        .from('kanban_boards')
        .select(`
          id,
          board_id,
          custom_todo_title,
          custom_in_progress_title,
          custom_done_title
        `)
        .eq('board_id', boardId);

      if (boardError) throw boardError;

      // If no board exists, create one
      if (!boards || boards.length === 0) {
        return this.createKanbanBoard(boardId);
      }

      const board = boards[0]; // Use the first board if multiple exist

      // Get tasks for the board
      const { data: tasks, error: tasksError } = await supabase
        .from('kanban_tasks')
        .select('*')
        .eq('board_id', board.id)
        .order('position');

      if (tasksError) throw tasksError;

      return {
        id: board.id,
        boardId: board.board_id,
        customTodoTitle: board.custom_todo_title,
        customInProgressTitle: board.custom_in_progress_title,
        customDoneTitle: board.custom_done_title,
        tasks: tasks || []
      };
    } catch (error) {
      console.error('Error in getKanbanBoard:', error);
      throw error;
    }
  },

  async createKanbanBoard(boardId: string): Promise<KanbanBoard> {
    try {
      // First verify that the board exists in the boards table
      const { data: parentBoards, error: parentError } = await supabase
        .from('boards')
        .select('id')
        .eq('id', boardId);

      if (parentError) throw parentError;
      if (!parentBoards || parentBoards.length === 0) {
        throw new Error('Parent board not found');
      }

      // Create the kanban board
      const { data: boards, error: boardError } = await supabase
        .from('kanban_boards')
        .insert({
          board_id: boardId,
          custom_todo_title: 'To Do',
          custom_in_progress_title: 'In Progress',
          custom_done_title: 'Done'
        })
        .select();

      if (boardError) throw boardError;
      if (!boards || boards.length === 0) {
        throw new Error('Failed to create kanban board');
      }

      const board = boards[0];

      return {
        id: board.id,
        boardId: board.board_id,
        customTodoTitle: board.custom_todo_title,
        customInProgressTitle: board.custom_in_progress_title,
        customDoneTitle: board.custom_done_title,
        tasks: []
      };
    } catch (error) {
      console.error('Error in createKanbanBoard:', error);
      throw error;
    }
  },

  async createTask(
    boardId: string,
    task: Omit<KanbanTask, 'id' | 'position'>
  ): Promise<KanbanTask> {
    try {
      // Get current max position for the status
      const { data: positions, error: posError } = await supabase
        .from('kanban_tasks')
        .select('position')
        .eq('board_id', boardId)
        .eq('status', task.status)
        .order('position', { ascending: false })
        .limit(1);

      if (posError) throw posError;

      const position = positions && positions.length > 0 ? positions[0].position + 1 : 0;

      const { data, error } = await supabase
        .from('kanban_tasks')
        .insert({
          board_id: boardId,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.dueDate,
          labels: task.labels || [],
          position
        })
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Failed to create task');
      }

      return data[0];
    } catch (error) {
      console.error('Error in createTask:', error);
      throw error;
    }
  },

  async updateTask(
    taskId: string,
    updates: Partial<Omit<KanbanTask, 'id'>>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error in updateTask:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      throw error;
    }
  },

  async moveTask(
    taskId: string,
    newStatus: 'todo' | 'inProgress' | 'done',
    newPosition: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .update({
          status: newStatus,
          position: newPosition
        })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error in moveTask:', error);
      throw error;
    }
  }
};
