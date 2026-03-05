import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, ...props }, ref) => {
    const baseStyles = `
      block w-full rounded-2xl border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-md
      shadow-sm
      text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]
      focus:outline-none focus:ring-2 focus:ring-[var(--gradient-hero-start)]/20 focus:border-[var(--gradient-hero-start)]
      disabled:opacity-50
      transition-all duration-200 ease-out
    `;
    const errorStyles = error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
      : 'hover:border-[var(--text-primary)]/40';
    const sizeStyles = 'px-4 py-3 text-sm min-h-[44px]';

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${errorStyles} ${sizeStyles} ${className}`}
          {...props}
        />
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
