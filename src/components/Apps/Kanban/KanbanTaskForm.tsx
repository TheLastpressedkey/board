import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { KanbanTask } from '../../../services/kanban';

interface KanbanTaskFormProps {
  task?: KanbanTask;
  status: 'todo' | 'inProgress' | 'done';
  onSubmit: (task: Omit<KanbanTask, 'id' | 'position'>) => void;
  onClose: () => void;
  themeColors: any;
}

export function KanbanTaskForm({ task, status, onSubmit, onClose, themeColors }: KanbanTaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<KanbanTask['priority']>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [labels, setLabels] = useState<string[]>(task?.labels || []);
  const [newLabel, setNewLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || undefined,
      labels
    });
  };

  const handleAddLabel = () => {
    if (newLabel.trim()) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (index: number) => {
    setLabels(labels.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div 
        className="w-full max-w-md rounded-lg p-6"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 resize-none h-24"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Priorité
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as KanbanTask['priority'])}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Date d'échéance
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Étiquettes
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {labels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-700 text-white rounded-full text-sm flex items-center gap-1"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(index)}
                    className="p-0.5 hover:bg-gray-600 rounded-full"
                  >
                    <Minus className="w-3 h-3 text-gray-400" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Ajouter une étiquette"
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              />
              <button
                type="button"
                onClick={handleAddLabel}
                className="px-3 py-2 rounded-lg text-white"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white rounded-lg"
              style={{ backgroundColor: themeColors.primary }}
            >
              {task ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}