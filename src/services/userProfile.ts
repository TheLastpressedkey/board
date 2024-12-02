import { supabase } from '../lib/supabase';

export const userProfile = {
  async getPreferredUsername() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .select('preferred_username')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.preferred_username;
  },

  async updatePreferredUsername(username: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        preferred_username: username
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
