import { create } from 'zustand';

const useCreatedPlaceModal = create((set) => ({
  openCreateGroupModal: false,
  setCreateGroupModal: (isopen) => set({ openCreateGroupModal: isopen })
}));
export default useCreatedPlaceModal;
