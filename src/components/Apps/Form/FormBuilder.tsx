import React, { useState } from 'react';
import { Form as FormType, FormField } from '../../../services/formService';
import { useTheme } from '../../../contexts/ThemeContext';
import { ArrowLeft, Plus, Trash2, GripVertical, Copy, Save } from 'lucide-react';

interface FormBuilderProps {
  form: FormType;
  onSave: (form: Partial<FormType>) => Promise<void>;
  onBack: () => void;
  onCopyLink: () => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date' },
];

export function FormBuilder({ form, onSave, onBack, onCopyLink }: FormBuilderProps) {
  const { themeColors } = useTheme();
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description || '');
  const [fields, setFields] = useState<FormField[]>(form.fields);
  const [saving, setSaving] = useState(false);

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: 'text',
      label: 'New Field',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const deleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === fields.length - 1)) {
      return;
    }
    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      title,
      description,
      fields,
    });
    setSaving(false);
  };

  return (
    <div className="flex-1 overflow-y-auto card-scrollbar">
      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onCopyLink}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Copy Link</span>
              <span className="sm:hidden">Link</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 text-xs sm:text-sm"
              style={{ backgroundColor: themeColors.primary }}
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Form Title"
            className="w-full bg-transparent text-xl sm:text-2xl font-bold text-white border-none outline-none mb-2 sm:mb-3 placeholder-gray-600"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Form description (optional)"
            className="w-full bg-transparent text-sm sm:text-base text-gray-400 border-none outline-none resize-none placeholder-gray-600"
            rows={2}
          />
        </div>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-gray-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="hidden sm:flex flex-col gap-1 pt-2">
                  <button
                    onClick={() => moveField(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      placeholder="Field label"
                      className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-gray-500 outline-none text-sm"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value as any })}
                      className="w-full sm:w-auto px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-gray-500 outline-none text-sm"
                    >
                      {FIELD_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {field.type === 'text' || field.type === 'email' || field.type === 'textarea' ? (
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(index, { placeholder: e.target.value })}
                      placeholder="Placeholder text (optional)"
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-gray-500 outline-none text-sm"
                    />
                  ) : null}

                  {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Options (one per line)</label>
                      <textarea
                        value={(field.options || []).join('\n')}
                        onChange={(e) => updateField(index, { options: e.target.value.split('\n') })}
                        onBlur={(e) => updateField(index, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-gray-500 outline-none text-sm"
                        rows={3}
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                      className="rounded"
                    />
                    Required field
                  </label>
                </div>

                <button
                  onClick={() => deleteField(index)}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addField}
          className="w-full py-2.5 sm:py-3 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-gray-600 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Add Field
        </button>
      </div>
    </div>
  );
}
