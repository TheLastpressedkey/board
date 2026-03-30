-- Fix vector index: replace IVFFlat with HNSW (more memory efficient)
-- IVFFlat failed with: memory required is 61 MB, maintenance_work_mem is 32 MB

-- 1. Drop the old IVFFlat index
DROP INDEX IF EXISTS idx_rag_chunks_embedding;

-- 2. Create HNSW index (recommended by Supabase, more memory efficient)
CREATE INDEX idx_rag_chunks_embedding ON rag_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
