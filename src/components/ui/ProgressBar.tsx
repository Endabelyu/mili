interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  label,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorStyles = {
    primary: 'bg-[var(--accent)]',
    success: 'bg-[var(--income)]',
    warning: 'bg-amber-500',
    danger: 'bg-[var(--expense)]',
  };

  // Dynamic color based on percentage when color is not explicitly set
  const getDynamicColor = () => {
    if (percentage >= 100) return 'bg-[var(--expense)]';
    if (percentage >= 80) return 'bg-amber-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-[var(--income)]';
  };

  const barColor = color === 'success' ? getDynamicColor() : colorStyles[color];

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-[13px] font-bold text-[var(--text)]">{label}</span>
          )}
          {showLabel && (
            <span className="text-[12px] font-bold text-[var(--text-dim)] tabular-nums">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      
      <div
        className={`
          w-full bg-[var(--muted)] rounded-full overflow-hidden
          ${sizeStyles[size]}
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`
            ${barColor} rounded-full
            transition-all duration-500 ease-out
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
