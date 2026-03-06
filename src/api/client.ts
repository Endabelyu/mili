/**
 * Typed API client for the finance tracker backend.
 * All requests include credentials (cookies) by default for session auth.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${BASE_URL}${path}`;
  if (params) {
    const search = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    );
    if (search.toString()) url += `?${search}`;
  }

  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers || {}),
    },
    ...fetchOptions,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, errorBody.message || response.statusText, errorBody);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;
  body?: unknown;
  
  constructor(
    status: number,
    message: string,
    body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export const authApi = {
  getMe: () => request<{ user: User | null }>('/api/auth/me'),
  login: (email: string, password: string) =>
    request<{ user: User }>('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name: string) =>
    request<{ user: User }>('/api/auth/sign-up/email', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  logout: () =>
    request<void>('/api/auth/sign-out', { method: 'POST' }),
  updateUser: (data: { name?: string; image?: string }) =>
    request<{ user: User }>('/api/auth/update-user', { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (data: any) =>
    request<void>('/api/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
};

import { type Transaction, type Budget, type Category } from '../types';

export const transactionsApi = {
  list: (params?: { limit?: number; page?: number; type?: string; category?: string; search?: string }) =>
    request<{ items: Transaction[], pagination: { page: number; limit: number; total: number; totalPages: number } }>('/api/transactions', { params }),
  create: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    request<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Transaction>) =>
    request<Transaction>(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/api/transactions/${id}`, { method: 'DELETE' }),
};

// ─── Budgets ──────────────────────────────────────────────────────────────────
export const budgetsApi = {
  list: (params?: { month?: string }) => 
    request<{ items: Budget[] }>('/api/budgets', { params }).then(res => res.items),
  create: (data: Omit<Budget, 'id' | 'userId' | 'createdAt'>) =>
    request<Budget>('/api/budgets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Budget>) =>
    request<Budget>(`/api/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/api/budgets/${id}`, { method: 'DELETE' }),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsApi = {
  summary: (params?: { month?: string }) =>
    request<{ income: number, expenses: number, balance: number, savingsRate: number, transactionCount: number }>('/api/reports/summary', { params }),
  byCategory: (params?: { month?: string }) =>
    request<Array<{ categoryId: string, label: string, color: string, amount: number, percentage: number }>>('/api/reports/by-category', { params }),
  monthly: (params?: { months?: number }) =>
    request<Array<{ month: string, income: number, expenses: number, balance: number }>>('/api/reports/monthly', { params }),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () => request<{ items: Category[] }>('/api/categories').then(res => res.items),
};
