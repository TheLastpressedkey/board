import React from 'react';
import { Plus } from 'lucide-react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { KanbanTask } from '../../../services/kanban';
import { KanbanTaskCard } from './KanbanTaskCard';

interface KanbanColumnProps {
  id: 'todo' | 'inProgress' | 'done';
  title: string;
  tasks: KanbanTask[];
  onAddTask: () => void;
  onUpdateTask: (taskId: string, updates: Partial<KanbanTask>) => void;
  onDeleteTask: (taskId: string) => void;
  themeColors: any;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  themeColors
}: KanbanColumnProps) {
  return (
    <div 
      className="flex-1 min-w-[300px] flex flex-col rounded-lg"
      style={{ backgroundColor: themeColors.menuBg }}
    >
      {/* En-tête */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="text-sm text-gray-400">{tasks.length}</span>
        </div>
        <button
          onClick={onAddTask}
          className="w-full px-3 py-2 flex items-center justify-center gap-2 rounded-lg transition-colors"
          style={{ backgroundColor: `${themeColors.primary}20` }}
        >
          <Plus className="w-4 h-4" style={{ color: themeColors.primary }} />
          <span style={{ color: themeColors.primary }}>Ajouter une tâche</span>
        </button>
      </div>

      {/* Tâches */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-4 space-y-3 analytics-scrollbar transition-colors ${
              snapshot.isDraggingOver ? 'bg-gray-800/30' : ''
            }`}
            style={{ minHeight: '200px' }}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      transform: snapshot.isDragging
                        ? provided.draggableProps.style?.transform
                        : 'none',
                      transition: snapshot.isDragging
                        ? provided.draggableProps.style?.transition
                        : 'transform 0.2s ease-in-out'
                    }}
                    className={`${snapshot.isDragging ? 'z-50' : ''}`}
                  >
                    <KanbanTaskCard
                      task={task}
                      onUpdate={(updates) => onUpdateTask(task.id, updates)}
                      onDelete={() => onDeleteTask(task.id)}
                      themeColors={themeColors}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
