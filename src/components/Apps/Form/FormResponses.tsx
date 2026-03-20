import React, { useState, useEffect } from 'react';
import { Form as FormType, FormResponse, formService } from '../../../services/formService';
import { useTheme } from '../../../contexts/ThemeContext';
import { ArrowLeft, Download, BarChart3 } from 'lucide-react';

interface FormResponsesProps {
  form: FormType;
  onBack: () => void;
}

export function FormResponses({ form, onBack }: FormResponsesProps) {
  const { themeColors } = useTheme();
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'stats'>('table');

  useEffect(() => {
    loadResponses();
  }, [form.id]);

  const loadResponses = async () => {
    setLoading(true);
    const data = await formService.getFormResponses(form.id);
    setResponses(data);
    setLoading(false);
  };

  const handleExport = () => {
    const csv = formService.exportToCSV(form, responses);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title.replace(/\s+/g, '_')}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFieldStats = (field: any) => {
    if (field.type === 'radio' || field.type === 'select') {
      const counts: Record<string, number> = {};
      responses.forEach(response => {
        const value = response.data[field.id];
        if (value) {
          counts[value] = (counts[value] || 0) + 1;
        }
      });
      return counts;
    }
    if (field.type === 'checkbox') {
      const counts: Record<string, number> = {};
      responses.forEach(response => {
        const values = response.data[field.id] || [];
        values.forEach((value: string) => {
          counts[value] = (counts[value] || 0) + 1;
        });
      });
      return counts;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Loading responses...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="p-3 sm:p-4 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setView('table')}
                className={`px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm transition-colors ${
                  view === 'table' ? 'bg-gray-700 text-white' : 'text-gray-400'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setView('stats')}
                className={`px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm transition-colors flex items-center gap-1 ${
                  view === 'stats' ? 'bg-gray-700 text-white' : 'text-gray-400'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Stats</span>
              </button>
            </div>
            {responses.length > 0 && (
              <button
                onClick={handleExport}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white truncate">{form.title}</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {responses.length} {responses.length === 1 ? 'response' : 'responses'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 card-scrollbar">
        {responses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Responses Yet</h3>
            <p className="text-gray-400 max-w-md">
              Share your form link to start collecting responses
            </p>
          </div>
        ) : view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3 text-gray-400 font-medium">Submitted</th>
                  {form.fields.map((field) => (
                    <th key={field.id} className="text-left p-3 text-gray-400 font-medium">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((response) => (
                  <tr key={response.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3 text-gray-400">
                      {new Date(response.submitted_at).toLocaleString()}
                    </td>
                    {form.fields.map((field) => (
                      <td key={field.id} className="p-3 text-white">
                        {Array.isArray(response.data[field.id])
                          ? response.data[field.id].join(', ')
                          : response.data[field.id] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-6">
            {form.fields.map((field) => {
              const stats = getFieldStats(field);
              if (!stats) {
                return (
                  <div key={field.id} className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">{field.label}</h3>
                    <p className="text-sm text-gray-400">Statistics not available for this field type</p>
                  </div>
                );
              }

              const total = Object.values(stats).reduce((sum, count) => sum + count, 0);

              return (
                <div key={field.id} className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4">{field.label}</h3>
                  <div className="space-y-3">
                    {Object.entries(stats).map(([option, count]) => {
                      const percentage = ((count / total) * 100).toFixed(1);
                      return (
                        <div key={option}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-300">{option}</span>
                            <span className="text-gray-400">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: themeColors.primary,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
