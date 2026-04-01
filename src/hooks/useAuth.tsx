import React, { createContext, useContext } from 'react';
import { authClient } from '../lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (data: { name?: string; image?: string }) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending, refetch } = authClient.useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      }
    : null;

  const login = async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message || 'Invalid email or password');
    await refetch();
  };

  const register = async (data: any) => {
    const { error } = await authClient.signUp.email(data);
    if (error) throw new Error(error.message || 'Failed to register');
    await refetch();
  };

  const logout = async () => {
    await authClient.signOut();
    await refetch();
  };

  const refresh = async () => {
    await refetch();
  };

  const updateUser = async (data: { name?: string; image?: string }) => {
    const { error } = await authClient.updateUser(data);
    if (error) throw new Error(error.message || 'Failed to update user');
    await refetch();
  };

  const changePassword = async (data: any) => {
    const { error } = await authClient.changePassword(data);
    if (error) throw new Error(error.message || 'Failed to change password');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isPending,
        isAuthenticated: !!user,
        login,
        logout,
        refresh,
        updateUser,
        changePassword,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
