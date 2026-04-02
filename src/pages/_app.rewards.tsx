import { Sparkles, Crown, CircleCheck, Flame, Medal, Lock, Gift } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function RewardsPage() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6 pb-32 animate-fade-in w-full max-w-sm mx-auto">
      
      {/* Huge Header */}
      <div className="bg-gradient-to-b from-[#a3e635] to-[var(--app-bg)] rounded-none rounded-b-[60px] pt-12 pb-6 px-4 -mx-4 flex flex-col items-center shadow-sm relative overflow-hidden">
        {/* Crown floating */}
        <div className="absolute top-8 right-16 bg-[#fbbf24] w-12 h-12 rounded-full flex items-center justify-center animate-bounce z-10 border-4 border-white shadow-md">
           <Crown className="w-6 h-6 text-white" strokeWidth={3}/>
        </div>
        
        {/* Bear Avatar */}
        <div className="w-[120px] h-[120px] rounded-full bg-white border-[6px] border-white z-0 mt-8 mb-4 shadow-xl overflow-hidden shadow-[#a3e635]/50 relative">
           <div className="absolute inset-0 border-4 border-[#84cc16] rounded-full z-10 outline-none" />
           {user?.image ? <img src={user.image} className="w-full h-full object-cover" alt="Profile" /> : '🐻'}
        </div>
        
        <h1 className="text-[26px] font-extrabold text-[#1a1a2e] tracking-tight">You're on Fire!</h1>
        <p className="text-[14px] font-bold text-[#71717a] mt-1 mb-4 flex items-center gap-1">
          7-Day Streak with Budi 🐾
        </p>

        <button className="bg-[#bced6b] text-[#3f6212] px-4 py-1.5 rounded-full text-[11px] font-extrabold tracking-widest uppercase flex items-center gap-1 shadow-sm opacity-90">
           <Flame className="w-3.5 h-3.5 fill-[#3f6212]" /> KEEP IT UP!
        </button>
      </div>

      <div className="px-4 space-y-6">
        {/* Duit Coins Balance Card */}
        <div className="bg-[#8ce836] rounded-[40px] p-6 shadow-lg shadow-[#8ce836]/20 relative overflow-hidden border-b-8 border-[#75d424]">
          <p className="text-[11px] font-extrabold text-[#3f6212] tracking-widest uppercase opacity-80 mb-2">
            Duit Coins Balance
          </p>
          <div className="flex items-center gap-3">
             <div className="bg-[#1a1a2e] w-8 h-8 rounded-full flex items-center justify-center">
               <span className="text-[#a3e635] font-extrabold">$</span>
             </div>
             <h2 className="text-[44px] font-extrabold text-[#1a1a2e] tracking-tight leading-none">
               1,250
             </h2>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#bced6b] rounded-full px-3 py-1 font-extrabold text-[#1a1a2e] text-[13px] shadow-sm">
             +50 today
          </div>
        </div>

        {/* Streak Progress */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-50">
           <div className="flex items-center gap-2 mb-6">
             <div className="w-6 h-6 rounded-md border-2 border-zinc-200" />
             <h3 className="text-[17px] font-extrabold text-[#1a1a2e]">Streak Progress</h3>
           </div>
           
           <div className="flex justify-between items-center mb-6">
             {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-extrabold text-[#1a1a2e] ${i < 6 ? 'bg-[#a3e635]' : 'bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-50'}`}>
                    {day}
                  </div>
                  {i < 6 ? (
                    <CircleCheck className="w-3.5 h-3.5 text-[#84cc16] fill-[#ecfccb]" />
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-zinc-300" />
                  )}
                </div>
             ))}
           </div>
           <p className="text-center text-[12px] font-bold text-[#71717a]">
             1 more day to unlock a Super Rare Chest! 🎁
           </p>
        </div>

        {/* Your Badges */}
        <div>
          <h3 className="text-[17px] font-extrabold text-[#1a1a2e] mb-4">Your Badges</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
             <div className="snap-center bg-white rounded-full p-4 flex flex-col items-center shadow-sm border border-zinc-50 min-w-[90px]">
                <div className="w-14 h-14 rounded-full bg-[#e0f2fe] flex items-center justify-center mb-2 shadow-inner">
                   <Sparkles className="w-7 h-7 text-[#3b82f6] fill-[#3b82f6]" />
                </div>
                <span className="text-[11px] font-extrabold text-[#1a1a2e]">3 Day Spark</span>
             </div>
             <div className="snap-center bg-[#ecfccb] border-2 border-[#a3e635] rounded-full p-4 flex flex-col items-center shadow-md min-w-[90px]">
                <div className="w-14 h-14 rounded-full bg-[#a3e635] flex items-center justify-center mb-2 shadow-inner">
                   <Flame className="w-7 h-7 text-[#1a1a2e] fill-[#1a1a2e]" />
                </div>
                <span className="text-[11px] font-extrabold text-[#1a1a2e]">7 Day Fire</span>
             </div>
             <div className="snap-center bg-zinc-50 rounded-full p-4 flex flex-col items-center shadow-sm border border-zinc-100 opacity-60 min-w-[90px]">
                <div className="w-14 h-14 rounded-full bg-zinc-200 flex items-center justify-center mb-2 shadow-inner">
                   <Medal className="w-7 h-7 text-zinc-400" />
                </div>
                <span className="text-[11px] font-bold text-[#a1a1aa]">30 Day Legend</span>
             </div>
          </div>
        </div>

        {/* Upcoming Rewards */}
        <div>
          <h3 className="text-[17px] font-extrabold text-[#1a1a2e] mb-4">Upcoming Rewards</h3>
          <div className="space-y-3">
             <div className="bg-[#eff6ff] rounded-[32px] p-4 flex items-center justify-between border border-[#dbeafe]">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#6366f1] text-white flex items-center justify-center shrink-0">
                     {/* Using arbitrary icon */}
                     <span className="font-extrabold text-xl">🎨</span>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-extrabold text-[#1a1a2e]">Candy App Skin</h4>
                    <p className="text-[11px] font-bold text-[#64748b] mt-0.5">Reach 10-day streak to unlock</p>
                  </div>
               </div>
               <div className="w-8 h-8 rounded-full bg-[#cbd5e1]/40 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-[#64748b]" />
               </div>
             </div>

             <div className="bg-[#fff1f2] rounded-[32px] p-4 flex items-center justify-between border border-[#ffe4e6]">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f43f5e] text-white flex items-center justify-center shrink-0">
                     <Gift className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-extrabold text-[#1a1a2e]">Plant a Tree</h4>
                    <p className="text-[11px] font-bold text-[#64748b] mt-0.5">Exchange 2,000 Duit Coins</p>
                  </div>
               </div>
               <button className="bg-[#f43f5e] text-white text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full opacity-90 shadow-sm shrink-0">
                  REDEEM
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
