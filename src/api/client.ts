/**
 * Typed API client for the finance tracker backend.
 * All requests include credentials (cookies) by default for session auth.
 */

const BASE_URL = import.meta.env.VITE_API_URL;

// Debug log for production configuration tracking
console.log('[API] Base URL:', BASE_URL);
if (!BASE_URL) {
  console.warn('[API] WARNING: VITE_API_URL is undefined! This will cause mangled relative URLs.');
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
  /** Request timeout in milliseconds. Defaults to 10 000 ms. */
  timeoutMs?: number;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, timeoutMs = 10_000, ...fetchOptions } = options;

  let url = `${BASE_URL}${path}`;
  if (params) {
    const search = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    );
    if (search.toString()) url += `?${search}`;
  }

  // Debug log for each request
  console.debug(`[API] Fetching: ${url}`);

  // Abort the request automatically after `timeoutMs` milliseconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const method = (fetchOptions.method || 'GET').toUpperCase();
    const needsContentType = ['POST', 'PUT', 'PATCH'].includes(method);

    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        ...(needsContentType ? { 'Content-Type': 'application/json' } : {}),
        ...(fetchOptions.headers || {}),
      },
      ...fetchOptions,
      // Merge any caller-provided signal with our timeout signal
      signal: fetchOptions.signal ?? controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: response.statusText }));
      throw new ApiError(response.status, errorBody.message || response.statusText, errorBody);
    }

    // 204 No Content
    if (response.status === 204) return undefined as T;

    return response.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(408, `Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
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


import type { Transaction, Budget, Category, Account } from '../types';
export type { Transaction, Budget, Category, Account };

export const accountsApi = {
  list: () => request<{ items: Account[] }>('/api/accounts').then(res => res.items),
  create: (data: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    request<Account>('/api/accounts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Account>) =>
    request<Account>(`/api/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/accounts/${id}`, { method: 'DELETE' }),
};

export interface CalendarDay {
  date: string;
  income: number;
  expense: number;
  items: Transaction[];
}

export const calendarApi = {
  get: (month: string) => request<{ month: string; days: CalendarDay[] }>(`/api/calendar?month=${month}`),
};
export interface Target {
  id: string;
  userId: string;
  name: string;
  targetAmount: string | number;
  currentAmount: string | number;
  deadline?: string | Date | null;
  color: string;
  icon: string;
  status: 'active' | 'completed' | 'paused';
}

export const targetsApi = {
  list: () => request<{ items: Target[] }>('/api/targets').then(res => res.items),
  create: (data: Omit<Target, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    request<Target>('/api/targets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Target>) =>
    request<Target>(`/api/targets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/targets/${id}`, { method: 'DELETE' }),
};

export interface NotificationItem {
  id: string;
  title: string;
  amount: string;
  time: string;
  icon: string;
  color: string;
  iconColor: string;
  unread: boolean;
}

export const notificationsApi = {
  list: () => request<{ items: NotificationItem[] }>('/api/notifications').then(res => res.items),
  markRead: (id: string) => request<void>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request<void>('/api/notifications/mark-all-read', { method: 'POST' }),
};

export interface ScheduledTransaction {
  id: string;
  userId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: string | number;
  categoryId: string;
  accountId?: string | null;
  toAccountId?: string | null;
  description?: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextRunDate: string | Date;
  status: 'active' | 'paused' | 'completed';
  category?: Category;
  account?: Account;
  toAccount?: Account;
}

export const scheduledApi = {
  list: () => request<{ items: ScheduledTransaction[] }>('/api/scheduled').then(res => res.items),
  create: (data: Omit<ScheduledTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    request<ScheduledTransaction>('/api/scheduled', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ScheduledTransaction>) =>
    request<ScheduledTransaction>(`/api/scheduled/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/scheduled/${id}`, { method: 'DELETE' }),
  post: (id: string) => request<{ success: boolean; item: ScheduledTransaction }>(`/api/scheduled/${id}/post`, { method: 'POST' }),
};

export const transactionsApi = {
  list: (params?: { limit?: number; page?: number; type?: string; category?: string; account?: string; search?: string; month?: string }) =>
    request<{ items: Transaction[], pagination: { page: number; limit: number; total: number; totalPages: number } }>('/api/transactions', { params }),
  get: (id: string) =>
    request<Transaction>(`/api/transactions/${id}`),
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
    request<{ items: Array<{ categoryId: string, label: string, color: string, amount: number, percentage: number }> }>('/api/reports/by-category', { params }).then(res => res.items),
  monthly: (params?: { months?: number }) =>
    request<{ items: Array<{ month: string, income: number, expenses: number, balance: number }> }>('/api/reports/monthly', { params }).then(res => res.items),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () => request<{ items: Category[] }>('/api/categories').then(res => res.items),
  create: (data: { label: string; color: string; icon: string; type: string }) => 
    request<Category>('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Consent ──────────────────────────────────────────────────────────────────
export const consentApi = {
  record: (data: { consentVersion: string }) => 
    request<void>('/api/v1/consent', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── OCR — Receipt Scanner ────────────────────────────────────────────────────
export const ocrApi = {
  getStatus: () =>
    request<{ enabled: boolean; limit: number }>('/api/v1/ocr/status'),
  scanReceipt: (base64Image: string) =>
    request<Record<string, unknown>>('/api/v1/ocr/scan-receipt', {
      method: 'POST',
      body: JSON.stringify({ image: base64Image }),
      timeoutMs: 30_000, // OCR can take a while
    }),
};

// ─── Feedbacks ───────────────────────────────────────────────────────────────
export interface FeedbackItem {
  id: string;
  message: string;
  rating: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const feedbacksApi = {
  create: (data: { message: string, rating: number }) =>
    request<void>('/api/feedbacks', { method: 'POST', body: JSON.stringify(data) }),
  list: () =>
    request<{ items: FeedbackItem[] }>('/api/feedbacks').then(res => res.items),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface AnalyticsUser {
  id: string;
  email: string;
  name: string;
  role: string;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalUsers: number;
  newUsersThisMonth: number;
  growth: Array<{ month: string, count: number }>;
}

export const analyticsApi = {
  summary: () => request<AnalyticsSummary>('/api/analytics/summary'),
  users: () => request<AnalyticsUser[]>('/api/analytics/users'),
};
