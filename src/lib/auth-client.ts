import { createAuthClient } from 'better-auth/react';

const _apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005';
const normalizedApiUrl = _apiUrl.startsWith('http') ? _apiUrl : `https://${_apiUrl}`;
const baseURL = `${normalizedApiUrl}/api/auth`;

export const authClient = createAuthClient({ baseURL });

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
