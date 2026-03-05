// Shared types that don't import Drizzle/Postgres directly
export interface Category {
  id: string;
  label: string;
  icon: string | null;
  color: string | null;
  type: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: string | number;
  type: string;
  categoryId: string;
  description: string | null;
  date: Date | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  limitAmount: string | number;
  month: string;
}
