import { supabase } from '../lib/supabase';

export interface Password {
  id: string;
  userId: string;
  serviceName: string;
  username: string;
  encryptedPassword: string;
  url?: string;
  notes?: string;
  category: 'social' | 'email' | 'banking' | 'work' | 'shopping' | 'other';
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

export interface CreatePasswordData {
  serviceName: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category?: Password['category'];
  isFavorite?: boolean;
}

export interface UpdatePasswordData {
  serviceName?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  category?: Password['category'];
  isFavorite?: boolean;
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

const ENCRYPTION_KEY = 'simple-key-for-demo';

function simpleEncrypt(text: string): string {
  return btoa(text + '::' + ENCRYPTION_KEY);
}

function simpleDecrypt(encrypted: string): string {
  const decoded = atob(encrypted);
  const [text] = decoded.split('::');
  return text;
}

export const passwordService = {
  async getAllPasswords(): Promise<Password[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('passwords')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(pwd => ({
      id: pwd.id,
      userId: pwd.user_id,
      serviceName: pwd.service_name,
      username: pwd.username,
      encryptedPassword: pwd.encrypted_password,
      url: pwd.url,
      notes: pwd.notes,
      category: pwd.category,
      isFavorite: pwd.is_favorite,
      createdAt: new Date(pwd.created_at),
      updatedAt: new Date(pwd.updated_at),
      lastUsedAt: pwd.last_used_at ? new Date(pwd.last_used_at) : undefined
    }));
  },

  async getPassword(id: string): Promise<Password | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('passwords')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      serviceName: data.service_name,
      username: data.username,
      encryptedPassword: data.encrypted_password,
      url: data.url,
      notes: data.notes,
      category: data.category,
      isFavorite: data.is_favorite,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastUsedAt: data.last_used_at ? new Date(data.last_used_at) : undefined
    };
  },

  async createPassword(passwordData: CreatePasswordData): Promise<Password> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const encryptedPassword = simpleEncrypt(passwordData.password);

    const { data, error } = await supabase
      .from('passwords')
      .insert({
        user_id: user.id,
        service_name: passwordData.serviceName,
        username: passwordData.username,
        encrypted_password: encryptedPassword,
        url: passwordData.url,
        notes: passwordData.notes,
        category: passwordData.category || 'other',
        is_favorite: passwordData.isFavorite || false
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      serviceName: data.service_name,
      username: data.username,
      encryptedPassword: data.encrypted_password,
      url: data.url,
      notes: data.notes,
      category: data.category,
      isFavorite: data.is_favorite,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastUsedAt: data.last_used_at ? new Date(data.last_used_at) : undefined
    };
  },

  async updatePassword(id: string, updates: UpdatePasswordData): Promise<Password> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.serviceName !== undefined) updateData.service_name = updates.serviceName;
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.password !== undefined) updateData.encrypted_password = simpleEncrypt(updates.password);
    if (updates.url !== undefined) updateData.url = updates.url;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;

    const { data, error } = await supabase
      .from('passwords')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      serviceName: data.service_name,
      username: data.username,
      encryptedPassword: data.encrypted_password,
      url: data.url,
      notes: data.notes,
      category: data.category,
      isFavorite: data.is_favorite,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastUsedAt: data.last_used_at ? new Date(data.last_used_at) : undefined
    };
  },

  async deletePassword(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('passwords')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async updateLastUsed(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('passwords')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);
  },

  decryptPassword(encryptedPassword: string): string {
    return simpleDecrypt(encryptedPassword);
  },

  generatePassword(options: PasswordGeneratorOptions): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = '';
    let password = '';

    if (options.includeUppercase) charset += uppercase;
    if (options.includeLowercase) charset += lowercase;
    if (options.includeNumbers) charset += numbers;
    if (options.includeSymbols) charset += symbols;

    if (charset.length === 0) {
      charset = lowercase;
    }

    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);

    for (let i = 0; i < options.length; i++) {
      password += charset[array[i] % charset.length];
    }

    return password;
  },

  calculatePasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
  } {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

    const index = Math.min(Math.floor(score / 1.5), 4);

    return {
      score: (score / 7) * 100,
      label: labels[index],
      color: colors[index]
    };
  }
};
