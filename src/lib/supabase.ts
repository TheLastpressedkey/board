import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Add WeBoard API
export const weboardAPI = {
  theme: {
    colors: {
      primary: 'var(--theme-primary)',
      scrollbar: 'var(--theme-scrollbar)',
      menuBg: 'var(--theme-menu-bg)',
      menuHover: 'var(--theme-menu-hover)'
    },
    getCssVariable: (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name)
  },
  storage: {
    get: (key: string) => localStorage.getItem(key),
    set: (key: string, value: string) => localStorage.setItem(key, value),
    
    async getData(appId: string) {
      const { data, error } = await supabase
        .from('custom_app_data')
        .select('data')
        .eq('app_id', appId)
        .single();
      
      if (error) {
        console.error('Error fetching app data:', error);
        return null;
      }
      return data?.data;
    },
    
    async setData(appId: string, data: any) {
      const { error } = await supabase
        .from('custom_app_data')
        .upsert({
          app_id: appId,
          data
        }, {
          onConflict: 'user_id,app_id'
        });
      
      if (error) {
        console.error('Error saving app data:', error);
        throw error;
      }
    }
  },
  ui: {
    showNotification: (message: string) => {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        padding: 1rem;
        background: var(--theme-menu-bg);
        color: white;
        border: 1px solid var(--theme-primary);
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        z-index: 9999;
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  },
  cursor: {
    getPosition: () => {
      const boardElement = document.querySelector('.bg-dots');
      if (!boardElement) return { x: 0, y: 0 };
      
      const rect = boardElement.getBoundingClientRect();
      const x = window.scrollX + rect.left;
      const y = window.scrollY + rect.top;
      
      return { x, y };
    }
  }
};