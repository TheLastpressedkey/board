import React, { useState, useEffect } from 'react';
import { Layout, GripHorizontal, Loader2, X } from 'lucide-react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useTheme } from '../../../contexts/ThemeContext';
import { kanban, KanbanBoard, KanbanTask } from '../../../services/kanban';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTaskForm } from './KanbanTaskForm';

interface KanbanAppProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  metadata?: { boardId: string };
  onDataChange?: (data: { boardId: string }) => void;
}

export function KanbanApp({ onClose, onDragStart, metadata, onDataChange }: KanbanAppProps) {
  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'todo' | 'inProgress' | 'done'>('todo');
  const { themeColors } = useTheme();

  useEffect(() => {
    if (metadata?.boardId) {
      loadBoard();
    }
  }, [metadata?.boardId]);

  const loadBoard = async () => {
    if (!metadata?.boardId) {
      setError('ID du tableau non fourni');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await kanban.getKanbanBoard(metadata.boardId);
      setBoard(data);
    } catch (err) {
      console.error('Erreur lors du chargement du tableau Kanban:', err);
      setError('Échec du chargement du tableau Kanban');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (task: Omit<KanbanTask, 'id' | 'position'>) => {
    if (!board) return;

    try {
      const newTask = await kanban.createTask(board.id, task);
      setBoard(prev => prev ? {
        ...prev,
        tasks: [...prev.tasks, newTask]
      } : null);
      setShowTaskForm(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la tâche:', err);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<KanbanTask>) => {
    if (!board) return;

    try {
      await kanban.updateTask(taskId, updates);
      setBoard(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      } : null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la tâche:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!board) return;

    try {
      await kanban.deleteTask(taskId);
      setBoard(prev => prev ? {
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== taskId)
      } : null);
    } catch (err) {
      console.error('Erreur lors de la suppression de la tâche:', err);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination || !board) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const destinationTasks = board.tasks
      .filter(t => t.status === destination.droppableId)
      .sort((a, b) => a.position - b.position);

    let newPosition: number;

    if (destinationTasks.length === 0) {
      newPosition = 0;
    } else if (destination.index === 0) {
      newPosition = destinationTasks[0].position / 2;
    } else if (destination.index >= destinationTasks.length) {
      newPosition = destinationTasks[destinationTasks.length - 1].position + 1;
    } else {
      newPosition = (
        destinationTasks[destination.index - 1].position +
        destinationTasks[destination.index].position
      ) / 2;
    }

    try {
      await kanban.moveTask(
        draggableId,
        destination.droppableId as 'todo' | 'inProgress' | 'done',
        newPosition
      );

      setBoard(prev => {
        if (!prev) return null;

        return {
          ...prev,
          tasks: prev.tasks.map(task => 
            task.id === draggableId
              ? { ...task, status: destination.droppableId as 'todo' | 'inProgress' | 'done', position: newPosition }
              : task
          )
        };
      });
    } catch (err) {
      console.error('Erreur lors du déplacement de la tâche:', err);
      loadBoard();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-red-400">
          {error || 'Impossible de charger le tableau Kanban'}
        </div>
      </div>
    );
  }

  const columns = [
    {
      id: 'todo' as const,
      title: 'À faire',
      tasks: board.tasks
        .filter(task => task.status === 'todo')
        .sort((a, b) => a.position - b.position)
    },
    {
      id: 'inProgress' as const,
      title: 'En cours',
      tasks: board.tasks
        .filter(task => task.status === 'inProgress')
        .sort((a, b) => a.position - b.position)
    },
    {
      id: 'done' as const,
      title: 'Terminé',
      tasks: board.tasks
        .filter(task => task.status === 'done')
        .sort((a, b) => a.position - b.position)
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* En-tête */}
      <div 
        className="p-4 border-b border-gray-700/50"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            onMouseDown={onDragStart}
          >
            <GripHorizontal className="w-5 h-5 text-gray-500" />
            <Layout 
              className="w-5 h-5"
              style={{ color: themeColors.primary }}
            />
            <h2 className="text-lg font-semibold text-white">Tableau Kanban</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Contenu */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto analytics-scrollbar">
          <div className="flex gap-4 p-4 h-full min-h-[400px]">
            {columns.map(column => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={column.tasks}
                onAddTask={() => {
                  setSelectedStatus(column.id);
                  setShowTaskForm(true);
                }}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                themeColors={themeColors}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      {showTaskForm && (
        <KanbanTaskForm
          status={selectedStatus}
          onSubmit={handleAddTask}
          onClose={() => setShowTaskForm(false)}
          themeColors={themeColors}
        />
      )}
    </div>
  );
}
