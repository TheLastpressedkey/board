import { supabase } from '../lib/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

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
  created_at: string;
  updated_at: string;
}

export interface RAGDocument {
  id: string;
  collection_id: string;
  source_type: 'file' | 'url' | 'text' | 'card';
  title: string;
  content: string;
  metadata: any;
  status: 'processing' | 'completed' | 'failed';
  chunk_count?: number;
  token_count?: number;
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

export interface RAGSearchResult {
  chunk_id: string;
  document_id: string;
  document_title: string;
  chunk_text: string;
  similarity: number;
  document_source_type: string;
  document_source_ref?: string;
}

export interface RAGChatResponse {
  response: string;
  sources: {
    document_id: string;
    document_title: string;
    chunk_id: string;
    similarity: number;
    text: string;
    source_type: string;
    source_ref?: string;
  }[];
  model_used: string;
  chunks_used: number;
}

export interface RAGStats {
  total_documents: number;
  total_chunks: number;
  total_tokens: number;
  last_updated: string;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  model: string;
  system_prompt?: string;
  config: {
    temperature: number;
    max_tokens: number;
    top_k: number;
    threshold: number;
  };
  collections?: {
    id: string;
    name: string;
    description?: string;
    document_count: number;
    chunk_count: number;
  }[];
  created_at: string;
  updated_at: string;
}

class RAGClient {
  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    return session.access_token;
  }

  private async request(endpoint: string, options: RequestInit = {}, baseUrl: string = `${BACKEND_URL}/api/rag`): Promise<any> {
    const token = await this.getAuthToken();

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Collections
  async getCollections(): Promise<RAGCollection[]> {
    const data = await this.request('/collections');
    return data.collections;
  }

  async getCollection(id: string): Promise<RAGCollection> {
    const data = await this.request(`/collections/${id}`);
    return data.collection;
  }

  async createCollection(
    name: string,
    description: string,
    config?: Partial<RAGCollection['config']>
  ): Promise<RAGCollection> {
    const data = await this.request('/collections', {
      method: 'POST',
      body: JSON.stringify({ name, description, config }),
    });
    return data.collection;
  }

  async deleteCollection(id: string): Promise<void> {
    await this.request(`/collections/${id}`, { method: 'DELETE' });
  }

  // Documents
  async getDocuments(collectionId: string): Promise<RAGDocument[]> {
    const data = await this.request(`/collections/${collectionId}/documents`);
    return data.documents;
  }

  async addTextDocument(
    collectionId: string,
    title: string,
    content: string,
    metadata?: any
  ): Promise<{ document: RAGDocument; chunks_count: number; tokens: number }> {
    const data = await this.request(`/collections/${collectionId}/documents/text`, {
      method: 'POST',
      body: JSON.stringify({ title, content, metadata }),
    });
    return data;
  }

  async uploadDocument(
    collectionId: string,
    file: File
  ): Promise<{ document: RAGDocument; chunks_count: number; tokens: number }> {
    const token = await this.getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${BACKEND_URL}/api/rag/collections/${collectionId}/documents/upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.request(`/documents/${documentId}`, { method: 'DELETE' });
  }

  // Search & Chat
  async search(
    collectionId: string,
    query: string,
    topK: number = 5,
    threshold: number = 0.7
  ): Promise<RAGSearchResult[]> {
    const data = await this.request(`/collections/${collectionId}/search`, {
      method: 'POST',
      body: JSON.stringify({ query, top_k: topK, threshold }),
    });
    return data.results;
  }

  async chat(
    collectionId: string,
    message: string,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<RAGChatResponse> {
    const data = await this.request(`/collections/${collectionId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, conversation_history: conversationHistory }),
    });
    return data;
  }

  // Stats
  async getStats(collectionId: string): Promise<RAGStats> {
    const data = await this.request(`/collections/${collectionId}/stats`);
    return data.stats;
  }

  // ==================== AGENTS ====================

  async getAgents(): Promise<Agent[]> {
    const data = await this.request('/agents', {}, `${BACKEND_URL}/api`);
    return data.agents;
  }

  async getAgent(id: string): Promise<Agent> {
    const data = await this.request(`/agents/${id}`, {}, `${BACKEND_URL}/api`);
    return data.agent;
  }

  async createAgent(
    name: string,
    model: string,
    description?: string,
    systemPrompt?: string,
    collectionIds: string[] = [],
    config?: Partial<Agent['config']>
  ): Promise<Agent> {
    const data = await this.request('/agents', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        model,
        system_prompt: systemPrompt,
        collection_ids: collectionIds,
        config,
      }),
    }, `${BACKEND_URL}/api`);
    return data.agent;
  }

  async updateAgent(
    id: string,
    updates: {
      name?: string;
      description?: string;
      model?: string;
      system_prompt?: string;
      collection_ids?: string[];
      config?: Partial<Agent['config']>;
    }
  ): Promise<Agent> {
    const data = await this.request(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, `${BACKEND_URL}/api`);
    return data.agent;
  }

  async deleteAgent(id: string): Promise<void> {
    await this.request(`/agents/${id}`, { method: 'DELETE' }, `${BACKEND_URL}/api`);
  }

  async chatWithAgent(
    agentId: string,
    message: string,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<RAGChatResponse> {
    const data = await this.request(`/agents/${agentId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, conversation_history: conversationHistory }),
    }, `${BACKEND_URL}/api`);
    return data;
  }
}

export const ragClient = new RAGClient();
