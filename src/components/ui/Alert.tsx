import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  isConfirm?: boolean;
}

export function Alert({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',
  confirmLabel = 'OK',
  cancelLabel = 'Batal',
  onConfirm,
  isConfirm = false
}: AlertProps) {
  if (!isOpen) return null;

  const icons = {
    info: <Info className="w-10 h-10 text-blue-500" />,
    success: <CheckCircle2 className="w-10 h-10 text-[#15803D]" />,
    warning: <AlertCircle className="w-10 h-10 text-amber-500" />,
    error: <X className="w-10 h-10 text-rose-500" />,
  };

  const bgColors = {
    info: 'bg-blue-50',
    success: 'bg-emerald-50',
    warning: 'bg-amber-50',
    error: 'bg-rose-50',
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative bg-[var(--card)] rounded-[28px] w-full max-w-[400px] p-8 shadow-2xl animate-slide-up border border-[var(--border)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-[24px] ${bgColors[type]} flex items-center justify-center mb-6`}>
            {icons[type]}
          </div>
          
          <h3 className="text-[20px] font-bold text-[var(--text)] mb-2">{title}</h3>
          <p className="text-[14px] font-medium text-[var(--text-dim-2)] leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            {isConfirm && (
              <button
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl bg-[var(--muted)] text-[var(--text)] font-bold text-[15px] hover:bg-[var(--border)] transition-all active:scale-95"
              >
                {cancelLabel}
              </button>
            )}
            <button
              onClick={() => {
                if (onConfirm) {
                  onConfirm();
                } else {
                  onClose();
                }
              }}
              className={`h-14 rounded-2xl text-white font-bold text-[15px] transition-all active:scale-95 shadow-lg shadow-[#15803D20] ${
                isConfirm ? 'flex-[1.5]' : 'w-full'
              } ${type === 'error' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-[#15803D] shadow-[#15803D/20]'}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
