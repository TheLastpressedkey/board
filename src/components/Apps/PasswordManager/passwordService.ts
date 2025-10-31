import { supabase } from '../../../lib/supabase';
import { PasswordEntry, PasswordCategory } from './types';
import { encryptPassword, decryptPassword } from './passwordUtils';

const MASTER_KEY_STORAGE = 'pm_master_key';

export const passwordService = {
  async getMasterKey(): Promise<string | null> {
    return sessionStorage.getItem(MASTER_KEY_STORAGE);
  },

  setMasterKey(key: string): void {
    sessionStorage.setItem(MASTER_KEY_STORAGE, key);
  },

  clearMasterKey(): void {
    sessionStorage.removeItem(MASTER_KEY_STORAGE);
  },

  async getAllPasswords(): Promise<PasswordEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('passwords')
      .select('*')
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('service_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getPasswordsByCategory(category: PasswordCategory): Promise<PasswordEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('passwords')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .order('service_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getFavoritePasswords(): Promise<PasswordEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('passwords')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_favorite', true)
      .order('service_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async searchPasswords(query: string): Promise<PasswordEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('passwords')
      .select('*')
      .eq('user_id', user.id)
      .or(`service_name.ilike.%${query}%,username.ilike.%${query}%,url.ilike.%${query}%`)
      .order('service_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createPassword(
    serviceName: string,
    username: string,
    password: string,
    masterKey: string,
    url?: string,
    notes?: string,
    category: PasswordCategory = 'other'
  ): Promise<PasswordEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const encryptedPassword = encryptPassword(password, masterKey);

    const { data, error } = await supabase
      .from('passwords')
      .insert({
        user_id: user.id,
        service_name: serviceName,
        username,
        encrypted_password: encryptedPassword,
        url,
        notes,
        category,
        is_favorite: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePassword(
    id: string,
    updates: {
      service_name?: string;
      username?: string;
      password?: string;
      url?: string;
      notes?: string;
      category?: PasswordCategory;
    },
    masterKey?: string
  ): Promise<PasswordEntry> {
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.password && masterKey) {
      updateData.encrypted_password = encryptPassword(updates.password, masterKey);
      delete updateData.password;
    } else {
      delete updateData.password;
    }

    const { data, error } = await supabase
      .from('passwords')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('passwords')
      .update({
        is_favorite: isFavorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async updateLastUsed(id: string): Promise<void> {
    const { error } = await supabase
      .from('passwords')
      .update({
        last_used_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async deletePassword(id: string): Promise<void> {
    const { error } = await supabase
      .from('passwords')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getPasswordCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('passwords')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) return 0;
    return count || 0;
  },

  decryptPassword(encryptedPassword: string, masterKey: string): string {
    return decryptPassword(encryptedPassword, masterKey);
  }
};
