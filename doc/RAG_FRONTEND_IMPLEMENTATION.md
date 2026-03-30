# RAG Frontend Implementation Guide

Guide pour implémenter l'interface RAG côté frontend (React).

## Architecture Frontend

```
src/
├── services/
│   └── ragClient.ts          # Client API RAG
├── components/
│   └── Apps/
│       └── RAG/
│           ├── RAG.tsx                # App principale
│           ├── CollectionManager.tsx  # Gestion collections
│           ├── DocumentUploader.tsx   # Upload de documents
│           ├── RAGChat.tsx            # Interface chat
│           └── SearchResults.tsx      # Affichage résultats
```

## 1. Client API RAG

**Fichier:** `src/services/ragClient.ts`

```typescript
import { supabase } from '../lib/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

/**
 * Service client pour l'API RAG
 */
export const ragClient = {
  /**
   * Récupère le token JWT de l'utilisateur connecté
   */
  async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }
    return session.access_token;
  },

  /**
   * Headers par défaut avec authentification
   */
  async getHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  },

  // ========== COLLECTIONS ==========

  async createCollection(name: string, description?: string, config?: any) {
    const headers = await this.getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/rag/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, description, config })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  },

  async getCollections() {
    const headers = await this.getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/rag/collections`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  },

  async getCollection(collectionId: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/rag/collections/${collectionId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  },

  async deleteCollection(collectionId: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/rag/collections/${collectionId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  },

  async getCollectionStats(collectionId: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/rag/collections/${collectionId}/stats`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  },

  // ========== DOCUMENTS ==========

  async getDocuments(collectionId: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/rag/collections/${collectionId}/documents`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  },

  async addTextDocument(collectionId: string, title: string, content: string, metadata?: any) {
    const headers = await this.getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/rag/collections/${collectionId}/documents/text`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title, content, metadata })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  },

  async uploadDocument(collectionId: string, file: File, onProgress?: (progress: number) => void) {
    const token = await this.getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      // Success
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(xhr.responseText));
        }
      });

      // Error
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${BACKEND_URL}/api/rag/collections/${collectionId}/documents/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  async deleteDocument(documentId: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/rag/documents/${documentId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  },

  // ========== SEARCH & CHAT ==========

  async search(collectionId: string, query: string, topK: number = 5, threshold: number = 0.7) {
    const headers = await this.getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/rag/collections/${collectionId}/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, top_k: topK, threshold })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  },

  async chat(collectionId: string, message: string, conversationHistory: any[] = []) {
    const headers = await this.getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/rag/collections/${collectionId}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, conversation_history: conversationHistory })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  }
};
```

## 2. Types TypeScript

**Fichier:** `src/types/rag.ts`

```typescript
export interface RAGCollection {
  id: string;
  user_id: string;
  name: string;
  description: string;
  config: {
    chunk_size: number;
    chunk_overlap: number;
    top_k: number;
    embedding_model: string;
    llm_provider: string;
    llm_model: string;
    temperature: number;
  };
  document_count: number;
  chunk_count: number;
  total_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface RAGDocument {
  id: string;
  collection_id: string;
  source_type: 'file' | 'url' | 'text' | 'card';
  source_ref?: string;
  title: string;
  content: string;
  metadata: any;
  chunk_count: number;
  token_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  document_title: string;
  chunk_text: string;
  chunk_index: number;
  similarity: number;
  document_source_type: string;
  document_source_ref?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    document_id: string;
    document_title: string;
    similarity: number;
    text: string;
  }>;
  timestamp?: string;
}
```

## 3. Composants React

### CollectionManager.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { ragClient } from '../../../services/ragClient';

export function CollectionManager() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const { collections } = await ragClient.getCollections();
      setCollections(collections);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await ragClient.createCollection(newCollectionName);
      setNewCollectionName('');
      setShowCreateDialog(false);
      await loadCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette collection ?')) return;

    try {
      await ragClient.deleteCollection(id);
      await loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <button onClick={() => setShowCreateDialog(true)}>
        Nouvelle Collection
      </button>

      <div className="grid gap-4 mt-4">
        {collections.map(collection => (
          <div key={collection.id} className="p-4 border rounded">
            <h3>{collection.name}</h3>
            <p>{collection.description}</p>
            <div className="text-sm text-gray-500">
              {collection.document_count} documents, {collection.chunk_count} chunks
            </div>
            <button onClick={() => handleDelete(collection.id)}>
              Supprimer
            </button>
          </div>
        ))}
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded">
            <h2>Nouvelle Collection</h2>
            <input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Nom de la collection"
            />
            <button onClick={handleCreate}>Créer</button>
            <button onClick={() => setShowCreateDialog(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### DocumentUploader.tsx

```typescript
import React, { useState } from 'react';
import { ragClient } from '../../../services/ragClient';

interface Props {
  collectionId: string;
  onUploaded: () => void;
}

export function DocumentUploader({ collectionId, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      await ragClient.uploadDocument(collectionId, file, setProgress);
      onUploaded();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept=".pdf,.docx,.txt,.md,.csv"
        onChange={handleFileUpload}
        disabled={uploading}
      />

      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>{progress}%</p>
        </div>
      )}
    </div>
  );
}
```

### RAGChat.tsx

```typescript
import React, { useState } from 'react';
import { ragClient } from '../../../services/ragClient';
import { ChatMessage } from '../../../types/rag';

interface Props {
  collectionId: string;
}

export function RAGChat({ collectionId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { response, sources } = await ragClient.chat(
        collectionId,
        input,
        messages
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        sources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block p-3 rounded ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              {msg.content}
            </div>

            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Sources: {msg.sources.map(s => s.document_title).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Posez votre question..."
          disabled={loading}
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
}
```

## 4. Configuration LLM Provider (UI)

Ajouter une interface dans les Settings pour configurer les providers LLM :

```typescript
// Dans Settings.tsx ou nouvelle page LLMProviderSettings.tsx

const saveLLMProvider = async (provider: string, apiKey: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Désactiver tous les autres providers
  await supabase
    .from('api_configs')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .in('service', ['openai', 'anthropic', 'cohere', 'google']);

  // Ajouter ou mettre à jour le nouveau provider
  await supabase
    .from('api_configs')
    .upsert({
      user_id: user.id,
      service: provider,
      config: {
        apiKey,
        models: {
          chat: provider === 'openai' ? 'gpt-4o' : 'default',
          embedding: provider === 'openai' ? 'text-embedding-3-small' : 'default'
        }
      },
      is_active: true
    }, {
      onConflict: 'user_id,service'
    });
};
```

## Prochaines Étapes

1. ✅ Créer `ragClient.ts`
2. ✅ Créer les types TypeScript
3. ✅ Créer `CollectionManager.tsx`
4. ✅ Créer `DocumentUploader.tsx`
5. ✅ Créer `RAGChat.tsx`
6. Créer `RAG.tsx` (app principale)
7. Ajouter dans `AppStore.tsx`
8. Ajouter dans `AppCard.tsx`
9. Tester end-to-end

## Notes Importantes

- Le backend doit tourner sur `http://localhost:3002`
- L'utilisateur doit configurer un provider LLM avant d'utiliser RAG
- Les providers pour embeddings : OpenAI, Cohere, Google uniquement
- Limite upload : 10MB
