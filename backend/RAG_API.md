# RAG API Documentation

API backend pour le système RAG (Retrieval Augmented Generation) de WeBoard.

## Base URL

```
http://localhost:3002/api/rag
```

## Authentication

Toutes les routes nécessitent un JWT token dans le header Authorization :

```
Authorization: Bearer <your_jwt_token>
```

Le token est obtenu via l'authentification Supabase côté frontend.

## Endpoints

### Collections

#### Créer une collection

```http
POST /api/rag/collections
Content-Type: application/json

{
  "name": "Ma Collection",
  "description": "Description optionnelle",
  "config": {
    "chunk_size": 1000,
    "chunk_overlap": 200,
    "top_k": 5,
    "llm_provider": "openai",
    "llm_model": "gpt-4o",
    "temperature": 0.7
  }
}
```

**Response:**
```json
{
  "success": true,
  "collection": {
    "id": "uuid",
    "name": "Ma Collection",
    "description": "...",
    "config": { ... },
    "created_at": "2024-03-24T10:00:00Z"
  }
}
```

#### Lister les collections

```http
GET /api/rag/collections
```

**Response:**
```json
{
  "success": true,
  "collections": [
    {
      "id": "uuid",
      "name": "Collection 1",
      "document_count": 5,
      "chunk_count": 123,
      "created_at": "..."
    }
  ]
}
```

#### Récupérer une collection

```http
GET /api/rag/collections/:id
```

#### Supprimer une collection

```http
DELETE /api/rag/collections/:id
```

#### Statistiques d'une collection

```http
GET /api/rag/collections/:id/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "collection_name": "...",
    "document_count": 10,
    "chunk_count": 245,
    "total_tokens": 12500,
    "avg_chunks_per_document": 24.5
  }
}
```

### Documents

#### Lister les documents d'une collection

```http
GET /api/rag/collections/:id/documents
```

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": "uuid",
      "title": "Mon Document",
      "source_type": "file",
      "chunk_count": 25,
      "status": "completed",
      "created_at": "..."
    }
  ]
}
```

#### Ajouter un document texte

```http
POST /api/rag/collections/:id/documents/text
Content-Type: application/json

{
  "title": "Mon Document",
  "content": "Contenu du document...",
  "metadata": {
    "author": "John Doe",
    "tags": ["important"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "title": "Mon Document",
    "collection_id": "uuid"
  },
  "chunks_count": 15,
  "tokens": 1234
}
```

#### Upload un fichier

```http
POST /api/rag/collections/:id/documents/upload
Content-Type: multipart/form-data

file: <binary_file>
```

**Formats supportés:**
- PDF (`.pdf`)
- Word (`.docx`)
- Texte (`.txt`, `.md`)
- CSV (`.csv`)

**Taille max:** 10MB

**Response:**
```json
{
  "success": true,
  "document": { ... },
  "chunks_count": 20,
  "tokens": 2500
}
```

#### Supprimer un document

```http
DELETE /api/rag/documents/:id
```

### Recherche & Chat

#### Recherche sémantique

```http
POST /api/rag/collections/:id/search
Content-Type: application/json

{
  "query": "Qu'est-ce que RAG?",
  "top_k": 5,
  "threshold": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "chunk_id": "uuid",
      "document_id": "uuid",
      "document_title": "Introduction to RAG",
      "chunk_text": "RAG (Retrieval Augmented Generation) est...",
      "similarity": 0.89,
      "document_source_type": "file"
    }
  ]
}
```

#### Chat avec RAG

```http
POST /api/rag/collections/:id/chat
Content-Type: application/json

{
  "message": "Explique-moi le RAG",
  "conversation_history": [
    {
      "role": "user",
      "content": "Bonjour"
    },
    {
      "role": "assistant",
      "content": "Bonjour! Comment puis-je vous aider?"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Le RAG (Retrieval Augmented Generation) est une technique qui combine...",
  "sources": [
    {
      "document_id": "uuid",
      "document_title": "Guide RAG",
      "similarity": 0.92,
      "text": "Extrait du document..."
    }
  ],
  "model_used": "gpt-4o",
  "chunks_used": 3
}
```

## Configuration LLM Provider

Avant d'utiliser l'API RAG, l'utilisateur doit configurer au moins un provider LLM dans Supabase via la table `api_configs`.

**Exemple de configuration OpenAI:**

```sql
INSERT INTO api_configs (user_id, service, config, is_active)
VALUES (
  'user_uuid',
  'openai',
  '{
    "apiKey": "sk-...",
    "models": {
      "chat": "gpt-4o",
      "embedding": "text-embedding-3-small"
    }
  }'::jsonb,
  true
);
```

**Providers supportés:**
- `openai` - GPT-4o, embeddings
- `anthropic` - Claude 3.5 Sonnet
- `cohere` - Command R+, embeddings
- `google` - Gemini 1.5 Pro, embeddings

**Note:** Seuls OpenAI, Cohere et Google supportent les embeddings (nécessaires pour le RAG).

## Codes d'erreur

- `400` - Bad Request (paramètres manquants ou invalides)
- `401` - Unauthorized (token manquant ou invalide)
- `403` - Forbidden (accès refusé à la ressource)
- `500` - Internal Server Error

## Workflow typique

1. **Configurer un LLM provider** (via Supabase)
2. **Créer une collection** (`POST /collections`)
3. **Ajouter des documents** (`POST /collections/:id/documents/upload`)
4. **Attendre le processing** (vérifier `status: completed`)
5. **Rechercher** (`POST /collections/:id/search`) ou **Chater** (`POST /collections/:id/chat`)

## Variables d'environnement requises

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Exemples complets

### Exemple TypeScript (Frontend)

```typescript
// Créer une collection
const createCollection = async (token: string) => {
  const response = await fetch('http://localhost:3002/api/rag/collections', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Mes Documents Tech',
      description: 'Documentation technique',
      config: {
        llm_provider: 'openai',
        llm_model: 'gpt-4o'
      }
    })
  });

  return await response.json();
};

// Upload un fichier
const uploadDocument = async (token: string, collectionId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `http://localhost:3002/api/rag/collections/${collectionId}/documents/upload`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }
  );

  return await response.json();
};

// Chat avec RAG
const chatWithRAG = async (token: string, collectionId: string, message: string) => {
  const response = await fetch(
    `http://localhost:3002/api/rag/collections/${collectionId}/chat`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        conversation_history: []
      })
    }
  );

  return await response.json();
};
```

## Limitations

- **Taille de fichier:** 10MB max
- **Formats:** PDF, DOCX, TXT, MD, CSV uniquement
- **Providers pour embeddings:** OpenAI, Cohere, Google seulement
- **Rate limiting:** Dépend de votre plan API du provider LLM

## Support

Pour tout problème, vérifiez :
1. Que les variables d'environnement Supabase sont correctes
2. Qu'un provider LLM actif est configuré dans `api_configs`
3. Que le JWT token est valide
4. Les logs du serveur backend
