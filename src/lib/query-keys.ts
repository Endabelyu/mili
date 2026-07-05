export const queryKeys = {
  transactions: {
    all: ['transactions'] as const,
    list: (params: object) => ['transactions', 'list', params] as const,
  },
  budgets: {
    all: ['budgets'] as const,
    list: (month?: string) => ['budgets', 'list', month] as const,
  },
  reports: {
    summary: (month?: string) => ['reports', 'summary', month] as const,
    byCategory: (month?: string) => ['reports', 'by-category', month] as const,
    monthly: (months?: number) => ['reports', 'monthly', months] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (params?: { includeHidden?: boolean }) => ['categories', 'list', params ?? {}] as const,
  },
  accounts: { all: ['accounts'] as const },
  calendar: {
    monthly: (month: string) => ['calendar', month] as const,
  },
};
