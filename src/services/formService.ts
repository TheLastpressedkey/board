import { supabase } from '../lib/supabase';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
}

export interface Form {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings: {
    allow_multiple: boolean;
    show_results: boolean;
    require_login: boolean;
  };
  share_link: string;
  created_at: string;
  updated_at: string;
}

export interface FormResponse {
  id: string;
  form_id: string;
  data: Record<string, any>;
  submitted_at: string;
  ip_address?: string;
}

class FormService {
  // Generate unique share link
  private generateShareLink(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Create a new form
  async createForm(title: string, description?: string, fields?: FormField[]): Promise<Form | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const shareLink = this.generateShareLink();

    const { data, error } = await supabase
      .from('forms')
      .insert({
        user_id: user.id,
        title,
        description,
        fields: fields || [],
        share_link: shareLink,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating form:', error);
      return null;
    }

    return data;
  }

  // Get user's forms
  async getUserForms(): Promise<Form[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching forms:', error);
      return [];
    }

    return data || [];
  }

  // Get form by ID
  async getFormById(id: string): Promise<Form | null> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching form:', error);
      return null;
    }

    return data;
  }

  // Get form by share link (public access)
  async getFormByShareLink(shareLink: string): Promise<Form | null> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('share_link', shareLink)
      .single();

    if (error) {
      console.error('Error fetching form by share link:', error);
      return null;
    }

    return data;
  }

  // Update form
  async updateForm(id: string, updates: Partial<Form>): Promise<Form | null> {
    const { data, error } = await supabase
      .from('forms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating form:', error);
      return null;
    }

    return data;
  }

  // Delete form
  async deleteForm(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting form:', error);
      return false;
    }

    return true;
  }

  // Submit form response
  async submitResponse(formId: string, data: Record<string, any>): Promise<boolean> {
    const { error } = await supabase
      .from('form_responses')
      .insert({
        form_id: formId,
        data,
      });

    if (error) {
      console.error('Error submitting response:', error);
      return false;
    }

    return true;
  }

  // Get form responses
  async getFormResponses(formId: string): Promise<FormResponse[]> {
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching responses:', error);
      return [];
    }

    return data || [];
  }

  // Get response count
  async getResponseCount(formId: string): Promise<number> {
    const { count, error } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId);

    if (error) {
      console.error('Error fetching response count:', error);
      return 0;
    }

    return count || 0;
  }

  // Export responses to CSV
  exportToCSV(form: Form, responses: FormResponse[]): string {
    if (responses.length === 0) return '';

    // Header row
    const headers = form.fields.map(field => field.label);
    const headerRow = headers.join(',');

    // Data rows
    const dataRows = responses.map(response => {
      return form.fields.map(field => {
        const value = response.data[field.id];
        if (Array.isArray(value)) {
          return `"${value.join(', ')}"`;
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value || '';
      }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  }

  // Form templates
  getTemplates(): Array<{ name: string; title: string; description: string; fields: FormField[] }> {
    return [
      {
        name: 'contact',
        title: 'Contact Form',
        description: 'Simple contact form',
        fields: [
          {
            id: 'name',
            type: 'text',
            label: 'Name',
            required: true,
            placeholder: 'Your name'
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            required: true,
            placeholder: 'your@email.com'
          },
          {
            id: 'message',
            type: 'textarea',
            label: 'Message',
            required: true,
            placeholder: 'Your message...'
          }
        ]
      },
      {
        name: 'survey',
        title: 'Customer Survey',
        description: 'Customer satisfaction survey',
        fields: [
          {
            id: 'satisfaction',
            type: 'radio',
            label: 'How satisfied are you with our service?',
            required: true,
            options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied', 'Very Unsatisfied']
          },
          {
            id: 'recommend',
            type: 'radio',
            label: 'Would you recommend us to a friend?',
            required: true,
            options: ['Yes', 'No', 'Maybe']
          },
          {
            id: 'feedback',
            type: 'textarea',
            label: 'Additional feedback',
            required: false,
            placeholder: 'Tell us more...'
          }
        ]
      },
      {
        name: 'registration',
        title: 'Event Registration',
        description: 'Event registration form',
        fields: [
          {
            id: 'name',
            type: 'text',
            label: 'Full Name',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            required: true
          },
          {
            id: 'phone',
            type: 'text',
            label: 'Phone Number',
            required: false
          },
          {
            id: 'attendees',
            type: 'number',
            label: 'Number of Attendees',
            required: true
          },
          {
            id: 'dietary',
            type: 'checkbox',
            label: 'Dietary Restrictions',
            required: false,
            options: ['Vegetarian', 'Vegan', 'Gluten-Free', 'None']
          }
        ]
      }
    ];
  }
}

export const formService = new FormService();
