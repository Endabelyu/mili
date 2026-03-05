import {
  useWalkthroughContext,
  useIsWalkthroughActive,
  type WalkthroughStep,
} from '@app/context/WalkthroughContext';

// Re-export for convenience
export { useWalkthroughContext as useWalkthrough, useIsWalkthroughActive };
export type { WalkthroughStep };

/**
 * Hook to check if the walkthrough is currently on a specific step
 */
export function useIsWalkthroughStep(stepId: string): boolean {
  const { isActive, currentStep } = useWalkthroughContext();
  return isActive && currentStep?.id === stepId;
}

/**
 * Hook to get the current walkthrough step index
 */
export function useWalkthroughStepIndex(): number {
  const { currentStepIndex } = useWalkthroughContext();
  return currentStepIndex;
}

/**
 * Hook to check if walkthrough has been completed
 */
export function useWalkthroughStatus(): {
  isCompleted: boolean;
  isSkipped: boolean;
  hasSeenWalkthrough: boolean;
} {
  const { isCompleted, isSkipped } = useWalkthroughContext();
  return {
    isCompleted,
    isSkipped,
    hasSeenWalkthrough: isCompleted || isSkipped,
  };
}
