interface StatusToggleProps {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function StatusToggle({ active, onToggle, disabled }: StatusToggleProps) {
  return (
    <button 
      type="button"
      onClick={(e) => { 
        e.stopPropagation(); 
        if (!disabled) onToggle(); 
      }}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
        active ? 'bg-[#15803D]' : 'bg-[var(--muted)]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
        active ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}
