import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-[var(--gradient-hero-start)] text-[var(--app-bg-start)] hover:brightness-110 focus:ring-[var(--gradient-hero-start)]/50 shadow-sm hover:shadow',
  secondary: 'bg-[var(--card-bg)] backdrop-blur-md text-[var(--text-primary)] border border-[var(--card-border)] hover:bg-[var(--text-primary)]/5 focus:ring-[var(--card-border)]',
  outline: 'bg-[var(--card-bg)] backdrop-blur-md text-[var(--text-primary)] border border-[var(--card-border)] hover:bg-[var(--text-primary)]/5 focus:ring-[var(--card-border)] hover:border-[var(--text-primary)]/40',
  ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 focus:ring-[var(--text-primary)]/20',
  danger: 'bg-[var(--gradient-danger-start)] text-white hover:brightness-110 focus:ring-[var(--gradient-danger-start)]/50 shadow-sm hover:shadow',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-sm h-10',
  lg: 'px-6 py-3 text-base h-12',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className = '', disabled, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center font-semibold rounded-lg
      focus:outline-none focus:ring-2 focus:ring-offset-1
      transition-all duration-200 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
      active:scale-[0.98]
    `;

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
