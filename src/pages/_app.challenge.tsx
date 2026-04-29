import { ArrowLeft, Share2, CheckCircle2, Circle, Flame, Share } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon } from '../components/ui/CategoryIcon';

export default function ChallengeDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-28 pt-6 w-full max-w-[1040px] mx-auto animate-fade-in px-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => navigate(-1)} className="icon-btn">
           <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[19px] font-bold text-[var(--text)] tracking-[-0.02em]">Challenge</h1>
        <button className="icon-btn">
           <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Banner */}
      <div className="rounded-[24px] p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #ff914d 0%, #f97316 100%)', border: 'none' }}>
         <div className="relative z-10">
            <CategoryIcon 
              category="challenge" 
              icon="🚫" 
              size="xl" 
              className="mb-4 bg-white/20 border border-white/30 backdrop-blur-sm"
            />
           <h2 className="text-[26px] font-bold tracking-[-0.02em] leading-none mb-1.5">
             No Spend Weekend
           </h2>
           <p className="text-[13px] font-medium text-white/80">
             Save cash by cooking & chilling at home!
           </p>
         </div>
         {/* Decorative Bear */}
         <div className="absolute -bottom-4 -right-4 text-8xl opacity-20 rotate-12 pointer-events-none">
           🐻
         </div>
      </div>

      {/* Progress */}
      <div className="flow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-[var(--text)] tracking-[-0.01em]">Your Progress</h3>
          <span className="text-[14px] font-bold text-[#f97316] tabular-nums">2/3 Days</span>
        </div>
        <div className="w-full h-3.5 bg-[var(--muted)] rounded-full overflow-hidden">
           <div className="h-full bg-gradient-to-r from-[#ff914d] to-[#f97316] w-[66%] rounded-full shadow-inner" />
        </div>
        <p className="text-[12px] font-medium text-[var(--text-dim)] mt-4 text-center">
          1 day left to complete! You got this! 💪
        </p>
      </div>

      {/* Rules */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[14px] font-semibold text-[var(--text)] tracking-[-0.01em]">Challenge Rules</h3>
        </div>
        <div className="flow-card p-5 space-y-4">
           <div className="flex items-start gap-4">
              <CheckCircle2 className="w-5 h-5 text-[var(--income)] mt-0.5" />
              <p className="text-[14px] font-medium text-[var(--text)]">No non-essential spending</p>
           </div>
           <div className="flex items-start gap-4">
              <CheckCircle2 className="w-5 h-5 text-[var(--income)] mt-0.5" />
              <p className="text-[14px] font-medium text-[var(--text)]">Cook all meals at home</p>
           </div>
           <div className="flex items-start gap-4">
              <Circle className="w-5 h-5 text-[var(--text-dim-2)] mt-0.5" strokeWidth={2.5}/>
              <p className="text-[14px] font-medium text-[var(--text-dim)]">Use public transit or walk</p>
           </div>
        </div>
      </div>

      {/* Potential Reward */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[14px] font-semibold text-[var(--text)] tracking-[-0.01em]">Potential Reward</h3>
        </div>
        <div className="flow-card p-5 flex items-center justify-between border-[1.5px]" style={{ borderColor: 'var(--accent)', background: 'var(--accent-tint)' }}>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner" style={{ background: 'var(--accent)' }}>
              <CategoryIcon 
                category="salary" 
                icon="💰" 
                size="md" 
              />
              </div>
              <div>
                <p className="text-[17px] font-bold text-[var(--text)] tracking-[-0.01em] tabular-nums">500 Duit Coins</p>
                <p className="text-[12px] font-medium text-[var(--text-dim)]">Upon completion</p>
              </div>
           </div>
           <Flame className="w-6 h-6 text-[#f97316] fill-[#f97316]" />
        </div>
      </div>

      {/* Recent Logs (Activity) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[14px] font-semibold text-[var(--text)] tracking-[-0.01em]">Recent Log</h3>
        </div>
        <div className="flow-card p-5 flex items-start gap-4">
           <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center shrink-0 text-xl">
            <CategoryIcon 
              category="fun" 
              icon="🧘‍♂️" 
              size="md" 
            />
           </div>
           <div>
             <p className="text-[14px] font-bold text-[var(--text)]">Zero spent!</p>
             <p className="text-[12px] font-medium text-[var(--text-dim)] mt-0.5">Stayed home, watched Netflix and cooked pantry indomie. 💪</p>
             <p className="text-[10px] font-bold text-[var(--text-dim-2)] mt-3 uppercase tracking-[0.04em]">Yesterday, 9:00 PM</p>
           </div>
        </div>
      </div>

      {/* Primary Action */}
      <div className="pt-4 pb-8">
        <button className="btn-primary w-full py-4 flex items-center justify-center gap-2">
          <Share className="w-5 h-5 opacity-80" strokeWidth={2.5} />
          Share Progress
        </button>
      </div>

    </div>
  );
}
