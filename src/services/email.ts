import { supabase } from '../lib/supabase';

interface SMTPConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  sender_name: string;
  sender_email: string;
}

export const email = {
  async getConfig(): Promise<SMTPConfig | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('email_configs')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async saveConfig(config: SMTPConfig): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: existingConfig } = await supabase
      .from('email_configs')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingConfig) {
      const { error } = await supabase
        .from('email_configs')
        .update(config)
        .eq('id', existingConfig.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('email_configs')
        .insert({
          user_id: user.id,
          ...config
        });

      if (error) throw error;
    }
  }
};
