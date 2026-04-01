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
  default: 'bg-zinc-100 text-[#52525b] border-zinc-200',
  primary: 'bg-[#ecfccb] text-[#4d7c0f] border-[#bef264]',
  success: 'bg-[#dcfce7] text-[#15803d] border-[#86efac]',
  warning: 'bg-[#ffedd5] text-[#c2410c] border-[#fdba74]',
  danger: 'bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]',
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
        font-medium rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
