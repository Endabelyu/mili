import { createAuthClient } from 'better-auth/react';

const _apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005';
const normalizedApiUrl = _apiUrl.includes('://localhost') 
  ? _apiUrl 
  : _apiUrl.replace(/^(?:https?:\/*)?/, 'https://').replace(/\/+$/, '');
const baseURL = `${normalizedApiUrl}/api/auth`;

export const authClient = createAuthClient({ baseURL });

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
