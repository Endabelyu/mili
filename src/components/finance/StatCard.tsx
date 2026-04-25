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
    bg: 'flow-card border-none',
    border: '',
    iconBg: 'bg-[var(--muted)]',
    iconColor: 'text-[var(--text)]',
    titleColor: 'text-[var(--text-dim)] font-semibold',
    valueColor: 'text-[var(--text)]',
    hoverShadow: 'hover:-translate-y-0.5 transition-transform',
  },
  primary: {
    bg: 'flow-card border-none',
    border: 'border-[var(--accent)]/30',
    iconBg: 'bg-[var(--accent-tint)]',
    iconColor: 'text-[var(--accent)]',
    titleColor: 'text-[var(--text-dim)] font-semibold',
    valueColor: 'text-[var(--text)]',
    hoverShadow: 'hover:-translate-y-0.5 transition-transform',
  },
  income: {
    bg: 'flow-card border-none',
    border: 'border-[var(--income)]/30',
    iconBg: 'bg-[var(--income)]/10',
    iconColor: 'text-[var(--income)]',
    titleColor: 'text-[var(--text-dim)] font-semibold',
    valueColor: 'text-[var(--text)]',
    hoverShadow: 'hover:-translate-y-0.5 transition-transform',
  },
  expense: {
    bg: 'flow-card border-none',
    border: 'border-[var(--expense)]/30',
    iconBg: 'bg-[var(--expense)]/10',
    iconColor: 'text-[var(--expense)]',
    titleColor: 'text-[var(--text-dim)] font-semibold',
    valueColor: 'text-[var(--text)]',
    hoverShadow: 'hover:-translate-y-0.5 transition-transform',
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
      <div className={`${styles.bg} ${styles.border} rounded-[16px] p-5 animate-pulse`}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-[var(--muted)] rounded" />
            <div className="h-8 w-32 bg-[var(--muted-2)] rounded" />
          </div>
          <div className="h-10 w-10 rounded-lg bg-[var(--muted)]" />
        </div>
      </div>
    );
  }

  const changeIsPositive = change && change > 0;
  const changeIsNegative = change && change < 0;

  return (
    <div
      className={`
        relative ${styles.bg} ${styles.border} p-5 md:p-6 rounded-[20px]
        transition-all duration-200 ${styles.hoverShadow}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className={`text-[12px] font-bold tracking-[0.02em] ${styles.titleColor} truncate uppercase opacity-70`}>
            {title}
          </p>
          <p className={`text-[24px] font-bold tracking-[-0.02em] ${styles.valueColor} mt-1 truncate tabular-nums`}>
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              {changeIsPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-[var(--income)]" />
              ) : changeIsNegative ? (
                <TrendingDown className="w-3.5 h-3.5 text-[var(--expense)]" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-[var(--text-dim-2)]" />
              )}
              <span
                className={`text-[13px] font-bold tabular-nums ${
                  changeIsPositive
                    ? 'text-[var(--income)]'
                    : changeIsNegative
                    ? 'text-[var(--expense)]'
                    : 'text-[var(--text-dim)]'
                }`}
              >
                {change > 0 ? '+' : ''}
                {change.toFixed(1)}%
              </span>
              {changeLabel && (
                <span className="text-[12px] font-medium text-[var(--text-dim)] truncate">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={`
            ${styles.iconBg} ${styles.iconColor}
            w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
          `}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
