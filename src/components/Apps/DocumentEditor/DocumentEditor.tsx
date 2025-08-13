import React, { useState, useEffect, useRef } from 'react';
import { Save, FileText, Bold, Italic, Underline, List, ListOrdered, Link, Image, Undo, Redo, Eye, Edit3, GripHorizontal, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { DocumentToolbar } from './DocumentToolbar';
import { DocumentPreview } from './DocumentPreview';
import { documents } from '../../../services/documents';

interface DocumentEditorProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  metadata?: { documentId?: string };
  onDataChange?: (data: { documentId: string }) => void;
}

export function DocumentEditor({ onClose, onDragStart, metadata, onDataChange }: DocumentEditorProps) {
  const [document, setDocument] = useState({
    id: '',
    title: 'Nouveau Document',
    content: '',
    format: 'markdown' as 'markdown' | 'text',
    tags: [] as string[]
  });
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { themeColors } = useTheme();

  useEffect(() => {
    if (metadata?.documentId) {
      loadDocument(metadata.documentId);
    }
  }, [metadata?.documentId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.content && document.id) {
        handleSave(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [document]);

  const loadDocument = async (documentId: string) => {
    try {
      const doc = await documents.getDocument(documentId);
      if (doc) {
        setDocument(doc);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Erreur lors du chargement du document');
    }
  };

  const handleSave = async (showNotification = true) => {
    if (!document.title.trim() || !document.content.trim()) {
      if (showNotification) {
        setError('Le titre et le contenu sont requis');
      }
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      let savedDoc;
      if (document.id) {
        savedDoc = await documents.updateDocument(document.id, {
          title: document.title,
          content: document.content,
          format: document.format,
          tags: document.tags
        });
      } else {
        savedDoc = await documents.createDocument({
          title: document.title,
          content: document.content,
          format: document.format,
          tags: document.tags
        });
        
        if (onDataChange) {
          onDataChange({ documentId: savedDoc.id });
        }
      }

      setDocument(savedDoc);
      setLastSaved(new Date());
      
      if (showNotification) {
        // Utiliser une notification native du navigateur
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Document sauvegardé', {
            body: `"${document.title}" a été sauvegardé avec succès`,
            icon: '/logo.svg'
          });
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const insertText = (before: string, after: string = '') => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newText = before + selectedText + after;
    const newContent = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end);
    
    setDocument(prev => ({ ...prev, content: newContent }));
    
    // Restaurer la sélection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const formatActions = {
    bold: () => insertText('**', '**'),
    italic: () => insertText('*', '*'),
    underline: () => insertText('<u>', '</u>'),
    heading1: () => insertText('# '),
    heading2: () => insertText('## '),
    heading3: () => insertText('### '),
    bulletList: () => insertText('- '),
    numberedList: () => insertText('1. '),
    link: () => insertText('[', '](url)'),
    code: () => insertText('`', '`'),
    codeBlock: () => insertText('```\n', '\n```'),
    quote: () => insertText('> ')
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
            <FileText 
              className="w-5 h-5"
              style={{ color: themeColors.primary }}
            />
            <input
              type="text"
              value={document.title}
              onChange={(e) => setDocument(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg font-semibold bg-transparent text-white border-none outline-none"
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              title={isPreview ? "Mode édition" : "Aperçu"}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {isPreview ? (
                <Edit3 className="w-4 h-4 text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50"
              title="Sauvegarder"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Save className={`w-4 h-4 text-gray-400 ${isSaving ? 'animate-pulse' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>{document.content.length} caractères</span>
            <span>{document.content.split(/\s+/).filter(w => w.length > 0).length} mots</span>
            {lastSaved && (
              <span>Dernière sauvegarde: {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
          {error && (
            <span className="text-red-400">{error}</span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      {!isPreview && (
        <DocumentToolbar
          onAction={formatActions}
          themeColors={themeColors}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <DocumentPreview
            content={document.content}
            format={document.format}
            themeColors={themeColors}
          />
        ) : (
          <div className="h-full p-4">
            <textarea
              ref={editorRef}
              value={document.content}
              onChange={(e) => setDocument(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Commencez à écrire votre document..."
              className="w-full h-full bg-transparent text-white resize-none outline-none font-mono text-sm leading-relaxed"
              style={{ 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
              }}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      {/* Tags */}
      <div 
        className="p-4 border-t border-gray-700/50"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Tags:</span>
          <input
            type="text"
            placeholder="Ajouter des tags (séparés par des virgules)"
            value={document.tags.join(', ')}
            onChange={(e) => setDocument(prev => ({ 
              ...prev, 
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            }))}
            className="flex-1 px-2 py-1 bg-gray-700/50 text-white text-sm rounded border-none outline-none"
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}