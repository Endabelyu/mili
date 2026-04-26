import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { calendarApi, type CalendarDay } from '../api/client';
import { queryKeys } from '../lib/query-keys';
import type { Transaction } from '../api/client';
import { usePreferences } from '../hooks/usePreferences';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function CalendarPage() {
  const { formatMoney } = usePreferences();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  
  const monthStr = currentDate.format('YYYY-MM');
  
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.calendar.monthly(monthStr),
    queryFn: () => calendarApi.get(monthStr),
  });

  const nextMonth = () => setCurrentDate((curr: dayjs.Dayjs) => curr.add(1, 'month'));
  const prevMonth = () => setCurrentDate((curr: dayjs.Dayjs) => curr.subtract(1, 'month'));

  // Calendar Grid Logic
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDayOfWeek = startOfMonth.day(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = endOfMonth.date();

  // Create an array of days to render the grid
  const gridDays = [];
  
  // Empty cells before the 1st of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    gridDays.push(null);
  }
  
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    gridDays.push(i);
  }

  // Find data for a specific day
  const getDayData = (day: number) => {
    if (!data?.days) return null;
    const dateStr = currentDate.date(day).format('YYYY-MM-DD');
    return data.days.find(d => d.date === dateStr);
  };

  const today = dayjs().format('YYYY-MM-DD');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[var(--text)] tracking-[-0.02em]">Kalender</h1>
        <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--text)]">
          <CalendarIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between bg-[var(--card)] p-2 rounded-[20px] shadow-sm border border-[var(--border)]">
        <button onClick={prevMonth} className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-[var(--muted)] transition-colors">
          <ChevronLeft className="w-6 h-6 text-[var(--text)]" />
        </button>
        <span className="text-[16px] font-bold text-[var(--text)] tracking-wide">
          {currentDate.format('MMMM YYYY')}
        </span>
        <button onClick={nextMonth} className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-[var(--muted)] transition-colors">
          <ChevronRight className="w-6 h-6 text-[var(--text)]" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[var(--card)] rounded-[24px] shadow-sm border border-[var(--border)] overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--muted)]/50">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
            <div key={day} className="py-3 text-center text-[12px] font-bold text-[var(--text-dim-2)] uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 auto-rows-[80px] lg:auto-rows-[100px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-[var(--card)]/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#12B76A]/30 border-t-[#12B76A] rounded-full animate-spin" />
            </div>
          )}
          
          {gridDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="border-r border-b border-[var(--border)] bg-[var(--muted)]/20" />;
            }

            const dayData = getDayData(day);
            const dateStr = currentDate.date(day).format('YYYY-MM-DD');
            const isToday = dateStr === today;

            return (
              <div 
                key={day} 
                onClick={() => {
                  if (dayData) {
                    setSelectedDay(dayData);
                    setIsDayModalOpen(true);
                  }
                }}
                className="border-r border-b border-[var(--border)] p-1.5 flex flex-col hover:bg-[var(--muted)]/30 transition-colors relative group cursor-pointer active:scale-95"
              >
                <span className={`text-[13px] font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1
                  ${isToday ? 'bg-[#12B76A] text-white shadow-md' : 'text-[var(--text)]'}`}>
                  {day}
                </span>

                {dayData && (
                  <div className="flex flex-col gap-0.5 mt-auto">
                    {dayData.income > 0 && (
                      <div className="text-[9px] font-bold text-[#12B76A] bg-[#12B76A]/10 px-1 rounded truncate flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        {formatMoney(dayData.income).replace('Rp', '')}
                      </div>
                    )}
                    {dayData.expense > 0 && (
                      <div className="text-[9px] font-bold text-[#F04438] bg-[#F04438]/10 px-1 rounded truncate flex items-center">
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                        {formatMoney(dayData.expense).replace('Rp', '')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction List for the Month */}
      <div className="space-y-4 pt-4">
        <h3 className="text-[16px] font-bold text-[var(--text)] px-2">Ringkasan Bulan Ini</h3>
        
        {data?.days && data.days.length > 0 ? (
          <div className="space-y-4">
            {data.days.map(dayData => (
              <div key={dayData.date} className="flow-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-2">
                  <span className="text-[13px] font-bold text-[var(--text-dim-2)]">
                    {dayjs(dayData.date).format('dddd, D MMMM')}
                  </span>
                  <div className="flex gap-3">
                    {dayData.income > 0 && <span className="text-[13px] font-bold text-[#12B76A]">+{formatMoney(dayData.income)}</span>}
                    {dayData.expense > 0 && <span className="text-[13px] font-bold text-[#F04438]">-{formatMoney(dayData.expense)}</span>}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {dayData.items.map(txn => (
                    <div key={txn.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-[var(--muted)] flex items-center justify-center text-[18px]">
                          {txn.category?.icon || '📦'}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[var(--text)]">{txn.category?.label || 'Other'}</p>
                          {txn.description && <p className="text-[11px] font-medium text-[var(--text-dim-2)]">{txn.description}</p>}
                        </div>
                      </div>
                      <span className={`text-[14px] font-bold ${txn.type === 'expense' ? 'text-[#F04438]' : 'text-[#12B76A]'}`}>
                        {txn.type === 'expense' ? '-' : '+'}{formatMoney(parseFloat(String(txn.amount)))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-6 bg-[var(--card)] rounded-[24px] border border-[var(--border)]">
            <CalendarIcon className="w-12 h-12 text-[var(--text-dim-2)] mx-auto mb-3 opacity-20" />
            <p className="text-[14px] font-bold text-[var(--text-dim-2)]">Tidak ada transaksi di bulan ini</p>
          </div>
        )}
      </div>

      {/* ─── Day Details Modal ─── */}
      {isDayModalOpen && selectedDay && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in z-[190]" 
            onClick={() => setIsDayModalOpen(false)} 
          />
          <div 
            className="relative z-[200] w-full max-w-[480px] bg-[var(--bg)] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex flex-col">
                <h2 className="text-[18px] font-bold text-[var(--text)]">Detail Transaksi</h2>
                <p className="text-[13px] font-medium text-[var(--text-dim-2)]">
                  {dayjs(selectedDay.date).format('dddd, D MMMM YYYY')}
                </p>
              </div>
              <button 
                onClick={() => setIsDayModalOpen(false)}
                className="relative z-[210] w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--border)] transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="flex gap-4 p-4 rounded-2xl bg-[var(--muted)]/50">
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase mb-1">Total Pemasukan</p>
                  <p className="text-[16px] font-bold text-[#12B76A]">{formatMoney(selectedDay.income)}</p>
                </div>
                <div className="w-px bg-[var(--border)]" />
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase mb-1">Total Pengeluaran</p>
                  <p className="text-[16px] font-bold text-[#F04438]">{formatMoney(selectedDay.expense)}</p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedDay.items.map((txn: Transaction) => (
                  <div key={txn.id} className="flow-card p-4 flex items-center justify-between hover:bg-[var(--muted)]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[20px] shadow-sm">
                        {txn.category?.icon || '📦'}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[var(--text)]">{txn.category?.label || 'Other'}</p>
                        <p className="text-[11px] font-medium text-[var(--text-dim-2)]">
                          {txn.description || 'Tanpa keterangan'} • {txn.account?.name}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[15px] font-bold ${txn.type === 'expense' ? 'text-[#F04438]' : 'text-[#12B76A]'}`}>
                      {txn.type === 'expense' ? '-' : '+'}{formatMoney(parseFloat(String(txn.amount)))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)]">
              <button 
                onClick={() => setIsDayModalOpen(false)}
                className="w-full py-4 rounded-2xl bg-[var(--text)] text-[var(--bg)] font-bold text-[15px]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
