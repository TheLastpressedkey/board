export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  labels: string[];
  position: number;
  createdAt: Date;
}

export interface KanbanColumn {
  id: 'todo' | 'inProgress' | 'done';
  title: string;
  tasks: KanbanTask[];
}

export interface KanbanBoard {
  id: string;
  columns: KanbanColumn[];
  customTodoTitle: string;
  customInProgressTitle: string;
  customDoneTitle: string;
}