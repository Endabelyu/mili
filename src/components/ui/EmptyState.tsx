import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ComponentType<LucideProps>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-[var(--muted)] flex items-center justify-center">
        <Icon className="w-7 h-7 text-[var(--text-dim-2)]" />
      </div>
      
      <h3 className="text-[17px] font-bold text-[var(--text)] mb-2 tracking-[-0.01em]">
        {title}
      </h3>
      
      {description && (
        <p className="text-[14px] font-medium text-[var(--text-dim)] mb-8 max-w-xs mx-auto">
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex items-center justify-center gap-3">
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
