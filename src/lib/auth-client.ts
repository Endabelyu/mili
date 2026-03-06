import { createAuthClient } from 'better-auth/react';

const _rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005';
// Ensure URL always has a protocol — prevents relative URL resolution bugs
const baseURL = _rawApiUrl.startsWith('http://') || _rawApiUrl.startsWith('https://')
  ? _rawApiUrl
  : `https://${_rawApiUrl}`;

export const authClient = createAuthClient({ baseURL });

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
