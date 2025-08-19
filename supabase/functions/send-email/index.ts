import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createTransport } from 'npm:nodemailer@6.9.9';
import { corsHeaders } from '../_shared/cors.ts';

interface EmailConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  sender_name: string;
  sender_email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, content } = await req.json();
    const client = await supabase.auth.getUser();
    if (!client.data.user) {
      throw new Error('Not authenticated');
    }

    // Get SMTP config
    const { data: config, error: configError } = await supabase
      .from('email_configs')
      .select('*')
      .eq('user_id', client.data.user.id)
      .single();

    if (configError || !config) {
      throw new Error('SMTP configuration not found');
    }

    // Create transporter
    const transporter = createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_port === 465,
      auth: {
        user: config.smtp_username,
        pass: config.smtp_password,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"${config.sender_name}" <${config.sender_email}>`,
      to,
      subject,
      text: content,
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
