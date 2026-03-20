import React from 'react';
import { formService } from '../../../services/formService';
import { useTheme } from '../../../contexts/ThemeContext';
import { FileText, ArrowLeft } from 'lucide-react';

interface FormTemplatesProps {
  onSelectTemplate: (template: any) => void;
  onCreateBlank: () => void;
  onBack: () => void;
}

export function FormTemplates({ onSelectTemplate, onCreateBlank, onBack }: FormTemplatesProps) {
  const { themeColors } = useTheme();
  const templates = formService.getTemplates();

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 card-scrollbar">
      <div className="mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-3 sm:mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Choose a Template</h2>
        <p className="text-sm sm:text-base text-gray-400">Start with a template or create from scratch</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={onCreateBlank}
          className="p-4 sm:p-6 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-600 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${themeColors.primary}20` }}>
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: themeColors.primary }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white truncate">Blank Form</h3>
              <p className="text-xs sm:text-sm text-gray-400">Start from scratch</p>
            </div>
          </div>
        </button>

        {templates.map((template) => (
          <button
            key={template.name}
            onClick={() => onSelectTemplate(template)}
            className="p-4 sm:p-6 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors text-left border border-gray-700"
          >
            <div className="mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1 line-clamp-1">{template.title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{template.description}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {template.fields.slice(0, 3).map((field, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded truncate max-w-[120px]"
                >
                  {field.label}
                </span>
              ))}
              {template.fields.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                  +{template.fields.length - 3}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
