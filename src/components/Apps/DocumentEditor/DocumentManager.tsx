import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Trash2, Edit, Calendar, Tag, GripHorizontal, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';
import { documents, Document } from '../../../services/documents';
import { DocumentEditor } from './DocumentEditor';

interface DocumentManagerProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
}

export function DocumentManager({ onClose, onDragStart }: DocumentManagerProps) {
  const [documentsList, setDocumentsList] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documentsList, searchQuery]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await documents.getDocuments();
      setDocumentsList(docs);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documentsList);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = documentsList.filter(doc =>
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query))
    );
    setFilteredDocuments(filtered);
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      await documents.deleteDocument(id);
      await loadDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Erreur lors de la suppression du document');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedDocument) {
    return (
      <DocumentEditor
        onClose={() => setSelectedDocument(null)}
        metadata={{ documentId: selectedDocument }}
        onDataChange={() => loadDocuments()}
      />
    );
  }

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgHeader = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const bgInput = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(55, 65, 81)';
  const bgCard = isTerminalTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(31, 41, 55, 0.5)';
  const bgCardHover = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 65, 81, 0.5)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 65, 81, 0.5)';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;
  const bgButtonText = isTerminalTheme ? 'rgb(0, 0, 0)' : 'white';

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
            <FileText
              className="w-5 h-5"
              style={{ color: primaryColor }}
            />
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>Gestionnaire de Documents</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDocument('new')}
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-2"
              style={{ backgroundColor: primaryColor, color: bgButtonText }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Plus className="w-4 h-4" />
              Nouveau
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
              style={{ color: textMuted }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textMuted }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les documents..."
            className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: bgInput,
              color: textColor,
              border: `1px solid ${borderColor}`,
              '--tw-ring-color': primaryColor
            } as React.CSSProperties}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto analytics-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2" style={{ borderColor: `${primaryColor} transparent` }} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full" style={{ color: 'rgb(248, 113, 113)' }}>
            {error}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: textMuted }}>
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg mb-2">
              {searchQuery ? 'Aucun document trouvé' : 'Aucun document'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Créez votre premier document'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="rounded-lg p-4 transition-colors group cursor-pointer"
                style={{ backgroundColor: bgCard }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = bgCardHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = bgCard)}
                onClick={() => setSelectedDocument(doc.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1 truncate" style={{ color: textColor }}>
                      {doc.title}
                    </h3>
                    <p className="text-sm line-clamp-2 mb-2" style={{ color: textMuted }}>
                      {doc.content.substring(0, 150)}...
                    </p>

                    <div className="flex items-center gap-4 text-xs" style={{ color: textMuted }}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(doc.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>v{doc.version}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{doc.content.length} caractères</span>
                      </div>
                    </div>

                    {doc.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Tag className="w-3 h-3" style={{ color: textMuted }} />
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 text-xs rounded-full"
                              style={{
                                backgroundColor: isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgb(55, 65, 81)',
                                color: isTerminalTheme ? 'rgb(255, 255, 255)' : 'rgb(209, 213, 219)'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {doc.tags.length > 3 && (
                            <span className="text-xs" style={{ color: textMuted }}>
                              +{doc.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDocument(doc.id);
                      }}
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(75, 85, 99, 0.5)' }}
                      title="Éditer"
                    >
                      <Edit className="w-4 h-4" style={{ color: textMuted }} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(75, 85, 99, 0.5)' }}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: 'rgb(248, 113, 113)' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}