import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { formService, Form as FormType, FormField } from '../../../services/formService';
import { FormBuilder } from './FormBuilder';
import { FormResponses } from './FormResponses';
import { FormTemplates } from './FormTemplates';
import { ShareDialog } from './ShareDialog';
import { AlertDialog } from '../../Common/AlertDialog/AlertDialog';
import { FileText, Plus, BarChart3, Settings } from 'lucide-react';
import { AppHeader } from '../../Common/Headers/AppHeader';

interface FormProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onTogglePin?: () => void;
  isPinned?: boolean;
  metadata?: {
    currentFormId?: string;
  };
  onDataChange?: (data: any) => void;
}

type ViewMode = 'list' | 'builder' | 'responses' | 'templates';

export function Form({ onClose, onDragStart, onTogglePin, isPinned, metadata, onDataChange }: FormProps) {
  const { themeColors } = useTheme();
  const [forms, setForms] = useState<FormType[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentForm, setCurrentForm] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    formId: string | null;
  }>({ isOpen: false, formId: null });

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    const userForms = await formService.getUserForms();
    setForms(userForms);
    setLoading(false);
  };

  const handleCreateNew = () => {
    setCurrentForm(null);
    setViewMode('templates');
  };

  const handleSelectTemplate = async (template: any) => {
    const newForm = await formService.createForm(
      template.title,
      template.description,
      template.fields
    );
    if (newForm) {
      await loadForms();
      setCurrentForm(newForm);
      setViewMode('builder');
    }
  };

  const handleCreateBlank = async () => {
    const newForm = await formService.createForm('Untitled Form', '', []);
    if (newForm) {
      await loadForms();
      setCurrentForm(newForm);
      setViewMode('builder');
    }
  };

  const handleEditForm = (form: FormType) => {
    setCurrentForm(form);
    setViewMode('builder');
  };

  const handleViewResponses = (form: FormType) => {
    setCurrentForm(form);
    setViewMode('responses');
  };

  const handleDeleteForm = (formId: string) => {
    setDeleteDialog({ isOpen: true, formId });
  };

  const confirmDelete = async () => {
    if (deleteDialog.formId) {
      await formService.deleteForm(deleteDialog.formId);
      await loadForms();
      if (currentForm?.id === deleteDialog.formId) {
        setCurrentForm(null);
        setViewMode('list');
      }
    }
    setDeleteDialog({ isOpen: false, formId: null });
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentForm(null);
    loadForms();
  };

  const copyShareLink = (link: string) => {
    setShareLink(link);
    setShowShareDialog(true);
  };

  if (viewMode === 'templates') {
    return (
      <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
        <AppHeader
          onClose={onClose}
          onDragStart={onDragStart}
          onTogglePin={onTogglePin}
          isPinned={isPinned}
          title="Create Form"
        />
        <FormTemplates
          onSelectTemplate={handleSelectTemplate}
          onCreateBlank={handleCreateBlank}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  if (viewMode === 'builder' && currentForm) {
    return (
      <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
        <AppHeader
          onClose={onClose}
          onDragStart={onDragStart}
          onTogglePin={onTogglePin}
          isPinned={isPinned}
          title="Form Builder"
        />
        <FormBuilder
          form={currentForm}
          onSave={async (updatedForm) => {
            await formService.updateForm(currentForm.id, updatedForm);
            await loadForms();
            setCurrentForm(updatedForm as FormType);
          }}
          onBack={handleBackToList}
          onCopyLink={() => copyShareLink(currentForm.share_link)}
        />
      </div>
    );
  }

  if (viewMode === 'responses' && currentForm) {
    return (
      <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
        <AppHeader
          onClose={onClose}
          onDragStart={onDragStart}
          onTogglePin={onTogglePin}
          isPinned={isPinned}
          title="Responses"
        />
        <FormResponses
          form={currentForm}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      <AppHeader
        onClose={onClose}
        onDragStart={onDragStart}
        onTogglePin={onTogglePin}
        isPinned={isPinned}
        title="Forms"
      />

      <div className="flex-1 overflow-y-auto p-4 card-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading forms...</div>
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Forms Yet</h3>
            <p className="text-sm sm:text-base text-gray-400 mb-6 max-w-md">
              Create your first form to start collecting responses
            </p>
            <button
              onClick={handleCreateNew}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity text-sm sm:text-base"
              style={{ backgroundColor: themeColors.primary }}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Create Form
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">My Forms</h2>
              <button
                onClick={handleCreateNew}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm sm:text-base"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                New Form
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="bg-gray-800 rounded-lg p-3 sm:p-4 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1 truncate">
                        {form.title}
                      </h3>
                      {form.description && (
                        <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
                          {form.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteForm(form.id)}
                      className="p-1 ml-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 sm:mb-4">
                    <span>{form.fields.length} fields</span>
                    <span>•</span>
                    <span className="hidden sm:inline">{new Date(form.created_at).toLocaleDateString()}</span>
                    <span className="sm:hidden">{new Date(form.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleEditForm(form)}
                      className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-xs sm:text-sm hover:bg-gray-600 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewResponses(form)}
                      className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-xs sm:text-sm hover:bg-gray-600 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Responses
                    </button>
                    <button
                      onClick={() => copyShareLink(form.share_link)}
                      className="sm:flex-initial px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors"
                      style={{ backgroundColor: themeColors.primary, color: 'white' }}
                    >
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <ShareDialog
          shareLink={shareLink}
          onClose={() => setShowShareDialog(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, formId: null })}
        title="Delete Form"
        description="Are you sure you want to delete this form? This action cannot be undone and all responses will be permanently deleted."
        type="error"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        showCancel={true}
      />
    </div>
  );
}
