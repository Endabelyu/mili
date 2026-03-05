import { NavLink, Link } from 'react-router';
import { 
  LayoutDashboard, 
  Wallet, 
  PiggyBank, 
  BarChart3, 
  Receipt, 
  X, 
  Settings, 
  User,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Monitor,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useSession, signOut } from '@app/lib/auth-client';
import { useTheme } from '@app/hooks/useTheme';
import { useWalkthrough } from '@app/hooks/useWalkthrough';
import { defaultWalkthroughSteps } from '@app/lib/walkthrough-steps';
import { useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: Receipt },
  { path: '/budget', label: 'Budget', icon: PiggyBank },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session, isPending } = useSession();
  const { theme, effectiveTheme, setTheme, mounted } = useTheme();
  const { startWalkthrough } = useWalkthrough();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const user = session?.user;
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.[0].toUpperCase() || '?';

  const isDark = ['midnight-blue', 'warm-charcoal', 'deep-purple'].includes(effectiveTheme);
  const ThemeIcon = mounted && isDark ? Sun : Moon;

  // Handle swipe to close
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      
      const touchX = e.touches[0].clientX;
      const diff = touchX - touchStartX.current;
      
      // Swipe left to close (when diff is negative and significant)
      if (diff < -80 && touchStartX.current < 100) {
        onClose();
        touchStartX.current = null;
      }
    };

    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener('touchstart', handleTouchStart, { passive: true });
      sidebar.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener('touchstart', handleTouchStart);
        sidebar.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden
          transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw]
          bg-white dark:bg-[#1A1C26]
          border-r-2 border-[#2C2D35]/10 dark:border-white/5
          shadow-2xl shadow-black/10
          transform transition-transform duration-300 ease-out
          flex flex-col
          lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* User Profile Section */}
        <div className="p-5 bg-[#2C2D35] dark:bg-[#13151C]">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white font-bold text-lg">
              {user?.image ? (
                <img src={user.image} alt={user.name || user.email} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                userInitials
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm font-semibold text-white truncate">
            {isPending ? '...' : (user?.name || user?.email || 'Guest')}
          </p>
          <p className="text-xs text-white/50 truncate">
            {user?.email && user.name ? user.email : ''}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl
                text-sm font-semibold transition-all duration-200 min-h-[48px]
                ${isActive
                  ? 'bg-[#2C2D35] text-white dark:bg-white/10 dark:text-white'
                  : 'text-[#2C2D35]/60 dark:text-white/50 hover:bg-[#2C2D35]/8 hover:text-[#2C2D35] dark:hover:bg-white/5 dark:hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="my-2 h-px bg-[#2C2D35]/8 dark:bg-white/5" />

          {/* Help */}
          <button
            onClick={() => { onClose(); startWalkthrough(defaultWalkthroughSteps); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#2C2D35]/60 dark:text-white/50 hover:bg-[#2C2D35]/8 hover:text-[#2C2D35] dark:hover:bg-white/5 dark:hover:text-white transition-colors min-h-[48px]"
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            <span>Help & Tour</span>
          </button>

          {/* Settings — navigate to /settings page */}
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                isActive ? 'bg-[#2C2D35] text-white dark:bg-white/10 dark:text-white' : 'text-[#2C2D35]/60 dark:text-white/50 hover:bg-[#2C2D35]/8 hover:text-[#2C2D35] dark:hover:bg-white/5 dark:hover:text-white'
              }`
            }
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">Settings</span>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </NavLink>
        </nav>

        {/* Footer - Sign Out */}
        <div className="p-4 border-t-2 border-[#2C2D35]/8 dark:border-white/5">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] mb-1 ${
                isActive ? 'bg-[#2C2D35] text-white dark:bg-white/10 dark:text-white' : 'text-[#2C2D35]/60 dark:text-white/50 hover:bg-[#2C2D35]/8 hover:text-[#2C2D35] dark:hover:bg-white/5 dark:hover:text-white'
              }`
            }
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <span>Profil</span>
          </NavLink>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors min-h-[48px]"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r-2 border-[#2C2D35]/10 fixed left-0 top-0">
        {/* Logo */}
        <div className="p-6 border-b-2 border-[#2C2D35]/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2C2D35] flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#2C2D35] leading-tight">Finance</h1>
              <p className="text-xs text-slate-400">Tracker</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[48px]
                ${isActive
                  ? 'bg-[#2C2D35] text-white'
                  : 'text-[#2C2D35]/60 hover:bg-[#2C2D35]/8 hover:text-[#2C2D35]'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Theme & User Footer */}
        <div className="p-4 border-t-2 border-[#2C2D35]/10 space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                isActive ? 'bg-[#2C2D35] text-white' : 'text-[#2C2D35]/60 hover:bg-[#2C2D35]/8 hover:text-[#2C2D35]'
              }`
            }
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <span>Profil</span>
          </NavLink>
          <p className="text-xs text-slate-400 text-center pt-2">
            © {new Date().getFullYear()} Finance Tracker
          </p>
        </div>
      </aside>
    </>
  );
}
