import { supabase } from '../lib/supabase';

export type LLMProviderType = 'openai' | 'anthropic' | 'google';

export interface LLMProviderConfig {
  id?: string;
  provider: LLMProviderType;
  apiKey: string;
  available_models?: string[];
  isActive: boolean;
}

interface StoredLLMConfig {
  apiKey: string;
  available_models?: string[];
}

export const llmProviderService = {
  /**
   * Get all LLM provider configurations for the current user
   */
  async getAllConfigs(): Promise<LLMProviderConfig[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('api_configs')
      .select('id, service, config, is_active')
      .eq('user_id', user.id)
      .in('service', ['openai', 'anthropic', 'google'])
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      provider: item.service as LLMProviderType,
      apiKey: (item.config as StoredLLMConfig).apiKey,
      available_models: (item.config as StoredLLMConfig).available_models || [],
      isActive: item.is_active
    }));
  },

  /**
   * Get the active LLM provider configuration
   */
  async getActiveConfig(): Promise<LLMProviderConfig | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('api_configs')
      .select('id, service, config, is_active')
      .eq('user_id', user.id)
      .in('service', ['openai', 'anthropic', 'google'])
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      provider: data.service as LLMProviderType,
      apiKey: (data.config as StoredLLMConfig).apiKey,
      available_models: (data.config as StoredLLMConfig).available_models || [],
      isActive: data.is_active
    };
  },

  /**
   * Add a new LLM provider configuration
   */
  async addConfig(config: Omit<LLMProviderConfig, 'id'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // If this provider should be active, deactivate all others
    if (config.isActive) {
      await this.deactivateAll();
    }

    const { error } = await supabase
      .from('api_configs')
      .insert({
        user_id: user.id,
        service: config.provider,
        config: {
          apiKey: config.apiKey,
          available_models: config.available_models || []
        },
        is_active: config.isActive
      });

    if (error) throw error;
  },

  /**
   * Update an existing LLM provider configuration
   */
  async updateConfig(id: string, config: Partial<Omit<LLMProviderConfig, 'id' | 'provider'>>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // If setting this provider as active, deactivate all others first
    if (config.isActive) {
      await this.deactivateAll();
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (config.apiKey !== undefined || config.available_models !== undefined) {
      // Get current config to merge
      const { data: current } = await supabase
        .from('api_configs')
        .select('config')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      updateData.config = {
        ...(current?.config || {}),
        ...(config.apiKey !== undefined && { apiKey: config.apiKey }),
        ...(config.available_models !== undefined && { available_models: config.available_models })
      };
    }

    if (config.isActive !== undefined) {
      updateData.is_active = config.isActive;
    }

    const { error } = await supabase
      .from('api_configs')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Delete an LLM provider configuration
   */
  async deleteConfig(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('api_configs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Set a provider as active (deactivates all others)
   */
  async setActiveProvider(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Deactivate all providers first
    await this.deactivateAll();

    // Activate the selected one
    const { error } = await supabase
      .from('api_configs')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Deactivate all LLM providers
   */
  async deactivateAll(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('api_configs')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .in('service', ['openai', 'anthropic', 'google']);

    if (error) throw error;
  }
};
