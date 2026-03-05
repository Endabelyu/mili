import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  route?: string;
  highlightPadding?: number;
}

interface WalkthroughState {
  isActive: boolean;
  currentStepIndex: number;
  isCompleted: boolean;
  isSkipped: boolean;
}

interface WalkthroughContextValue extends WalkthroughState {
  steps: WalkthroughStep[];
  currentStep: WalkthroughStep | null;
  progress: number;
  // Actions
  startWalkthrough: (steps?: WalkthroughStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipWalkthrough: () => void;
  completeWalkthrough: () => void;
  goToStep: (index: number) => void;
  resetWalkthrough: () => void;
  // Utils
  hasNextStep: boolean;
  hasPrevStep: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'finance-tracker-walkthrough';

const DEFAULT_STATE: WalkthroughState = {
  isActive: false,
  currentStepIndex: 0,
  isCompleted: false,
  isSkipped: false,
};

// ============================================================================
// CONTEXT
// ============================================================================

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface WalkthroughProviderProps {
  children: ReactNode;
  initialSteps?: WalkthroughStep[];
  autoStartForNewUsers?: boolean;
}

export function WalkthroughProvider({
  children,
  initialSteps = [],
  autoStartForNewUsers = true,
}: WalkthroughProviderProps) {
  const [state, setState] = useState<WalkthroughState>(DEFAULT_STATE);
  const [steps, setSteps] = useState<WalkthroughStep[]>(initialSteps);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Load persisted state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          isCompleted: parsed.isCompleted || false,
          isSkipped: parsed.isSkipped || false,
        }));
        setIsFirstVisit(false);
      } else {
        setIsFirstVisit(true);
      }
    } catch {
      setIsFirstVisit(true);
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isCompleted: state.isCompleted,
          isSkipped: state.isSkipped,
          lastVisit: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [state.isCompleted, state.isSkipped]);

  // Auto-start for new users
  useEffect(() => {
    if (autoStartForNewUsers && isFirstVisit && initialSteps.length > 0) {
      const timer = setTimeout(() => {
        startWalkthrough(initialSteps);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStartForNewUsers, isFirstVisit, initialSteps]);

  // Keyboard navigation
  useEffect(() => {
    if (!state.isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to skip
      if (e.key === 'Escape') {
        e.preventDefault();
        skipWalkthrough();
        return;
      }

      // Arrow right or Enter for next
      if ((e.key === 'ArrowRight' || e.key === 'Enter') && !e.repeat) {
        e.preventDefault();
        nextStep();
        return;
      }

      // Arrow left for previous
      if (e.key === 'ArrowLeft' && !e.repeat) {
        e.preventDefault();
        prevStep();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isActive, state.currentStepIndex, steps.length]);

  const startWalkthrough = useCallback((newSteps?: WalkthroughStep[]) => {
    if (newSteps && newSteps.length > 0) {
      setSteps(newSteps);
    }
    setState({
      isActive: true,
      currentStepIndex: 0,
      isCompleted: false,
      isSkipped: false,
    });
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      if (prev.currentStepIndex >= steps.length - 1) {
        return {
          ...prev,
          isActive: false,
          isCompleted: true,
          isSkipped: false,
        };
      }
      return {
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
      };
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }));
  }, []);

  const skipWalkthrough = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isSkipped: true,
    }));
  }, []);

  const completeWalkthrough = useCallback(() => {
    setState({
      isActive: false,
      currentStepIndex: 0,
      isCompleted: true,
      isSkipped: false,
    });
  }, []);

  const goToStep = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentStepIndex: Math.max(0, Math.min(index, steps.length - 1)),
    }));
  }, [steps.length]);

  const resetWalkthrough = useCallback(() => {
    setState(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const currentStep = steps[state.currentStepIndex] || null;
  const progress = steps.length > 0 ? ((state.currentStepIndex + 1) / steps.length) * 100 : 0;
  const hasNextStep = state.currentStepIndex < steps.length - 1;
  const hasPrevStep = state.currentStepIndex > 0;

  const value: WalkthroughContextValue = {
    ...state,
    steps,
    currentStep,
    progress,
    startWalkthrough,
    nextStep,
    prevStep,
    skipWalkthrough,
    completeWalkthrough,
    goToStep,
    resetWalkthrough,
    hasNextStep,
    hasPrevStep,
  };

  return (
    <WalkthroughContext.Provider value={value}>
      {children}
    </WalkthroughContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useWalkthroughContext(): WalkthroughContextValue {
  const context = useContext(WalkthroughContext);
  if (!context) {
    throw new Error('useWalkthroughContext must be used within a WalkthroughProvider');
  }
  return context;
}

export function useWalkthrough(): WalkthroughContextValue {
  return useWalkthroughContext();
}

export function useIsWalkthroughActive(): boolean {
  const context = useContext(WalkthroughContext);
  return context?.isActive ?? false;
}
