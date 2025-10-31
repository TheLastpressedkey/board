export type PasswordCategory = 'social' | 'email' | 'banking' | 'work' | 'shopping' | 'other';

export interface PasswordEntry {
  id: string;
  serviceName: string;
  username: string;
  encryptedPassword: string;
  url?: string;
  notes?: string;
  category: PasswordCategory;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

export interface PasswordFormData {
  serviceName: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: PasswordCategory;
  isFavorite: boolean;
}
