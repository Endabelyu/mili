import { useEffect, useRef, useState, useCallback, type ReactNode, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[]; // Percentage values (0-100)
  initialSnap?: number;
  showHandle?: boolean;
  showBackdrop?: boolean;
  preventClose?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [25, 50, 100],
  initialSnap = 0,
  showHandle = true,
  showBackdrop = true,
  preventClose = false,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const startYRef = useRef(0);
  const startTranslateYRef = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate snap position in pixels
  const getSnapPosition = useCallback((index: number) => {
    if (typeof window === 'undefined') return 0;
    const maxHeight = window.innerHeight * 0.9; // 90vh max
    return maxHeight * (1 - snapPoints[index] / 100);
  }, [snapPoints]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Reset to initial snap when opening
      setCurrentSnap(initialSnap);
      setTranslateY(0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, preventClose, initialSnap]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    // Only start dragging from handle or when at top of content
    const target = e.target as HTMLElement;
    const isHandle = target.closest('[data-sheet-handle]');
    const isAtTop = contentRef.current?.scrollTop === 0;

    if (isHandle || isAtTop) {
      setIsDragging(true);
      startYRef.current = e.touches[0].clientY;
      startTranslateYRef.current = translateY;
    }
  }, [translateY]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startYRef.current;

    // Only allow dragging down (positive delta)
    if (deltaY > 0) {
      // Add resistance
      const resistance = 0.6;
      setTranslateY(startTranslateYRef.current + deltaY * resistance);
    } else if (deltaY > -10) {
      // Small upward movement allowed
      setTranslateY(startTranslateYRef.current + deltaY);
    }
  }, [isDragging]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100; // px to dismiss
    const snapThreshold = 30; // px to change snap point

    if (translateY > threshold && !preventClose) {
      onClose();
      return;
    }

    // Find nearest snap point
    const currentOffset = getSnapPosition(currentSnap) + translateY;
    let nearestSnap = currentSnap;
    let minDistance = Infinity;

    snapPoints.forEach((_, index) => {
      const snapPos = getSnapPosition(index);
      const distance = Math.abs(currentOffset - snapPos);
      if (distance < minDistance) {
        minDistance = distance;
        nearestSnap = index;
      }
    });

    if (Math.abs(translateY) > snapThreshold) {
      setCurrentSnap(nearestSnap);
    }
    setTranslateY(0);
  }, [isDragging, translateY, preventClose, onClose, currentSnap, snapPoints, getSnapPosition]);

  // Handle backdrop tap
  const handleBackdropClick = useCallback(() => {
    if (!preventClose) onClose();
  }, [onClose, preventClose]);

  // Handle snap point change
  const handleSnapChange = useCallback((index: number) => {
    setCurrentSnap(index);
    setTranslateY(0);
  }, []);

  if (!isOpen) return null;

  const sheetHeight = `${snapPoints[currentSnap]}%`;
  const transform = isDragging
    ? `translateY(${translateY}px)`
    : `translateY(${getSnapPosition(currentSnap)}px)`;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl bottom-sheet-enter"
        style={{
          height: '90vh',
          transform,
          transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Handle Bar */}
        {showHandle && (
          <div
            data-sheet-handle
            className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-manipulation"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="px-4 pb-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        )}

        {/* Snap Point Indicators */}
        {snapPoints.length > 1 && (
          <div className="flex justify-center gap-1.5 py-2">
            {snapPoints.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSnapChange(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentSnap ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                aria-label={`Snap to ${snapPoints[index]}%`}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div
          ref={contentRef}
          className="overflow-y-auto px-4 pb-safe"
          style={{ height: `calc(100% - ${showHandle ? 60 : 0}px - ${title ? 50 : 0}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {children}
        </div>

        {/* Content Height Indicator */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 transition-all duration-300"
          style={{ width: `${snapPoints[currentSnap]}%` }}
        />
      </div>
    </div>,
    document.body
  );
}

// Hook for bottom sheet state management
export function useBottomSheet(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}
