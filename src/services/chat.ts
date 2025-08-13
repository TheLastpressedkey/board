import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'system';
  createdAt: Date;
}

export const chat = {
  async getHistory(): Promise<ChatMessage[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      createdAt: new Date(msg.created_at)
    }));
  },

  async saveMessage(content: string, sender: 'user' | 'bot' | 'system'): Promise<ChatMessage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        content,
        sender
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to save message');

    return {
      id: data.id,
      content: data.content,
      sender: data.sender,
      createdAt: new Date(data.created_at)
    };
  },

  async deleteMessage(messageId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async deleteAllMessages(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  }
};