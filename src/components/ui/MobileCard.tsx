import type { ReactNode } from 'react';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md';
  border?: boolean;
  compact?: boolean;
}

export function MobileCard({
  children,
  className = '',
  onClick,
  href,
  padding = 'md',
  shadow = 'sm',
  border = true,
  compact = false,
}: MobileCardProps) {
  const paddingStyles = {
    none: '',
    sm: compact ? 'p-3' : 'p-4',
    md: compact ? 'p-4' : 'p-5',
    lg: compact ? 'p-5' : 'p-6',
  };

  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
  };

  const baseStyles = `
    bg-white rounded-xl overflow-hidden
    ${border ? 'border border-gray-100' : ''}
    ${paddingStyles[padding]}
    ${shadowStyles[shadow]}
    ${className}
  `;

  const interactiveStyles = onClick || href
    ? 'cursor-pointer active:scale-[0.99] active:bg-gray-50 transition-all duration-150'
    : '';

  const Component = href ? 'a' : onClick ? 'button' : 'div';
  const props = href
    ? { href, className: `${baseStyles} ${interactiveStyles} block` }
    : onClick
    ? { onClick, className: `${baseStyles} ${interactiveStyles} w-full text-left touch-manipulation` }
    : { className: baseStyles };

  return (
    <Component {...props as any}>
      {children}
    </Component>
  );
}

// Compact list item card - optimized for dense lists
interface ListItemCardProps {
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
  icon?: ReactNode;
  iconColor?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  badge?: ReactNode;
}

export function ListItemCard({
  title,
  subtitle,
  rightContent,
  icon,
  iconColor = 'bg-gray-100 text-gray-600',
  onClick,
  href,
  className = '',
  badge,
}: ListItemCardProps) {
  return (
    <MobileCard
      onClick={onClick}
      href={href}
      padding="sm"
      shadow="none"
      className={className}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        {icon && (
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${iconColor} flex items-center justify-center`}>
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{title}</h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 truncate">{subtitle}</p>
          )}
        </div>

        {/* Right Content */}
        {rightContent && (
          <div className="flex-shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </MobileCard>
  );
}

// Summary card for dashboard stats
interface SummaryCardProps {
  title: string;
  amount: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: ReactNode;
  iconColor: string;
  onClick?: () => void;
}

export function SummaryCard({
  title,
  amount,
  trend,
  trendValue,
  icon,
  iconColor,
  onClick,
}: SummaryCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };

  const trendIcons = {
    up: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    down: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    neutral: null,
  };

  return (
    <MobileCard onClick={onClick} padding="md" className="touch-manipulation">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{amount}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${trendColors[trend]}`}>
              {trendIcons[trend]}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${iconColor} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </MobileCard>
  );
}

// Transaction card optimized for mobile
interface TransactionCardProps {
  title: string;
  date: string;
  amount: string | number;
  isPositive?: boolean;
  category?: string;
  categoryColor?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export function TransactionCard({
  title,
  date,
  amount,
  isPositive = false,
  category,
  categoryColor = 'bg-gray-100',
  icon,
  onClick,
}: TransactionCardProps) {
  return (
    <MobileCard
      onClick={onClick}
      padding="sm"
      shadow="none"
      className="border-0 border-b border-gray-100 rounded-none last:border-b-0"
    >
      <div className="flex items-center gap-3">
        {/* Category Icon */}
        {icon && (
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${categoryColor} flex items-center justify-center`}>
            {icon}
          </div>
        )}

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{title}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{date}</span>
            {category && (
              <>
                <span>•</span>
                <span className="truncate">{category}</span>
              </>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className={`flex-shrink-0 font-semibold ${isPositive ? 'text-green-600' : 'text-gray-900'}`}>
          {isPositive ? '+' : ''}{amount}
        </div>
      </div>
    </MobileCard>
  );
}

// Section header for mobile lists
interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  count?: number;
}

export function SectionHeader({ title, action, count }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-1 py-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {title}
        {count !== undefined && (
          <span className="ml-2 text-xs text-gray-400">({count})</span>
        )}
      </h2>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-medium text-blue-600 active:text-blue-700 touch-manipulation min-h-[44px] px-2 -mr-2 flex items-center"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Empty state card for mobile
interface EmptyStateCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyStateCard({ title, description, icon, action }: EmptyStateCardProps) {
  return (
    <MobileCard padding="lg" className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl active:bg-blue-700 touch-manipulation min-h-[44px]"
        >
          {action.label}
        </button>
      )}
    </MobileCard>
  );
}
