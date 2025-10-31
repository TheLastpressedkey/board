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
  isTerminalTheme: boolean;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  themeColors,
  isTerminalTheme
}: KanbanColumnProps) {
  const bgColumn = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const bgButton = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : `${themeColors.primary}20`;
  const bgDragOver = isTerminalTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(31, 41, 55, 0.3)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 65, 81, 0.5)';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;

  return (
    <div
      className="flex-1 min-w-[300px] flex flex-col rounded-lg"
      style={{
        backgroundColor: bgColumn,
        border: isTerminalTheme ? `1px solid ${borderColor}` : 'none'
      }}
    >
      {/* En-tête */}
      <div className="p-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold" style={{ color: textColor }}>{title}</h3>
          <span className="text-sm" style={{ color: textMuted }}>{tasks.length}</span>
        </div>
        <button
          onClick={onAddTask}
          className="w-full px-3 py-2 flex items-center justify-center gap-2 rounded-lg transition-colors"
          style={{ backgroundColor: bgButton }}
        >
          <Plus className="w-4 h-4" style={{ color: primaryColor }} />
          <span style={{ color: primaryColor }}>Ajouter une tâche</span>
        </button>
      </div>

      {/* Tâches */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 overflow-y-auto p-4 space-y-3 analytics-scrollbar transition-colors"
            style={{
              minHeight: '200px',
              backgroundColor: snapshot.isDraggingOver ? bgDragOver : 'transparent'
            }}
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
                      isTerminalTheme={isTerminalTheme}
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