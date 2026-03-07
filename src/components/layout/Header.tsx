import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router';
import { Menu, Search, Plus, Bell, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@app/components/ui';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/transactions/new': 'New Transaction',
  '/budget': 'Budget',
  '/budget/new': 'New Budget',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export function Header({ onMenuClick, title }: HeaderProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const pageTitle = title || pageTitles[location.pathname] || 'Finance Tracker';
  const isSubPage = location.pathname.includes('/new') || location.pathname.includes('/edit');

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add background when scrolled
      setIsScrolled(currentScrollY > 10);

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Mobile Header - Hidden as requested to use bottom nav only */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-30 hidden
          transition-all duration-300 ease-out
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
          ${isScrolled
            ? 'bg-white/95 dark:bg-[#1A1C26]/95 backdrop-blur-2xl shadow-sm border-b border-black/5 dark:border-white/5'
            : 'bg-[#FAF5EE]/80 dark:bg-transparent backdrop-blur-sm'
          }
        `}
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Menu or Back */}
          {isSubPage ? (
            <Link
              to=".."
              className="flex items-center justify-center w-11 h-11 -ml-1 rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </Link>
          ) : (
            <button
              onClick={onMenuClick}
              className="flex items-center justify-center w-11 h-11 -ml-1 rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          {/* Center: Title */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white truncate max-w-[160px] sm:max-w-[200px]">
              {pageTitle}
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {!isSubPage && (
              <>
                <button
                  className="flex items-center justify-center w-11 h-11 rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <Link
                  to="/transactions/new"
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-[#2C2D35] dark:bg-[#6372FF] active:opacity-80 text-white transition-colors"
                  aria-label="Add new"
                >
                  <Plus className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:flex items-center justify-between h-20 px-8 bg-transparent border-b border-[var(--card-border)] backdrop-blur-md sticky top-0 z-20">
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">{pageTitle}</h1>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <button
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          <Link
            to="/transactions/new"
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm font-bold"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Transaksi</span>
          </Link>
        </div>
      </header>
    </>
  );
}
