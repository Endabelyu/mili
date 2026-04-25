import { useEffect } from 'react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { InstallPrompt, OfflineIndicator, UpdatePrompt } from '@app/components/pwa';
import { NewTransactionModal } from '../finance/NewTransactionModal';
import { MoreMenuModal } from './MoreMenuModal';
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
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)] selection:bg-[var(--accent-tint)] flex flex-col lg:flex-row relative w-full overflow-x-hidden">
      <Sidebar />
      
      {/* App Shell */}
      <div className="flex flex-col min-h-screen flex-1 relative pb-24 lg:pb-0 lg:pl-[260px]">
        <Topbar />
        
        {/* Main Content */}
        <main className="flex-1 w-full pt-0 bg-[var(--app-bg)]">
          <div className="min-h-full w-full max-w-[1280px] mx-auto px-6 py-2 lg:px-10 lg:py-4">
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
      <NewTransactionModal />
      <MoreMenuModal />

      {/* PWA Components */}
      <InstallPrompt />
      <OfflineIndicator />
      <UpdatePrompt />
    </div>
  );
}
