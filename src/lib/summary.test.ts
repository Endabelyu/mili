import { describe, it, expect } from 'vitest';
import { computeSummary } from './summary';
import type { Transaction } from '../types';

function tx(type: 'income' | 'expense' | 'transfer', amount: number): Transaction {
  return { id: '', userId: '', type, amount, categoryId: '', accountId: '', date: '', createdAt: '', updatedAt: '' } as unknown as Transaction;
}

describe('computeSummary', () => {
  it('returns zeros for empty list', () => {
    const result = computeSummary([]);
    expect(result).toEqual({ income: 0, expenses: 0, transfers: 0, balance: 0, filteredCount: 0 });
  });

  it('aggregates income correctly', () => {
    const items = [tx('income', 100000), tx('income', 50000)];
    const { income, expenses, transfers, balance, filteredCount } = computeSummary(items);
    expect(income).toBe(150000);
    expect(expenses).toBe(0);
    expect(transfers).toBe(0);
    expect(balance).toBe(150000);
    expect(filteredCount).toBe(2);
  });

  it('aggregates expenses correctly', () => {
    const items = [tx('expense', 80000), tx('expense', 20000)];
    const { income, expenses, transfers, balance, filteredCount } = computeSummary(items);
    expect(income).toBe(0);
    expect(expenses).toBe(100000);
    expect(transfers).toBe(0);
    expect(balance).toBe(-100000);
    expect(filteredCount).toBe(2);
  });

  it('aggregates transfers as standalone — never folds into balance', () => {
    const items = [tx('transfer', 200000), tx('transfer', 50000)];
    const { income, expenses, transfers, balance } = computeSummary(items);
    expect(transfers).toBe(250000);
    // transfers do NOT affect income/expense/balance
    expect(income).toBe(0);
    expect(expenses).toBe(0);
    expect(balance).toBe(0);
  });

  it('computes balance as income minus expenses (transfers excluded)', () => {
    const items = [
      tx('income', 500000),
      tx('expense', 200000),
      tx('transfer', 100000),
    ];
    const { income, expenses, transfers, balance, filteredCount } = computeSummary(items);
    expect(income).toBe(500000);
    expect(expenses).toBe(200000);
    expect(transfers).toBe(100000);
    expect(balance).toBe(300000);
    expect(filteredCount).toBe(3);
  });

  it('handles string amounts from API', () => {
    const item = { ...tx('expense', 0), amount: '75000.50' } as unknown as Transaction;
    const { expenses } = computeSummary([item]);
    expect(expenses).toBeCloseTo(75000.50);
  });
});
