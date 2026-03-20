import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formService, Form } from '../../services/formService';
import { Loader2, CheckCircle } from 'lucide-react';
import { AlertDialog } from '../Common/AlertDialog/AlertDialog';

export function PublicFormView() {
  const { shareLink } = useParams<{ shareLink: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: '' });

  useEffect(() => {
    loadForm();
  }, [shareLink]);

  const loadForm = async () => {
    if (!shareLink) return;

    setLoading(true);
    const formData = await formService.getFormByShareLink(shareLink);

    if (!formData) {
      setError('Form not found');
    } else {
      setForm(formData);
    }

    setLoading(false);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;

    // Validate required fields
    for (const field of form.fields) {
      if (field.required && !formData[field.id]) {
        setErrorDialog({
          isOpen: true,
          message: `Please fill in required field: ${field.label}`
        });
        return;
      }
    }

    setSubmitting(true);
    const success = await formService.submitResponse(form.id, formData);
    setSubmitting(false);

    if (success) {
      setSubmitted(true);
      setFormData({});
    } else {
      setErrorDialog({
        isOpen: true,
        message: 'Failed to submit response. Please try again.'
      });
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none text-sm sm:text-base"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
          >
            <option value="">Select an option...</option>
            {field.options?.map((option: string, idx: number) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, idx: number) => (
              <label key={idx} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                  className="w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm sm:text-base text-white break-words">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, idx: number) => (
              <label key={idx} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="checkbox"
                  value={option}
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...(value || []), option]
                      : (value || []).filter((v: string) => v !== option);
                    handleFieldChange(field.id, newValue);
                  }}
                  className="w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm sm:text-base text-white break-words">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-sm sm:text-base text-gray-400">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl sm:text-4xl">⚠️</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Form Not Found</h1>
          <p className="text-sm sm:text-base text-gray-400 mb-6">
            This form doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Thank You!</h1>
          <p className="text-sm sm:text-base text-gray-400 mb-6">
            Your response has been submitted successfully.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-sm sm:text-base text-gray-400">{form.description}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {form.fields.map((field) => (
            <div key={field.id} className="bg-gray-800 rounded-lg p-4 sm:p-6">
              <label className="block mb-2 sm:mb-3">
                <span className="text-sm sm:text-base text-white font-medium">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </span>
              </label>
              {renderField(field)}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
          Powered by WeBoard Forms
        </div>
      </div>

      {/* Error Dialog */}
      <AlertDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, message: '' })}
        title="Error"
        description={errorDialog.message}
        type="error"
        confirmText="OK"
        onConfirm={() => setErrorDialog({ isOpen: false, message: '' })}
        showCancel={false}
      />
    </div>
  );
}
