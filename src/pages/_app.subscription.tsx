import { ArrowLeft, Edit2, Calendar, CreditCard, BellRing, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-28 pt-6 w-full max-w-[1040px] mx-auto animate-fade-in px-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="icon-btn">
           <ArrowLeft className="w-5 h-5" />
        </button>
        <button className="icon-btn">
           <Edit2 className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      {/* Mega Hero Avatar */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-[100px] h-[100px] rounded-full bg-black flex items-center justify-center mb-5 shadow-xl shadow-red-500/20">
           <span className="text-[#e50914] font-bold text-[44px] tracking-tighter">N</span>
        </div>
        
        <h2 className="text-[26px] font-bold text-[var(--text)] tracking-[-0.02em] leading-none mb-2">Netflix Premium</h2>
        <p className="text-[32px] font-bold text-[var(--text)] tracking-[-0.01em] tabular-nums">$19.99<span className="text-[15px] text-[var(--text-dim-2)] font-semibold">/mo</span></p>
      </div>

      {/* Bear Tip */}
      <div className="flow-tip-card p-4 flex gap-3 items-center mb-2">
         <span className="text-2xl">🐻</span>
         <p className="text-[12px] font-medium text-[#4d7c0f]">
           Consider switching to a family plan to split the cost!
         </p>
      </div>

      {/* Details Grid */}
      <div className="flow-card p-2 mb-8">
         
         <div className="flex items-center justify-between p-3 rounded-[12px] hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)]">
            <div className="flex items-center gap-4">
               <div className="flow-icon-badge">
                  <Calendar className="w-4 h-4" strokeWidth={2.5} />
               </div>
               <span className="text-[14px] font-semibold text-[var(--text)]">Next Bill</span>
            </div>
            <span className="font-bold text-[14px] text-[var(--text)] tabular-nums">July 24</span>
         </div>

         <div className="flex items-center justify-between p-3 rounded-[12px] hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)]">
            <div className="flex items-center gap-4">
               <div className="flow-icon-badge">
                  <CreditCard className="w-4 h-4" strokeWidth={2.5} />
               </div>
               <span className="text-[14px] font-semibold text-[var(--text)]">Method</span>
            </div>
            <span className="font-bold text-[14px] text-blue-500">Visa 4242</span>
         </div>

         <div className="flex items-center justify-between p-3 rounded-[12px] hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)]">
            <div className="flex items-center gap-4">
               <div className="flow-icon-badge">
                  <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
               </div>
               <span className="text-[14px] font-semibold text-[var(--text)]">Auto-renew</span>
            </div>
            <div className="w-10 h-6 bg-[var(--accent)] rounded-full p-1 flex items-center justify-end shadow-inner cursor-pointer">
               <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
         </div>

         <div className="flex items-center justify-between p-3 rounded-[12px] hover:bg-[var(--muted)] transition-colors">
            <div className="flex items-center gap-4">
               <div className="flow-icon-badge">
                  <BellRing className="w-4 h-4" strokeWidth={2.5} />
               </div>
               <span className="text-[14px] font-semibold text-[var(--text)]">Reminders</span>
            </div>
            <span className="font-bold text-[14px] text-[var(--text)]">2 days before</span>
         </div>

      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button className="btn-primary w-full py-4">
          Change Plan
        </button>
        <div className="flex gap-3">
          <button className="flex-1 flow-card bg-transparent border-[1.5px] border-[var(--border)] py-4 text-[var(--text-dim)] font-bold text-[15px] active:scale-[0.98] transition-transform hover:bg-[var(--muted)]">
            Pause
          </button>
          <button className="flex-1 rounded-[16px] border-[1.5px] border-red-100 py-4 text-red-500 font-bold text-[15px] active:scale-[0.98] transition-transform" style={{ background: 'rgba(239,68,56,0.08)' }}>
            Cancel
          </button>
        </div>
      </div>

    </div>
  );
}
