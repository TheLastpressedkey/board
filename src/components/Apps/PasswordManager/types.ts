export interface PasswordEntry {
  id: string;
  user_id: string;
  service_name: string;
  username: string;
  encrypted_password: string;
  url?: string;
  notes?: string;
  category: PasswordCategory;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

export type PasswordCategory =
  | 'social'
  | 'email'
  | 'banking'
  | 'shopping'
  | 'work'
  | 'entertainment'
  | 'other';

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}
