import { useState } from 'react';
import { type MetaFunction, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  User,
  LogOut,
  Bell,
  Shield,
  Download,
  ChevronRight,
  Moon,
  Sparkles
} from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'Profil | Finance Tracker' },
];

function SettingRow({ icon: Icon, label, description, onClick, href, danger }: any) {
  const content = (
    <div className={`flex items-center gap-4 p-4 w-full transition-colors active:bg-zinc-50 lg:hover:bg-zinc-50 ${danger ? 'text-[#ef4444]' : 'text-[#1a1a2e]'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${danger ? 'bg-[#fef2f2] text-[#ef4444]' : 'bg-[#f4f4f5] text-[#1a1a2e]'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[15px] font-bold leading-tight">{label}</p>
        {description && <p className={`text-[13px] font-medium mt-0.5 ${danger ? 'text-[#ef4444]/70' : 'text-[#71717a]'}`}>{description}</p>}
      </div>
      <ChevronRight className={`w-4 h-4 flex-shrink-0 ${danger ? 'text-[#ef4444]/40' : 'text-[#a1a1aa]'}`} />
    </div>
  );

  if (href) return <Link to={href} className="block">{content}</Link>;
  return <button type="button" onClick={onClick} className="w-full block">{content}</button>;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/export/transactions', {
        credentials: 'include'
      });
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
    <div className="max-w-xl mx-auto space-y-4 md:space-y-6 pb-28 md:pb-8 pt-4 lg:pt-8 px-4 animate-fade-in">
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#1a1a2e] tracking-tight">Profil</h1>
          <p className="text-sm font-medium text-[#71717a]">Kelola akun Anda</p>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="flow-card p-6 border-none shadow-sm shadow-[#ecfccb]/50 bg-[#f0fdf4]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#a3e635] flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm overflow-hidden">
            {user.image ? (
              <img src={user.image} alt={user.name || undefined} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[22px] font-extrabold text-[#3f6212]">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold text-[#1a1a2e] truncate flex items-center gap-1.5 leading-tight mb-0.5">
              {user.name || 'User'} <Sparkles className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
            </h1>
            <p className="text-[#15803d] font-bold text-[13px] truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="flow-card overflow-hidden border-none shadow-sm">
        <div className="px-4 py-3 bg-[#fbfbf9] border-b border-zinc-100">
          <p className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider">Akun</p>
        </div>
        <div className="divide-y divide-zinc-100 bg-white">
          <SettingRow icon={User} label="Edit Profil" description="Ubah nama dan foto profil" href="/profile/edit" />
          <SettingRow icon={Bell} label="Notifikasi" description="Atur preferensi pemberitahuan" onClick={() => alert('Fitur ini akan segera hadir!')} />
          <SettingRow icon={Shield} label="Keamanan" description="Ubah kata sandi" href="/profile/security" />
        </div>
      </div>

      {/* App Settings */}
      <div className="flow-card overflow-hidden border-none shadow-sm">
        <div className="px-4 py-3 bg-[#fbfbf9] border-b border-zinc-100">
          <p className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider">Preferensi</p>
        </div>
        <div className="divide-y divide-zinc-100 bg-white">
          <SettingRow icon={Moon} label="Pengaturan Tema" description="Tampilan FlowState" href="/settings" />
          <SettingRow
            icon={Download}
            label={isExporting ? 'Mengekspor...' : 'Ekspor Data'}
            description="Unduh data transaksi sebagai CSV"
            onClick={handleExport}
          />
        </div>
      </div>

      {/* Logout */}
      <div className="flow-card overflow-hidden border-none shadow-sm">
        <SettingRow
          icon={LogOut}
          label="Keluar"
          onClick={handleLogout}
          danger
        />
      </div>

      <p className="text-center text-xs font-bold text-[#d4d4d8] pt-4 uppercase tracking-widest">FlowState v2.0</p>
    </div>
  );
}
