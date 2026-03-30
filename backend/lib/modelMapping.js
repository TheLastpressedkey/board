/**
 * Model Mapping Service
 * Maps model IDs from provider APIs to LangChain model names
 */

// Mapping des modèles Anthropic (API ID -> LangChain ID)
// LangChain utilise directement les noms de l'API Anthropic
const ANTHROPIC_MODEL_MAPPING = {
  // Claude 4.6 - Utiliser directement les noms de l'API
  'claude-sonnet-4-6': 'claude-sonnet-4-6',
  'claude-opus-4-6': 'claude-opus-4-6',

  // Claude 4.5
  'claude-opus-4-5-20251101': 'claude-opus-4-5-20251101',
  'claude-haiku-4-5-20251001': 'claude-haiku-4-5-20251001',
  'claude-sonnet-4-5-20250929': 'claude-sonnet-4-5-20250929',

  // Claude 4.1 & 4
  'claude-opus-4-1-20250805': 'claude-opus-4-1-20250805',
  'claude-opus-4-20250514': 'claude-opus-4-20250514',
  'claude-sonnet-4-20250514': 'claude-sonnet-4-20250514',

  // Claude 3.x (direct mapping)
  'claude-3-haiku-20240307': 'claude-3-haiku-20240307',
  'claude-3-5-sonnet-20241022': 'claude-3-5-sonnet-20241022',
  'claude-3-opus-20240229': 'claude-3-opus-20240229',
};

// Mapping des modèles OpenAI (API ID -> LangChain ID)
const OPENAI_MODEL_MAPPING = {
  // GPT-4.1 (nouveaux modèles 2025)
  'gpt-4.1': 'gpt-4-turbo',
  'gpt-4.1-2025-04-14': 'gpt-4-turbo',
  'gpt-4.1-mini': 'gpt-4o-mini',
  'gpt-4.1-mini-2025-04-14': 'gpt-4o-mini',
  'gpt-4.1-nano': 'gpt-4o-mini',
  'gpt-4.1-nano-2025-04-14': 'gpt-4o-mini',

  // GPT-4o (direct mapping)
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
  'gpt-4o-2024-05-13': 'gpt-4o',
  'gpt-4o-2024-08-06': 'gpt-4o',

  // GPT-4 Turbo
  'gpt-4-turbo': 'gpt-4-turbo',
  'gpt-4-turbo-2024-04-09': 'gpt-4-turbo',
  'gpt-4-turbo-preview': 'gpt-4-turbo-preview',
  'gpt-4-0125-preview': 'gpt-4-0125-preview',
  'gpt-4-1106-preview': 'gpt-4-1106-preview',

  // GPT-4 Legacy
  'gpt-4': 'gpt-4',
  'gpt-4-0613': 'gpt-4-0613',

  // GPT-3.5
  'gpt-3.5-turbo': 'gpt-3.5-turbo',
  'gpt-3.5-turbo-0125': 'gpt-3.5-turbo-0125',
  'gpt-3.5-turbo-1106': 'gpt-3.5-turbo-1106',
  'gpt-3.5-turbo-16k': 'gpt-3.5-turbo-16k',
  'gpt-3.5-turbo-instruct': 'gpt-3.5-turbo-instruct',
};

// Mapping des modèles Google (API ID -> LangChain ID)
const GOOGLE_MODEL_MAPPING = {
  'gemini-pro': 'gemini-pro',
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-2.0-flash': 'gemini-2.0-flash-exp',
};

// Modèles d'embeddings supportés par provider
const EMBEDDING_MODELS = {
  openai: [
    'text-embedding-3-small',
    'text-embedding-3-large',
    'text-embedding-ada-002'
  ],
  cohere: [
    'embed-english-v3.0',
    'embed-multilingual-v3.0',
    'embed-english-light-v3.0',
    'embed-multilingual-light-v3.0'
  ],
  google: [
    'text-embedding-004',
    'text-multilingual-embedding-002'
  ]
};

/**
 * Convertit un ID de modèle provenant de l'API du provider vers le nom LangChain
 * @param {string} provider - Provider name (openai, anthropic, google)
 * @param {string} modelId - Model ID from provider API
 * @returns {string} LangChain model name
 */
function toLangChainModel(provider, modelId) {
  switch (provider.toLowerCase()) {
    case 'openai':
      return OPENAI_MODEL_MAPPING[modelId] || modelId;
    case 'anthropic':
      return ANTHROPIC_MODEL_MAPPING[modelId] || modelId;
    case 'google':
      return GOOGLE_MODEL_MAPPING[modelId] || modelId;
    default:
      return modelId;
  }
}

/**
 * Convertit un nom LangChain vers l'ID de modèle du provider
 * @param {string} provider - Provider name
 * @param {string} langchainModel - LangChain model name
 * @returns {string} Provider model ID
 */
function fromLangChainModel(provider, langchainModel) {
  let mapping;

  switch (provider.toLowerCase()) {
    case 'openai':
      mapping = OPENAI_MODEL_MAPPING;
      break;
    case 'anthropic':
      mapping = ANTHROPIC_MODEL_MAPPING;
      break;
    case 'google':
      mapping = GOOGLE_MODEL_MAPPING;
      break;
    default:
      return langchainModel;
  }

  // Reverse lookup
  for (const [apiId, lcId] of Object.entries(mapping)) {
    if (lcId === langchainModel) {
      return apiId;
    }
  }

  return langchainModel;
}

/**
 * Obtient les modèles d'embeddings disponibles pour un provider
 * @param {string} provider - Provider name
 * @returns {Array} List of embedding model IDs
 */
function getEmbeddingModels(provider) {
  return EMBEDDING_MODELS[provider.toLowerCase()] || [];
}

/**
 * Vérifie si un provider supporte les embeddings
 * @param {string} provider - Provider name
 * @returns {boolean}
 */
function supportsEmbeddings(provider) {
  return !!EMBEDDING_MODELS[provider.toLowerCase()];
}

/**
 * Obtient le modèle d'embedding par défaut pour un provider
 * @param {string} provider - Provider name
 * @returns {string|null} Default embedding model
 */
function getDefaultEmbeddingModel(provider) {
  const models = getEmbeddingModels(provider);
  return models.length > 0 ? models[0] : null;
}

export {
  toLangChainModel,
  fromLangChainModel,
  getEmbeddingModels,
  supportsEmbeddings,
  getDefaultEmbeddingModel,
  ANTHROPIC_MODEL_MAPPING,
  OPENAI_MODEL_MAPPING,
  GOOGLE_MODEL_MAPPING,
  EMBEDDING_MODELS
};
