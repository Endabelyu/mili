// Shared types that don't import Drizzle/Postgres directly
export interface Category {
  id: string;
  label: string;
  icon: string | null;
  color: string | null;
  type: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'bank' | 'e-wallet' | 'cash' | 'investment' | 'credit-card';
  balance: string | number;
  currency: string;
  color: string;
  icon?: string | null;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: string | number;
  type: string;
  categoryId: string;
  accountId?: string | null;
  toAccountId?: string | null;
  description: string | null;
  date: Date | string;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  account?: Account;
  fromAccount?: Account;
  toAccount?: Account;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  limitAmount: string | number;
  month: string;
  recurring?: boolean;
  spent?: string | number;
  percentageUsed?: number;
  category?: Category;
}
