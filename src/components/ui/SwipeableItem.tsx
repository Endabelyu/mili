import { useRef, useState, useCallback, type ReactNode, type TouchEvent, type MouseEvent } from 'react';

interface SwipeAction {
  id: string;
  label: string;
  icon: ReactNode;
  color: string;
  onClick: () => void;
}

interface SwipeableItemProps {
  children: ReactNode;
  actions: SwipeAction[];
  onSwipeComplete?: (actionId: string) => void;
  threshold?: number;
  className?: string;
}

export function SwipeableItem({
  children,
  actions,
  onSwipeComplete,
  threshold = 80,
  className = '',
}: SwipeableItemProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [revealedAction, setRevealedAction] = useState<string | null>(null);
  const startXRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const itemRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Haptic feedback helper
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  // Calculate max swipe distance based on number of actions
  const maxSwipe = Math.min(actions.length * threshold, 200);

  // Handle touch/mouse start
  const handleStart = useCallback((clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX;
    currentOffsetRef.current = offset;
  }, [offset]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    handleStart(e.touches[0].clientX);
  }, [handleStart]);

  // Handle mouse start
  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    handleStart(e.clientX);
  }, [handleStart]);

  // Handle move
  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startXRef.current;
    const newOffset = Math.max(-maxSwipe, Math.min(0, currentOffsetRef.current + deltaX));

    setOffset(newOffset);

    // Determine which action is revealed
    const actionIndex = Math.min(
      actions.length - 1,
      Math.floor(Math.abs(newOffset) / threshold)
    );
    const newRevealedAction = actions[actionIndex]?.id || null;

    if (newRevealedAction !== revealedAction) {
      setRevealedAction(newRevealedAction);
      if (newRevealedAction) triggerHaptic();
    }
  }, [isDragging, maxSwipe, actions, threshold, revealedAction, triggerHaptic]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [handleMove, isDragging]);

  // Handle end
  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const absOffset = Math.abs(offset);

    // If swiped past threshold, snap to reveal actions
    if (absOffset > threshold / 2) {
      const revealedWidth = Math.min(
        actions.length * threshold,
        Math.ceil(absOffset / threshold) * threshold
      );
      setOffset(-revealedWidth);
    } else {
      // Snap back
      setOffset(0);
      setRevealedAction(null);
    }
  }, [isDragging, offset, threshold, actions.length]);

  // Handle action click
  const handleActionClick = useCallback((action: SwipeAction) => {
    action.onClick();
    onSwipeComplete?.(action.id);

    // Animate item out if it's a destructive action
    if (action.color.includes('red')) {
      setOffset(-window.innerWidth);
      setTimeout(() => {
        setOffset(0);
        setRevealedAction(null);
      }, 300);
    } else {
      setOffset(0);
      setRevealedAction(null);
    }
  }, [onSwipeComplete]);

  // Close on outside click
  const handleContainerClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current && offset !== 0) {
      setOffset(0);
      setRevealedAction(null);
    }
  }, [offset]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden touch-manipulation ${className}`}
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {/* Background Actions Layer */}
      <div
        className="absolute inset-y-0 right-0 flex items-stretch"
        style={{ width: `${actions.length * threshold}px` }}
      >
        {actions.map((action, index) => {
          const isRevealed = revealedAction === action.id;
          const actionWidth = Math.min(threshold, Math.abs(offset) - index * threshold);

          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ${action.color} ${
                isRevealed ? 'brightness-110' : ''
              }`}
              style={{
                width: actionWidth > 0 ? `${actionWidth}px` : '0px',
                minWidth: actionWidth > 10 ? `${Math.min(threshold, actionWidth)}px` : '0px',
                opacity: actionWidth > 20 ? 1 : 0,
              }}
              aria-label={action.label}
            >
              <span className="w-5 h-5 text-white">{action.icon}</span>
              {actionWidth > 50 && (
                <span className="text-xs text-white font-medium whitespace-nowrap">
                  {action.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Foreground Content */}
      <div
        ref={itemRef}
        className={`relative bg-white transition-transform duration-200 ease-out ${
          isDragging ? '' : 'will-change-transform'
        }`}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  );
}

// Simplified swipeable item with just delete
interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
  className?: string;
  confirmDelete?: boolean;
}

export function SwipeToDelete({
  children,
  onDelete,
  deleteLabel = 'Delete',
  className = '',
  confirmDelete = false,
}: SwipeToDeleteProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = useCallback(() => {
    if (confirmDelete && !showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 2000);
      return;
    }
    onDelete();
  }, [confirmDelete, showConfirm, onDelete]);

  const actions: SwipeAction[] = [
    {
      id: 'delete',
      label: showConfirm ? 'Confirm?' : deleteLabel,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      color: 'bg-red-500 hover:bg-red-600',
      onClick: handleDelete,
    },
  ];

  return (
    <SwipeableItem actions={actions} className={className}>
      {children}
    </SwipeableItem>
  );
}

// Swipeable item with edit and delete
interface SwipeToEditDeleteProps {
  children: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function SwipeToEditDelete({
  children,
  onEdit,
  onDelete,
  className = '',
}: SwipeToEditDeleteProps) {
  const actions: SwipeAction[] = [
    {
      id: 'edit',
      label: 'Edit',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onEdit,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      color: 'bg-red-500 hover:bg-red-600',
      onClick: onDelete,
    },
  ];

  return (
    <SwipeableItem actions={actions} className={className}>
      {children}
    </SwipeableItem>
  );
}
