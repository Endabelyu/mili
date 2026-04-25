import { Sparkles, Crown, CircleCheck, Flame, Medal, Lock, Gift } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function RewardsPage() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6 pb-28 animate-fade-in w-full max-w-[1040px] mx-auto">
      
      {/* Huge Header */}
      <div className="bg-gradient-to-b from-[var(--accent)] to-[var(--bg)] rounded-none rounded-b-[48px] pt-12 pb-8 px-4 flex flex-col items-center shadow-sm relative overflow-hidden">
        {/* Crown floating */}
        <div className="absolute top-8 right-12 bg-[#fbbf24] w-11 h-11 rounded-full flex items-center justify-center animate-bounce z-10 border-4 border-[var(--card)] shadow-md">
           <Crown className="w-5 h-5 text-white" strokeWidth={3}/>
        </div>
        
        {/* Bear Avatar */}
        <div className="w-[110px] h-[110px] rounded-full p-1 mt-8 mb-4 relative" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)' }}>
           <div className="w-full h-full rounded-full bg-orange-100 overflow-hidden border-4 border-[var(--card)] flex items-center justify-center">
             {user?.image ? <img src={user.image} className="w-full h-full object-cover" alt="Profile" /> : <span className="text-4xl">🐻</span>}
           </div>
        </div>
        
        <h1 className="text-[24px] font-bold text-[var(--text)] tracking-[-0.02em]">You're on Fire!</h1>
        <p className="text-[13px] font-medium text-[var(--text-dim)] mt-1 mb-4 flex items-center gap-1">
          7-Day Streak with Budi 🐾
        </p>

        <div className="bg-[var(--accent)] text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.04em] uppercase flex items-center gap-1 shadow-sm">
           <Flame className="w-3.5 h-3.5 fill-white" /> KEEP IT UP!
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Duit Coins Balance Card */}
        <div className="rounded-[24px] p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', border: 'none' }}>
          <p className="text-[11px] font-bold text-white/70 tracking-[0.04em] uppercase mb-2">
            Duit Coins Balance
          </p>
          <div className="flex items-center gap-3">
             <div className="bg-white/20 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center border border-white/30">
               <span className="text-white font-bold">$</span>
             </div>
             <h2 className="text-[44px] font-bold text-white tracking-[-0.02em] leading-none tabular-nums">
               1,250
             </h2>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 font-bold text-white text-[12px] border border-white/30">
             +50 today
          </div>
        </div>

        {/* Streak Progress */}
        <div className="flow-card p-6">
           <div className="flex items-center gap-2 mb-6 px-1">
             <h3 className="text-[15px] font-semibold text-[var(--text)] tracking-[-0.01em]">Streak Progress</h3>
           </div>
           
           <div className="flex justify-between items-center mb-6">
             {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <span className="text-[11px] font-medium text-[var(--text-dim)]">{day}</span>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold tabular-nums transition-all ${i < 6 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--muted)] text-[var(--text-dim-2)]'}`}>
                    {i < 6 ? <CircleCheck className="w-5 h-5" /> : i + 1}
                  </div>
                </div>
             ))}
           </div>
           <p className="text-center text-[12px] font-medium text-[var(--text-dim)]">
             1 more day to unlock a Super Rare Chest! 🎁
           </p>
        </div>

        {/* Your Badges */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[15px] font-semibold text-[var(--text)] tracking-[-0.01em]">Your Badges</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
             <div className="snap-center flow-card p-4 flex flex-col items-center min-w-[100px] bg-white">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                   <Sparkles className="w-6 h-6 text-blue-500 fill-blue-500" />
                </div>
                <span className="text-[11px] font-bold text-[var(--text)] text-center">3 Day Spark</span>
             </div>
             <div className="snap-center flow-card p-4 flex flex-col items-center min-w-[100px] border-[1.5px]" style={{ borderColor: 'var(--accent)', background: 'var(--accent-tint)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--accent)' }}>
                   <Flame className="w-6 h-6 text-white fill-white" />
                </div>
                <span className="text-[11px] font-bold text-[var(--text)] text-center">7 Day Fire</span>
             </div>
             <div className="snap-center flow-card p-4 flex flex-col items-center min-w-[100px] bg-white opacity-50 grayscale">
                <div className="w-12 h-12 rounded-xl bg-[var(--muted)] flex items-center justify-center mb-3">
                   <Medal className="w-6 h-6 text-[var(--text-dim-2)]" />
                </div>
                <span className="text-[11px] font-bold text-[var(--text-dim)] text-center">30 Day Legend</span>
             </div>
          </div>
        </div>

        {/* Upcoming Rewards */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[15px] font-semibold text-[var(--text)] tracking-[-0.01em]">Upcoming Rewards</h3>
          </div>
          <div className="space-y-3">
             <div className="flow-card p-4 flex items-center justify-between bg-white border-none">
               <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                     <span className="font-bold text-lg">🎨</span>
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[var(--text)]">Candy App Skin</h4>
                    <p className="text-[11px] font-medium text-[var(--text-dim)] mt-0.5">Reach 10-day streak to unlock</p>
                  </div>
               </div>
               <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5 text-[var(--text-dim-2)]" />
               </div>
             </div>

             <div className="flow-card p-4 flex items-center justify-between bg-white border-none">
               <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                     <Gift className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[var(--text)]">Plant a Tree</h4>
                    <p className="text-[11px] font-medium text-[var(--text-dim)] mt-0.5">Exchange 2,000 Duit Coins</p>
                  </div>
               </div>
               <button className="bg-rose-500 text-white text-[10px] font-bold tracking-[0.04em] uppercase px-3 py-1.5 rounded-lg shadow-sm shrink-0">
                  REDEEM
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
