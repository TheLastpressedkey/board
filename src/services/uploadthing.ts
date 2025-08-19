import { supabase } from '../lib/supabase';

interface UploadThingConfig {
  appId: string;
  secretKey: string;
}

export const uploadthing = {
  async getConfig(): Promise<UploadThingConfig | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('api_configs')
      .select('config')
      .eq('user_id', user.id)
      .eq('service', 'uploadthing')
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data?.config as UploadThingConfig || null;
  },

  async saveConfig(config: UploadThingConfig): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: existingConfig } = await supabase
      .from('api_configs')
      .select('id')
      .eq('user_id', user.id)
      .eq('service', 'uploadthing')
      .eq('is_active', true)
      .maybeSingle();

    if (existingConfig) {
      const { error } = await supabase
        .from('api_configs')
        .update({
          config,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('api_configs')
        .insert({
          user_id: user.id,
          service: 'uploadthing',
          config,
          is_active: true
        });

      if (error) throw error;
    }
  }
};