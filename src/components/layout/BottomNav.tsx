import { NavLink, useLocation, useNavigate } from 'react-router';
import { Activity, Receipt, Wallet, Settings, Plus } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Derive dynamic FAB state based on current route
  let fabHidden = false;
  let fabPosition: 'center' | 'right' = 'center';
  let fabColor: 'green' | 'orange' | 'glow' = 'green';
  let fabRoute = '/transactions?new=true';

  // Gamification pages and Dashboard (Wallet)
  if (path === '/' || path.startsWith('/rewards')) {
    fabHidden = true;
  } 
  // Challenge detail
  else if (path.startsWith('/challenge')) {
    fabPosition = 'right';
    fabColor = 'orange';
  }
  // Flow/Transactions
  else if (path.startsWith('/transactions')) {
    fabPosition = 'right';
    fabColor = 'green';
  }
  // Budget/Bills
  else if (path.startsWith('/budget')) {
    fabPosition = 'right';
    fabColor = 'green';
  }
  // Settings/Profile
  else if (path.startsWith('/profile') || path.startsWith('/settings')) {
    fabPosition = 'center';
    fabColor = 'green';
  }

  // Handle Dark Mode new expense route
  if (location.search.includes('new=true')) {
    fabColor = 'glow';
    fabPosition = 'center';
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Floating Action Button Layer */}
      {!fabHidden && (
        <div 
          className={`absolute flex pointer-events-none w-full px-4 ${
            fabPosition === 'right' ? 'justify-end bottom-24' : 'justify-center bottom-6'
          }`}
        >
          <button
            onClick={() => navigate(fabRoute)}
            className={`
              pointer-events-auto rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 z-20
              ${fabPosition === 'right' ? 'w-14 h-14' : 'w-16 h-16'}
              ${fabColor === 'green' ? 'bg-[var(--duit-green)] text-[#1a1a2e] shadow-[#a3e635]/40 border-[5px] border-[var(--app-bg)]' : ''}
              ${fabColor === 'orange' ? 'bg-[#ff914d] text-white shadow-[#ff914d]/40' : ''}
              ${fabColor === 'glow' ? 'bg-[var(--duit-green)] text-[#1a1a2e] shadow-[0_0_20px_rgba(163,230,53,0.6)] border-4 border-black' : ''}
            `}
          >
            <Plus className="w-7 h-7" strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Nav Bar Background */}
      <div className={`
        flex h-[76px] items-stretch px-2 relative z-10 
        ${location.search.includes('new=true') ? 'bg-[#09090b]' : 'bg-white shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.06)] rounded-t-[32px]'}
      `}>
        {/* Left two tabs */}
        <div className="flex flex-1 items-stretch justify-around pt-3 pb-safe">
          <NavTab to="/transactions" icon={Activity} label="FLOW" active={path.startsWith('/transactions')} />
          <NavTab to="/budget" icon={Receipt} label="BILLS" active={path.startsWith('/budget')} />
        </div>

        {/* Center spacing if FAB is centered */}
        {fabPosition === 'center' && !fabHidden && (
          <div className="w-16" />
        )}

        {/* Right two tabs */}
        <div className="flex flex-1 items-stretch justify-around pt-3 pb-safe">
          <NavTab to="/" icon={Wallet} label="WALLET" active={path === '/'} />
          <NavTab to="/profile" icon={Settings} label="SETTINGS" active={path.startsWith('/profile') || path.startsWith('/settings')} />
        </div>
      </div>
    </nav>
  );
}

function NavTab({ to, icon: Icon, label, active }: { to: string; icon: React.ElementType; label: string; active: boolean }) {
  const location = useLocation();
  const isDarkMode = location.search.includes('new=true'); // simplistic check for demo

  return (
    <NavLink
      to={to}
      className="group relative flex flex-col items-center justify-start pt-1 flex-1 gap-1"
    >
      <div className={`
        flex rounded-xl p-1 transition-all
        ${active && isDarkMode ? 'bg-[#a3e635] text-black' : ''}
        ${!active && isDarkMode ? 'text-zinc-500' : ''}
        ${active && !isDarkMode ? 'text-[#84cc16]' : ''}
        ${!active && !isDarkMode ? 'text-[#a1a1aa]' : ''}
      `}>
        <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className={`text-[9px] font-extrabold tracking-wider uppercase transition-colors 
        ${active && isDarkMode ? 'text-[#a3e635]' : ''}
        ${!active && isDarkMode ? 'text-zinc-600' : ''}
        ${active && !isDarkMode ? 'text-[#84cc16]' : ''}
        ${!active && !isDarkMode ? 'text-[#a1a1aa]' : ''}
      `}>
        {label}
      </span>
    </NavLink>
  );
}
