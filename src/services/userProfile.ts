import { supabase } from '../lib/supabase';
import { ThemeType } from '../contexts/ThemeContext';

export const userProfile = {
  async getPreferredUsername() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .select('preferred_username, theme')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return {
      username: data?.preferred_username,
      theme: (data?.theme || 'default') as ThemeType
    };
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
  },

  async updateTheme(theme: ThemeType) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First, get the current profile to ensure we have the username
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('preferred_username')
      .eq('id', user.id)
      .single();

    // If no profile exists, we need to create one with a default username
    const username = currentProfile?.preferred_username || user.email?.split('@')[0] || 'User';

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        preferred_username: username,
        theme
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};