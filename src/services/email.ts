import { supabase } from '../lib/supabase';
import { API_CONFIG, buildApiUrl } from '../config/api';

interface SMTPConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  sender_name: string;
  sender_email: string;
}

interface SendEmailRequest {
  to: string;
  subject: string;
  content: string;
  forcePhpMail?: boolean;
}

interface SendEmailResponse {
  success: boolean;
  method?: string;
  message?: string;
  error?: string;
  usedFallback?: boolean;
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
  },

  async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      // Récupérer la configuration SMTP de l'utilisateur
      const smtpConfig = await this.getConfig();
      
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SEND_EMAIL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: request.to,
          subject: request.subject,
          content: request.content,
          smtpConfig: smtpConfig,
          forcePhpMail: request.forcePhpMail || false
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Erreur lors de l\'envoi de l\'email'
        };
      }

      return {
        success: true,
        method: data.data?.method || 'Unknown',
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur réseau'
      };
    }
  },

  async sendEmailWithFallback(request: Omit<SendEmailRequest, 'forcePhpMail'>): Promise<{
    success: boolean;
    method?: string;
    message?: string;
    error?: string;
    usedFallback?: boolean;
  }> {
    // Essayer d'abord avec SMTP (si configuré)
    const firstAttempt = await this.sendEmail(request);
    
    if (firstAttempt.success) {
      return firstAttempt;
    }

    // Si SMTP a échoué et qu'on n'a pas encore essayé PHP mail, proposer le fallback
    if (firstAttempt.error?.includes('SMTP')) {
      // Essayer avec PHP mail en fallback
      const fallbackAttempt = await this.sendEmail({
        ...request,
        forcePhpMail: true
      });
      
      if (fallbackAttempt.success) {
        return {
          ...fallbackAttempt,
          usedFallback: true,
          message: `${fallbackAttempt.message} (SMTP a échoué, utilisé PHP mail comme solution de secours)`
        };
      }
    }

    return firstAttempt;
  }
};