import { useState, useCallback, useEffect, type ReactNode } from 'react';

interface FABAction {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  color?: string;
}

interface FABProps {
  icon: ReactNode;
  actions?: FABAction[];
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  hideOnScroll?: boolean;
  scrollThreshold?: number;
  ariaLabel: string;
}

export function FAB({
  icon,
  actions,
  onClick,
  position = 'bottom-right',
  color = 'bg-blue-600',
  size = 'md',
  hideOnScroll = false,
  scrollThreshold = 100,
  ariaLabel,
}: FABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isSpeedDial = actions && actions.length > 0;

  // Position styles
  const positionStyles = {
    'bottom-right': 'right-4 bottom-4',
    'bottom-left': 'left-4 bottom-4',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-4',
  };

  // Size styles
  const sizeStyles = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  // Handle scroll to hide/show FAB
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY;
      const isPastThreshold = currentScrollY > scrollThreshold;

      if (isPastThreshold) {
        setIsVisible(isScrollingUp);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll, lastScrollY, scrollThreshold]);

  // Close speed dial on outside click
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-fab-container]')) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isExpanded]);

  // Handle main button click
  const handleMainClick = useCallback(() => {
    if (isSpeedDial) {
      setIsExpanded(prev => !prev);
    } else if (onClick) {
      onClick();
    }
  }, [isSpeedDial, onClick]);

  // Handle action click
  const handleActionClick = useCallback((action: FABAction) => {
    action.onClick();
    setIsExpanded(false);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isExpanded]);

  return (
    <div
      data-fab-container
      className={`fixed ${positionStyles[position]} z-50 flex flex-col items-end gap-3 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-24'
      }`}
    >
      {/* Speed Dial Actions */}
      {isSpeedDial && isExpanded && (
        <div className="flex flex-col items-end gap-2 mb-2">
          {actions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`
                flex items-center gap-3 group speed-dial-item-enter
                ${action.color || 'bg-white'} 
                ${action.color ? 'text-white' : 'text-gray-700'}
                shadow-lg rounded-full pr-4 pl-3 py-2
                active:scale-95 transition-transform
                min-h-[44px]
              `}
              style={{
                animationDelay: `${(actions.length - 1 - index) * 50}ms`,
              }}
            >
              <span className="text-sm font-medium whitespace-nowrap">
                {action.label}
              </span>
              <span className={`${iconSizes.sm}`}>
                {action.icon}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={handleMainClick}
        className={`
          ${sizeStyles[size]} ${color}
          rounded-full shadow-lg shadow-blue-500/30
          flex items-center justify-center
          text-white
          active:scale-90 transition-all duration-200
          hover:shadow-xl hover:shadow-blue-500/40
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          touch-manipulation
          min-h-[44px] min-w-[44px]
        `}
        aria-label={ariaLabel}
        aria-expanded={isExpanded}
      >
        {/* Icon with rotation animation for speed dial */}
        <span
          className={`${iconSizes[size]} transition-transform duration-300 ${
            isExpanded ? 'rotate-45' : 'rotate-0'
          }`}
        >
          {isSpeedDial ? (
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          ) : (
            icon
          )}
        </span>
      </button>

      {/* Backdrop for speed dial */}
      {isSpeedDial && isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-[-1] animate-fade-in"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// FAB variants for common use cases
interface AddFABProps {
  onClick: () => void;
  label?: string;
  hideOnScroll?: boolean;
}

export function AddFAB({ onClick, label = 'Add', hideOnScroll = false }: AddFABProps) {
  return (
    <FAB
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      }
      onClick={onClick}
      ariaLabel={label}
      hideOnScroll={hideOnScroll}
    />
  );
}

// Speed dial for transactions
interface TransactionSpeedDialProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onTransfer?: () => void;
  hideOnScroll?: boolean;
}

export function TransactionSpeedDial({
  onAddIncome,
  onAddExpense,
  onTransfer,
  hideOnScroll = false,
}: TransactionSpeedDialProps) {
  const actions: FABAction[] = [
    {
      id: 'expense',
      label: 'Expense',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
      onClick: onAddExpense,
      color: 'bg-red-500',
    },
    {
      id: 'income',
      label: 'Income',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: onAddIncome,
      color: 'bg-green-500',
    },
  ];

  if (onTransfer) {
    actions.push({
      id: 'transfer',
      label: 'Transfer',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      onClick: onTransfer,
      color: 'bg-blue-500',
    });
  }

  return (
    <FAB
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      }
      actions={actions}
      ariaLabel="Add transaction"
      color="bg-blue-600"
      hideOnScroll={hideOnScroll}
    />
  );
}
