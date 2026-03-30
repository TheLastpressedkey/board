import React, { useState, useEffect } from 'react';
import { Database, Plus, MessageSquare, FileText, Settings, Trash2, Upload, Search } from 'lucide-react';
import { ragClient, RAGCollection, RAGDocument } from '../../../services/ragClient';
import { useTheme } from '../../../contexts/ThemeContext';

interface AgentHubProps {
  onClose?: () => void;
}

export function AgentHub({ onClose }: AgentHubProps) {
  const { themeColors } = useTheme();
  const [collections, setCollections] = useState<RAGCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<RAGCollection | null>(null);
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [view, setView] = useState<'collections' | 'documents' | 'chat'>('collections');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string; sources?: any[] }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await ragClient.getCollections();
      setCollections(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (collectionId: string) => {
    try {
      const data = await ragClient.getDocuments(collectionId);
      setDocuments(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateCollection = async (name: string, description: string) => {
    try {
      await ragClient.createCollection(name, description);
      await loadCollections();
      setShowCreateCollection(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection and all its documents?')) return;

    try {
      await ragClient.deleteCollection(id);
      await loadCollections();
      if (selectedCollection?.id === id) {
        setSelectedCollection(null);
        setView('collections');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSelectCollection = (collection: RAGCollection) => {
    setSelectedCollection(collection);
    loadDocuments(collection.id);
    setView('documents');
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
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await ragClient.deleteDocument(documentId);
      if (selectedCollection) {
        await loadDocuments(selectedCollection.id);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedCollection || sendingMessage) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setSendingMessage(true);

    try {
      const conversationHistory = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await ragClient.chat(selectedCollection.id, userMessage, conversationHistory);

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        sources: response.sources
      }]);
    } catch (err: any) {
      setError(err.message);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`
      }]);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartChat = () => {
    setChatMessages([]);
    setView('chat');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: `${themeColors.primary} transparent` }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view !== 'collections' && (
              <button
                onClick={() => {
                  if (view === 'chat') {
                    setView('documents');
                  } else {
                    setView('collections');
                    setSelectedCollection(null);
                  }
                }}
                className="text-gray-400 hover:text-white"
              >
                ← Back
              </button>
            )}
            <Database className="w-6 h-6" style={{ color: themeColors.primary }} />
            <div>
              <h2 className="text-xl font-bold">Agent Hub</h2>
              <p className="text-sm text-gray-400">
                {view === 'collections' && 'Manage your RAG collections'}
                {view === 'documents' && selectedCollection?.name}
                {view === 'chat' && `Chat with ${selectedCollection?.name}`}
              </p>
            </div>
          </div>

          {view === 'collections' && (
            <button
              onClick={() => setShowCreateCollection(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: themeColors.primary }}
            >
              <Plus className="w-4 h-4" />
              New Collection
            </button>
          )}

          {view === 'documents' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartChat}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </button>
              <button
                onClick={() => setShowAddDocument(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Plus className="w-4 h-4" />
                Add Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 m-4 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="float-right">×</button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {view === 'collections' && (
          <CollectionsList
            collections={collections}
            onSelect={handleSelectCollection}
            onDelete={handleDeleteCollection}
            themeColors={themeColors}
          />
        )}

        {view === 'documents' && selectedCollection && (
          <DocumentsList
            documents={documents}
            onDelete={handleDeleteDocument}
            themeColors={themeColors}
          />
        )}

        {view === 'chat' && selectedCollection && (
          <ChatView
            messages={chatMessages}
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            onSend={handleSendMessage}
            sending={sendingMessage}
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

// Chat View Component
function ChatView({ messages, inputMessage, onInputChange, onSend, sending, themeColors }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Start a conversation</p>
            <p className="text-sm">Ask questions about your documents</p>
          </div>
        )}

        {messages.map((msg: any, idx: number) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-4 ${
              msg.role === 'user'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-100'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                  <p className="font-semibold mb-2">Sources:</p>
                  {msg.sources.map((source: any, i: number) => (
                    <div key={i} className="mb-1">
                      • {source.document_title} ({(source.similarity * 100).toFixed(1)}%)
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2" style={{ borderColor: `${themeColors.primary} transparent` }} />
                <span className="text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
          placeholder="Ask a question..."
          className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
          disabled={sending}
        />
        <button
          onClick={onSend}
          disabled={sending || !inputMessage.trim()}
          className="px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: themeColors.primary }}
        >
          Send
        </button>
      </div>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">Create New Collection</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: themeColors.primary }}
            >
              Create
            </button>
          </div>
        </form>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">Add Document</h3>

        <div className="flex gap-2 mb-4">
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

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: themeColors.primary }}
            >
              Add Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
