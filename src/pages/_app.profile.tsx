import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Pencil,
  Banknote,
  Moon,
  ShieldCheck,
  HelpCircle,
  BellRing,
  Gift,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="space-y-6 pb-32 pt-8 w-full max-w-md mx-auto animate-fade-in px-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center text-[#1a1a2e] hover:scale-105 transition-transform">
           <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[19px] font-extrabold text-[#1a1a2e]">Settings</h1>
        <button className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center text-[#1a1a2e] hover:scale-105 transition-transform">
           <Bell className="w-5 h-5 fill-[#1a1a2e]" />
        </button>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full border-4 border-[#a3e635] p-1 shadow-lg shadow-[#a3e635]/20">
             <div className="w-full h-full rounded-full bg-orange-100 overflow-hidden border border-zinc-200">
               {user?.image ? <img src={user.image} className="w-full h-full object-cover" alt="Profile" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🐻</div>}
             </div>
          </div>
          <button className="absolute bottom-0 right-0 bg-[#84cc16] text-[#1a1a2e] w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
             <Pencil className="w-3.5 h-3.5 fill-[#1a1a2e]" />
          </button>
        </div>
        
        <h2 className="text-[22px] font-extrabold text-[#1a1a2e] tracking-tight">{user?.name || 'Budi the Bear'}</h2>
        <p className="text-[15px] font-medium text-[#71717a] mb-4">@{user?.name?.toLowerCase().replace(' ', '') || 'budibear_duit'}</p>
        
        <button className="bg-[#a3e635] text-[#1a1a2e] font-extrabold text-[15px] px-8 py-3 rounded-full shadow-sm active:scale-95 transition-transform shadow-[#a3e635]/30">
          Edit Profile
        </button>
      </div>

      {/* App Preferences */}
      <div className="mb-8">
        <h3 className="text-[12px] font-extrabold text-[#a1a1aa] tracking-widest uppercase mb-4 ml-2">App Preferences</h3>
        <div className="bg-white rounded-[32px] p-2 space-y-1 shadow-sm border border-zinc-50">
           
           <div className="flex items-center justify-between p-3 rounded-[24px] hover:bg-zinc-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                 <div className="w-11 h-11 bg-[#ecfccb] text-[#65a30d] rounded-full flex items-center justify-center">
                    <Banknote className="w-5 h-5" strokeWidth={2.5} />
                 </div>
                 <span className="text-[16px] font-bold text-[#1a1a2e]">Currency</span>
              </div>
              <div className="flex items-center gap-2 text-[#71717a]">
                 <span className="font-bold text-[14px]">IDR</span>
                 <ChevronRight className="w-4 h-4 opacity-70" />
              </div>
           </div>

           <div className="flex items-center justify-between p-3 rounded-[24px] hover:bg-zinc-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                 <div className="w-11 h-11 bg-[#ecfccb] text-[#65a30d] rounded-full flex items-center justify-center">
                    <Moon className="w-5 h-5 fill-[#65a30d]" strokeWidth={2.5} />
                 </div>
                 <span className="text-[16px] font-bold text-[#1a1a2e]">Dark Mode</span>
              </div>
              {/* Toggle Switch */}
              <div className="w-12 h-6 bg-[#ecfccb] rounded-full p-1 flex items-center justify-end shadow-inner cursor-pointer">
                 <div className="w-4 h-4 bg-[#84cc16] rounded-full shadow-sm" />
              </div>
           </div>

        </div>
      </div>

      {/* Account & Support Grid */}
      <div className="mb-8">
        <h3 className="text-[12px] font-extrabold text-[#a1a1aa] tracking-widest uppercase mb-4 ml-2">Account & Support</h3>
        <div className="grid grid-cols-2 gap-4">
          
          <div className="bg-white rounded-[32px] p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center">
               <ShieldCheck className="w-6 h-6 fill-[#3b82f6]" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-[#1a1a2e] mb-0.5">Security</h4>
              <p className="text-[11px] font-bold text-[#a1a1aa]">2FA & Privacy</p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#f3e8ff] text-[#a855f7] flex items-center justify-center">
               <HelpCircle className="w-6 h-6 fill-[#a855f7] text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-[#1a1a2e] mb-0.5">Support</h4>
              <p className="text-[11px] font-bold text-[#a1a1aa]">Help Center</p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ffedd5] text-[#f97316] flex items-center justify-center">
               <BellRing className="w-6 h-6 fill-[#f97316]" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-[#1a1a2e] mb-0.5">Alerts</h4>
              <p className="text-[11px] font-bold text-[#a1a1aa]">Push Settings</p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ecfccb] text-[#84cc16] flex items-center justify-center">
               <Gift className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-[#1a1a2e] mb-0.5">Rewards</h4>
              <p className="text-[11px] font-bold text-[#a1a1aa]">Invite & Win</p>
            </div>
          </div>

        </div>
      </div>

      {/* Log Out */}
      <button 
        onClick={handleLogout}
        className="w-full bg-transparent border-[1.5px] border-[#e4e4e7] rounded-[32px] py-4 flex items-center justify-center gap-2 text-[#71717a] font-bold hover:bg-zinc-50 transition-colors active:scale-95"
      >
        <LogOut className="w-5 h-5" /> Log Out
      </button>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-[11px] font-bold text-[#a1a1aa]">Duit App v2.4.0 • Made with ♡ for Gen Z</p>
      </div>

    </div>
  );
}
