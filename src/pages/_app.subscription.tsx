import { ArrowLeft, Edit2, Calendar, CreditCard, BellRing, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-32 pt-8 w-full max-w-md mx-auto animate-fade-in px-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center text-[#1a1a2e] hover:scale-105 transition-transform">
           <ArrowLeft className="w-5 h-5" />
        </button>
        <button className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center text-[#1a1a2e] hover:scale-105 transition-transform">
           <Edit2 className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      {/* Mega Hero Avatar */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-[100px] h-[100px] rounded-full bg-black flex items-center justify-center mb-5 shadow-xl shadow-red-500/20">
           <span className="text-[#e50914] font-extrabold text-[44px] tracking-tighter">N</span>
        </div>
        
        <h2 className="text-[26px] font-extrabold text-[#1a1a2e] tracking-tight leading-none mb-2">Netflix Premium</h2>
        <p className="text-[32px] font-extrabold text-[#1a1a2e] opacity-90">$19.99<span className="text-[15px] text-[#a1a1aa] font-bold">/mo</span></p>
      </div>

      {/* Bear Tip */}
      <div className="bg-[#ecfccb] border border-[#d9f99d] rounded-[24px] p-4 flex gap-3 items-center mb-2">
         <span className="text-2xl">🐻</span>
         <p className="text-[12px] font-bold text-[#3f6212]">
           Consider switching to a family plan to split the cost!
         </p>
      </div>

      {/* Details Grid */}
      <div className="bg-white rounded-[32px] p-3 shadow-sm border border-zinc-50 mb-8 space-y-1">
         
         <div className="flex items-center justify-between p-3 rounded-[24px] hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-[#f4f4f5] text-[#1a1a2e] rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4" strokeWidth={2.5} />
               </div>
               <span className="text-[15px] font-bold text-[#1a1a2e]">Next Bill</span>
            </div>
            <span className="font-extrabold text-[14px] text-[#1a1a2e]">July 24</span>
         </div>

         <div className="flex items-center justify-between p-3 rounded-[24px] hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-[#f4f4f5] text-[#1a1a2e] rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4" strokeWidth={2.5} />
               </div>
               <span className="text-[15px] font-bold text-[#1a1a2e]">Method</span>
            </div>
            <span className="font-extrabold text-[14px] text-[#2563eb]">Visa 4242</span>
         </div>

         <div className="flex items-center justify-between p-3 rounded-[24px] hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-[#f4f4f5] text-[#1a1a2e] rounded-full flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
               </div>
               <span className="text-[15px] font-bold text-[#1a1a2e]">Auto-renew</span>
            </div>
            <div className="w-10 h-6 bg-[#a3e635] rounded-full p-1 flex items-center justify-end shadow-inner cursor-pointer">
               <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
         </div>

         <div className="flex items-center justify-between p-3 rounded-[24px] hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-[#f4f4f5] text-[#1a1a2e] rounded-full flex items-center justify-center">
                  <BellRing className="w-4 h-4" strokeWidth={2.5} />
               </div>
               <span className="text-[15px] font-bold text-[#1a1a2e]">Reminders</span>
            </div>
            <span className="font-extrabold text-[14px] text-[#1a1a2e]">2 days before</span>
         </div>

      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button className="w-full bg-[#a3e635] text-[#1a1a2e] rounded-full py-4 font-extrabold text-[15px] shadow-sm shadow-[#a3e635]/30 active:scale-95 transition-transform">
          Change Plan
        </button>
        <div className="flex gap-3">
          <button className="flex-1 bg-transparent border-[1.5px] border-[#e4e4e7] rounded-full py-4 text-[#71717a] font-bold text-[15px] active:scale-95 transition-transform hover:bg-zinc-50">
            Pause
          </button>
          <button className="flex-1 bg-[#fff1f2] border-[1.5px] border-[#ffe4e6] rounded-full py-4 text-[#ef4444] font-bold text-[15px] active:scale-95 transition-transform">
            Cancel
          </button>
        </div>
      </div>

    </div>
  );
}
