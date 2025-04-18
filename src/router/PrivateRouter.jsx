import { useUserStore } from '@/zustand/auth.store';
import { useAuthStore } from '@/zustand/loginstate.store';
import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRouter = () => {
  const { isAuthenticated, isAuthChecked, checkAuthToken } = useAuthStore();
  const checkSignin = useUserStore((state) => state.checkSignIn);
  useEffect(() => {
    const setupUserAuth = async () => {
      await checkAuthToken();
      await checkSignin();
    };
    setupUserAuth();
  }, []);

  if (!isAuthChecked) return null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};
