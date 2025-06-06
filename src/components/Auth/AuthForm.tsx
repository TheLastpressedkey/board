import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LogIn, UserPlus, Loader2, Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { themeColors } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation pour l'inscription
    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-dots" />
      </div>
      
      {/* Gradient Orbs */}
      <div 
        className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: themeColors.primary }}
      />
      <div 
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ backgroundColor: themeColors.primary }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.primary}dd)`,
              boxShadow: `0 20px 40px ${themeColors.primary}30`
            }}
          >
            <img src="/logo.svg" alt="WeBoard" className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            WeBoard
          </h1>
          <p className="text-gray-400 text-lg">
            Votre espace de travail visuel
          </p>
        </div>

        {/* Form Container */}
        <div 
          className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
          style={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }}
        >
          {/* Form Header */}
          <div className="p-8 pb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isSignUp ? 'Créer un compte' : 'Connexion'}
              </h2>
              <p className="text-gray-400">
                {isSignUp 
                  ? 'Rejoignez WeBoard et commencez à créer' 
                  : 'Connectez-vous à votre espace de travail'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail 
                      className={`w-5 h-5 transition-colors ${
                        focusedField === 'email' ? 'text-white' : 'text-gray-500'
                      }`}
                      style={{ color: focusedField === 'email' ? themeColors.primary : undefined }}
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{ 
                      '--tw-ring-color': themeColors.primary,
                      borderColor: focusedField === 'email' ? themeColors.primary : undefined
                    } as React.CSSProperties}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock 
                      className={`w-5 h-5 transition-colors ${
                        focusedField === 'password' ? 'text-white' : 'text-gray-500'
                      }`}
                      style={{ color: focusedField === 'password' ? themeColors.primary : undefined }}
                    />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{ 
                      '--tw-ring-color': themeColors.primary,
                      borderColor: focusedField === 'password' ? themeColors.primary : undefined
                    } as React.CSSProperties}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Sign Up only) */}
              {isSignUp && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock 
                        className={`w-5 h-5 transition-colors ${
                          focusedField === 'confirmPassword' ? 'text-white' : 'text-gray-500'
                        }`}
                        style={{ color: focusedField === 'confirmPassword' ? themeColors.primary : undefined }}
                      />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-12 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{ 
                        '--tw-ring-color': themeColors.primary,
                        borderColor: focusedField === 'confirmPassword' ? themeColors.primary : undefined
                      } as React.CSSProperties}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.primary}dd)`,
                  boxShadow: `0 10px 20px ${themeColors.primary}30`
                }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSignUp ? (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Créer mon compte
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Se connecter
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Form Footer */}
          <div 
            className="px-8 py-6 border-t border-gray-700/50"
            style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)' }}
          >
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">
                {isSignUp
                  ? 'Vous avez déjà un compte ?'
                  : 'Vous n\'avez pas encore de compte ?'}
              </p>
              <button
                onClick={toggleMode}
                className="text-sm font-medium transition-colors hover:underline"
                style={{ color: themeColors.primary }}
              >
                {isSignUp
                  ? 'Se connecter'
                  : 'Créer un compte gratuit'}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}
