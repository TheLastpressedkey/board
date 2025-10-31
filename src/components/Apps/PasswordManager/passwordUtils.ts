import { PasswordGeneratorOptions, PasswordStrength } from './types';

export function generatePassword(options: PasswordGeneratorOptions): string {
  let charset = '';

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const similar = 'il1Lo0O';
  const ambiguous = '{}[]()/\\\'"`~,;:.<>';

  if (options.includeUppercase) {
    charset += options.excludeSimilar
      ? uppercase.split('').filter(c => !similar.includes(c)).join('')
      : uppercase;
  }

  if (options.includeLowercase) {
    charset += options.excludeSimilar
      ? lowercase.split('').filter(c => !similar.includes(c)).join('')
      : lowercase;
  }

  if (options.includeNumbers) {
    charset += options.excludeSimilar
      ? numbers.split('').filter(c => !similar.includes(c)).join('')
      : numbers;
  }

  if (options.includeSymbols) {
    let symbolSet = symbols;
    if (options.excludeAmbiguous) {
      symbolSet = symbolSet.split('').filter(c => !ambiguous.includes(c)).join('');
    }
    charset += symbolSet;
  }

  if (charset === '') {
    charset = lowercase + numbers;
  }

  let password = '';
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }

  if (options.includeUppercase && !/[A-Z]/.test(password)) {
    const pos = array[0] % password.length;
    password = password.substring(0, pos) + uppercase[array[1] % uppercase.length] + password.substring(pos + 1);
  }

  if (options.includeLowercase && !/[a-z]/.test(password)) {
    const pos = array[0] % password.length;
    password = password.substring(0, pos) + lowercase[array[1] % lowercase.length] + password.substring(pos + 1);
  }

  if (options.includeNumbers && !/[0-9]/.test(password)) {
    const pos = array[0] % password.length;
    password = password.substring(0, pos) + numbers[array[1] % numbers.length] + password.substring(pos + 1);
  }

  if (options.includeSymbols && !/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
    const pos = array[0] % password.length;
    password = password.substring(0, pos) + symbols[array[1] % symbols.length] + password.substring(pos + 1);
  }

  return password;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length < 8) {
    suggestions.push('Utilisez au moins 8 caractères');
  } else if (password.length < 12) {
    score += 1;
    suggestions.push('Utilisez au moins 12 caractères pour plus de sécurité');
  } else if (password.length < 16) {
    score += 2;
  } else {
    score += 3;
  }

  if (!/[a-z]/.test(password)) {
    suggestions.push('Ajoutez des lettres minuscules');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    suggestions.push('Ajoutez des lettres majuscules');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    suggestions.push('Ajoutez des chiffres');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
    suggestions.push('Ajoutez des symboles spéciaux');
  } else {
    score += 2;
  }

  const hasRepeatingChars = /(.)\1{2,}/.test(password);
  if (hasRepeatingChars) {
    score -= 1;
    suggestions.push('Évitez les caractères répétitifs');
  }

  const hasSequentialChars = /abc|bcd|cde|def|123|234|345|456|567|678|789/i.test(password);
  if (hasSequentialChars) {
    score -= 1;
    suggestions.push('Évitez les séquences prévisibles');
  }

  const uniqueChars = new Set(password).size;
  if (uniqueChars < password.length * 0.5) {
    score -= 1;
    suggestions.push('Utilisez plus de caractères différents');
  }

  score = Math.max(0, Math.min(10, score));

  let label: string;
  let color: string;

  if (score <= 3) {
    label = 'Très faible';
    color = '#ef4444';
  } else if (score <= 5) {
    label = 'Faible';
    color = '#f97316';
  } else if (score <= 7) {
    label = 'Moyen';
    color = '#eab308';
  } else if (score <= 9) {
    label = 'Fort';
    color = '#22c55e';
  } else {
    label = 'Très fort';
    color = '#10b981';
  }

  return { score, label, color, suggestions };
}

export function encryptPassword(password: string, masterKey: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const key = encoder.encode(masterKey.padEnd(32, '0').substring(0, 32));

  const encrypted = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ key[i % key.length];
  }

  return btoa(String.fromCharCode(...encrypted));
}

export function decryptPassword(encryptedPassword: string, masterKey: string): string {
  try {
    const encrypted = Uint8Array.from(atob(encryptedPassword), c => c.charCodeAt(0));
    const encoder = new TextEncoder();
    const key = encoder.encode(masterKey.padEnd(32, '0').substring(0, 32));

    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ key[i % key.length];
    }

    return new TextDecoder().decode(decrypted);
  } catch {
    return '';
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
