import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';


interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--muted)] text-[var(--text-dim)] border-[var(--border)]',
  primary: 'bg-[var(--accent-tint)] text-[var(--accent)] border-[var(--accent)]/10',
  success: 'bg-[#dcfce7] text-[var(--income)] border-[var(--income)]/10',
  warning: 'bg-[#ffedd5] text-[#c2410c] border-[#fdba74]',
  danger: 'bg-[#fee2e2] text-[var(--expense)] border-[var(--expense)]/10',
  info: 'bg-[#e0e7ff] text-[#4338ca] border-[#a5b4fc]',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-bold rounded-lg border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
