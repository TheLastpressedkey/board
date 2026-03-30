-- ============================================
-- Fonctions pour RAG (Recherche Vectorielle)
-- ============================================

-- Fonction: match_rag_chunks
-- Description: Recherche par similarité vectorielle dans une collection
CREATE OR REPLACE FUNCTION match_rag_chunks(
  p_collection_id UUID,
  p_query_embedding vector(1536),
  p_match_threshold FLOAT DEFAULT 0.7,
  p_match_count INT DEFAULT 5
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  chunk_text TEXT,
  chunk_index INTEGER,
  similarity FLOAT,
  chunk_metadata JSONB,
  document_title TEXT,
  document_source_type TEXT,
  document_source_ref TEXT,
  document_metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.document_id,
    c.chunk_text,
    c.chunk_index,
    1 - (c.embedding <=> p_query_embedding) AS similarity,
    c.metadata AS chunk_metadata,
    d.title AS document_title,
    d.source_type AS document_source_type,
    d.source_ref AS document_source_ref,
    d.metadata AS document_metadata
  FROM rag_chunks c
  INNER JOIN rag_documents d ON c.document_id = d.id
  WHERE c.collection_id = p_collection_id
    AND 1 - (c.embedding <=> p_query_embedding) > p_match_threshold
  ORDER BY c.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- ============================================

-- Fonction: match_rag_chunks_multi_collection
-- Description: Recherche dans plusieurs collections simultanément
CREATE OR REPLACE FUNCTION match_rag_chunks_multi_collection(
  p_collection_ids UUID[],
  p_query_embedding vector(1536),
  p_match_threshold FLOAT DEFAULT 0.7,
  p_match_count INT DEFAULT 5
)
RETURNS TABLE (
  chunk_id UUID,
  collection_id UUID,
  collection_name TEXT,
  document_id UUID,
  chunk_text TEXT,
  chunk_index INTEGER,
  similarity FLOAT,
  chunk_metadata JSONB,
  document_title TEXT,
  document_source_type TEXT,
  document_source_ref TEXT,
  document_metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.collection_id,
    col.name AS collection_name,
    c.document_id,
    c.chunk_text,
    c.chunk_index,
    1 - (c.embedding <=> p_query_embedding) AS similarity,
    c.metadata AS chunk_metadata,
    d.title AS document_title,
    d.source_type AS document_source_type,
    d.source_ref AS document_source_ref,
    d.metadata AS document_metadata
  FROM rag_chunks c
  INNER JOIN rag_documents d ON c.document_id = d.id
  INNER JOIN rag_collections col ON c.collection_id = col.id
  WHERE c.collection_id = ANY(p_collection_ids)
    AND 1 - (c.embedding <=> p_query_embedding) > p_match_threshold
  ORDER BY c.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- ============================================

-- Fonction: get_collection_stats
-- Description: Obtenir les statistiques d'une collection
CREATE OR REPLACE FUNCTION get_collection_stats(p_collection_id UUID)
RETURNS TABLE (
  collection_id UUID,
  collection_name TEXT,
  document_count BIGINT,
  chunk_count BIGINT,
  total_tokens BIGINT,
  avg_chunks_per_document NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS collection_id,
    c.name AS collection_name,
    COUNT(DISTINCT d.id) AS document_count,
    COUNT(ch.id) AS chunk_count,
    COALESCE(SUM(ch.token_count), 0) AS total_tokens,
    CASE
      WHEN COUNT(DISTINCT d.id) > 0
      THEN ROUND(COUNT(ch.id)::NUMERIC / COUNT(DISTINCT d.id), 2)
      ELSE 0
    END AS avg_chunks_per_document,
    c.created_at,
    c.updated_at
  FROM rag_collections c
  LEFT JOIN rag_documents d ON c.id = d.collection_id
  LEFT JOIN rag_chunks ch ON d.id = ch.document_id
  WHERE c.id = p_collection_id
  GROUP BY c.id, c.name, c.created_at, c.updated_at;
END;
$$;

-- ============================================

-- Fonction: delete_collection_cascade
-- Description: Supprime une collection et toutes ses données associées
-- Note: Cette fonction est utile pour le cleanup complet
CREATE OR REPLACE FUNCTION delete_collection_cascade(p_collection_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- Vérifier que la collection appartient à l'utilisateur
  SELECT EXISTS(
    SELECT 1 FROM rag_collections
    WHERE id = p_collection_id AND user_id = p_user_id
  ) INTO v_exists;

  IF NOT v_exists THEN
    RAISE EXCEPTION 'Collection not found or access denied';
  END IF;

  -- Supprimer toutes les conversations liées
  DELETE FROM rag_conversations WHERE collection_id = p_collection_id;

  -- Supprimer tous les chunks (cascade supprimera aussi via FK)
  DELETE FROM rag_chunks WHERE collection_id = p_collection_id;

  -- Supprimer tous les documents (cascade supprimera aussi via FK)
  DELETE FROM rag_documents WHERE collection_id = p_collection_id;

  -- Supprimer la collection
  DELETE FROM rag_collections WHERE id = p_collection_id;

  RETURN TRUE;
END;
$$;

-- ============================================

-- Fonction: update_usage_stats
-- Description: Met à jour les statistiques d'utilisation quotidiennes
CREATE OR REPLACE FUNCTION update_usage_stats(
  p_user_id UUID,
  p_queries_count INT DEFAULT 0,
  p_tokens_used INT DEFAULT 0,
  p_embeddings_created INT DEFAULT 0,
  p_documents_processed INT DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO rag_usage_stats (
    user_id,
    date,
    queries_count,
    tokens_used,
    embeddings_created,
    documents_processed
  )
  VALUES (
    p_user_id,
    CURRENT_DATE,
    p_queries_count,
    p_tokens_used,
    p_embeddings_created,
    p_documents_processed
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    queries_count = rag_usage_stats.queries_count + EXCLUDED.queries_count,
    tokens_used = rag_usage_stats.tokens_used + EXCLUDED.tokens_used,
    embeddings_created = rag_usage_stats.embeddings_created + EXCLUDED.embeddings_created,
    documents_processed = rag_usage_stats.documents_processed + EXCLUDED.documents_processed;
END;
$$;

-- ============================================

-- Fonction: get_document_chunks
-- Description: Récupère tous les chunks d'un document dans l'ordre
CREATE OR REPLACE FUNCTION get_document_chunks(p_document_id UUID)
RETURNS TABLE (
  chunk_id UUID,
  chunk_text TEXT,
  chunk_index INTEGER,
  token_count INTEGER,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.chunk_text,
    c.chunk_index,
    c.token_count,
    c.metadata
  FROM rag_chunks c
  WHERE c.document_id = p_document_id
  ORDER BY c.chunk_index ASC;
END;
$$;

-- ============================================

-- Fonction: search_documents
-- Description: Recherche de documents par titre ou contenu (recherche textuelle)
CREATE OR REPLACE FUNCTION search_documents(
  p_collection_id UUID,
  p_search_query TEXT,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  document_id UUID,
  title TEXT,
  source_type TEXT,
  source_ref TEXT,
  content_preview TEXT,
  chunk_count INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id AS document_id,
    d.title,
    d.source_type,
    d.source_ref,
    LEFT(d.content, 200) AS content_preview,
    d.chunk_count,
    d.created_at
  FROM rag_documents d
  WHERE d.collection_id = p_collection_id
    AND (
      d.title ILIKE '%' || p_search_query || '%'
      OR d.content ILIKE '%' || p_search_query || '%'
    )
  ORDER BY d.created_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================

-- Fonction: get_user_collections_summary
-- Description: Récupère un résumé de toutes les collections d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_collections_summary(p_user_id UUID)
RETURNS TABLE (
  collection_id UUID,
  collection_name TEXT,
  description TEXT,
  document_count INTEGER,
  chunk_count INTEGER,
  total_tokens INTEGER,
  llm_provider TEXT,
  llm_model TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS collection_id,
    c.name AS collection_name,
    c.description,
    c.document_count,
    c.chunk_count,
    c.total_tokens,
    c.config->>'llm_provider' AS llm_provider,
    c.config->>'llm_model' AS llm_model,
    c.created_at,
    c.updated_at
  FROM rag_collections c
  WHERE c.user_id = p_user_id
  ORDER BY c.updated_at DESC;
END;
$$;
