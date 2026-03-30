import { supabase } from '../lib/supabase.js';

/**
 * Service de gestion des Agents RAG
 */
export class AgentService {
  /**
   * Créer un nouvel agent
   */
  static async createAgent(userId, name, description, model, systemPrompt, collectionIds = [], config = {}) {
    const defaultConfig = {
      temperature: 0.7,
      max_tokens: 2000,
      top_k: 5,
      threshold: 0.7,
    };

    // 1. Créer l'agent
    const { data: agent, error: agentError } = await supabase
      .from('rag_agents')
      .insert({
        user_id: userId,
        name,
        description,
        model,
        system_prompt: systemPrompt || null,
        config: { ...defaultConfig, ...config },
      })
      .select()
      .single();

    if (agentError) throw agentError;

    // 2. Lier les collections
    if (collectionIds.length > 0) {
      const links = collectionIds.map(collectionId => ({
        agent_id: agent.id,
        collection_id: collectionId,
      }));

      const { error: linksError } = await supabase
        .from('rag_agent_collections')
        .insert(links);

      if (linksError) throw linksError;
    }

    return agent;
  }

  /**
   * Récupérer tous les agents d'un utilisateur
   */
  static async getUserAgents(userId) {
    const { data, error } = await supabase
      .from('rag_agents')
      .select(`
        *,
        collections:rag_agent_collections(
          collection:rag_collections(
            id,
            name,
            description,
            document_count,
            chunk_count
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flatten collections
    return data.map(agent => ({
      ...agent,
      collections: agent.collections.map(c => c.collection).filter(c => c !== null),
    }));
  }

  /**
   * Récupérer un agent par ID
   */
  static async getAgent(agentId) {
    const { data, error } = await supabase
      .from('rag_agents')
      .select(`
        *,
        collections:rag_agent_collections(
          collection:rag_collections(
            id,
            name,
            description,
            document_count,
            chunk_count,
            config
          )
        )
      `)
      .eq('id', agentId)
      .single();

    if (error) throw error;

    // Flatten collections
    return {
      ...data,
      collections: data.collections.map(c => c.collection).filter(c => c !== null),
    };
  }

  /**
   * Mettre à jour un agent
   */
  static async updateAgent(agentId, updates) {
    const { data, error } = await supabase
      .from('rag_agents')
      .update(updates)
      .eq('id', agentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mettre à jour les collections d'un agent
   */
  static async updateAgentCollections(agentId, collectionIds) {
    // 1. Supprimer les anciennes liaisons
    const { error: deleteError } = await supabase
      .from('rag_agent_collections')
      .delete()
      .eq('agent_id', agentId);

    if (deleteError) throw deleteError;

    // 2. Créer les nouvelles liaisons
    if (collectionIds.length > 0) {
      const links = collectionIds.map(collectionId => ({
        agent_id: agentId,
        collection_id: collectionId,
      }));

      const { error: insertError } = await supabase
        .from('rag_agent_collections')
        .insert(links);

      if (insertError) throw insertError;
    }
  }

  /**
   * Supprimer un agent
   */
  static async deleteAgent(agentId, userId) {
    const { error } = await supabase
      .from('rag_agents')
      .delete()
      .eq('id', agentId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Récupérer toutes les collections d'un agent
   */
  static async getAgentCollections(agentId) {
    const { data, error } = await supabase
      .from('rag_agent_collections')
      .select(`
        collection:rag_collections(
          id,
          name,
          description,
          config,
          document_count,
          chunk_count
        )
      `)
      .eq('agent_id', agentId);

    if (error) throw error;

    return data.map(item => item.collection).filter(c => c !== null);
  }
}
