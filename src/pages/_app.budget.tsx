import { Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BillsPage() {
  const navigate = useNavigate();

  const subscriptions = [
    { id: 1, name: 'Netflix Premium', price: 19.99, date: 'July 24', paid: false, icon: 'N', color: 'bg-black text-[#e50914]' },
    { id: 2, name: 'Spotify Family', price: 16.99, date: 'July 26', paid: false, icon: 'S', color: 'bg-[#1db954] text-white' },
    { id: 3, name: 'Iron Paradise Gym', price: 45.00, date: 'July 15', paid: true, icon: '💪', color: 'bg-zinc-100' },
    { id: 4, name: 'Adobe Creative Cloud', price: 52.99, date: 'July 30', paid: false, icon: 'A', color: 'bg-[#ff0000] text-white' },
  ];

  return (
    <div className="space-y-6 pb-32 pt-8 w-full max-w-sm mx-auto animate-fade-in">
      
      {/* Mega Header */}
      <div className="bg-[#d9f99d] px-6 py-10 -mx-4 -mt-8 rounded-b-[48px] shadow-sm flex flex-col items-center">
         <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#65a30d] mb-4 shadow-sm">
            <Calendar className="w-8 h-8" strokeWidth={2.5}/>
         </div>
         <p className="text-[12px] font-extrabold tracking-widest uppercase text-[#3f6212] opacity-80 mb-1">
           Subscription Flow
         </p>
         <h1 className="text-[15px] font-bold text-[#1a1a2e] mb-2">Total Due This Month</h1>
         <p className="text-[44px] font-extrabold text-[#1a1a2e] tracking-tight leading-none">
           $458.20
         </p>
      </div>

      <div className="px-4 space-y-8">
        
        {/* Upcoming Timeline */}
        <div>
          <h3 className="text-[17px] font-extrabold text-[#1a1a2e] mb-4">Upcoming Timeline</h3>
          <div className="bg-white rounded-[32px] p-5 shadow-sm border border-zinc-50 flex justify-between items-center relative">
            {/* Connecting Line */}
            <div className="absolute top-[40px] left-8 right-8 h-1 bg-zinc-100 rounded-full z-0" />
            
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-3 relative z-10">
                <span className="text-[12px] font-bold text-[#a1a1aa]">{day}</span>
                <div className={`w-4 h-4 rounded-full border-[3px] border-white shadow-sm flex items-center justify-center
                  ${i === 2 || i === 4 ? 'bg-[#ff914d] w-5 h-5 shadow-[#ff914d]/40' : 'bg-zinc-200'}
                `}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscriptions List */}
        <div>
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-[17px] font-extrabold text-[#1a1a2e]">Your Subscriptions</h3>
             <button className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shadow-sm">
               <TrendingUp className="w-4 h-4 text-[#1a1a2e]" />
             </button>
           </div>

           <div className="space-y-3">
             {subscriptions.map((sub) => (
               <div 
                 key={sub.id} 
                 onClick={() => navigate(`/subscription/${sub.id}`)}
                 className="bg-white rounded-[32px] p-4 flex items-center justify-between shadow-sm border border-zinc-50 cursor-pointer active:scale-95 transition-transform"
               >
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-xl shadow-inner ${sub.color}`}>
                       {sub.icon}
                    </div>
                    <div>
                      <p className={`text-[15px] font-extrabold ${sub.paid ? 'text-zinc-400 line-through' : 'text-[#1a1a2e]'}`}>
                        {sub.name}
                      </p>
                      <p className="text-[12px] font-bold text-[#a1a1aa] mt-0.5">
                        Due {sub.date}
                      </p>
                    </div>
                 </div>

                 <div className="flex flex-col flex-end items-end gap-1.5">
                    <span className={`text-[17px] font-extrabold tracking-tight ${sub.paid ? 'text-zinc-400' : 'text-[#1a1a2e]'}`}>
                      ${sub.price.toFixed(2)}
                    </span>
                    {sub.paid && (
                      <span className="bg-[#ecfccb] text-[#3f6212] px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase">
                         PAID
                      </span>
                    )}
                 </div>
               </div>
             ))}
           </div>
        </div>

      </div>

    </div>
  );
}
