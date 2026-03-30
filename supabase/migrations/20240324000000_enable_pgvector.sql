-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vector index operator classes if not exists
-- This is needed for similarity search performance
