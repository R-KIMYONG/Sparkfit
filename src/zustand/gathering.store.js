import { create } from 'zustand';

export const useGatheringStore = create((set) => ({
  sortedPlace: [],
  setSortedPlace: (places) => set({ sortedPlace: places })
}));
