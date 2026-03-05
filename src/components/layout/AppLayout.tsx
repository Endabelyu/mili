import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { InstallPrompt, OfflineIndicator, UpdatePrompt } from '@app/components/pwa';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Add safe area CSS variable for notched phones
  useEffect(() => {
    const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
    const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0px';
    
    document.documentElement.style.setProperty('--safe-area-top', safeAreaTop);
    document.documentElement.style.setProperty('--safe-area-bottom', safeAreaBottom);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-[#2C2D35] dark:text-gray-100 selection:bg-[#2C2D35]/20 flex flex-col relative w-full overflow-x-hidden">
      {/* Main Sidebar Component (Handles both Mobile and Desktop internally) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* App Shell */}
      <div className="lg:ml-64 flex flex-col min-h-screen w-full relative">
        {/* Main Content */}
        <main
          className="
            flex-1 w-full
            pt-2
            pb-32 lg:pb-8
          "
        >
          <div className="min-h-full px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* PWA Components */}
      <InstallPrompt />
      <OfflineIndicator />
      <UpdatePrompt />
      
      {/* Safe Area Styles */}
      <style>{`
        .safe-area-pt {
          padding-top: max(env(safe-area-inset-top), 0px);
        }
        .safe-area-pb {
          padding-bottom: max(env(safe-area-inset-bottom), 16px);
        }
        
        /* Ensure 44px minimum touch targets */
        @media (pointer: coarse) {
          button, a, [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
}
