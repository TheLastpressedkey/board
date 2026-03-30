import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import fs from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
import { supabase } from '../lib/supabase.js';
import { LLMProvider } from './llmProvider.js';
import { encoding_for_model } from 'tiktoken';

/**
 * Service de gestion RAG (Retrieval Augmented Generation)
 */
export class RAGService {

  /**
   * Crée une nouvelle collection RAG
   * @param {string} userId - ID de l'utilisateur
   * @param {string} name - Nom de la collection
   * @param {string} description - Description
   * @param {object} config - Configuration (chunk_size, llm_provider, etc.)
   * @returns {object} Collection créée
   */
  static async createCollection(userId, name, description = '', config = {}) {
    const defaultConfig = {
      chunk_size: 1000,
      chunk_overlap: 200,
      top_k: 5,
      embedding_model: 'text-embedding-3-small',
      llm_provider: 'openai',
      llm_model: 'gpt-4o',
      temperature: 0.7,
    };

    const { data, error } = await supabase
      .from('rag_collections')
      .insert({
        user_id: userId,
        name,
        description,
        config: { ...defaultConfig, ...config },
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Récupère toutes les collections d'un utilisateur
   * @param {string} userId
   * @returns {array} Collections
   */
  static async getUserCollections(userId) {
    const { data, error } = await supabase
      .from('rag_collections')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Récupère une collection par ID
   * @param {string} collectionId
   * @returns {object} Collection
   */
  static async getCollection(collectionId) {
    const { data, error } = await supabase
      .from('rag_collections')
      .select('*')
      .eq('id', collectionId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Supprime une collection et toutes ses données
   * @param {string} collectionId
   * @param {string} userId
   */
  static async deleteCollection(collectionId, userId) {
    const { error } = await supabase.rpc('delete_collection_cascade', {
      p_collection_id: collectionId,
      p_user_id: userId,
    });

    if (error) throw error;
  }

  /**
   * Charge un document depuis un fichier
   * @param {string} filePath - Chemin du fichier
   * @param {string} fileType - Type de fichier (pdf, docx, txt, csv)
   * @returns {string} Contenu du document
   */
  static async loadDocument(filePath, fileType) {
    const buffer = await fs.readFile(filePath);

    switch (fileType.toLowerCase()) {
      case 'pdf': {
        const data = await pdfParse(buffer);
        return data.text;
      }
      case 'docx': {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }
      case 'txt':
      case 'md':
      case 'csv': {
        return buffer.toString('utf-8');
      }
      default:
        throw new Error(`File type ${fileType} not supported`);
    }
  }

  /**
   * Ajoute un document texte à une collection
   * @param {string} collectionId
   * @param {string} sourceType - 'file', 'url', 'text', 'card'
   * @param {string} title
   * @param {string} content
   * @param {object} metadata
   * @param {string} llmProviderConfig - Config du provider pour embeddings
   * @returns {object} Document créé avec ses chunks
   */
  static async addDocument(collectionId, sourceType, title, content, metadata = {}, llmProviderConfig) {
    let document = null;
    try {
      // 1. Récupérer la config de la collection
      const collection = await this.getCollection(collectionId);
      const config = collection.config;

      // 2. Créer le document
      const { data: doc, error: docError } = await supabase
        .from('rag_documents')
        .insert({
          collection_id: collectionId,
          source_type: sourceType,
          title,
          content,
          metadata,
          status: 'processing',
        })
        .select()
        .single();

      if (docError) throw docError;
      document = doc;

      // 3. Chunking du texte
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: config.chunk_size || 1000,
        chunkOverlap: config.chunk_overlap || 200,
        separators: ['\n\n', '\n', '. ', ' ', ''],
      });

      const chunks = await splitter.splitText(content);

      // 4. Générer les embeddings
      const provider = config.llm_provider || 'openai';

      if (!LLMProvider.supportsEmbeddings(provider)) {
        throw new Error(`Provider ${provider} does not support embeddings. Use openai, cohere, or google.`);
      }

      const embeddings = LLMProvider.getEmbeddings(provider, llmProviderConfig);

      // 5. Compter les tokens
      let totalTokens = 0;
      try {
        const enc = encoding_for_model('gpt-4o');
        totalTokens = enc.encode(content).length;
        enc.free();
      } catch (e) {
        // Fallback si tiktoken fail
        totalTokens = Math.ceil(content.length / 4);
      }

      // 6. Insérer les chunks avec embeddings
      const chunkInserts = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];

        // Générer embedding pour ce chunk
        const embedding = await embeddings.embedQuery(chunkText);

        // Compter tokens du chunk
        let chunkTokens = 0;
        try {
          const enc = encoding_for_model('gpt-4o');
          chunkTokens = enc.encode(chunkText).length;
          enc.free();
        } catch (e) {
          chunkTokens = Math.ceil(chunkText.length / 4);
        }

        chunkInserts.push({
          document_id: document.id,
          collection_id: collectionId,
          chunk_text: chunkText,
          chunk_index: i,
          embedding,
          token_count: chunkTokens,
          metadata: {
            start_char: i * config.chunk_size,
            end_char: Math.min((i + 1) * config.chunk_size, content.length),
          },
        });
      }

      // Insérer tous les chunks
      const { error: chunksError } = await supabase
        .from('rag_chunks')
        .insert(chunkInserts);

      if (chunksError) throw chunksError;

      // 7. Mettre à jour le statut du document
      const { error: updateError } = await supabase
        .from('rag_documents')
        .update({
          status: 'completed',
          chunk_count: chunks.length,
          token_count: totalTokens,
          processed_at: new Date().toISOString(),
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      return {
        document,
        chunks_count: chunks.length,
        tokens: totalTokens,
      };

    } catch (error) {
      // En cas d'erreur, marquer le document comme failed
      if (document?.id) {
        await supabase
          .from('rag_documents')
          .update({
            status: 'failed',
            error_message: error.message,
          })
          .eq('id', document.id);
      }
      throw error;
    }
  }

  /**
   * Recherche sémantique dans une collection
   * @param {string} collectionId
   * @param {string} query
   * @param {object} llmProviderConfig
   * @param {number} topK - Nombre de résultats
   * @param {number} threshold - Seuil de similarité (0-1)
   * @returns {array} Chunks pertinents avec leurs scores
   */
  static async semanticSearch(collectionId, query, llmProviderConfig, topK = 5, threshold = 0.7) {
    try {
      // 1. Récupérer la config de la collection
      const collection = await this.getCollection(collectionId);
      const provider = collection.config.llm_provider || 'openai';

      console.log(`[SemanticSearch] Provider: ${provider}, Query: "${query.substring(0, 50)}..."`);

      if (!LLMProvider.supportsEmbeddings(provider)) {
        throw new Error(`Provider ${provider} does not support embeddings`);
      }

      // 2. Générer embedding de la query
      console.log(`[SemanticSearch] Generating query embedding with provider: ${llmProviderConfig.provider}`);
      const embeddings = LLMProvider.getEmbeddings(provider, llmProviderConfig);
      const queryEmbedding = await embeddings.embedQuery(query);
      console.log(`[SemanticSearch] Query embedding generated, dimension: ${queryEmbedding.length}`);

      // 3. Recherche vectorielle dans Supabase
      const { data, error } = await supabase.rpc('match_rag_chunks', {
        p_collection_id: collectionId,
        p_query_embedding: queryEmbedding,
        p_match_threshold: threshold,
        p_match_count: topK,
      });

      if (error) {
        console.error('[SemanticSearch] RPC Error:', error);
        throw error;
      }
      console.log(`[SemanticSearch] RPC returned ${data ? data.length : 0} results`);
      return data;
    } catch (error) {
      console.error('[SemanticSearch] Error:', error);
      throw error;
    }
  }

  /**
   * Chat avec RAG - Répond à une question en utilisant le contexte de la collection
   * @param {string} collectionId
   * @param {string} userMessage
   * @param {array} conversationHistory - Messages précédents
   * @param {object} llmProviderConfig
   * @returns {object} { response, sources }
   */
  static async chatWithRAG(collectionId, userMessage, conversationHistory = [], llmProviderConfig) {
    // 1. Récupérer la config de la collection
    const collection = await this.getCollection(collectionId);
    const config = collection.config;
    const provider = config.llm_provider || 'openai';

    // 2. Rechercher le contexte pertinent
    const topK = config.top_k || 5;
    const relevantChunks = await this.semanticSearch(
      collectionId,
      userMessage,
      llmProviderConfig,
      topK,
      0.7
    );

    if (!relevantChunks || relevantChunks.length === 0) {
      return {
        response: "Je n'ai pas trouvé d'information pertinente dans les documents pour répondre à cette question.",
        sources: [],
      };
    }

    // 3. Construire le contexte
    const context = relevantChunks
      .map((chunk, idx) => `[Document ${idx + 1}: ${chunk.document_title}]\n${chunk.chunk_text}`)
      .join('\n\n---\n\n');

    // 4. Construire le prompt système avec contexte
    const systemPrompt = `Tu es un assistant intelligent qui répond aux questions en utilisant UNIQUEMENT le contexte fourni ci-dessous.

CONTEXTE DISPONIBLE:
${context}

INSTRUCTIONS IMPORTANTES:
- Réponds UNIQUEMENT en te basant sur les informations du contexte fourni
- Si l'information n'est pas dans le contexte, dis clairement "Je n'ai pas cette information dans les documents fournis"
- Cite les documents sources quand tu utilises une information spécifique
- Sois précis et concis dans tes réponses
- Si tu n'es pas sûr, indique-le clairement`;

    // 5. Créer le chat model
    const chatModel = LLMProvider.getChatModel(provider, llmProviderConfig);

    // 6. Construire les messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    // 7. Appeler le LLM
    const response = await chatModel.invoke(messages);

    // 8. Formatter les sources
    const sources = relevantChunks.map(chunk => ({
      document_id: chunk.document_id,
      document_title: chunk.document_title,
      chunk_id: chunk.chunk_id,
      similarity: chunk.similarity,
      text: chunk.chunk_text.substring(0, 200) + '...',
      source_type: chunk.document_source_type,
      source_ref: chunk.document_source_ref,
    }));

    return {
      response: response.content,
      sources,
      model_used: config.llm_model || 'default',
      chunks_used: relevantChunks.length,
    };
  }

  /**
   * Récupère les documents d'une collection
   * @param {string} collectionId
   * @returns {array} Documents
   */
  static async getCollectionDocuments(collectionId) {
    const { data, error } = await supabase
      .from('rag_documents')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Supprime un document
   * @param {string} documentId
   */
  static async deleteDocument(documentId) {
    // Les chunks seront supprimés automatiquement via CASCADE
    const { error } = await supabase
      .from('rag_documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  }

  /**
   * Met à jour les statistiques d'utilisation
   * @param {string} userId
   * @param {object} stats - { queries_count, tokens_used, embeddings_created, documents_processed }
   */
  static async updateUsageStats(userId, stats) {
    const { error } = await supabase.rpc('update_usage_stats', {
      p_user_id: userId,
      p_queries_count: stats.queries_count || 0,
      p_tokens_used: stats.tokens_used || 0,
      p_embeddings_created: stats.embeddings_created || 0,
      p_documents_processed: stats.documents_processed || 0,
    });

    if (error) throw error;
  }
}
