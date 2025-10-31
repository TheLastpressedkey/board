import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { KanbanTask } from '../../../services/kanban';

interface KanbanTaskFormProps {
  task?: KanbanTask;
  status: 'todo' | 'inProgress' | 'done';
  onSubmit: (task: Omit<KanbanTask, 'id' | 'position'>) => void;
  onClose: () => void;
  themeColors: any;
  isTerminalTheme: boolean;
}

export function KanbanTaskForm({ task, status, onSubmit, onClose, themeColors, isTerminalTheme }: KanbanTaskFormProps) {
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

  const bgModal = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const bgInput = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(55, 65, 81)';
  const bgLabel = isTerminalTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgb(55, 65, 81)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(209, 213, 219)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'transparent';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div
        className="w-full max-w-md rounded-lg p-6"
        style={{
          backgroundColor: bgModal,
          border: isTerminalTheme ? `1px solid ${borderColor}` : 'none'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: textColor }}>
            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full"
            style={{ color: textMuted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: textMuted }}>
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: bgInput,
                color: textColor,
                border: `1px solid ${borderColor}`,
                '--tw-ring-color': primaryColor
              } as React.CSSProperties}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: textMuted }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 resize-none h-24"
              style={{
                backgroundColor: bgInput,
                color: textColor,
                border: `1px solid ${borderColor}`,
                '--tw-ring-color': primaryColor
              } as React.CSSProperties}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: textMuted }}>
                Priorité
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as KanbanTask['priority'])}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: bgInput,
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  '--tw-ring-color': primaryColor
                } as React.CSSProperties}
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: textMuted }}>
                Date d'échéance
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: bgInput,
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  '--tw-ring-color': primaryColor
                } as React.CSSProperties}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: textMuted }}>
              Étiquettes
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {labels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  style={{ backgroundColor: bgLabel, color: textColor }}
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(index)}
                    className="p-0.5 rounded-full"
                  >
                    <Minus className="w-3 h-3" style={{ color: textMuted }} />
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
                className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: bgInput,
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  '--tw-ring-color': primaryColor
                } as React.CSSProperties}
              />
              <button
                type="button"
                onClick={handleAddLabel}
                className="px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: primaryColor,
                  color: isTerminalTheme ? 'rgb(0, 0, 0)' : 'white'
                }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm"
              style={{ color: textMuted }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg"
              style={{
                backgroundColor: primaryColor,
                color: isTerminalTheme ? 'rgb(0, 0, 0)' : 'white'
              }}
            >
              {task ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}