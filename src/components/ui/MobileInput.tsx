import { forwardRef, useState, useCallback, type InputHTMLAttributes, type ReactNode } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: ReactNode;
  clearable?: boolean;
  fullScreen?: boolean;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ label, error, helper, icon, clearable, fullScreen = false, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputType = type === 'password' && showPassword ? 'text' : type;

    const handleClear = useCallback(() => {
      if (props.onChange) {
        const event = {
          target: { value: '', name: props.name },
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange(event);
      }
    }, [props]);

    const baseStyles = `
      w-full px-4 py-4
      bg-white border rounded-xl
      text-base text-gray-900 placeholder:text-gray-400
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500/20
      disabled:bg-gray-50 disabled:text-gray-400
      touch-manipulation
    `;

    const stateStyles = error
      ? 'border-red-300 focus:border-red-500'
      : isFocused
      ? 'border-blue-500 shadow-sm'
      : 'border-gray-200';

    const heightStyles = fullScreen ? 'min-h-[56px]' : 'min-h-[48px]';

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`${baseStyles} ${stateStyles} ${heightStyles} ${
              icon ? 'pl-11' : ''
            } ${clearable || type === 'password' ? 'pr-11' : ''}`}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {clearable && props.value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                tabIndex={-1}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500 ml-1">{error}</p>}
        {helper && !error && <p className="mt-1.5 text-sm text-gray-500 ml-1">{helper}</p>}
      </div>
    );
  }
);

MobileInput.displayName = 'MobileInput';

// Mobile text area
interface MobileTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const MobileTextArea = forwardRef<HTMLTextAreaElement, MobileTextAreaProps>(
  ({ label, error, helper, className = '', rows = 4, ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full px-4 py-3
            bg-white border rounded-xl
            text-base text-gray-900 placeholder:text-gray-400
            transition-all duration-200
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            disabled:bg-gray-50 disabled:text-gray-400
            resize-none touch-manipulation min-h-[120px]
            ${error ? 'border-red-300' : 'border-gray-200'}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-500 ml-1">{error}</p>}
        {helper && !error && <p className="mt-1.5 text-sm text-gray-500 ml-1">{helper}</p>}
      </div>
    );
  }
);

MobileTextArea.displayName = 'MobileTextArea';

// Mobile select with native styling
interface MobileSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MobileSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  label?: string;
  error?: string;
  helper?: string;
  options: MobileSelectOption[];
  placeholder?: string;
}

export const MobileSelect = forwardRef<HTMLSelectElement, MobileSelectProps>(
  ({ label, error, helper, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-4 pr-10
              bg-white border rounded-xl
              text-base text-gray-900
              transition-all duration-200
              focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              disabled:bg-gray-50 disabled:text-gray-400
              appearance-none touch-manipulation min-h-[56px]
              ${error ? 'border-red-300' : 'border-gray-200'}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500 ml-1">{error}</p>}
        {helper && !error && <p className="mt-1.5 text-sm text-gray-500 ml-1">{helper}</p>}
      </div>
    );
  }
);

MobileSelect.displayName = 'MobileSelect';

// Mobile form section
interface MobileFormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function MobileFormSection({ title, description, children }: MobileFormSectionProps) {
  return (
    <div className="space-y-4">
      {(title || description) && (
        <div className="px-1">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// Mobile form actions (sticky bottom)
interface MobileFormActionsProps {
  children: ReactNode;
  className?: string;
}

export function MobileFormActions({ children, className = '' }: MobileFormActionsProps) {
  return (
    <div
      className={`
        sticky bottom-0 left-0 right-0
        bg-white/95 backdrop-blur-sm
        border-t border-gray-100
        p-4 safe-area-inset-bottom
        flex gap-3
        ${className}
      `}
    >
      {children}
    </div>
  );
}
