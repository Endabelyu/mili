import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  variant?: 'default' | 'income' | 'expense' | 'primary';
  isLoading?: boolean;
}

const variantStyles = {
  default: {
    bg: 'glass-card',
    border: '',
    iconBg: 'bg-[var(--text-primary)]/10',
    iconColor: 'text-[var(--text-primary)]',
    titleColor: 'text-[var(--text-secondary)] font-semibold',
    valueColor: 'text-[var(--text-primary)]',
    hoverShadow: 'hover:-translate-y-1 transition-transform',
  },
  primary: {
    bg: 'glass-card',
    border: 'border-[var(--gradient-hero-start)]/30',
    iconBg: 'bg-[var(--gradient-hero-start)]/20',
    iconColor: 'text-[var(--gradient-hero-start)]',
    titleColor: 'text-[var(--text-secondary)] font-semibold',
    valueColor: 'text-[var(--text-primary)]',
    hoverShadow: 'hover:-translate-y-1 transition-transform',
  },
  income: {
    bg: 'glass-card',
    border: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    titleColor: 'text-[var(--text-secondary)] font-semibold',
    valueColor: 'text-[var(--text-primary)]',
    hoverShadow: 'hover:-translate-y-1 transition-transform',
  },
  expense: {
    bg: 'glass-card',
    border: 'border-rose-500/30',
    iconBg: 'bg-rose-500/20',
    iconColor: 'text-rose-400',
    titleColor: 'text-[var(--text-secondary)] font-semibold',
    valueColor: 'text-[var(--text-primary)]',
    hoverShadow: 'hover:-translate-y-1 transition-transform',
  },
};


export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  variant = 'default',
  isLoading,
}: StatCardProps) {
  const styles = variantStyles[variant];

  if (isLoading) {
    return (
      <div className={`${styles.bg} ${styles.border} rounded-2xl p-5 animate-pulse`}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-32 bg-gray-300 rounded" />
          </div>
          <div className="h-10 w-10 rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  const changeIsPositive = change && change > 0;
  const changeIsNegative = change && change < 0;

  return (
    <div
      className={`
        relative ${styles.bg} ${styles.border} p-5 md:p-6
        transition-transform duration-200 ${styles.hoverShadow}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${styles.titleColor} truncate`}>
            {title}
          </p>
          <p className={`text-2xl md:text-3xl font-bold tracking-tight ${styles.valueColor} mt-2 truncate`}>
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              {changeIsPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              ) : changeIsNegative ? (
                <TrendingDown className="w-3.5 h-3.5 text-red-600" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span
                className={`text-sm font-medium ${
                  changeIsPositive
                    ? 'text-green-600 dark:text-emerald-400'
                    : changeIsNegative
                    ? 'text-red-600 dark:text-rose-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {change > 0 ? '+' : ''}
                {change.toFixed(1)}%
              </span>
              {changeLabel && (
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={`
            ${styles.iconBg} ${styles.iconColor}
            w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm dark:shadow-none
          `}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
