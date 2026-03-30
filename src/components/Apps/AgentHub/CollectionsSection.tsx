import React, { useState, useEffect } from 'react';
import { Database, Plus, FileText, Trash2, Upload } from 'lucide-react';
import { ragClient, RAGCollection, RAGDocument } from '../../../services/ragClient';

interface CollectionsSectionProps {
  themeColors: any;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function CollectionsSection({ themeColors, onError, onSuccess }: CollectionsSectionProps) {
  const [collections, setCollections] = useState<RAGCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<RAGCollection | null>(null);
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [view, setView] = useState<'list' | 'details'>('list');
  const [loading, setLoading] = useState(true);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await ragClient.getCollections();
      setCollections(data);
    } catch (err: any) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (collectionId: string) => {
    try {
      const data = await ragClient.getDocuments(collectionId);
      setDocuments(data);
    } catch (err: any) {
      onError(err.message);
    }
  };

  const handleCreateCollection = async (name: string, description: string) => {
    try {
      await ragClient.createCollection(name, description);
      await loadCollections();
      setShowCreateCollection(false);
      onSuccess('Collection created successfully');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection and all its documents?')) return;

    try {
      await ragClient.deleteCollection(id);
      await loadCollections();
      if (selectedCollection?.id === id) {
        setSelectedCollection(null);
        setView('list');
      }
      onSuccess('Collection deleted successfully');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const handleSelectCollection = (collection: RAGCollection) => {
    setSelectedCollection(collection);
    loadDocuments(collection.id);
    setView('details');
  };

  const handleAddDocument = async (file: File | null, title: string, content: string) => {
    if (!selectedCollection) return;

    try {
      if (file) {
        await ragClient.uploadDocument(selectedCollection.id, file);
      } else {
        await ragClient.addTextDocument(selectedCollection.id, title, content);
      }
      await loadDocuments(selectedCollection.id);
      setShowAddDocument(false);
      onSuccess('Document added successfully');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await ragClient.deleteDocument(documentId);
      if (selectedCollection) {
        await loadDocuments(selectedCollection.id);
      }
      onSuccess('Document deleted successfully');
    } catch (err: any) {
      onError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: `${themeColors.primary} transparent` }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          {view === 'list' ? (
            <h3 className="text-lg font-semibold">Collections</h3>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setView('list');
                  setSelectedCollection(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ← Back
              </button>
              <h3 className="text-lg font-semibold">{selectedCollection?.name}</h3>
            </div>
          )}
        </div>

        {view === 'list' ? (
          <button
            onClick={() => setShowCreateCollection(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Plus className="w-4 h-4" />
            New Collection
          </button>
        ) : (
          <button
            onClick={() => setShowAddDocument(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Plus className="w-4 h-4" />
            Add Document
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {view === 'list' && (
          <CollectionsList
            collections={collections}
            onSelect={handleSelectCollection}
            onDelete={handleDeleteCollection}
            themeColors={themeColors}
          />
        )}

        {view === 'details' && selectedCollection && (
          <DocumentsList
            documents={documents}
            onDelete={handleDeleteDocument}
            themeColors={themeColors}
          />
        )}
      </div>

      {/* Dialogs */}
      {showCreateCollection && (
        <CreateCollectionDialog
          onClose={() => setShowCreateCollection(false)}
          onCreate={handleCreateCollection}
          themeColors={themeColors}
        />
      )}

      {showAddDocument && (
        <AddDocumentDialog
          onClose={() => setShowAddDocument(false)}
          onAdd={handleAddDocument}
          themeColors={themeColors}
        />
      )}
    </div>
  );
}

// Collections List Component
function CollectionsList({ collections, onSelect, onDelete, themeColors }: any) {
  if (collections.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg mb-2">No collections yet</p>
        <p className="text-sm">Create your first RAG collection to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {collections.map((collection: RAGCollection) => (
        <div
          key={collection.id}
          className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 cursor-pointer transition-colors"
          onClick={() => onSelect(collection)}
        >
          <div className="flex items-start justify-between mb-3">
            <Database className="w-8 h-8" style={{ color: themeColors.primary }} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(collection.id);
              }}
              className="text-gray-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-lg font-semibold mb-1">{collection.name}</h3>
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{collection.description}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{collection.config.llm_provider}</span>
            <span>•</span>
            <span>{collection.config.llm_model}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Documents List Component
function DocumentsList({ documents, onDelete, themeColors }: any) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg mb-2">No documents yet</p>
        <p className="text-sm">Add documents to build your knowledge base</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc: RAGDocument) => (
        <div key={doc.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <FileText className="w-5 h-5" style={{ color: themeColors.primary }} />
              <h4 className="font-medium">{doc.title}</h4>
              <span className={`text-xs px-2 py-1 rounded ${
                doc.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                doc.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {doc.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{doc.source_type}</span>
              {doc.chunk_count && <span>{doc.chunk_count} chunks</span>}
              {doc.token_count && <span>{doc.token_count.toLocaleString()} tokens</span>}
              <span>{new Date(doc.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <button
            onClick={() => onDelete(doc.id)}
            className="text-gray-400 hover:text-red-400 ml-4"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Create Collection Dialog
function CreateCollectionDialog({ onClose, onCreate, themeColors }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name, description);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold">Create New Collection</h3>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              required
              placeholder="My Knowledge Base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              rows={3}
              placeholder="Description of your collection..."
            />
          </div>
        </form>
        <div className="p-6 border-t border-gray-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: themeColors.primary }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Document Dialog
function AddDocumentDialog({ onClose, onAdd, themeColors }: any) {
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'file' && file) {
      onAdd(file, '', '');
    } else if (mode === 'text') {
      onAdd(null, title, content);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold mb-4">Add Document</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('file')}
              className={`flex-1 px-4 py-2 rounded-lg ${mode === 'file' ? 'bg-gray-700' : 'bg-gray-800'}`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setMode('text')}
              className={`flex-1 px-4 py-2 rounded-lg ${mode === 'text' ? 'bg-gray-700' : 'bg-gray-800'}`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Text
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {mode === 'file' ? (
            <div>
              <label className="block text-sm font-medium mb-2">File (PDF, DOCX, TXT, MD, CSV)</label>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md,.csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none"
                required
              />
              {file && <p className="text-sm text-gray-400 mt-2">{file.name}</p>}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
                  required
                  placeholder="Document title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 resize-none"
                  style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
                  rows={10}
                  required
                  placeholder="Paste your text content here..."
                />
              </div>
            </>
          )}
        </form>

        <div className="p-6 border-t border-gray-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: themeColors.primary }}
          >
            Add Document
          </button>
        </div>
      </div>
    </div>
  );
}
