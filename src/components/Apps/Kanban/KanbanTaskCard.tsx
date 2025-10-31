import React from 'react';
import { Calendar, Flag, Tag, Trash2, Pencil, GripVertical } from 'lucide-react';
import { KanbanTask } from '../../../services/kanban';

interface KanbanTaskCardProps {
  task: KanbanTask;
  onUpdate: (updates: Partial<KanbanTask>) => void;
  onDelete: () => void;
  themeColors: any;
  isTerminalTheme: boolean;
}

export function KanbanTaskCard({ task, onUpdate, onDelete, themeColors, isTerminalTheme }: KanbanTaskCardProps) {
  const priorityColors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
  };

  const priorityLabels = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute'
  };

  const bgCard = isTerminalTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(31, 41, 55, 0.5)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'transparent';
  const hoverBg = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgb(55, 65, 81)';

  return (
    <div
      className="rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow group"
      style={{
        backgroundColor: bgCard,
        border: isTerminalTheme ? `1px solid ${borderColor}` : 'none'
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing" style={{ color: textMuted }} />
          <h4 className="font-medium flex-1" style={{ color: textColor }}>{task.title}</h4>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onUpdate({})}
            className="p-1 rounded"
          >
            <Pencil className="w-3 h-3" style={{ color: textMuted }} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm mb-3 line-clamp-2" style={{ color: textMuted }}>
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs" style={{ color: textMuted }}>
        {task.dueDate && (
          <div className="flex items-center gap-1" title="Date d'échéance">
            <Calendar className="w-3 h-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex items-center gap-1" title={`Priorité ${priorityLabels[task.priority]}`}>
          <Flag className="w-3 h-3" />
          <span className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
        </div>

        {task.labels.length > 0 && (
          <div className="flex items-center gap-1" title="Étiquettes">
            <Tag className="w-3 h-3" />
            <span>{task.labels.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}