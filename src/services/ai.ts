import { supabase } from '../lib/supabase';

export const ai = {
  async getSystemPrompt(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('api_configs')
      .select('config')
      .eq('user_id', user.id)
      .eq('service', 'ai')
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data?.config?.systemPrompt || null;
  },

  async saveSystemPrompt(systemPrompt: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First, check if an active config exists
    const { data: existingConfig } = await supabase
      .from('api_configs')
      .select('id')
      .eq('user_id', user.id)
      .eq('service', 'ai')
      .eq('is_active', true)
      .maybeSingle();

    if (existingConfig) {
      // Update existing config
      const { error } = await supabase
        .from('api_configs')
        .update({
          config: { systemPrompt },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id);

      if (error) throw error;
    } else {
      // Insert new config
      const { error } = await supabase
        .from('api_configs')
        .insert({
          user_id: user.id,
          service: 'ai',
          config: { systemPrompt },
          is_active: true
        });

      if (error) throw error;
    }
  }
};
