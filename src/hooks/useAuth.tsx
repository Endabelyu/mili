import React, { createContext, useContext } from 'react';
import { authClient } from '../lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  lastSeenAt: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (data: { name?: string; image?: string }) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  forgetPassword: (email: string) => Promise<void>;
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: (session.user as any).role || 'user',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastSeenAt: (session.user as any).lastSeenAt || null,
      }
    : null;

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    const { data, error } = await authClient.signIn.email({ email, password, rememberMe });
    if (error) throw new Error(error.message || 'Invalid email or password');
    await refetch();
    return data.user as unknown as User;
  };

  const register = async (data: { email: string; password: string; name: string }) => {
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

  const changePassword = async (data: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }) => {
    const { error } = await authClient.changePassword(data);
    if (error) throw new Error(error.message || 'Failed to change password');
  };

  const forgetPassword = async (email: string) => {
    const client = authClient as unknown as { 
      forgetPassword: (data: { email: string; redirectTo: string }) => Promise<{ error: { message?: string } | null }> 
    };
    const { error } = await client.forgetPassword({
      email,
      redirectTo: '/auth/reset-password',
    });
    if (error) throw new Error(error.message || 'Failed to send reset email');
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
        forgetPassword,
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
