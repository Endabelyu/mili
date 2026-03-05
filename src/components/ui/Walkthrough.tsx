import { useEffect, useState, useRef, useCallback } from 'react';
import { useWalkthroughContext, type WalkthroughStep } from '@app/context/WalkthroughContext';
import { Button } from './Button';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  HelpCircle,
  Keyboard,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

// ============================================================================
// WALKTHROUGH COMPONENT
// ============================================================================

export function Walkthrough() {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    steps,
    progress,
    nextStep,
    prevStep,
    skipWalkthrough,
    completeWalkthrough,
    hasNextStep,
    hasPrevStep,
  } = useWalkthroughContext();

  const [spotlight, setSpotlight] = useState<SpotlightPosition | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({});
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate spotlight position for the target element
  const calculateSpotlight = useCallback((step: WalkthroughStep): SpotlightPosition | null => {
    if (step.position === 'center' || !step.targetSelector) {
      return null;
    }

    const element = document.querySelector(step.targetSelector);
    if (!element) {
      // If element not found, center the spotlight
      return null;
    }

    const rect = element.getBoundingClientRect();
    const padding = step.highlightPadding ?? 8;

    return {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
  }, []);

  // Calculate tooltip position based on spotlight and desired position
  const calculateTooltipPosition = useCallback((
    step: WalkthroughStep,
    spotlightPos: SpotlightPosition | null
  ): TooltipPosition => {
    const tooltipEl = tooltipRef.current;
    if (!tooltipEl) return { top: 50, left: 50 };

    const tooltipRect = tooltipEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 16;

    // Center position (no target or center explicitly requested)
    if (step.position === 'center' || !spotlightPos) {
      return {
        top: viewportHeight / 2 - tooltipRect.height / 2,
        left: viewportWidth / 2 - tooltipRect.width / 2,
      };
    }

    const position = step.position ?? 'bottom';
    let pos: TooltipPosition = {};

    switch (position) {
      case 'top':
        pos = {
          left: Math.max(margin, Math.min(
            spotlightPos.left + spotlightPos.width / 2 - tooltipRect.width / 2,
            viewportWidth - tooltipRect.width - margin
          )),
          bottom: viewportHeight - spotlightPos.top + 16,
        };
        break;
      case 'bottom':
        pos = {
          left: Math.max(margin, Math.min(
            spotlightPos.left + spotlightPos.width / 2 - tooltipRect.width / 2,
            viewportWidth - tooltipRect.width - margin
          )),
          top: spotlightPos.top + spotlightPos.height + 16,
        };
        break;
      case 'left':
        pos = {
          right: viewportWidth - spotlightPos.left + 16,
          top: Math.max(margin, Math.min(
            spotlightPos.top + spotlightPos.height / 2 - tooltipRect.height / 2,
            viewportHeight - tooltipRect.height - margin
          )),
        };
        break;
      case 'right':
        pos = {
          left: spotlightPos.left + spotlightPos.width + 16,
          top: Math.max(margin, Math.min(
            spotlightPos.top + spotlightPos.height / 2 - tooltipRect.height / 2,
            viewportHeight - tooltipRect.height - margin
          )),
        };
        break;
    }

    return pos;
  }, []);

  // Update positions when step changes or window resizes
  useEffect(() => {
    if (!isActive || !currentStep) {
      setIsVisible(false);
      return;
    }

    const updatePositions = () => {
      const newSpotlight = calculateSpotlight(currentStep);
      setSpotlight(newSpotlight);

      // Small delay to ensure tooltip is rendered for position calculation
      requestAnimationFrame(() => {
        const newTooltipPos = calculateTooltipPosition(currentStep, newSpotlight);
        setTooltipPos(newTooltipPos);
        setIsVisible(true);
      });
    };

    updatePositions();

    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions, true);

    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
    };
  }, [isActive, currentStep, calculateSpotlight, calculateTooltipPosition]);

  // Handle route navigation if step has a route
  useEffect(() => {
    if (!isActive) return;
    if (currentStep?.route && window.location.pathname !== currentStep.route) {
      window.history.pushState({}, '', currentStep.route);
      // Trigger a navigation event for React Router
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, [currentStep, isActive]);

  if (!isActive || !currentStep) return null;

  return (
    <div className="fixed inset-0 z-[100]" aria-live="polite">
      {/* Dark overlay with spotlight cutout */}
      <div className="absolute inset-0 animate-fade-in">
        <svg className="w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {spotlight && (
                <rect
                  x={spotlight.left}
                  y={spotlight.top}
                  width={spotlight.width}
                  height={spotlight.height}
                  rx="8"
                  fill="black"
                  className="transition-all duration-500 ease-out"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
            className="transition-all duration-300"
          />
        </svg>
      </div>

      {/* Highlight border around target */}
      {spotlight && (
        <div
          className="absolute pointer-events-none transition-all duration-500 ease-out"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4)',
            borderRadius: '8px',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`
          absolute max-w-sm w-[calc(100vw-2rem)] sm:w-96
          bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
          border border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
        style={{
          ...tooltipPos,
          maxHeight: 'calc(100vh - 2rem)',
        }}
      >
        {/* Header with progress */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={skipWalkthrough}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Skip tour"
              title="Skip tour (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {currentStep.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Footer with navigation */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {/* Step dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {}}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-200
                    ${index === currentStepIndex
                      ? 'w-6 bg-blue-500'
                      : index < currentStepIndex
                        ? 'bg-blue-300'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }
                  `}
                  aria-label={`Go to step ${index + 1}`}
                  aria-current={index === currentStepIndex ? 'step' : undefined}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2 ml-auto">
              {hasPrevStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  className="hidden sm:flex"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}

              {!hasNextStep ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={completeWalkthrough}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Finish
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={nextStep}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Keyboard hints */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">←</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">→</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">Esc</kbd>
              Skip
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WALKTHROUGH TRIGGER BUTTON
// ============================================================================

interface WalkthroughTriggerProps {
  className?: string;
  variant?: 'icon' | 'button' | 'ghost';
  label?: string;
}

export function WalkthroughTrigger({
  className = '',
  variant = 'ghost',
  label = 'Start Tour',
}: WalkthroughTriggerProps) {
  const { startWalkthrough, steps } = useWalkthroughContext();

  const handleClick = () => {
    startWalkthrough();
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`
          p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100
          dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700
          transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
          ${className}
        `}
        title="Start tour"
        aria-label="Start tour"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        onClick={handleClick}
        variant="outline"
        size="sm"
        className={className}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {label}
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        text-gray-600 hover:text-gray-900 hover:bg-gray-100
        dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `}
    >
      <HelpCircle className="w-4 h-4" />
      {label}
    </button>
  );
}

// ============================================================================
// WALKTHROUGH COMPLETION BADGE
// ============================================================================

export function WalkthroughCompletionBadge() {
  const { isCompleted, isSkipped, resetWalkthrough } = useWalkthroughContext();

  if (!isCompleted && !isSkipped) return null;

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        ${isCompleted
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }
      `}
    >
      {isCompleted ? (
        <>
          <Check className="w-4 h-4" />
          Tour completed
        </>
      ) : (
        <>
          <X className="w-4 h-4" />
          Tour skipped
        </>
      )}
      <button
        onClick={resetWalkthrough}
        className="ml-1 text-xs underline hover:no-underline"
      >
        Reset
      </button>
    </div>
  );
}


// Re-export types for convenience
export type { WalkthroughStep } from '@app/context/WalkthroughContext';
export type { WalkthroughTriggerProps };