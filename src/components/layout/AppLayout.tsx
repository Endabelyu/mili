import { useEffect } from 'react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { InstallPrompt, OfflineIndicator, UpdatePrompt, IOSInstallPrompt } from '@app/components/pwa';
import { lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const NewTransactionModal = lazy(() => import('../finance/NewTransactionModal').then(module => ({ default: module.NewTransactionModal })));
const TransactionEntryChoice = lazy(() => import('../finance/TransactionEntryChoice').then(module => ({ default: module.TransactionEntryChoice })));
const ScanModal = lazy(() => import('../finance/ScanModal').then(module => ({ default: module.ScanModal })));
const MoreMenuModal = lazy(() => import('./MoreMenuModal').then(module => ({ default: module.MoreMenuModal })));
const CommandPalette = lazy(() => import('../ui/CommandPalette').then(module => ({ default: module.CommandPalette })));
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isScanOpen = searchParams.get('scan') === 'true';

  const handleCloseScan = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('scan');
    navigate({ search: newParams.toString() }, { replace: true });
  };

  // Add safe area CSS variable for notched phones
  useEffect(() => {
    const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
    const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0px';
    
    document.documentElement.style.setProperty('--safe-area-top', safeAreaTop);
    document.documentElement.style.setProperty('--safe-area-bottom', safeAreaBottom);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)] selection:bg-[var(--accent-tint)] flex flex-col lg:grid lg:grid-cols-[260px_1fr] relative w-full overflow-x-hidden">
      <Sidebar />
      
      {/* App Shell */}
      <div className="flex flex-col min-h-screen relative pb-24 lg:pb-0 min-w-0">
        <Topbar />
        
        {/* Main Content */}
        <main className="flex-1 w-full pt-0 bg-[var(--app-bg)]">
          <div className="min-h-full w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-2 lg:px-10 lg:py-4">
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
      <Suspense fallback={null}>
        <NewTransactionModal />
        <TransactionEntryChoice />
        <MoreMenuModal />
        <CommandPalette />
        <ScanModal isOpen={isScanOpen} onClose={handleCloseScan} />
      </Suspense>

      {/* PWA Components */}
      <InstallPrompt />
      <IOSInstallPrompt />
      <OfflineIndicator />
      <UpdatePrompt />
    </div>
  );
}
