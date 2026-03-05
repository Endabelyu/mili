import { useState } from 'react';
import { type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { useLoaderData, useNavigate, Link } from 'react-router';
import { requireSession } from '@app/lib/auth.server';
import { signOut } from '@app/lib/auth-client';
import {
  User,
  LogOut,
  Bell,
  Shield,
  Download,
  ChevronRight,
  Moon,
} from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'Profil | Finance Tracker' },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireSession(request);
  return Response.json({ user: session.user });
}

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}

function SettingRow({ icon: Icon, label, description, onClick, href, danger }: SettingRowProps) {
  const inner = (
    <>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-500/10' : 'bg-[var(--text-primary)]/5'}`}>
        <Icon className={`w-4 h-4 ${danger ? 'text-red-500' : 'text-[var(--text-primary)]'}`} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
    </>
  );

  const cls = `w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--text-primary)]/5 transition-colors ${danger ? 'text-red-500' : 'text-[var(--text-primary)]'}`;

  if (href) return <Link to={href} className={cls}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

export default function ProfilePage() {
  const { user } = useLoaderData<{ user: { name: string; email: string; image?: string } }>();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/transactions');
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Gagal mengekspor data. Coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-28 animate-fade-in pt-2">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-[var(--gradient-hero-start)] to-[var(--gradient-hero-end)] shadow-xl shadow-[var(--gradient-hero-start)]/20 rounded-[2rem] p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{user.name || 'User'}</h1>
            <p className="text-white/60 text-sm truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="glass-card rounded-[2rem] border border-[var(--card-border)] overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Akun</p>
        </div>
        <div className="divide-y divide-[var(--text-primary)]/5">
          <SettingRow icon={User} label="Edit Profil" description="Ubah nama dan foto profil" href="/profile/edit" />
          <SettingRow icon={Bell} label="Notifikasi" description="Atur preferensi pemberitahuan" onClick={() => alert('Fitur ini akan segera hadir!')} />
          <SettingRow icon={Shield} label="Keamanan" description="Ubah kata sandi" href="/profile/security" />
        </div>
      </div>

      {/* App Settings */}
      <div className="glass-card rounded-[2rem] border border-[var(--card-border)] overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Preferensi</p>
        </div>
        <div className="divide-y divide-[var(--text-primary)]/5">
          <SettingRow icon={Moon} label="Pengaturan Tema" description="Terang / Gelap / Sistem" href="/settings" />
          <SettingRow
            icon={Download}
            label={isExporting ? 'Mengekspor...' : 'Ekspor Data'}
            description="Unduh data transaksi sebagai CSV"
            onClick={handleExport}
          />
        </div>
      </div>

      {/* Logout */}
      <div className="glass-card rounded-[2rem] border border-[var(--card-border)] overflow-hidden">
        <SettingRow
          icon={LogOut}
          label="Keluar"
          onClick={handleLogout}
          danger
        />
      </div>

      <p className="text-center text-xs text-[var(--text-secondary)] pb-2">Finance Tracker v1.0</p>
    </div>
  );
}
