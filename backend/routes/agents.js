import express from 'express';
import { AgentService } from '../services/agentService.js';
import { RAGService } from '../services/ragService.js';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

/**
 * Middleware pour vérifier l'authentification
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Récupérer la config LLM de l'utilisateur pour un provider spécifique
 */
const getLLMConfigForProvider = async (userId, provider) => {
  const { data, error } = await supabase
    .from('api_configs')
    .select('config')
    .eq('user_id', userId)
    .eq('service', provider)
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Provider ${provider} not configured`);

  return {
    provider,
    ...data.config,
  };
};

/**
 * Récupérer un provider compatible avec les embeddings
 */
const getEmbeddingProviderConfig = async (userId) => {
  const { data, error } = await supabase
    .from('api_configs')
    .select('service, config')
    .eq('user_id', userId)
    .in('service', ['openai', 'cohere', 'google']);

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No embedding provider configured. Please configure OpenAI, Cohere, or Google Gemini.');
  }

  const priority = ['openai', 'cohere', 'google'];
  const sortedProviders = data.sort((a, b) =>
    priority.indexOf(a.service) - priority.indexOf(b.service)
  );

  const selected = sortedProviders[0];
  return {
    provider: selected.service,
    ...selected.config,
  };
};

// ==================== AGENTS ====================

/**
 * POST /api/agents
 * Créer un nouvel agent
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, model, system_prompt, collection_ids, config } = req.body;

    if (!name || !model) {
      return res.status(400).json({ error: 'Name and model are required' });
    }

    const agent = await AgentService.createAgent(
      req.user.id,
      name,
      description,
      model,
      system_prompt,
      collection_ids || [],
      config
    );

    res.json({ success: true, agent });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agents
 * Récupérer tous les agents de l'utilisateur
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const agents = await AgentService.getUserAgents(req.user.id);
    res.json({ success: true, agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agents/:id
 * Récupérer un agent spécifique
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const agent = await AgentService.getAgent(req.params.id);

    // Vérifier que l'agent appartient à l'utilisateur
    if (agent.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, agent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/agents/:id
 * Mettre à jour un agent
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, model, system_prompt, config, collection_ids } = req.body;

    // Récupérer l'agent pour vérifier l'ownership
    const agent = await AgentService.getAgent(req.params.id);
    if (agent.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Préparer les updates
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (model !== undefined) updates.model = model;
    if (system_prompt !== undefined) updates.system_prompt = system_prompt;
    if (config !== undefined) updates.config = config;

    // Mettre à jour l'agent
    const updatedAgent = await AgentService.updateAgent(req.params.id, updates);

    // Mettre à jour les collections si fourni
    if (collection_ids !== undefined) {
      await AgentService.updateAgentCollections(req.params.id, collection_ids);
    }

    res.json({ success: true, agent: updatedAgent });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/agents/:id
 * Supprimer un agent
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await AgentService.deleteAgent(req.params.id, req.user.id);
    res.json({ success: true, message: 'Agent deleted' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agents/:id/chat
 * Chat avec un agent
 */
router.post('/:id/chat', authenticate, async (req, res) => {
  try {
    const { message, conversation_history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Récupérer l'agent avec ses collections
    const agent = await AgentService.getAgent(req.params.id);

    if (agent.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!agent.collections || agent.collections.length === 0) {
      return res.status(400).json({ error: 'Agent has no collections attached' });
    }

    // Extraire le provider du modèle
    let provider = 'openai'; // Default
    if (agent.model.includes('claude')) {
      provider = 'anthropic';
    } else if (agent.model.includes('gemini')) {
      provider = 'google';
    }

    // Récupérer la config pour le chat (provider du modèle)
    const chatConfig = await getLLMConfigForProvider(req.user.id, provider);

    // Ajouter le modèle de l'agent
    chatConfig.models = {
      chat: agent.model
    };

    // Récupérer la config pour les embeddings
    const embeddingConfig = await getEmbeddingProviderConfig(req.user.id);

    // Rechercher dans toutes les collections de l'agent
    const topK = agent.config.top_k || 5;
    const threshold = agent.config.threshold || 0.7;

    console.log(`[Agent Chat] Searching in ${agent.collections.length} collections with top_k=${topK}, threshold=${threshold}`);
    console.log(`[Agent Chat] Embedding provider: ${embeddingConfig.provider}`);

    let allChunks = [];
    for (const collection of agent.collections) {
      try {
        console.log(`[Agent Chat] Searching collection: ${collection.name} (${collection.id})`);
        const chunks = await RAGService.semanticSearch(
          collection.id,
          message,
          embeddingConfig,
          topK,
          threshold
        );
        console.log(`[Agent Chat] Found ${chunks.length} chunks in collection ${collection.name}`);
        allChunks = allChunks.concat(chunks);
      } catch (error) {
        console.error(`Error searching collection ${collection.id}:`, error);
      }
    }

    console.log(`[Agent Chat] Total chunks found: ${allChunks.length}`);

    // Trier par similarité et prendre les top K
    allChunks.sort((a, b) => b.similarity - a.similarity);
    const relevantChunks = allChunks.slice(0, topK);

    if (relevantChunks.length === 0) {
      return res.json({
        success: true,
        response: "Je n'ai pas trouvé d'information pertinente dans mes connaissances pour répondre à cette question.",
        sources: [],
        model_used: agent.model,
        chunks_used: 0,
      });
    }

    // Construire le contexte
    const context = relevantChunks
      .map((chunk, idx) => `[Document ${idx + 1}: ${chunk.document_title}]\n${chunk.chunk_text}`)
      .join('\n\n---\n\n');

    // Construire le prompt système
    const baseSystemPrompt = `Tu es ${agent.name}${agent.description ? ' - ' + agent.description : ''}.

Tu réponds aux questions en utilisant UNIQUEMENT le contexte fourni ci-dessous.

CONTEXTE DISPONIBLE:
${context}

INSTRUCTIONS IMPORTANTES:
- Réponds UNIQUEMENT en te basant sur les informations du contexte fourni
- Si l'information n'est pas dans le contexte, dis clairement "Je n'ai pas cette information dans mes connaissances"
- Cite les documents sources quand tu utilises une information spécifique
- Sois précis et concis dans tes réponses
- Si tu n'es pas sûr, indique-le clairement`;

    const systemPrompt = agent.system_prompt
      ? `${baseSystemPrompt}\n\nINSTRUCTIONS ADDITIONNELLES:\n${agent.system_prompt}`
      : baseSystemPrompt;

    // Créer le chat model avec la config de l'agent
    const { LLMProvider } = await import('../services/llmProvider.js');
    const chatModel = LLMProvider.getChatModel(provider, chatConfig);

    // Configurer la température depuis l'agent
    if (agent.config.temperature !== undefined) {
      chatModel.temperature = agent.config.temperature;
    }
    if (agent.config.max_tokens !== undefined) {
      chatModel.maxTokens = agent.config.max_tokens;
    }

    // Construire les messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversation_history || []),
      { role: 'user', content: message },
    ];

    // Appeler le LLM
    const response = await chatModel.invoke(messages);

    // Formatter les sources
    const sources = relevantChunks.map(chunk => ({
      document_id: chunk.document_id,
      document_title: chunk.document_title,
      chunk_id: chunk.chunk_id,
      similarity: chunk.similarity,
      text: chunk.chunk_text.substring(0, 200) + '...',
      source_type: chunk.document_source_type,
      source_ref: chunk.document_source_ref,
    }));

    res.json({
      success: true,
      response: response.content,
      sources,
      model_used: agent.model,
      chunks_used: relevantChunks.length,
    });
  } catch (error) {
    console.error('Error in agent chat:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
