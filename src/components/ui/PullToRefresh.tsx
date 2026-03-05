import { useRef, useState, useCallback, type ReactNode, type TouchEvent, useEffect } from 'react';
import { useRevalidator } from 'react-router';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
  className?: string;
  threshold?: number;
  maxPull?: number;
  spinnerSize?: number;
}

type RefreshState = 'idle' | 'pulling' | 'ready' | 'refreshing' | 'complete' | 'error';

export function PullToRefresh({
  children,
  onRefresh,
  className = '',
  threshold = 80,
  maxPull = 120,
  spinnerSize = 32,
}: PullToRefreshProps) {
  const [state, setState] = useState<RefreshState>('idle');
  const [pullDistance, setPullDistance] = useState(0);
  const [rotation, setRotation] = useState(0);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const revalidator = useRevalidator();

  // Check if at top of scroll
  const isAtTop = useCallback(() => {
    if (!contentRef.current) return true;
    return contentRef.current.scrollTop <= 0;
  }, []);

  // Calculate pull distance with resistance
  const calculatePull = useCallback((deltaY: number) => {
    const resistance = 0.5;
    const pulled = Math.min(deltaY * resistance, maxPull);
    return Math.max(0, pulled);
  }, [maxPull]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!isAtTop() || state === 'refreshing') return;

    startYRef.current = e.touches[0].clientY;
    currentYRef.current = startYRef.current;
    setState('pulling');
  }, [isAtTop, state]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (state !== 'pulling' && state !== 'ready') return;

    currentYRef.current = e.touches[0].clientY;
    const deltaY = currentYRef.current - startYRef.current;

    if (deltaY > 0 && isAtTop()) {
      e.preventDefault();
      const pull = calculatePull(deltaY);
      setPullDistance(pull);
      setRotation(Math.min((pull / threshold) * 360, 360));

      if (pull >= threshold) {
        setState('ready');
      } else {
        setState('pulling');
      }
    }
  }, [state, isAtTop, calculatePull, threshold]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (state === 'ready') {
      setState('refreshing');
      setPullDistance(threshold * 0.8);

      try {
        // Call custom refresh handler or revalidate
        if (onRefresh) {
          await onRefresh();
        } else {
          await revalidator.revalidate();
        }

        setState('complete');
        setTimeout(() => {
          setState('idle');
          setPullDistance(0);
          setRotation(0);
        }, 500);
      } catch (error) {
        setState('error');
        setTimeout(() => {
          setState('idle');
          setPullDistance(0);
          setRotation(0);
        }, 1500);
      }
    } else if (state === 'pulling') {
      // Snap back if not pulled enough
      setState('idle');
      setPullDistance(0);
      setRotation(0);
    }
  }, [state, onRefresh, revalidator, threshold]);

  // Reset on state change to idle
  useEffect(() => {
    if (state === 'idle') {
      setPullDistance(0);
      setRotation(0);
    }
  }, [state]);

  // Progress percentage (0-1)
  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Pull Indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-opacity duration-200"
        style={{
          top: `${pullDistance / 2 - spinnerSize / 2}px`,
          opacity: state === 'idle' ? 0 : 1,
          pointerEvents: 'none',
        }}
      >
        {/* Spinner SVG */}
        <div
          className={`
            rounded-full border-2 transition-all duration-200
            ${state === 'ready' ? 'border-blue-500' : 'border-gray-300'}
            ${state === 'refreshing' ? 'animate-spin border-blue-500 border-t-transparent' : ''}
            ${state === 'complete' ? 'border-green-500' : ''}
            ${state === 'error' ? 'border-red-500' : ''}
          `}
          style={{
            width: spinnerSize,
            height: spinnerSize,
            transform: state === 'refreshing' ? 'none' : `rotate(${rotation}deg)`,
          }}
        >
          {/* Arrow icon inside spinner */}
          {state !== 'refreshing' && state !== 'complete' && state !== 'error' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  state === 'ready' ? 'text-blue-500 rotate-180' : 'text-gray-400'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          )}

          {/* Checkmark for complete */}
          {state === 'complete' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {/* X for error */}
          {state === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Status Text */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-xs text-gray-500 transition-opacity duration-200"
        style={{
          top: `${pullDistance / 2 + spinnerSize / 2 + 8}px`,
          opacity: state === 'idle' ? 0 : 1,
          pointerEvents: 'none',
        }}
      >
        {state === 'pulling' && 'Pull to refresh'}
        {state === 'ready' && 'Release to refresh'}
        {state === 'refreshing' && 'Refreshing...'}
        {state === 'complete' && 'Updated!'}
        {state === 'error' && 'Failed to refresh'}
      </div>

      {/* Content with transform */}
      <div
        ref={contentRef}
        className="h-full overflow-auto touch-manipulation"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: state === 'pulling' || state === 'ready' ? 'none' : 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Hook for using pull to refresh with custom refresh function
export function usePullToRefresh(refreshFn: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshFn();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFn]);

  return { isRefreshing, handleRefresh };
}
