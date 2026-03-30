-- Create rag_agents table
CREATE TABLE IF NOT EXISTS rag_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  model TEXT NOT NULL, -- Le modèle LLM à utiliser (gpt-4o, claude-3-5-sonnet, etc.)
  system_prompt TEXT, -- Instructions personnalisées pour l'agent
  config JSONB NOT NULL DEFAULT jsonb_build_object(
    'temperature', 0.7,
    'max_tokens', 2000,
    'top_k', 5,
    'threshold', 0.7
  ),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create rag_agent_collections junction table (many-to-many)
CREATE TABLE IF NOT EXISTS rag_agent_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES rag_agents(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES rag_collections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, collection_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rag_agents_user_id ON rag_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_rag_agents_created_at ON rag_agents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rag_agent_collections_agent_id ON rag_agent_collections(agent_id);
CREATE INDEX IF NOT EXISTS idx_rag_agent_collections_collection_id ON rag_agent_collections(collection_id);

-- Enable Row Level Security
ALTER TABLE rag_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_agent_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rag_agents
CREATE POLICY "Users can view their own agents"
  ON rag_agents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents"
  ON rag_agents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON rag_agents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON rag_agents
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for rag_agent_collections
CREATE POLICY "Users can view their own agent collections"
  ON rag_agent_collections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rag_agents
      WHERE rag_agents.id = rag_agent_collections.agent_id
      AND rag_agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own agent collections"
  ON rag_agent_collections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rag_agents
      WHERE rag_agents.id = rag_agent_collections.agent_id
      AND rag_agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own agent collections"
  ON rag_agent_collections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM rag_agents
      WHERE rag_agents.id = rag_agent_collections.agent_id
      AND rag_agents.user_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rag_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rag_agents_updated_at
  BEFORE UPDATE ON rag_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_rag_agents_updated_at();

-- Function to get agent with its collections
CREATE OR REPLACE FUNCTION get_agent_with_collections(p_agent_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  description TEXT,
  model TEXT,
  system_prompt TEXT,
  config JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  collections JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.user_id,
    a.name,
    a.description,
    a.model,
    a.system_prompt,
    a.config,
    a.metadata,
    a.created_at,
    a.updated_at,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'description', c.description,
          'document_count', c.document_count,
          'chunk_count', c.chunk_count
        )
      ) FILTER (WHERE c.id IS NOT NULL),
      '[]'::jsonb
    ) AS collections
  FROM rag_agents a
  LEFT JOIN rag_agent_collections ac ON a.id = ac.agent_id
  LEFT JOIN rag_collections c ON ac.collection_id = c.id
  WHERE a.id = p_agent_id
  GROUP BY a.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
