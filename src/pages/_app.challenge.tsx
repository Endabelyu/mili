import { ArrowLeft, Share2, CheckCircle2, Circle, Flame, Share } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChallengeDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-32 pt-8 w-full max-w-md mx-auto animate-fade-in px-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center text-[#1a1a2e] hover:scale-105 transition-transform">
           <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[19px] font-extrabold text-[#1a1a2e]">Challenge</h1>
        <button className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center text-[#1a1a2e] hover:scale-105 transition-transform">
           <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#ff914d] to-[#f97316] rounded-[32px] p-6 shadow-lg shadow-[#f97316]/30 text-white relative overflow-hidden">
         <div className="relative z-10">
           <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl mb-4 border border-white/30">
             🚫
           </div>
           <h2 className="text-[28px] font-extrabold tracking-tight leading-none mb-1">
             No Spend Weekend
           </h2>
           <p className="text-[13px] font-bold text-white/80">
             Save cash by cooking & chilling at home!
           </p>
         </div>
         {/* Decorative Bear */}
         <div className="absolute -bottom-4 -right-4 text-8xl opacity-20 rotate-12 pointer-events-none">
           🐻
         </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[17px] font-extrabold text-[#1a1a2e]">Your Progress</h3>
          <span className="text-[14px] font-extrabold text-[#ff914d]">2/3 Days</span>
        </div>
        <div className="w-full h-4 bg-zinc-100 rounded-full overflow-hidden">
           <div className="h-full bg-gradient-to-r from-[#ff914d] to-[#f97316] w-[66%] rounded-full shadow-inner" />
        </div>
        <p className="text-[12px] font-bold text-[#a1a1aa] mt-3 text-center">
          1 day left to complete! You got this! 💪
        </p>
      </div>

      {/* Rules */}
      <div>
        <h3 className="text-[15px] font-extrabold text-[#1a1a2e] mb-3 ml-2">Challenge Rules</h3>
        <div className="bg-white rounded-[32px] p-5 shadow-sm border border-zinc-50 space-y-4">
           <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-[#84cc16] fill-[#ecfccb] shrink-0" />
              <p className="text-[14px] font-bold text-[#1a1a2e]">No non-essential spending</p>
           </div>
           <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-[#84cc16] fill-[#ecfccb] shrink-0" />
              <p className="text-[14px] font-bold text-[#1a1a2e]">Cook all meals at home</p>
           </div>
           <div className="flex items-start gap-4">
              <Circle className="w-6 h-6 text-zinc-300 shrink-0" strokeWidth={2.5}/>
              <p className="text-[14px] font-bold text-[#a1a1aa]">Use public transit or walk</p>
           </div>
        </div>
      </div>

      {/* Potential Reward */}
      <div>
        <h3 className="text-[15px] font-extrabold text-[#1a1a2e] mb-3 ml-2">Potential Reward</h3>
        <div className="bg-[#ecfccb] rounded-[32px] p-5 shadow-sm flex items-center justify-between border-2 border-[#a3e635]">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#a3e635] flex items-center justify-center shadow-inner">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-[17px] font-extrabold text-[#1a1a2e]">500 Duit Coins</p>
                <p className="text-[12px] font-bold text-[#3f6212]/70">Upon completion</p>
              </div>
           </div>
           <Flame className="w-6 h-6 text-[#f97316] fill-[#f97316]" />
        </div>
      </div>

      {/* Recent Logs (Activity) */}
      <div>
        <h3 className="text-[15px] font-extrabold text-[#1a1a2e] mb-3 ml-2">Recent Log</h3>
        <div className="bg-white rounded-[32px] p-5 shadow-sm border border-zinc-50 flex items-start gap-4">
           <div className="w-10 h-10 rounded-full bg-[#f3e8ff] flex items-center justify-center shrink-0 text-xl">
             🧘‍♂️
           </div>
           <div>
             <p className="text-[14px] font-extrabold text-[#1a1a2e]">Zero spent!</p>
             <p className="text-[12px] font-bold text-[#a1a1aa] mt-0.5">Stayed home, watched Netflix and cooked pantry indomie. 💪</p>
             <p className="text-[10px] font-extrabold text-[#d4d4d8] mt-2 uppercase tracking-widest">Yesterday, 9:00 PM</p>
           </div>
        </div>
      </div>

      {/* Primary Action */}
      <div className="pt-4 pb-8">
        <button className="w-full bg-[#1a1a2e] text-white rounded-full py-4 flex items-center justify-center gap-2 font-extrabold text-[15px] active:scale-95 transition-transform shadow-xl">
          <Share className="w-5 h-5 text-zinc-300" strokeWidth={2.5} />
          Share Progress
        </button>
      </div>

    </div>
  );
}
