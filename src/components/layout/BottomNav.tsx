import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { Home, List, Wallet, MoreHorizontal, Plus, BarChart3, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const path = location.pathname;

  const fabRoute = '?add_options=true';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Floating Action Button */}
      {user?.role !== 'developer' && user?.email !== 'endabelyuproject@gmail.com' && (
        <div className="absolute flex justify-center w-full bottom-[42px] pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <button
            onClick={() => navigate(fabRoute)}
            className="pointer-events-auto w-[68px] h-[68px] rounded-full flex items-center justify-center z-20 transition-transform active:scale-95 border-4 border-[var(--bg)]"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              boxShadow: '0 4px 12px var(--accent-tint)',
            }}
          >
            <Plus className="w-8 h-8" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Nav Bar */}
      <div
        className={`grid ${user?.role === 'developer' || user?.email === 'endabelyuproject@gmail.com' ? 'grid-cols-4' : 'grid-cols-5'} border-t border-[var(--border)] bg-[var(--bg)]`}
        style={{
          padding: '8px 8px calc(8px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {user?.role === 'developer' || user?.email === 'endabelyuproject@gmail.com' ? (
          <>
            <NavTab to="/developer/analytics" icon={BarChart3} label="Statistik" active={path === '/developer/analytics'} />
            <NavTab to="/developer/feedbacks" icon={MessageSquare} label="Umpan Balik" active={path === '/developer/feedbacks'} />
            <NavTab to="/" icon={Home} label="User View" active={path === '/'} />
            <Link to="?menu=true" className="flex flex-col items-center justify-center gap-1 py-1.5">
              <div className="flex items-center justify-center">
                {user.image ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-[var(--border)]">
                    <img src={user.image} className="w-full h-full object-cover" alt="Profile" />
                  </div>
                ) : (
                  <div className="text-[var(--text-dim)]">
                    <MoreHorizontal className="w-6 h-6" strokeWidth={1.8} />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-medium text-[var(--text-dim)]">Lainnya</span>
            </Link>
          </>
        ) : (
          <>
            <NavTab to="/" icon={Home} label="Dasbor" active={path === '/'} />
            <NavTab to="/transactions" icon={List} label="Transaksi" active={path.startsWith('/transactions')} />
            <div className="flex items-center justify-center"></div>
            <NavTab to="/accounts" icon={Wallet} label="Akun" active={path.startsWith('/accounts')} />
            <Link to="?menu=true" className="flex flex-col items-center justify-center gap-1 py-1.5">
              <div className="flex items-center justify-center text-[var(--text-dim)]">
                <MoreHorizontal className="w-6 h-6" strokeWidth={1.8} />
              </div>
              <span className="text-[10px] font-medium text-[var(--text-dim)]">Lainnya</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function NavTab({ to, icon: Icon, label, active }: { to: string; icon: React.ElementType; label: string; active: boolean }) {
  return (
    <NavLink
      to={to}
      className="flex flex-col items-center justify-center gap-1 py-1.5"
    >
      <div className={`flex items-center justify-center transition-colors ${active ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}>
        <Icon className="w-6 h-6" strokeWidth={active ? 2.2 : 1.8} />
      </div>
      <span className={`text-[10px] font-medium transition-colors ${active ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}>
        {label}
      </span>
    </NavLink>
  );
}
