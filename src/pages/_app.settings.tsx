import { type MetaFunction, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import {
  Sun,
  Moon,
  Bell,
  Shield,
  ChevronRight,
  Globe,
  Settings as SettingsIcon,
} from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'Pengaturan | Finance Tracker' },
];

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  href?: string;
}

function SettingRow({ icon: Icon, label, description, onClick, href }: SettingRowProps) {
  const content = (
    <div className="flex items-center gap-4 p-4 w-full transition-colors active:bg-zinc-50 lg:hover:bg-zinc-50 text-[#1a1a2e]">
      <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#1a1a2e]" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[15px] font-bold leading-tight">{label}</p>
        {description && <p className="text-[13px] font-medium text-[#71717a] mt-0.5">{description}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-[#a1a1aa] flex-shrink-0" />
    </div>
  );

  if (href) return <Link to={href} className="block">{content}</Link>;
  return <button type="button" onClick={onClick} className="w-full block">{content}</button>;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-xl mx-auto space-y-4 md:space-y-6 pb-28 md:pb-8 pt-4 lg:pt-8 px-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#1a1a2e] tracking-tight">Pengaturan</h1>
          <p className="text-sm font-medium text-[#71717a]">Preferensi aplikasi Anda</p>
        </div>
      </div>

      {/* Theme */}
      <div className="flow-card overflow-hidden border-none shadow-sm">
        <div className="px-4 py-3 bg-[#fbfbf9] border-b border-zinc-100">
          <p className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider">Tampilan</p>
        </div>
        <div className="p-4 bg-white">
          <p className="text-[13px] font-bold text-[#1a1a2e] mb-3">Tema FlowState</p>
          <div className="grid grid-cols-2 gap-3">
             <button
               type="button"
               onClick={() => setTheme('fresh-mint')}
               className={`flex flex-col items-center gap-2 p-4 rounded-[16px] border-2 transition-all ${
                 theme === 'fresh-mint' || theme === 'system' // Since FlowState is light-focused, simplify this
                   ? 'border-[#a3e635] bg-[#f0fdf4] text-[#3f6212]'
                   : 'border-zinc-100 text-[#71717a] hover:bg-zinc-50'
               }`}
             >
               <Sun className="w-6 h-6" />
               <span className="text-[12px] font-bold text-center leading-tight">FlowState Light</span>
             </button>
             <button
               type="button"
               onClick={() => alert('Mode Gelap sedang dikembangkan untuk versi FlowState.')}
               className={`flex flex-col items-center gap-2 p-4 rounded-[16px] border-2 border-zinc-100 text-[#a1a1aa] bg-zinc-50 opacity-60 cursor-not-allowed`}
               disabled
             >
               <Moon className="w-6 h-6" />
               <span className="text-[12px] font-bold text-center leading-tight">Mode Gelap (Segera)</span>
             </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="flow-card overflow-hidden border-none shadow-sm">
        <div className="px-4 py-3 bg-[#fbfbf9] border-b border-zinc-100">
          <p className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider">Notifikasi</p>
        </div>
        <div className="divide-y divide-zinc-100">
          <SettingRow
            icon={Bell}
            label="Pemberitahuan Push"
            description="Pengingat anggaran & ringkasan mingguan"
          />
        </div>
      </div>

      {/* Account */}
      <div className="flow-card overflow-hidden border-none shadow-sm">
        <div className="px-4 py-3 bg-[#fbfbf9] border-b border-zinc-100">
          <p className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider">Sistem</p>
        </div>
        <div className="divide-y divide-zinc-100">
          <SettingRow icon={Globe} label="Bahasa" description="Indonesia" />
          <SettingRow
            icon={Shield}
            label="Privasi & Ketentuan"
            description="Baca kebijakan kami"
          />
        </div>
      </div>

      {/* About */}
      <div className="flow-card p-4 flex items-center justify-between border-none shadow-sm">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[#1a1a2e]">
               <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
               <p className="text-[15px] font-bold leading-tight text-[#1a1a2e]">Versi Aplikasi</p>
               <p className="text-[13px] font-medium text-[#71717a] mt-0.5">Selalu diperbarui</p>
            </div>
         </div>
         <span className="text-[13px] font-bold text-[#10b981] bg-[#dcfce7] px-2 py-1 rounded-md">v2.0.0</span>
      </div>
    </div>
  );
}
