import { create } from 'zustand';

const useFilterStore = create((set) => ({
  filterType: 0, // 0: 전체, 1: 승인 필요, 2: 비승인, 3: 미확인
  sortType: 0, // 0: 거리순, 1: 최신순, 2: 마감임박순
  setFilterType: (value) => set({ filterType: value }),
  setSortType: (value) => set({ sortType: value })
}));
export default useFilterStore;
