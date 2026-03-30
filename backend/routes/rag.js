import express from 'express';
import { RAGService } from '../services/ragService.js';
import { supabase } from '../lib/supabase.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// Configuration multer pour upload de fichiers
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt', '.md', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed. Allowed: ${allowedTypes.join(', ')}`));
    }
  },
});

/**
 * Middleware pour vérifier l'authentification
 * Attend un JWT token dans le header Authorization
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);

    // Vérifier le token avec Supabase
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
 * Récupérer la config LLM active de l'utilisateur
 */
const getUserLLMConfig = async (userId) => {
  const { data, error } = await supabase.rpc('get_active_llm_provider', {
    p_user_id: userId,
  });

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error('No active LLM provider configured. Please configure an LLM provider first.');
  }

  return {
    provider: data[0].service,
    ...data[0].config,
  };
};

/**
 * Récupérer un provider compatible avec les embeddings
 */
const getEmbeddingProviderConfig = async (userId) => {
  // Récupérer tous les providers configurés
  const { data, error } = await supabase
    .from('api_configs')
    .select('service, config')
    .eq('user_id', userId)
    .in('service', ['openai', 'cohere', 'google']); // Providers supportant les embeddings

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error('No embedding provider configured. Please configure OpenAI, Cohere, or Google Gemini.');
  }

  // Préférer OpenAI, puis Cohere, puis Google
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

// ==================== COLLECTIONS ====================

/**
 * POST /api/rag/collections
 * Créer une nouvelle collection
 */
router.post('/collections', authenticate, async (req, res) => {
  try {
    const { name, description, config } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const collection = await RAGService.createCollection(
      req.user.id,
      name,
      description,
      config
    );

    res.json({ success: true, collection });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rag/collections
 * Récupérer toutes les collections de l'utilisateur
 */
router.get('/collections', authenticate, async (req, res) => {
  try {
    const collections = await RAGService.getUserCollections(req.user.id);
    res.json({ success: true, collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rag/collections/:id
 * Récupérer une collection spécifique
 */
router.get('/collections/:id', authenticate, async (req, res) => {
  try {
    const collection = await RAGService.getCollection(req.params.id);

    // Vérifier que la collection appartient à l'utilisateur
    if (collection.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, collection });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/rag/collections/:id
 * Supprimer une collection
 */
router.delete('/collections/:id', authenticate, async (req, res) => {
  try {
    await RAGService.deleteCollection(req.params.id, req.user.id);
    res.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DOCUMENTS ====================

/**
 * GET /api/rag/collections/:id/documents
 * Récupérer les documents d'une collection
 */
router.get('/collections/:id/documents', authenticate, async (req, res) => {
  try {
    const documents = await RAGService.getCollectionDocuments(req.params.id);
    res.json({ success: true, documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rag/collections/:id/documents/text
 * Ajouter un document texte
 */
router.post('/collections/:id/documents/text', authenticate, async (req, res) => {
  try {
    const { title, content, metadata } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Récupérer la config pour les embeddings
    const embeddingConfig = await getEmbeddingProviderConfig(req.user.id);

    const result = await RAGService.addDocument(
      req.params.id,
      'text',
      title,
      content,
      metadata || {},
      embeddingConfig
    );

    // Mettre à jour les stats
    await RAGService.updateUsageStats(req.user.id, {
      documents_processed: 1,
      embeddings_created: result.chunks_count,
      tokens_used: result.tokens,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error adding text document:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rag/collections/:id/documents/upload
 * Upload et traiter un fichier (PDF, DOCX, TXT, CSV)
 */
router.post('/collections/:id/documents/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).substring(1); // Remove dot
    const fileName = path.basename(req.file.originalname, path.extname(req.file.originalname));

    // Charger le document
    const content = await RAGService.loadDocument(filePath, fileType);

    // Récupérer la config pour les embeddings
    const embeddingConfig = await getEmbeddingProviderConfig(req.user.id);

    // Ajouter le document à la collection
    const result = await RAGService.addDocument(
      req.params.id,
      'file',
      fileName,
      content,
      {
        file_name: req.file.originalname,
        file_type: fileType,
        file_size: req.file.size,
      },
      embeddingConfig
    );

    // Supprimer le fichier temporaire
    await fs.unlink(filePath);

    // Mettre à jour les stats
    await RAGService.updateUsageStats(req.user.id, {
      documents_processed: 1,
      embeddings_created: result.chunks_count,
      tokens_used: result.tokens,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error uploading document:', error);

    // Nettoyer le fichier en cas d'erreur
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/rag/documents/:id
 * Supprimer un document
 */
router.delete('/documents/:id', authenticate, async (req, res) => {
  try {
    await RAGService.deleteDocument(req.params.id);
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SEARCH & CHAT ====================

/**
 * POST /api/rag/collections/:id/search
 * Recherche sémantique dans une collection
 */
router.post('/collections/:id/search', authenticate, async (req, res) => {
  try {
    const { query, top_k, threshold } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Récupérer la config pour les embeddings
    const embeddingConfig = await getEmbeddingProviderConfig(req.user.id);

    const results = await RAGService.semanticSearch(
      req.params.id,
      query,
      embeddingConfig,
      top_k || 5,
      threshold || 0.7
    );

    // Mettre à jour les stats
    await RAGService.updateUsageStats(req.user.id, {
      queries_count: 1,
    });

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rag/collections/:id/chat
 * Chat avec RAG
 */
router.post('/collections/:id/chat', authenticate, async (req, res) => {
  try {
    const { message, conversation_history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Récupérer la config LLM
    const llmConfig = await getUserLLMConfig(req.user.id);

    const result = await RAGService.chatWithRAG(
      req.params.id,
      message,
      conversation_history || [],
      llmConfig
    );

    // Mettre à jour les stats (approximation tokens)
    const tokensUsed = Math.ceil((message.length + result.response.length) / 4);
    await RAGService.updateUsageStats(req.user.id, {
      queries_count: 1,
      tokens_used: tokensUsed,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error in RAG chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATS ====================

/**
 * GET /api/rag/collections/:id/stats
 * Récupérer les statistiques d'une collection
 */
router.get('/collections/:id/stats', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_collection_stats', {
      p_collection_id: req.params.id,
    });

    if (error) throw error;

    res.json({ success: true, stats: data[0] || {} });
  } catch (error) {
    console.error('Error fetching collection stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
