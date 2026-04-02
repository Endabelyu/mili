import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Coffee, Car, Pizza, Music, Clapperboard, Monitor, CheckCircle, Lightbulb
} from 'lucide-react';
import { CategoryIcon } from '../components/ui';

export default function TransactionsPage() {
  const [view, setView] = useState<'daily' | 'monthly'>('monthly');
  const location = useLocation();
  const navigate = useNavigate();
  const isNewExpense = location.search.includes('new=true');

  if (isNewExpense) {
    return <OledExpenseMode onClose={() => navigate('/transactions')} />;
  }

  return (
    <div className="space-y-6 pb-32 pt-8 w-full max-w-2xl mx-auto animate-fade-in px-4">
      
      {/* Segmented Control */}
      <div className="flex bg-[#f4f4f5] rounded-full p-1 max-w-[280px] mx-auto mb-6 shadow-inner">
         <button 
           onClick={() => setView('daily')}
           className={`flex-1 py-1.5 rounded-full text-[13px] font-extrabold tracking-wider transition-all ${view === 'daily' ? 'bg-white shadow-sm text-[#1a1a2e]' : 'text-[#71717a]'}`}
         >
           DAILY
         </button>
         <button 
           onClick={() => setView('monthly')}
           className={`flex-1 py-1.5 rounded-full text-[13px] font-extrabold tracking-wider transition-all ${view === 'monthly' ? 'bg-white shadow-sm text-[#1a1a2e]' : 'text-[#71717a]'}`}
         >
           MONTHLY
         </button>
      </div>

      {view === 'monthly' && (
        <div className="animate-fade-in">
          {/* Monthly Flow Hero */}
          <div className="bg-gradient-to-br from-[#ff914d] to-[#ea580c] rounded-[32px] p-6 shadow-xl shadow-[#ea580c]/20 text-white flex flex-col items-center text-center">
             <p className="text-[11px] font-extrabold tracking-widest uppercase opacity-80 mb-2">
               Monthly Flow
             </p>
             <h2 className="text-[44px] font-extrabold tracking-tight leading-none mb-6">
               +$1,350.00
             </h2>
             <div className="flex gap-4 w-full">
               <div className="flex-1 bg-white/20 backdrop-blur rounded-[24px] py-4 flex flex-col items-center">
                 <p className="text-[11px] font-bold text-white/80">Spent</p>
                 <p className="text-[18px] font-extrabold">$2,450</p>
               </div>
               <div className="flex-1 bg-white/20 backdrop-blur rounded-[24px] py-4 flex flex-col items-center">
                 <p className="text-[11px] font-bold text-white/80">Earned</p>
                 <p className="text-[18px] font-extrabold">$3,800</p>
               </div>
             </div>
          </div>

          {/* Category Breakdown */}
          <div className="mt-8">
            <h3 className="text-[17px] font-extrabold text-[#1a1a2e] mb-4">Category Breakdown</h3>
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-50 space-y-5">
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                     <Pizza className="w-4 h-4 text-[#ef4444]" />
                     <span className="text-[14px] font-bold text-[#1a1a2e]">Food & Drinks</span>
                  </div>
                  <span className="text-[14px] font-extrabold text-[#1a1a2e]">$450</span>
                </div>
                <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                   <div className="h-full bg-[#ef4444] rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                     <ShoppingBag className="w-4 h-4 text-[#8b5cf6]" />
                     <span className="text-[14px] font-bold text-[#1a1a2e]">Shopping</span>
                  </div>
                  <span className="text-[14px] font-extrabold text-[#1a1a2e]">$220</span>
                </div>
                <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                   <div className="h-full bg-[#8b5cf6] rounded-full" style={{ width: '40%' }} />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {view === 'daily' && (
        <div className="animate-fade-in space-y-6">
           {/* Stash Buddy Tip */}
           <div className="bg-gradient-to-r from-[#ecfccb] to-[#d9f99d] rounded-[32px] p-5 shadow-sm border border-[#bef264] flex gap-4 items-center">
              <span className="text-4xl shrink-0">🐻</span>
              <div>
                <h4 className="text-[15px] font-extrabold text-[#3f6212] mb-0.5">Stash Buddy's Tip</h4>
                <p className="text-[13px] font-bold text-[#4d7c0f]">You saved 15% more this week than last week! Grab a coffee, on me! ☕</p>
              </div>
           </div>

           {/* Date Group */}
           <div>
             <h3 className="text-[12px] font-extrabold text-[#a1a1aa] tracking-widest uppercase mb-4 ml-2">Dec 31</h3>
             <div className="space-y-3">
               
               <div className="bg-white rounded-[32px] p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-full bg-[#ecfccb] flex items-center justify-center text-[#65a30d]">
                        <Coffee className="w-6 h-6" strokeWidth={2.5}/>
                     </div>
                     <div>
                       <p className="text-[15px] font-extrabold text-[#1a1a2e]">Starbucks</p>
                       <p className="text-[12px] font-bold text-[#a1a1aa] mt-0.5">9:41 AM</p>
                     </div>
                  </div>
                  <span className="text-[17px] font-extrabold text-[#1a1a2e] tracking-tight">-$6.50</span>
               </div>

               <div className="bg-white rounded-[32px] p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-full bg-[#e0e7ff] flex items-center justify-center text-[#4f46e5]">
                        <ShoppingBag className="w-6 h-6" strokeWidth={2.5}/>
                     </div>
                     <div>
                       <p className="text-[15px] font-extrabold text-[#1a1a2e]">Uniqlo</p>
                       <p className="text-[12px] font-bold text-[#a1a1aa] mt-0.5">1:15 PM</p>
                     </div>
                  </div>
                  <span className="text-[17px] font-extrabold text-[#1a1a2e] tracking-tight">-$42.00</span>
               </div>

             </div>
           </div>
        </div>
      )}

    </div>
  );
}

// ─── Phase 4: OLED Dark Mode Entry Component ──────────────────────────────────────────────
function OledExpenseMode({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('200000');
  const [activeCategory, setActiveCategory] = useState('DRINKS');

  const categories = [
    { id: 'FOOD', icon: Pizza, color: '#ef4444' },
    { id: 'DRINKS', icon: Coffee, color: '#a3e635' }, // Active neon one in mock
    { id: 'APPS', icon: Monitor, color: '#3b82f6' },
    { id: 'FITS', icon: ShoppingBag, color: '#8b5cf6' },
    { id: 'TRANSIT', icon: Car, color: '#f59e0b' },
    { id: 'FUN', icon: Music, color: '#ec4899' },
  ];

  return (
    <div className="fixed inset-0 bg-[#09090b] z-40 flex flex-col pt-12 pb-32 px-6 animate-fade-in text-white selection:bg-[#a3e635]/30">
       
       <button onClick={onClose} className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
         <ArrowLeft className="w-6 h-6 text-white" />
       </button>

       {/* Top: Amount & Chat Bubble */}
       <div className="flex flex-col items-center justify-center mt-12 mb-10 flex-1 min-h-[160px]">
          <p className="text-[#a3e635] text-[15px] font-extrabold tracking-widest uppercase mb-4 opacity-90 text-center">
            New Expense
          </p>
          <div className="flex items-baseline gap-2 mb-6">
             <span className="text-[32px] font-bold text-zinc-500">Rp</span>
             <h1 className="text-[64px] font-extrabold tracking-tighter text-white leading-none">
               {Number(amount).toLocaleString('id-ID')}
             </h1>
          </div>

          {/* Indomie Equivalency Pill */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-full px-5 py-2.5 flex items-center gap-3 shadow-xl">
             <span className="text-xl">🐻</span>
             <p className="text-[12px] font-bold text-zinc-300 tracking-wider">
               <span className="text-[#a3e635] font-extrabold">SETARA 3 BUNGKUS INDOMIE</span> 🍜
             </p>
          </div>
       </div>

       {/* Category Orbs */}
       <div className="grid grid-cols-3 gap-4 mb-auto justify-items-center w-full max-w-[300px] mx-auto">
          {categories.map((cat) => {
             const isAct = activeCategory === cat.id;
             const CIcon = cat.icon;
             return (
               <div key={cat.id} onClick={() => setActiveCategory(cat.id)} className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className={`w-[68px] h-[68px] rounded-full flex items-center justify-center transition-all duration-300
                    ${isAct 
                      ? 'bg-transparent border-4 border-[#a3e635] shadow-[0_0_30px_rgba(163,230,53,0.4)] scale-110' 
                      : 'bg-[#18181b] border-2 border-transparent group-hover:bg-[#27272a]'
                    }
                  `}>
                     <CIcon className={`w-8 h-8 ${isAct ? 'text-[#a3e635]' : 'text-zinc-500'}`} />
                  </div>
                  <span className={`text-[10px] font-extrabold tracking-widest uppercase transition-colors ${isAct ? 'text-[#a3e635]' : 'text-zinc-600'}`}>
                    {cat.id}
                  </span>
               </div>
             );
          })}
       </div>

       {/* Custom T9 Numpad */}
       <div className="mt-auto grid grid-cols-3 gap-2 px-4 pb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, '<'].map((key, i) => (
            <button 
              key={i} 
              className="h-[60px] flex items-center justify-center text-[28px] font-extrabold active:bg-white/10 rounded-2xl transition-colors"
            >
              {key}
            </button>
          ))}
       </div>

    </div>
  );
}
