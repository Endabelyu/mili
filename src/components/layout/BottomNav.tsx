import { NavLink, useLocation } from 'react-router';
import { Home, Receipt, PieChart, User, Plus } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();

  const path = location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      {/* Background container with subtle top shadow */}
      <div className="bg-white shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.08)] flex h-[76px] items-stretch px-2 relative rounded-t-[20px]">
        {/* Left two tabs */}
        <div className="flex flex-1 items-stretch justify-around pt-2 pb-safe">
          <NavTab to="/" icon={Home} label="Home" active={path === '/'} />
          <NavTab
            to="/transactions"
            icon={Receipt}
            label="Transaksi"
            active={path.startsWith('/transactions') && path !== '/transactions/new'}
          />
        </div>

        {/* Center FAB */}
        <div className="relative flex items-center justify-center px-4 w-16">
          <div className="absolute -top-7">
            <NavLink
              to="/transactions?new=true"
              className="w-14 h-14 bg-gradient-to-tr from-[#84cc16] to-[#a3e635] rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-[#a3e635]/40 text-black border-4 border-[var(--app-bg-end)]"
            >
              <Plus className="w-6 h-6" strokeWidth={3} />
            </NavLink>
          </div>
        </div>

        {/* Right two tabs */}
        <div className="flex flex-1 items-stretch justify-around pt-2 pb-safe">
          <NavTab
            to="/budget"
            icon={PieChart}
            label="Budget"
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
        className={`w-6 h-6 transition-colors ${active ? 'text-[#84cc16]' : 'text-[#a1a1aa] peer-hover:text-[#52525b]'}`}
        strokeWidth={active ? 2.5 : 2}
      />
      <span className={`text-[10px] font-bold tracking-wide transition-colors ${active ? 'text-[#84cc16]' : 'text-[#a1a1aa] group-hover:text-[#52525b]'}`}>
        {label}
      </span>
    </NavLink>
  );
}
