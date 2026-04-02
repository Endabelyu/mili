import { useEffect } from 'react';
import { BottomNav } from './BottomNav';
import { InstallPrompt, OfflineIndicator, UpdatePrompt } from '@app/components/pwa';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Add safe area CSS variable for notched phones
  useEffect(() => {
    const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
    const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0px';
    
    document.documentElement.style.setProperty('--safe-area-top', safeAreaTop);
    document.documentElement.style.setProperty('--safe-area-bottom', safeAreaBottom);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)] selection:bg-[var(--duit-green)]/30 flex flex-col relative w-full overflow-x-hidden">
      {/* App Shell */}
      <div className="flex flex-col min-h-screen w-full relative pb-24">
        {/* Main Content */}
        <main className="flex-1 w-full pt-0">
          <div className="min-h-full w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <BottomNav />

      {/* PWA Components */}
      <InstallPrompt />
      <OfflineIndicator />
      <UpdatePrompt />
    </div>
  );
}
