import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, ...props }, ref) => {
    const baseStyles = `
      block w-full rounded-[16px] border border-transparent bg-[var(--muted)]
      shadow-none
      text-[var(--text)] placeholder:text-[var(--text-dim-2)] font-semibold
      focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]
      disabled:opacity-50
      transition-all duration-200 ease-out
    `;
    const errorStyles = error
      ? 'border-[var(--expense)] focus:border-[var(--expense)] focus:ring-[var(--expense)]/10'
      : '';
    const sizeStyles = 'px-4 py-3.5 text-[15px]';

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={props.id} className="block text-[13px] font-bold text-[var(--text)] mb-1.5 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${errorStyles} ${sizeStyles} ${className}`}
          {...props}
        />
        {(error || helperText) && (
          <p className={`text-[12px] font-medium ml-1 ${error ? 'text-[var(--expense)]' : 'text-[var(--text-dim)]'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
