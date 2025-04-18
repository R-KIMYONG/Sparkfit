import supabase from '@/supabase/supabaseClient';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useAuthStore = create(
  immer((set) => ({
    isAuthenticated: false,
    isAuthChecked: false,

    checkAuthToken: async () => {
      const { data, error } = await supabase.auth.getSession();
      const isLoggedIn = !!data.session;
      set({
        isAuthenticated: isLoggedIn,
        isAuthChecked: true
      });
    }
  }))
);
