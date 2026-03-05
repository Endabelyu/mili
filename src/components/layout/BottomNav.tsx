import { NavLink, useLocation } from 'react-router';
import { Home, Repeat, PieChart, User, Plus } from 'lucide-react';


export function BottomNav() {
  const location = useLocation();

  const path = location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      {/* Background blur container with top border */}
      <div className="bg-[var(--card-bg)] backdrop-blur-2xl border-t border-[var(--card-border)] flex h-[72px] items-stretch px-2 relative">
        {/* Left two tabs */}
        <div className="flex flex-1 items-stretch justify-around">
          <NavTab to="/" icon={Home} label="Home" active={path === '/'} />
          <NavTab
            to="/transactions"
            icon={Repeat}
            label="Transaksi"
            active={path.startsWith('/transactions') && path !== '/transactions/new'}
          />
        </div>

        {/* Center FAB */}
        <div className="relative flex items-center justify-center px-4 w-16">
          <div className="absolute -top-7">
            <NavLink
              to="/transactions?new=true"
              className="w-16 h-16 bg-gradient-to-br from-[var(--gradient-hero-start)] to-[var(--gradient-hero-end)] rounded-[1.25rem] flex items-center justify-center active:scale-95 transition-transform shadow-xl shadow-[var(--gradient-hero-start)]/30 text-white"
            >
              <Plus className="w-8 h-8" strokeWidth={2.5} />
            </NavLink>
          </div>
        </div>

        {/* Right two tabs */}
        <div className="flex flex-1 items-stretch justify-around">
          <NavTab
            to="/budget"
            icon={PieChart}
            label="Budgets"
            active={path.startsWith('/budget')}
          />
          <NavTab
            to="/profile"
            icon={User}
            label="Profil"
            active={path.startsWith('/profile')}
          />
        </div>
      </div>
    </nav>
  );
}

function NavTab({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <NavLink
      to={to}
      className="group relative flex flex-col items-center justify-center flex-1 gap-1"
    >
      <Icon
        className={`w-6 h-6 transition-colors ${active ? 'text-[var(--gradient-hero-start)] drop-shadow-sm' : 'text-[var(--text-secondary)] peer-hover:text-[var(--text-primary)]'}`}
        strokeWidth={active ? 2.5 : 2}
      />
      <span className={`text-[10px] font-bold tracking-wide transition-colors ${active ? 'text-[var(--gradient-hero-start)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
        {label}
      </span>
    </NavLink>
  );
}
