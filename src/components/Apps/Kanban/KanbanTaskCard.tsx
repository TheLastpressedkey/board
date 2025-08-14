import React from 'react';
import { Calendar, Flag, Tag, Trash2, Pencil, GripVertical } from 'lucide-react';
import { KanbanTask } from '../../../services/kanban';

interface KanbanTaskCardProps {
  task: KanbanTask;
  onUpdate: (updates: Partial<KanbanTask>) => void;
  onDelete: () => void;
  themeColors: any;
}

export function KanbanTaskCard({ task, onUpdate, onDelete, themeColors }: KanbanTaskCardProps) {
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

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-500 cursor-grab active:cursor-grabbing" />
          <h4 className="text-white font-medium flex-1">{task.title}</h4>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onUpdate({})}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Pencil className="w-3 h-3 text-gray-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-400">
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