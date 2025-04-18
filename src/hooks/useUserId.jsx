import { useUserStore } from '@/zustand/auth.store';

const useUserId = () => {
  const userData = useUserStore((state) => state.userData);
  return userData?.id;
};

export default useUserId;
