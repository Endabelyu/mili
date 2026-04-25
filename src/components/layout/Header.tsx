import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router';
import { Menu, Plus, Bell, ArrowLeft } from 'lucide-react';
// We've removed ThemeToggle for now, keeping it clean

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
  const navigate = useNavigate();
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

  // In the new design, the Home/Dashboard header is rendered inline, so we hide this on mobile
  // *unless* it's a subpage where we need the back button or specific title.
  const isDashboard = location.pathname === '/';

  return (
    <>
      {/* Mobile Header - Hidden on Dashboard, shown on subpages/other pages */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-30 lg:hidden
          transition-all duration-300 ease-out
          ${isDashboard ? 'hidden' : 'flex'}
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
          ${isScrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-black/5'
            : 'bg-transparent'
          }
        `}
      >
        <div className="flex items-center justify-between h-14 w-full px-4 mt-safe">
          {/* Left: Back or Menu */}
          {isSubPage ? (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-11 h-11 -ml-1 rounded-full active:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-[#1a1a2e]" />
            </button>
          ) : (
            <button
              onClick={onMenuClick}
              className="w-11 h-11 flex items-center justify-center -ml-2 rounded-full active:bg-zinc-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-[#1a1a2e]" />
            </button>
          )}

          {/* Center: Title */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-safe-half">
            <h1 className="text-[17px] font-bold tracking-tight text-[#1a1a2e]">
              {pageTitle}
            </h1>
          </div>

          {/* Right: Empty for balance */}
          <div className="w-11 h-11" />
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:flex items-center justify-between h-20 px-8 bg-transparent border-b border-[var(--card-border)] backdrop-blur-md sticky top-0 z-20">
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">{pageTitle}</h1>

        <div className="flex items-center gap-3">

          <button
            className="flex items-center justify-center w-10 h-10 rounded-full text-zinc-500 hover:text-zinc-800 hover:bg-white border border-transparent hover:border-zinc-200 transition-all shadow-sm bg-white/50"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          <Link
            to="?new=true"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg text-sm font-bold bg-[#a3e635] text-[#1a1a2e] hover:bg-[#bef264] active:scale-95 transition-all outline-none"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Transaksi</span>
          </Link>
        </div>
      </header>
    </>
  );
}
