import React from 'react';
import { X, Check, Copy } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface ShareDialogProps {
  shareLink: string;
  onClose: () => void;
}

export function ShareDialog({ shareLink, onClose }: ShareDialogProps) {
  const { themeColors } = useTheme();
  const [copied, setCopied] = React.useState(false);
  const url = `${window.location.origin}/form/${shareLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] max-w-md bg-gray-800 rounded-lg shadow-2xl z-50 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white">Share Form</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-400 mb-4">
            Anyone with this link can submit responses to your form.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-xs sm:text-sm min-w-0"
              onClick={(e) => e.currentTarget.select()}
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded text-white font-medium transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              style={{
                backgroundColor: copied ? '#10b981' : themeColors.primary,
              }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-gray-750 border-t border-gray-700 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
