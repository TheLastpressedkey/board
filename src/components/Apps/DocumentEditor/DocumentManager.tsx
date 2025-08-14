import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Trash2, Edit, Calendar, Tag, GripHorizontal, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
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
            <h2 className="text-lg font-semibold text-white">Gestionnaire de Documents</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDocument('new')}
              className="px-3 py-1.5 text-sm text-white rounded-lg flex items-center gap-2"
              style={{ backgroundColor: themeColors.primary }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Plus className="w-4 h-4" />
              Nouveau
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

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les documents..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto analytics-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2\" style={{ borderColor: `${themeColors.primary} transparent` }} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-400">
            {error}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
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
                className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors group cursor-pointer"
                onClick={() => setSelectedDocument(doc.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium mb-1 truncate">
                      {doc.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                      {doc.content.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
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
                        <Tag className="w-3 h-3 text-gray-500" />
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {doc.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
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
                      className="p-1.5 hover:bg-gray-600/50 rounded-lg"
                      title="Éditer"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      className="p-1.5 hover:bg-gray-600/50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
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