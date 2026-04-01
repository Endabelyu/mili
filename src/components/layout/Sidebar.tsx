import { NavLink, Link } from 'react-router';
import { 
  Home,
  Receipt,
  PieChart,
  BarChart3,
  X,
  Settings,
  User,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useEffect, useRef } from 'react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/transactions', label: 'Transactions', icon: Receipt },
  { path: '/budget', label: 'Budget', icon: PieChart },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, isLoading: isPending, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.[0].toUpperCase() || '?';

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
    await logout();
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`
          fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden
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
          bg-white text-[#1a1a2e]
          border-r border-zinc-100
          shadow-2xl shadow-black/10
          transform transition-transform duration-300 ease-out
          flex flex-col
          lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 bg-[#fbfbf9] border-b border-zinc-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-full bg-[#ecfccb] border-2 border-white flex items-center justify-center text-[#4d7c0f] font-bold text-xl shadow-sm">
              {user?.image ? (
                <img src={user.image} alt={user.name || user.email} className="w-full h-full rounded-full object-cover" />
              ) : (
                userInitials
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-base font-bold text-[#1a1a2e] truncate">
            {isPending ? '...' : (user?.name || user?.email || 'Guest')}
          </p>
          <p className="text-xs text-zinc-500 truncate">
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
                flex items-center gap-3 px-4 py-3 rounded-2xl
                text-sm font-semibold transition-all duration-200 min-h-[48px]
                ${isActive
                  ? 'bg-[#ecfccb] text-[#3f6212]'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-[#1a1a2e]'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="my-3 h-px bg-zinc-100" />

          {/* Settings */}
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all min-h-[48px] ${
                isActive ? 'bg-[#ecfccb] text-[#3f6212]' : 'text-zinc-500 hover:bg-zinc-50 hover:text-[#1a1a2e]'
              }`
            }
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">Settings</span>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </NavLink>
        </nav>

        {/* Footer - Sign Out */}
        <div className="p-4 border-t border-zinc-100">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all min-h-[48px] mb-1 ${
                isActive ? 'bg-[#ecfccb] text-[#3f6212]' : 'text-zinc-500 hover:bg-zinc-50 hover:text-[#1a1a2e]'
              }`
            }
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <span>Profil</span>
          </NavLink>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors min-h-[48px]"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-[#fbfbf9] text-[#1a1a2e] border-r border-zinc-200 fixed left-0 top-0">
        {/* Logo */}
        <div className="p-8 border-b border-zinc-200 bg-white">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#a3e635] flex items-center justify-center shadow-sm shadow-[#a3e635]/20">
              <PieChart className="w-5 h-5 text-[#1a1a2e]" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#1a1a2e] leading-tight flex items-center gap-1">FlowState <span className="text-lg leading-none">✨</span></h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Finance Tracker</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto bg-[#fbfbf9]">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 min-h-[48px]
                ${isActive
                  ? 'bg-white shadow-sm border border-zinc-200/60 text-[#1a1a2e]'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-[#1a1a2e]'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-[#fbfbf9] space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all min-h-[48px] ${
                isActive ? 'bg-white shadow-sm border border-zinc-200/60 text-[#1a1a2e]' : 'text-zinc-500 hover:bg-zinc-100 hover:text-[#1a1a2e]'
              }`
            }
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Settings</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all min-h-[48px] ${
                isActive ? 'bg-white shadow-sm border border-zinc-200/60 text-[#1a1a2e]' : 'text-zinc-500 hover:bg-zinc-100 hover:text-[#1a1a2e]'
              }`
            }
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <span>Profile</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
