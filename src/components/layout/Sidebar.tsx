import { NavLink, useLocation } from 'react-router';
import { 
  LayoutGrid, 
  Activity, 
  Calendar, 
  Wallet, 
  Target, 
  BarChart3, 
  Receipt, 
  Clock, 
  Scan, 
  Bell, 
  User, 
  Settings,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatName } from '../../lib/utils';

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const path = location.pathname;

  return (
    <aside className="hidden lg:flex flex-col w-[260px] border-r border-[var(--border)] bg-[var(--card)] h-screen fixed top-0 left-0 z-50">
      {/* Brand */}
      <div className="px-4 pt-8 ">
        <div className="flex items-center justify-start">
          <img src="/Gemini_Generated_Image_pkgxflpkgxflpkgx-removebg-preview.png" className="h-30 w-auto object-contain -ml-4 -mt-6" alt="Mili Logo" />
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 pb-6 space-y-1 overflow-y-auto custom-scrollbar">
        {user?.role === 'developer' || user?.email === 'endabelyuproject@gmail.com' ? (
          <>
            <p className="px-4 mt-4 text-[10px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider mb-2 opacity-60">Portal Developer</p>
            <SidebarLink to="/developer/analytics" icon={BarChart3} label="Statistik Pengguna" active={path === '/developer/analytics'} />
            <SidebarLink to="/developer/feedbacks" icon={MessageSquare} label="Umpan Balik" active={path === '/developer/feedbacks'} />
            
            <div className="pt-4 mt-6 border-t border-[var(--border)]/50">
              <p className="px-4 text-[10px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider mb-2 opacity-60">Akses Pengguna</p>
              <SidebarLink to="/" icon={LayoutGrid} label="Dasbor User" active={path === '/'} />
            </div>
          </>
        ) : (
          <>
            <SidebarLink to="/" icon={LayoutGrid} label="Dasbor" active={path === '/'} />
            <SidebarLink to="/transactions" icon={Activity} label="Transaksi" active={path.startsWith('/transactions')} />
            <SidebarLink to="/calendar" icon={Calendar} label="Kalender" active={path.startsWith('/calendar')} />
            <SidebarLink to="/accounts" icon={Wallet} label="Akun" active={path.startsWith('/accounts')} />
            <SidebarLink to="/targets" icon={Target} label="Target" active={path.startsWith('/targets')} />
            <SidebarLink to="/analytics" icon={BarChart3} label="Analitik" active={path.startsWith('/analytics')} />
            <SidebarLink to="/budget" icon={Receipt} label="Anggaran" active={path.startsWith('/budget')} />
            <SidebarLink to="/scheduled" icon={Clock} label="Terjadwal" active={path.startsWith('/scheduled')} />
            <SidebarLink to="/scan" icon={Scan} label="Scan Struk" active={path.startsWith('/scan')} />
            <SidebarLink to="/notifications" icon={Bell} label="Notifikasi" active={path.startsWith('/notifications')} />
            <SidebarLink to="/profile" icon={User} label="Profil" active={path.startsWith('/profile')} />
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[var(--border)]">
        <SidebarLink to="/settings" icon={Settings} label="Pengaturan" active={path.startsWith('/settings')} />
        
        <div className="flex items-center gap-3 px-4 py-3 mt-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-[var(--muted)] overflow-hidden flex items-center justify-center border border-[var(--border)]">
             {user?.image ? (
               <img 
                 src={user.image} 
                 className="w-full h-full object-cover" 
                 alt="Foto profil pengguna" 
                 width="36" 
                 height="36" 
                 loading="lazy" 
                 decoding="async" 
               />
             ) : (
               <User className="w-5 h-5 text-[var(--text-dim-2)]" />
             )}
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-[13px] font-bold text-[var(--text)] truncate">{formatName(user?.name)}</p>
             <button onClick={logout} className="text-[11px] font-bold text-[var(--expense)] hover:underline">Keluar</button>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--border)]/50">
          <p className="text-[10px] font-medium text-[var(--text-dim-2)] text-center opacity-70">
            &copy; {new Date().getFullYear()} Mili.<br />Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ to, icon: Icon, label, active }: { to: string; icon: React.ElementType; label: string; active: boolean }) {
  return (
    <NavLink
      to={to}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold transition-all duration-200
        ${active 
          ? 'bg-[var(--accent-tint)] text-[var(--accent)]' 
          : 'text-[var(--text-dim)] hover:bg-[var(--muted)] hover:text-[var(--text)]'}
      `}
    >
      <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
      <span>{label}</span>
    </NavLink>
  );
}
