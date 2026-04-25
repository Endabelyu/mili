import { forwardRef, type SelectHTMLAttributes } from 'react';

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
      block w-full rounded-[10px] border-[var(--border)] bg-[var(--muted)]
      shadow-none
      text-[var(--text)]
      appearance-none cursor-pointer
      focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)]
      disabled:opacity-50
      transition-all duration-200 ease-out
    `;

    const errorStyles = error
      ? 'border-[var(--expense)] focus:border-[var(--expense)] focus:ring-[var(--expense)]/10'
      : 'hover:border-[var(--text-dim-2)]';

    const sizeStyles = 'px-4 py-2.5 text-[14px] min-h-[44px]';

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={props.id} className="block text-[13px] font-bold text-[var(--text)] mb-1.5 ml-1">
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
          <p className={`text-[12px] font-medium ml-1 ${error ? 'text-[var(--expense)]' : 'text-[var(--text-dim)]'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
