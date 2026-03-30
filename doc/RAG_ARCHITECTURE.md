# Architecture RAG Multi-LLM pour WeBoard

## Vue d'ensemble

Ce document décrit l'architecture du système RAG (Retrieval Augmented Generation) avec support multi-LLM pour WeBoard.

## Stack Technique

### Frontend
- **LangChain.js** : Framework pour RAG et chaining
- **React** : Interface utilisateur
- **Supabase Client** : Accès à la base de données

### Backend
- **Supabase PostgreSQL** : Base de données principale
- **pgvector** : Extension pour recherche vectorielle
- **Supabase Edge Functions** : Processing des documents (optionnel pour tasks lourds)
- **Backend Render existant** : API endpoints pour processing

### LLM Providers Supportés

1. **OpenAI** (GPT-4, GPT-3.5, embeddings)
2. **Anthropic** (Claude 3.5 Sonnet, Opus, Haiku)
3. **Cohere** (Command R+, embeddings)
4. **Google** (Gemini 1.5 Pro, embeddings)
5. **Mistral AI** (Mistral Large, embeddings)
6. **HuggingFace** (modèles open-source)
7. **Together AI** (Mixtral, Llama, etc.)
8. **Ollama** (modèles locaux)

## Structure de la Base de Données

### Tables Principales

#### 1. `rag_collections`
Collections RAG créées par les utilisateurs.

```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- name (TEXT) : Nom de la collection
- description (TEXT) : Description
- config (JSONB) : Configuration (chunk_size, top_k, modèle, etc.)
- document_count (INTEGER) : Nombre de documents
- chunk_count (INTEGER) : Nombre de chunks
- total_tokens (INTEGER) : Total tokens utilisés
- created_at, updated_at (TIMESTAMPTZ)
```

**Config Example:**
```json
{
  "chunk_size": 1000,
  "chunk_overlap": 200,
  "top_k": 5,
  "embedding_model": "text-embedding-3-small",
  "llm_provider": "openai",
  "llm_model": "gpt-4o",
  "temperature": 0.7
}
```

#### 2. `rag_documents`
Documents sources dans une collection.

```sql
- id (UUID, PK)
- collection_id (UUID, FK → rag_collections)
- source_type (TEXT) : 'file', 'url', 'card', 'text', 'api'
- source_ref (TEXT) : Référence source (file path, URL, card_id)
- title (TEXT) : Titre du document
- content (TEXT) : Contenu complet
- metadata (JSONB) : Métadonnées (file_size, type, language, etc.)
- chunk_count (INTEGER) : Nombre de chunks
- token_count (INTEGER) : Nombre de tokens
- status (TEXT) : 'pending', 'processing', 'completed', 'failed'
- error_message (TEXT) : Message d'erreur si échec
- created_at, processed_at (TIMESTAMPTZ)
```

#### 3. `rag_chunks`
Chunks de texte avec embeddings vectoriels.

```sql
- id (UUID, PK)
- document_id (UUID, FK → rag_documents)
- collection_id (UUID, FK → rag_collections)
- chunk_text (TEXT) : Texte du chunk
- chunk_index (INTEGER) : Index du chunk dans le document
- metadata (JSONB) : Métadonnées (position, page, section)
- embedding (vector(1536)) : Embedding vectoriel
- token_count (INTEGER) : Nombre de tokens
- created_at (TIMESTAMPTZ)
```

**Index vectoriel:**
```sql
CREATE INDEX idx_rag_chunks_embedding ON rag_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

#### 4. `rag_conversations`
Historique des conversations avec RAG.

```sql
- id (UUID, PK)
- collection_id (UUID, FK → rag_collections)
- user_id (UUID, FK → auth.users)
- title (TEXT) : Titre de la conversation
- messages (JSONB) : Array de messages
- message_count (INTEGER)
- total_tokens (INTEGER)
- created_at, updated_at, last_message_at (TIMESTAMPTZ)
```

**Messages Format:**
```json
[
  {
    "role": "user",
    "content": "Question de l'utilisateur",
    "timestamp": "2024-03-24T10:00:00Z"
  },
  {
    "role": "assistant",
    "content": "Réponse de l'assistant",
    "sources": [
      {
        "document_id": "uuid",
        "chunk_id": "uuid",
        "similarity": 0.85,
        "text": "Excerpt..."
      }
    ],
    "timestamp": "2024-03-24T10:00:05Z"
  }
]
```

#### 5. `rag_usage_stats`
Statistiques d'utilisation quotidiennes.

```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- date (DATE) : Date des stats
- queries_count (INTEGER) : Nombre de requêtes
- tokens_used (INTEGER) : Tokens utilisés
- embeddings_created (INTEGER) : Embeddings créés
- documents_processed (INTEGER) : Documents traités
- created_at (TIMESTAMPTZ)

UNIQUE(user_id, date)
```

#### 6. `api_configs` (existante, étendue)
Configuration des clés API pour chaque provider LLM.

```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- service (TEXT) : 'openai', 'anthropic', 'cohere', etc.
- config (JSONB) : Configuration spécifique au provider
- is_active (BOOLEAN) : Provider actif
- created_at, updated_at (TIMESTAMPTZ)

UNIQUE(user_id, service)
```

**Config par Provider:**

```json
// OpenAI
{
  "apiKey": "sk-...",
  "organization": "org-...",
  "models": {
    "chat": "gpt-4o",
    "embedding": "text-embedding-3-small"
  }
}

// Anthropic
{
  "apiKey": "sk-ant-...",
  "models": {
    "chat": "claude-3-5-sonnet-20241022"
  }
}

// Cohere
{
  "apiKey": "...",
  "models": {
    "chat": "command-r-plus",
    "embedding": "embed-multilingual-v3.0"
  }
}

// Ollama (local)
{
  "baseUrl": "http://localhost:11434",
  "models": {
    "chat": "llama3",
    "embedding": "nomic-embed-text"
  }
}
```

## Fonctions PostgreSQL

### 1. `match_rag_chunks()`
Recherche vectorielle dans une collection.

```sql
SELECT * FROM match_rag_chunks(
  p_collection_id := 'uuid',
  p_query_embedding := '[0.1, 0.2, ...]'::vector(1536),
  p_match_threshold := 0.7,
  p_match_count := 5
);
```

**Returns:**
- chunk_id, document_id, chunk_text
- similarity (score 0-1)
- chunk_metadata, document_metadata
- document_title, source_type, source_ref

### 2. `match_rag_chunks_multi_collection()`
Recherche dans plusieurs collections simultanément.

```sql
SELECT * FROM match_rag_chunks_multi_collection(
  p_collection_ids := ARRAY['uuid1', 'uuid2'],
  p_query_embedding := '[...]'::vector(1536),
  p_match_threshold := 0.7,
  p_match_count := 10
);
```

### 3. `get_collection_stats()`
Statistiques détaillées d'une collection.

```sql
SELECT * FROM get_collection_stats('collection_uuid');
```

### 4. `update_usage_stats()`
Met à jour les stats d'utilisation quotidiennes.

```sql
SELECT update_usage_stats(
  p_user_id := 'user_uuid',
  p_queries_count := 1,
  p_tokens_used := 500,
  p_embeddings_created := 10,
  p_documents_processed := 1
);
```

### 5. `get_active_llm_provider()`
Récupère le provider LLM actif.

```sql
SELECT * FROM get_active_llm_provider('user_uuid');
```

### 6. `get_all_llm_providers()`
Liste tous les providers configurés.

```sql
SELECT * FROM get_all_llm_providers('user_uuid');
```

## Workflow RAG

### 1. Ajouter un Document

```typescript
// 1. Upload/Load document
const document = {
  collection_id: 'uuid',
  source_type: 'file',
  title: 'Mon Document',
  content: 'Contenu...',
  metadata: { file_type: 'pdf', file_size: 1024 }
};

// 2. Insert document
const { data: doc } = await supabase
  .from('rag_documents')
  .insert(document)
  .select()
  .single();

// 3. Chunking avec LangChain
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200
});

const chunks = await splitter.splitText(document.content);

// 4. Générer embeddings
import { OpenAIEmbeddings } from '@langchain/openai';

const embeddings = new OpenAIEmbeddings({
  apiKey: userConfig.apiKey,
  model: 'text-embedding-3-small'
});

for (let i = 0; i < chunks.length; i++) {
  const embedding = await embeddings.embedQuery(chunks[i]);

  await supabase.from('rag_chunks').insert({
    document_id: doc.id,
    collection_id: document.collection_id,
    chunk_text: chunks[i],
    chunk_index: i,
    embedding: embedding
  });
}
```

### 2. Recherche Sémantique

```typescript
// 1. Générer embedding de la query
const queryEmbedding = await embeddings.embedQuery(userQuery);

// 2. Recherche vectorielle
const { data: results } = await supabase.rpc('match_rag_chunks', {
  p_collection_id: collectionId,
  p_query_embedding: queryEmbedding,
  p_match_threshold: 0.7,
  p_match_count: 5
});

// Results contient les chunks pertinents avec leurs scores
```

### 3. Chat avec RAG

```typescript
import { ChatOpenAI } from '@langchain/openai';

// 1. Rechercher contexte pertinent
const relevantChunks = await searchSemantic(userQuery);

// 2. Construire le contexte
const context = relevantChunks
  .map(c => c.chunk_text)
  .join('\n\n---\n\n');

// 3. Créer le prompt avec contexte
const systemPrompt = `Tu es un assistant qui répond en utilisant le contexte suivant :

CONTEXTE:
${context}

Instructions :
- Réponds uniquement basé sur le contexte fourni
- Si l'information n'est pas dans le contexte, dis-le
- Cite les sources quand possible`;

// 4. Appel LLM
const llm = new ChatOpenAI({
  apiKey: userConfig.apiKey,
  model: userConfig.models.chat,
  temperature: 0.7
});

const response = await llm.invoke([
  { role: 'system', content: systemPrompt },
  ...conversationHistory,
  { role: 'user', content: userQuery }
]);

// 5. Sauvegarder la conversation
await supabase.from('rag_conversations').insert({
  collection_id: collectionId,
  user_id: userId,
  messages: [
    ...existingMessages,
    { role: 'user', content: userQuery, timestamp: new Date() },
    {
      role: 'assistant',
      content: response.content,
      sources: relevantChunks.map(c => ({
        document_id: c.document_id,
        chunk_id: c.chunk_id,
        similarity: c.similarity,
        text: c.chunk_text.substring(0, 200)
      })),
      timestamp: new Date()
    }
  ]
});
```

## LangChain Multi-Provider Support

### Configuration

```typescript
// services/llmProvider.ts
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatCohere } from '@langchain/cohere';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { CohereEmbeddings } from '@langchain/cohere';

export class LLMProvider {
  static async getChatModel(provider: string, config: any) {
    switch (provider) {
      case 'openai':
        return new ChatOpenAI({
          apiKey: config.apiKey,
          model: config.models.chat,
          temperature: config.temperature || 0.7
        });

      case 'anthropic':
        return new ChatAnthropic({
          apiKey: config.apiKey,
          model: config.models.chat,
          temperature: config.temperature || 0.7
        });

      case 'cohere':
        return new ChatCohere({
          apiKey: config.apiKey,
          model: config.models.chat,
          temperature: config.temperature || 0.7
        });

      case 'google':
        return new ChatGoogleGenerativeAI({
          apiKey: config.apiKey,
          model: config.models.chat,
          temperature: config.temperature || 0.7
        });

      // ... autres providers

      default:
        throw new Error(`Provider ${provider} not supported`);
    }
  }

  static async getEmbeddings(provider: string, config: any) {
    switch (provider) {
      case 'openai':
        return new OpenAIEmbeddings({
          apiKey: config.apiKey,
          model: config.models.embedding
        });

      case 'cohere':
        return new CohereEmbeddings({
          apiKey: config.apiKey,
          model: config.models.embedding
        });

      // ... autres providers

      default:
        throw new Error(`Embeddings for ${provider} not supported`);
    }
  }
}
```

### Utilisation

```typescript
// Récupérer config active
const { data: activeProvider } = await supabase.rpc(
  'get_active_llm_provider',
  { p_user_id: userId }
);

// Instancier le modèle
const chatModel = await LLMProvider.getChatModel(
  activeProvider.service,
  activeProvider.config
);

const embeddings = await LLMProvider.getEmbeddings(
  activeProvider.service,
  activeProvider.config
);

// Utiliser
const response = await chatModel.invoke(messages);
const embedding = await embeddings.embedQuery(text);
```

## Installation des Dépendances

```bash
# Core LangChain
npm install langchain @langchain/core

# Providers
npm install @langchain/openai
npm install @langchain/anthropic
npm install @langchain/cohere
npm install @langchain/google-genai
npm install @langchain/community

# Document loaders
npm install pdf-parse
npm install mammoth  # Pour DOCX
npm install csv-parse

# Utilities
npm install tiktoken  # Pour compter les tokens
```

## Exécuter les Migrations

```bash
# Copier les fichiers dans supabase/migrations/
# Puis exécuter:
supabase db push

# Ou via Supabase Dashboard:
# SQL Editor → Coller le contenu → Run
```

## Prochaines Étapes

1. **Créer l'UI RAG Manager**
   - Gestion des collections
   - Upload de documents
   - Configuration des modèles

2. **Créer le Service RAG**
   - Document processing
   - Chunking & Embeddings
   - Recherche sémantique

3. **Créer l'Interface Chat**
   - Chat avec RAG
   - Affichage des sources
   - Export conversations

4. **Monitoring & Analytics**
   - Dashboard usage
   - Coûts par provider
   - Performance metrics

## Avantages du Multi-LLM

✅ **Flexibilité** : Choisir le meilleur modèle pour chaque tâche
✅ **Coût** : Optimiser les coûts (GPT-4 pour qualité, GPT-3.5 pour speed)
✅ **Privacy** : Utiliser Ollama localement pour données sensibles
✅ **Fallback** : Basculer si un provider est down
✅ **Spécialisation** : Claude pour code, GPT-4 pour analyse, Cohere pour search

## Backend

**Option 1 : Utiliser le backend Render existant**
- Ajouter endpoints pour document processing
- `/api/rag/process-document`
- `/api/rag/generate-embeddings`

**Option 2 : Supabase Edge Functions**
- Processing lourd côté serveur
- Évite d'exposer les clés API côté client
- Meilleure sécurité

**Recommandation : Hybride**
- Frontend direct pour queries simples
- Edge Functions pour document processing
- Backend Render pour tasks très lourds
