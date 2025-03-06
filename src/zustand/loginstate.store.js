import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useAuthStore = create(
  immer((set) => ({
    isAuthenticated: false,

    checkAuthToken: () => {
      set({ isAuthenticated: !!localStorage.getItem('sb-muzurefacnghaayepwdd-auth-token') });
    }
  }))
);
