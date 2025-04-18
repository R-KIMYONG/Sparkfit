import { create } from 'zustand';

export const useSearchStore = create((set) => ({
  searchKeyword: '',
  searchResults: [],

  openModal: () => {
    document.body.style.overflow = 'hidden';
    set(() => ({
      searchKeyword: ''
    }));
  },
  closeModal: () => {
    document.body.style.overflow = 'visible';
    set(() => ({
      searchResults: []
    }));
  },

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setSearchResults: (results) => set({ searchResults: results })
}));
