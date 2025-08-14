import React, { useState } from 'react';
import { Mail, GripHorizontal, X, Send, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { email } from '../../../services/email';

interface EmailAppProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
}

export function EmailApp({ onClose, onDragStart }: EmailAppProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showFallbackOption, setShowFallbackOption] = useState(false);
  const [lastFailedMethod, setLastFailedMethod] = useState<string>('');
  const { themeColors } = useTheme();

  const handleSubmit = async (e: React.FormEvent, forcePhpMail = false) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setShowFallbackOption(false);
    setSending(true);

    try {
      const result = forcePhpMail 
        ? await email.sendEmail({ to, subject, content, forcePhpMail: true })
        : await email.sendEmailWithFallback({ to, subject, content });

      if (result.success) {
        setSuccess(true);
        setTo('');
        setSubject('');
        setContent('');
        
        if (result.usedFallback) {
          setError(`✅ ${result.message}`);
        }
      } else {
        setError(result.error || 'Erreur lors de l\'envoi de l\'email');
        
        // Si SMTP a échoué, proposer PHP mail
        if (result.error?.includes('SMTP') && !forcePhpMail) {
          setShowFallbackOption(true);
          setLastFailedMethod('SMTP');
        }
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setSending(false);
    }
  };

  const handleRetryWithPhpMail = () => {
    handleSubmit(new Event('submit') as any, true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 border-b border-gray-700/50"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            onMouseDown={onDragStart}
          >
            <GripHorizontal className="w-5 h-5 text-gray-500" />
            <Mail 
              className="w-5 h-5"
              style={{ color: themeColors.primary }}
            />
            <h2 className="text-lg font-semibold text-white">Email</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              To
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              required
              placeholder="recipient@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              required
              placeholder="Email subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              required
              placeholder="Write your message here..."
            />
          </div>

          {error && (
            <div className={`text-sm ${error.startsWith('✅') ? '' : 'text-red-400'}`}>
              {error}
            </div>
          )}

          {showFallbackOption && (
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-400 text-sm mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Erreur {lastFailedMethod}</span>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                L'envoi via {lastFailedMethod} a échoué. Voulez-vous essayer avec PHP mail ?
              </p>
              <button
                type="button"
                onClick={handleRetryWithPhpMail}
                disabled={sending}
                className="flex items-center gap-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                Essayer avec PHP mail
              </button>
            </div>
          )}

          {success && (
            <div 
              className="text-sm"
              style={{ color: themeColors.primary }}
            >
              Email envoyé avec succès !
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: themeColors.primary }}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}