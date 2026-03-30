-- ============================================
-- Configuration API pour multi-LLM support
-- ============================================

-- Cette migration ajoute le support pour plusieurs fournisseurs LLM
-- dans la table api_configs existante

-- Exemples de services supportés:
-- - 'openai' : OpenAI (GPT-4, GPT-3.5, etc.)
-- - 'anthropic' : Claude (Claude 3 Opus, Sonnet, Haiku)
-- - 'cohere' : Cohere (Command, Embed)
-- - 'huggingface' : HuggingFace (modèles open-source)
-- - 'google' : Google (Gemini, PaLM)
-- - 'mistral' : Mistral AI
-- - 'together' : Together AI
-- - 'ollama' : Ollama (modèles locaux)

-- Format de config par provider:

-- OpenAI:
-- {
--   "apiKey": "sk-...",
--   "organization": "org-...", (optionnel)
--   "models": {
--     "chat": "gpt-4o",
--     "embedding": "text-embedding-3-small"
--   }
-- }

-- Anthropic:
-- {
--   "apiKey": "sk-ant-...",
--   "models": {
--     "chat": "claude-3-5-sonnet-20241022"
--   }
-- }

-- Cohere:
-- {
--   "apiKey": "...",
--   "models": {
--     "chat": "command-r-plus",
--     "embedding": "embed-multilingual-v3.0"
--   }
-- }

-- HuggingFace:
-- {
--   "apiKey": "hf_...",
--   "models": {
--     "chat": "meta-llama/Meta-Llama-3-70B-Instruct",
--     "embedding": "sentence-transformers/all-MiniLM-L6-v2"
--   },
--   "endpoint": "https://api-inference.huggingface.co/models/"
-- }

-- Google (Gemini):
-- {
--   "apiKey": "AIza...",
--   "models": {
--     "chat": "gemini-1.5-pro",
--     "embedding": "text-embedding-004"
--   }
-- }

-- Mistral:
-- {
--   "apiKey": "...",
--   "models": {
--     "chat": "mistral-large-latest",
--     "embedding": "mistral-embed"
--   }
-- }

-- Ollama (local):
-- {
--   "baseUrl": "http://localhost:11434",
--   "models": {
--     "chat": "llama3",
--     "embedding": "nomic-embed-text"
--   }
-- }

-- Together AI:
-- {
--   "apiKey": "...",
--   "models": {
--     "chat": "mistralai/Mixtral-8x7B-Instruct-v0.1",
--     "embedding": "togethercomputer/m2-bert-80M-8k-retrieval"
--   }
-- }

-- ============================================
-- Fonction helper pour valider les configs LLM
-- ============================================

CREATE OR REPLACE FUNCTION validate_llm_config(
  p_service TEXT,
  p_config JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifications de base
  IF p_config IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Vérifications spécifiques par provider
  CASE p_service
    WHEN 'openai' THEN
      -- OpenAI nécessite une apiKey
      IF NOT (p_config ? 'apiKey' AND p_config->>'apiKey' IS NOT NULL) THEN
        RAISE EXCEPTION 'OpenAI config must include apiKey';
      END IF;

    WHEN 'anthropic' THEN
      -- Anthropic nécessite une apiKey
      IF NOT (p_config ? 'apiKey' AND p_config->>'apiKey' IS NOT NULL) THEN
        RAISE EXCEPTION 'Anthropic config must include apiKey';
      END IF;

    WHEN 'cohere' THEN
      -- Cohere nécessite une apiKey
      IF NOT (p_config ? 'apiKey' AND p_config->>'apiKey' IS NOT NULL) THEN
        RAISE EXCEPTION 'Cohere config must include apiKey';
      END IF;

    WHEN 'huggingface' THEN
      -- HuggingFace nécessite une apiKey
      IF NOT (p_config ? 'apiKey' AND p_config->>'apiKey' IS NOT NULL) THEN
        RAISE EXCEPTION 'HuggingFace config must include apiKey';
      END IF;

    WHEN 'google' THEN
      -- Google nécessite une apiKey
      IF NOT (p_config ? 'apiKey' AND p_config->>'apiKey' IS NOT NULL) THEN
        RAISE EXCEPTION 'Google config must include apiKey';
      END IF;

    WHEN 'mistral' THEN
      -- Mistral nécessite une apiKey
      IF NOT (p_config ? 'apiKey' AND p_config->>'apiKey' IS NOT NULL) THEN
        RAISE EXCEPTION 'Mistral config must include apiKey';
      END IF;

    WHEN 'ollama' THEN
      -- Ollama nécessite baseUrl
      IF NOT (p_config ? 'baseUrl' AND p_config->>'baseUrl' IS NOT NULL) THEN
        RAISE EXCEPTION 'Ollama config must include baseUrl';
      END IF;

    WHEN 'together' THEN
      -- Together AI nécessite une apiKey
      IF NOT (p_config ? 'apiKey' AND p_config->>'apiKey' IS NOT NULL) THEN
        RAISE EXCEPTION 'Together AI config must include apiKey';
      END IF;

    ELSE
      -- Provider inconnu, on accepte tout config JSONB
      NULL;
  END CASE;

  RETURN TRUE;
END;
$$;

-- ============================================
-- Fonction pour obtenir le provider actif
-- ============================================

CREATE OR REPLACE FUNCTION get_active_llm_provider(p_user_id UUID)
RETURNS TABLE (
  service TEXT,
  config JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.service,
    ac.config,
    ac.created_at
  FROM api_configs ac
  WHERE ac.user_id = p_user_id
    AND ac.is_active = true
    AND ac.service IN (
      'openai', 'anthropic', 'cohere', 'huggingface',
      'google', 'mistral', 'ollama', 'together'
    )
  ORDER BY ac.updated_at DESC
  LIMIT 1;
END;
$$;

-- ============================================
-- Fonction pour lister tous les providers configurés
-- ============================================

CREATE OR REPLACE FUNCTION get_all_llm_providers(p_user_id UUID)
RETURNS TABLE (
  service TEXT,
  is_active BOOLEAN,
  has_chat_model BOOLEAN,
  has_embedding_model BOOLEAN,
  chat_model TEXT,
  embedding_model TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.service,
    ac.is_active,
    (ac.config->'models' ? 'chat') AS has_chat_model,
    (ac.config->'models' ? 'embedding') AS has_embedding_model,
    ac.config->'models'->>'chat' AS chat_model,
    ac.config->'models'->>'embedding' AS embedding_model,
    ac.created_at,
    ac.updated_at
  FROM api_configs ac
  WHERE ac.user_id = p_user_id
    AND ac.service IN (
      'openai', 'anthropic', 'cohere', 'huggingface',
      'google', 'mistral', 'ollama', 'together'
    )
  ORDER BY ac.is_active DESC, ac.updated_at DESC;
END;
$$;

-- ============================================
-- Vue pour faciliter l'accès aux configs LLM
-- ============================================

CREATE OR REPLACE VIEW llm_providers_summary AS
SELECT
  ac.user_id,
  ac.service AS provider,
  ac.is_active,
  ac.config->'models'->>'chat' AS chat_model,
  ac.config->'models'->>'embedding' AS embedding_model,
  ac.created_at,
  ac.updated_at
FROM api_configs ac
WHERE ac.service IN (
  'openai', 'anthropic', 'cohere', 'huggingface',
  'google', 'mistral', 'ollama', 'together'
);

-- ============================================
-- Commentaires pour documentation
-- ============================================

COMMENT ON FUNCTION validate_llm_config IS
'Valide la configuration JSON pour un fournisseur LLM donné';

COMMENT ON FUNCTION get_active_llm_provider IS
'Récupère le fournisseur LLM actif pour un utilisateur';

COMMENT ON FUNCTION get_all_llm_providers IS
'Liste tous les fournisseurs LLM configurés pour un utilisateur';

COMMENT ON VIEW llm_providers_summary IS
'Vue résumant tous les fournisseurs LLM par utilisateur';
