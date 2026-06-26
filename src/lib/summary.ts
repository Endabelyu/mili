import type { Transaction } from '../types';

export interface SummaryResult {
  income: number;
  expenses: number;
  transfers: number;
  balance: number;
  filteredCount: number;
}

export function computeSummary(items: Transaction[]): SummaryResult {
  let income = 0;
  let expenses = 0;
  let transfers = 0;

  for (const tx of items) {
    const amount = parseFloat(String(tx.amount));
    if (tx.type === 'income') income += amount;
    else if (tx.type === 'expense') expenses += amount;
    else if (tx.type === 'transfer') transfers += amount;
  }

  return { income, expenses, transfers, balance: income - expenses, filteredCount: items.length };
}
