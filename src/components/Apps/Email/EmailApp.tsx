import React, { useState } from 'react';
import { Mail, GripHorizontal, X, Send, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';
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
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

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

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgHeader = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const bgInput = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(31, 41, 55)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(209, 213, 219)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 65, 81, 0.5)';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden" style={{ backgroundColor: bgMain }}>
      {/* Header */}
      <div
        className="p-4"
        style={{ backgroundColor: bgHeader, borderBottom: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            onMouseDown={onDragStart}
          >
            <GripHorizontal className="w-5 h-5" style={{ color: textMuted }} />
            <Mail
              className="w-5 h-5"
              style={{ color: primaryColor }}
            />
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>Email</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ color: textMuted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 analytics-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: textMuted }}>
              To
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: bgInput,
                color: textColor,
                border: `1px solid ${borderColor}`,
                '--tw-ring-color': primaryColor
              } as React.CSSProperties}
              required
              placeholder="recipient@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: textMuted }}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: bgInput,
                color: textColor,
                border: `1px solid ${borderColor}`,
                '--tw-ring-color': primaryColor
              } as React.CSSProperties}
              required
              placeholder="Email subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: textMuted }}>
              Message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 resize-none"
              style={{
                backgroundColor: bgInput,
                color: textColor,
                border: `1px solid ${borderColor}`,
                '--tw-ring-color': primaryColor
              } as React.CSSProperties}
              required
              placeholder="Write your message here..."
            />
          </div>

          {error && (
            <div className="text-sm" style={{ color: error.startsWith('✅') ? primaryColor : 'rgb(248, 113, 113)' }}>
              {error}
            </div>
          )}

          {showFallbackOption && (
            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: isTerminalTheme ? 'rgba(255, 255, 0, 0.1)' : 'rgba(133, 77, 14, 0.2)',
                border: `1px solid ${isTerminalTheme ? 'rgba(255, 255, 0, 0.3)' : 'rgba(202, 138, 4, 0.3)'}`
              }}
            >
              <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'rgb(250, 204, 21)' }}>
                <AlertTriangle className="w-4 h-4" />
                <span>Erreur {lastFailedMethod}</span>
              </div>
              <p className="text-sm mb-3" style={{ color: textMuted }}>
                L'envoi via {lastFailedMethod} a échoué. Voulez-vous essayer avec PHP mail ?
              </p>
              <button
                type="button"
                onClick={handleRetryWithPhpMail}
                disabled={sending}
                className="flex items-center gap-2 px-3 py-1 text-sm rounded disabled:opacity-50"
                style={{ backgroundColor: 'rgb(202, 138, 4)', color: 'white' }}
              >
                <RefreshCw className="w-3 h-3" />
                Essayer avec PHP mail
              </button>
            </div>
          )}

          {success && (
            <div
              className="text-sm"
              style={{ color: primaryColor }}
            >
              Email envoyé avec succès !
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: primaryColor,
                color: isTerminalTheme ? 'rgb(0, 0, 0)' : 'white'
              }}
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