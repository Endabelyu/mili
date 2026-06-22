import { X, Target, Calendar, TrendingUp, DollarSign, Bell, Scan, User, Settings, LogOut, Shield, MessageSquare, ClipboardList } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const MENU_ITEMS = [
  { path: '/targets', icon: Target, title: 'Target', subtitle: 'Target finansial' },
  { path: '/calendar', icon: Calendar, title: 'Kalender', subtitle: 'Riwayat per hari' },
  { path: '/analytics', icon: TrendingUp, title: 'Analitik', subtitle: 'Statistik & insight' },
  { path: '/budget', icon: DollarSign, title: 'Anggaran', subtitle: 'Anggaran per kategori' },
  { path: '/scheduled', icon: Bell, title: 'Transaksi Terjadwal', subtitle: 'Tagihan berulang' },
  { path: '/scan', icon: Scan, title: 'Scan Struk', subtitle: 'Pindai struk' },
  { path: '/notifications', icon: Bell, title: 'Notifikasi', subtitle: 'Pemberitahuan' },
  { path: '/profile', icon: User, title: 'Akun', subtitle: 'Kelola Akun' },
  { path: '/settings', icon: Settings, title: 'Pengaturan', subtitle: 'Preferensi Aplikasi' },
];

export function MoreMenuModal() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchParams] = useSearchParams();
  const isOpen = searchParams.get('menu') === 'true';

  const handleClose = () => {
    searchParams.delete('menu');
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/auth/login');
  };

  const { user } = useAuth();

  const menuItems = user?.role === 'developer'
    ? [
        { path: '/developer/analytics', icon: Shield, title: 'Statistik', subtitle: 'Statistik Sistem' },
        { path: '/developer/feedbacks', icon: MessageSquare, title: 'Umpan Balik', subtitle: 'User Feedback' },
        { path: '/developer/activities', icon: ClipboardList, title: 'Log Aktivitas', subtitle: 'Aktivitas Pengguna' },
        ...MENU_ITEMS.map(item => ({ ...item, title: `${item.title} User` }))
      ]
    : MENU_ITEMS;


  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-[90] animate-fade-in backdrop-blur-sm lg:hidden"
        onClick={handleClose}
      />

      <div className="fixed inset-x-0 bottom-0 bg-[var(--bg)] z-[100] flex flex-col animate-slide-up rounded-t-[32px] lg:hidden pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between p-6 shrink-0 relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-[var(--border)] rounded-full" />
          <h2 className="text-[18px] font-bold text-[var(--text)] mt-2">Menu Lainnya</h2>
          <button 
            onClick={handleClose} 
            className="w-10 h-10 mt-2 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] transition-colors hover:bg-[var(--border)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid */}
        <div className="px-6 pb-2 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleClose}
                className="bg-[#F6F5F2] dark:bg-[var(--card)] p-4 rounded-2xl flex flex-col items-center text-center gap-3 active:scale-95 transition-transform"
              >
                <div className="w-11 h-11 rounded-[14px] bg-[var(--accent-tint)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[var(--text)]">{item.title}</h3>
                  <p className="text-[11px] font-medium text-[var(--text-dim-2)] mt-0.5">{item.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Logout Section */}
        <div className="p-6 pt-2">
          <button 
            onClick={handleLogout}
            className="w-full h-14 rounded-2xl bg-[var(--muted)] text-[15px] font-bold text-[#F04438] flex items-center justify-center gap-3 transition-colors active:bg-[var(--border)] active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5" />
            Keluar dari Aplikasi
          </button>
        </div>

        <div className="pb-8 pt-2 border-t border-[var(--border)]/50">
          <p className="text-[10px] font-medium text-[var(--text-dim-2)] text-center opacity-70">
            &copy; {new Date().getFullYear()} Mili • v2.0.0<br />
            Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </>
  );
}
