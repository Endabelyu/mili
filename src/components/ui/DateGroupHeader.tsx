interface DateGroupHeaderProps {
  date: string;
  isToday?: boolean;
}

export function DateGroupHeader({ date, isToday = false }: DateGroupHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-2 pt-4 px-1 sticky top-[54px] z-10 bg-[var(--app-bg-start)]/90 backdrop-blur-md">
      <h3 className="text-[17px] font-bold text-[#1a1a2e]">{date}</h3>
      {isToday && (
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#71717a]">
          TODAY
        </span>
      )}
    </div>
  );
}
