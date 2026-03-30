-- ============================================
-- RAG (Retrieval Augmented Generation) Tables
-- ============================================

-- Table: rag_collections
-- Description: Collections RAG créées par les utilisateurs
CREATE TABLE rag_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,

  -- Configuration de la collection
  config JSONB NOT NULL DEFAULT jsonb_build_object(
    'chunk_size', 1000,
    'chunk_overlap', 200,
    'top_k', 5,
    'embedding_model', 'text-embedding-3-small',
    'llm_provider', 'openai',
    'llm_model', 'gpt-4o',
    'temperature', 0.7
  ),

  -- Métadonnées
  metadata JSONB DEFAULT '{}',

  -- Stats
  document_count INTEGER DEFAULT 0,
  chunk_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT valid_name CHECK (length(name) > 0 AND length(name) <= 100)
);

-- Index
CREATE INDEX idx_rag_collections_user_id ON rag_collections(user_id);
CREATE INDEX idx_rag_collections_created_at ON rag_collections(created_at DESC);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_rag_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rag_collections_updated_at
  BEFORE UPDATE ON rag_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_rag_collections_updated_at();

-- ============================================

-- Table: rag_documents
-- Description: Documents sources ajoutés à une collection
CREATE TABLE rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES rag_collections(id) ON DELETE CASCADE,

  -- Source du document
  source_type TEXT NOT NULL CHECK (source_type IN ('file', 'url', 'card', 'text', 'api')),
  source_ref TEXT, -- file path, URL, card_id, etc.

  -- Contenu
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Métadonnées
  metadata JSONB DEFAULT jsonb_build_object(
    'file_size', 0,
    'file_type', '',
    'language', 'en',
    'author', '',
    'created_date', null
  ),

  -- Stats
  chunk_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,

  -- Status du processing
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,

  -- Contraintes
  CONSTRAINT valid_title CHECK (length(title) > 0 AND length(title) <= 500),
  CONSTRAINT valid_content CHECK (length(content) > 0)
);

-- Index
CREATE INDEX idx_rag_documents_collection_id ON rag_documents(collection_id);
CREATE INDEX idx_rag_documents_source_type ON rag_documents(source_type);
CREATE INDEX idx_rag_documents_status ON rag_documents(status);
CREATE INDEX idx_rag_documents_created_at ON rag_documents(created_at DESC);

-- ============================================

-- Table: rag_chunks
-- Description: Chunks de texte avec embeddings vectoriels
CREATE TABLE rag_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES rag_collections(id) ON DELETE CASCADE,

  -- Contenu du chunk
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,

  -- Métadonnées du chunk
  metadata JSONB DEFAULT jsonb_build_object(
    'start_char', 0,
    'end_char', 0,
    'page_number', null,
    'section', ''
  ),

  -- Embedding vectoriel (1536 dimensions pour text-embedding-3-small)
  -- Peut aussi supporter 3072 pour text-embedding-3-large
  embedding vector(1536),

  -- Token count
  token_count INTEGER DEFAULT 0,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT valid_chunk_text CHECK (length(chunk_text) > 0),
  CONSTRAINT valid_chunk_index CHECK (chunk_index >= 0)
);

-- Index pour recherche vectorielle (IVFFlat)
-- Ajuster lists selon la taille: lists = rows / 1000 (minimum 10, max 100000)
CREATE INDEX idx_rag_chunks_embedding ON rag_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index classiques
CREATE INDEX idx_rag_chunks_document_id ON rag_chunks(document_id);
CREATE INDEX idx_rag_chunks_collection_id ON rag_chunks(collection_id);
CREATE INDEX idx_rag_chunks_chunk_index ON rag_chunks(chunk_index);

-- ============================================

-- Table: rag_conversations
-- Description: Historique des conversations avec RAG
CREATE TABLE rag_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES rag_collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Métadonnées
  title TEXT NOT NULL DEFAULT 'New Conversation',

  -- Messages (array de {role, content, sources})
  messages JSONB NOT NULL DEFAULT '[]',

  -- Stats
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

-- Index
CREATE INDEX idx_rag_conversations_collection_id ON rag_conversations(collection_id);
CREATE INDEX idx_rag_conversations_user_id ON rag_conversations(user_id);
CREATE INDEX idx_rag_conversations_updated_at ON rag_conversations(updated_at DESC);

-- Trigger pour updated_at
CREATE TRIGGER trigger_rag_conversations_updated_at
  BEFORE UPDATE ON rag_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_rag_collections_updated_at();

-- ============================================

-- Table: rag_usage_stats
-- Description: Statistiques d'utilisation RAG par utilisateur
CREATE TABLE rag_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Stats quotidiennes
  queries_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  embeddings_created INTEGER DEFAULT 0,
  documents_processed INTEGER DEFAULT 0,

  -- Métadonnées
  metadata JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contrainte unique par user et date
  UNIQUE(user_id, date)
);

-- Index
CREATE INDEX idx_rag_usage_stats_user_id ON rag_usage_stats(user_id);
CREATE INDEX idx_rag_usage_stats_date ON rag_usage_stats(date DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE rag_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_usage_stats ENABLE ROW LEVEL SECURITY;

-- Policies pour rag_collections
CREATE POLICY "Users can view their own RAG collections"
  ON rag_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own RAG collections"
  ON rag_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RAG collections"
  ON rag_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RAG collections"
  ON rag_collections FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour rag_documents
CREATE POLICY "Users can view documents in their collections"
  ON rag_documents FOR SELECT
  USING (
    collection_id IN (
      SELECT id FROM rag_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents in their collections"
  ON rag_documents FOR INSERT
  WITH CHECK (
    collection_id IN (
      SELECT id FROM rag_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents in their collections"
  ON rag_documents FOR UPDATE
  USING (
    collection_id IN (
      SELECT id FROM rag_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents in their collections"
  ON rag_documents FOR DELETE
  USING (
    collection_id IN (
      SELECT id FROM rag_collections WHERE user_id = auth.uid()
    )
  );

-- Policies pour rag_chunks
CREATE POLICY "Users can view chunks in their collections"
  ON rag_chunks FOR SELECT
  USING (
    collection_id IN (
      SELECT id FROM rag_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chunks in their collections"
  ON rag_chunks FOR INSERT
  WITH CHECK (
    collection_id IN (
      SELECT id FROM rag_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete chunks in their collections"
  ON rag_chunks FOR DELETE
  USING (
    collection_id IN (
      SELECT id FROM rag_collections WHERE user_id = auth.uid()
    )
  );

-- Policies pour rag_conversations
CREATE POLICY "Users can view their own conversations"
  ON rag_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON rag_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON rag_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON rag_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour rag_usage_stats
CREATE POLICY "Users can view their own usage stats"
  ON rag_usage_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage stats"
  ON rag_usage_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage stats"
  ON rag_usage_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Triggers pour auto-update des stats
-- ============================================

-- Trigger: Incrémenter document_count quand un document est ajouté
CREATE OR REPLACE FUNCTION increment_collection_document_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rag_collections
  SET document_count = document_count + 1
  WHERE id = NEW.collection_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_document_count
  AFTER INSERT ON rag_documents
  FOR EACH ROW
  EXECUTE FUNCTION increment_collection_document_count();

-- Trigger: Décrémenter document_count quand un document est supprimé
CREATE OR REPLACE FUNCTION decrement_collection_document_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rag_collections
  SET document_count = GREATEST(0, document_count - 1)
  WHERE id = OLD.collection_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_document_count
  AFTER DELETE ON rag_documents
  FOR EACH ROW
  EXECUTE FUNCTION decrement_collection_document_count();

-- Trigger: Incrémenter chunk_count pour collection et document
CREATE OR REPLACE FUNCTION increment_chunk_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrémenter pour la collection
  UPDATE rag_collections
  SET chunk_count = chunk_count + 1
  WHERE id = NEW.collection_id;

  -- Incrémenter pour le document
  UPDATE rag_documents
  SET chunk_count = chunk_count + 1
  WHERE id = NEW.document_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_chunk_counts
  AFTER INSERT ON rag_chunks
  FOR EACH ROW
  EXECUTE FUNCTION increment_chunk_counts();

-- Trigger: Décrémenter chunk_count pour collection et document
CREATE OR REPLACE FUNCTION decrement_chunk_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Décrémenter pour la collection
  UPDATE rag_collections
  SET chunk_count = GREATEST(0, chunk_count - 1)
  WHERE id = OLD.collection_id;

  -- Décrémenter pour le document
  UPDATE rag_documents
  SET chunk_count = GREATEST(0, chunk_count - 1)
  WHERE id = OLD.document_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_chunk_counts
  AFTER DELETE ON rag_chunks
  FOR EACH ROW
  EXECUTE FUNCTION decrement_chunk_counts();
