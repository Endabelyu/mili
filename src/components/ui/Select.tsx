import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectOptGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  groups?: SelectOptGroup[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, groups, className = '', children, ...props }, ref) => {
    const baseStyles = `
      block w-full rounded-2xl border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-md
      shadow-sm
      text-[var(--text-primary)]
      appearance-none cursor-pointer
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
        <div className="relative">
          <select
            ref={ref}
            className={`${baseStyles} ${errorStyles} ${sizeStyles} pr-10 ${className}`}
            {...props}
          >
            {children || (
              <>
                {options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                {groups?.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </>
            )}
          </select>
          
          {/* Chevron icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
