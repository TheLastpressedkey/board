import { supabase } from '../lib/supabase';

/**
 * Service pour gérer les données des applications du store
 */
export const appStoreDataService = {
  /**
   * Sauvegarde les données d'une application
   */
  async saveAppData(cardId: string, appType: string, data: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('app_store_data')
      .upsert({
        user_id: user.id,
        card_id: cardId,
        app_type: appType,
        data: data
      }, {
        onConflict: 'user_id,card_id'
      });

    if (error) {
      console.error('Error saving app data:', error);
      throw error;
    }
  },

  /**
   * Récupère les données d'une application
   */
  async getAppData(cardId: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('app_store_data')
      .select('data')
      .eq('user_id', user.id)
      .eq('card_id', cardId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found - this is normal for new cards
        return null;
      }
      console.error('Error fetching app data:', error);
      throw error;
    }

    return data?.data || null;
  },

  /**
   * Supprime les données d'une application
   */
  async deleteAppData(cardId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('app_store_data')
      .delete()
      .eq('user_id', user.id)
      .eq('card_id', cardId);

    if (error) {
      console.error('Error deleting app data:', error);
      throw error;
    }
  },

  /**
   * Récupère toutes les données d'un type d'application pour un utilisateur
   */
  async getAllAppDataByType(appType: string): Promise<Array<{ cardId: string; data: any }>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('app_store_data')
      .select('card_id, data')
      .eq('user_id', user.id)
      .eq('app_type', appType);

    if (error) {
      console.error('Error fetching app data by type:', error);
      throw error;
    }

    return data?.map(item => ({
      cardId: item.card_id,
      data: item.data
    })) || [];
  }
};