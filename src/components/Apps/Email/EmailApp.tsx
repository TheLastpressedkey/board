import React, { useState } from 'react';
import { Mail, GripHorizontal, X, Send, Loader2 } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../lib/supabase';

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
  const { themeColors } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, content }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setSuccess(true);
      setTo('');
      setSubject('');
      setContent('');
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
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
            <div className="text-red-400 text-sm">{error}</div>
          )}

          {success && (
            <div 
              className="text-sm"
              style={{ color: themeColors.primary }}
            >
              Email sent successfully!
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