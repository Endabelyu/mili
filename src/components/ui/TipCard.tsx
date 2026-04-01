import { ArrowRight } from 'lucide-react';

interface TipCardProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
  className?: string;
}

export function TipCard({ 
  title, 
  message, 
  actionText, 
  onAction,
  icon = '🤖', // default robot buddy
  className = ''
}: TipCardProps) {
  return (
    <div className={`flow-tip-card p-5 relative overflow-hidden group ${className}`}>
      {/* Decorative large shadow icon */}
      <div className="absolute right-[-10px] bottom-[-10px] text-[80px] opacity-10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
        {icon}
      </div>

      <div className="flex gap-4 relative z-10">
        <div className="w-12 h-12 flex-shrink-0 bg-[#a3e635] rounded-full flex items-center justify-center text-2xl shadow-sm border border-[#84cc16]">
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1a1a2e] text-[15px] mb-1">
            {title}
          </h3>
          <p className="text-[#3f3f46] text-sm leading-relaxed mb-3 pr-2">
            {message}
          </p>
          
          {actionText && (
            <button 
              onClick={onAction}
              className="text-[11px] uppercase tracking-wider font-extrabold text-[#1a1a2e] flex items-center gap-1 hover:text-[#65a30d] transition-colors"
            >
              {actionText} <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
